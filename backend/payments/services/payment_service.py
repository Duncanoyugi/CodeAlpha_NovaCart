# backend/payments/services/payment_service.py
import logging
from datetime import datetime, timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from orders.models.base import Order

from ..models.base import Payment, PaymentAttempt, ProcessedWebhookEvent
from .payment_finalization import PaymentFinalizationService as Finalizer
from .providers.mpesa.auth import MPesaConfigurationError
from .providers.mpesa.callback import MPesaCallbackService
from .providers.mpesa.stk_push import MPesaSTKPushService
from .stripe_service import StripeService, from_minor_units

logger = logging.getLogger(__name__)

ACTIVE = Finalizer.ACTIVE_PAYMENT_STATUSES
# After this long without a callback an STK push is treated as abandoned.
MPESA_PROMPT_TTL = timedelta(minutes=2)
MPESA_GRACE = timedelta(minutes=1)


class PaymentError(Exception):
    """A payment rule was violated; message is safe for customers."""


class PaymentService:
    """Provider orchestration. Money state changes live in PaymentFinalizationService."""

    # ------------------------------------------------------------------ helpers
    @staticmethod
    def _parse_iso_datetime(value):
        if not value:
            return None
        try:
            parsed = datetime.fromisoformat(str(value))
        except (TypeError, ValueError):
            return None
        return timezone.make_aware(parsed) if timezone.is_naive(parsed) else parsed

    @staticmethod
    def _payable_order(order_id, user):
        try:
            order = Order.objects.get(id=order_id, user=user)  # someone else's order == not found
        except Order.DoesNotExist:
            raise PaymentError('Order not found')
        if order.payment_status == Order.PaymentStatus.PAID:
            raise PaymentError('This order has already been paid.')
        if not order.is_payable:
            raise PaymentError('This order can no longer be paid. Please place a new order.')
        if order.total_amount <= 0:
            raise PaymentError('Nothing to pay for this order.')
        return order

    @staticmethod
    def _release_active_attempts(order, provider_wanted):
        """Make room for a new attempt. Returns an existing reusable Stripe payment, if any.

        Only one attempt per order may be live (DB constraint). Switching method cancels the
        old Stripe intent; a live M-Pesa prompt must be allowed to finish first.
        """
        reusable = None
        for payment in order.payments.filter(payment_status__in=ACTIVE).order_by('-created_at'):
            if payment.provider == Payment.Provider.MPESA:
                PaymentService.reconcile_mpesa(payment)
                payment.refresh_from_db()
                if payment.payment_status in ACTIVE:
                    raise PaymentError(
                        'An M-Pesa prompt is still open on your phone. Complete it, or wait about 2 minutes and try again.'
                    )
                if order.payment_status == Order.PaymentStatus.PAID or payment.payment_status == Payment.PaymentStatus.SUCCEEDED:
                    raise PaymentError('This order has already been paid.')
            else:  # Stripe
                if provider_wanted == Payment.Provider.STRIPE and payment.stripe_payment_intent_id:
                    result = StripeService.retrieve_payment_intent(payment.stripe_payment_intent_id)
                    if result['success'] and result['status'] in {
                        'requires_payment_method', 'requires_confirmation', 'requires_action',
                    }:
                        reusable = (payment, result)
                        continue
                if payment.stripe_payment_intent_id:
                    StripeService.cancel_payment_intent(payment.stripe_payment_intent_id)
                Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.CANCELLED, {'reason': 'superseded'})
        return reusable

    # ------------------------------------------------------------------- Stripe
    @staticmethod
    def process_payment(order_id, payment_method='stripe', user=None):
        if payment_method != 'stripe':
            return {'success': False, 'error': f'Payment method {payment_method} not supported here'}
        try:
            order = PaymentService._payable_order(order_id, user)
            reusable = PaymentService._release_active_attempts(order, Payment.Provider.STRIPE)
        except PaymentError as exc:
            return {'success': False, 'error': str(exc)}

        if reusable:
            payment, result = reusable
            return {
                'success': True, 'requires_action': True,
                'client_secret': result['client_secret'], 'payment_intent_id': payment.stripe_payment_intent_id,
            }

        try:
            with transaction.atomic():
                payment = Payment.objects.create(
                    order=order, user=order.user, amount=order.total_amount,
                    currency=settings.STORE_CURRENCY, provider=Payment.Provider.STRIPE,
                    payment_status=Payment.PaymentStatus.PENDING,
                )
        except IntegrityError:
            return {'success': False, 'error': 'A payment is already in progress for this order.'}

        result = StripeService.create_payment_intent(
            amount=order.total_amount, currency=settings.STORE_CURRENCY,
            metadata={'order_id': str(order.id), 'order_number': order.order_number, 'payment_id': str(payment.id)},
            idempotency_key=f'pi-{payment.id}',
        )
        if not result['success']:
            Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.FAILED, result, result.get('error', ''))
            return {'success': False, 'error': result.get('error') or 'Card payment could not be started.'}

        payment.stripe_payment_intent_id = result['payment_intent_id']
        payment.save(update_fields=['stripe_payment_intent_id', 'updated_at'])
        PaymentAttempt.objects.create(
            payment=payment, order=order, provider=Payment.Provider.STRIPE,
            provider_reference=result['payment_intent_id'], stripe_payment_intent_id=result['payment_intent_id'],
            amount=order.total_amount, status='pending', response_data={k: v for k, v in result.items() if k != 'client_secret'},
        )
        return {
            'success': True, 'requires_action': True,
            'client_secret': result['client_secret'], 'payment_intent_id': result['payment_intent_id'],
        }

    @staticmethod
    def confirm_payment(payment_intent_id, user=None):
        """Called by the SPA after Stripe.js confirms; we still verify with Stripe ourselves."""
        try:
            payment = Payment.objects.select_related('order').get(stripe_payment_intent_id=payment_intent_id)
        except Payment.DoesNotExist:
            return {'success': False, 'error': 'Payment not found'}
        if user is not None and payment.user_id != user.id:
            return {'success': False, 'error': 'Payment not found'}
        if payment.payment_status == Payment.PaymentStatus.SUCCEEDED:
            return {'success': True, 'message': 'Payment already confirmed', 'payment_status': payment.payment_status}

        result = StripeService.retrieve_payment_intent(payment_intent_id)
        if not result['success']:
            return {'success': False, 'error': result.get('error', 'Could not verify the payment')}

        intent = result['payment_intent']
        if intent.status == 'succeeded':
            if from_minor_units(intent.amount, intent.currency) != payment.amount or intent.currency.upper() != payment.currency.upper():
                Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.FAILED, {'error': 'amount mismatch'}, 'Amount mismatch')
                return {'success': False, 'error': 'Payment amount did not match the order.'}
            payment.stripe_charge_id = getattr(intent, 'latest_charge', None) or ''
            payment.save(update_fields=['stripe_charge_id', 'updated_at'])
            payment = Finalizer.mark_payment_succeeded(payment, intent.to_dict() if hasattr(intent, 'to_dict') else dict(intent))
            return {'success': True, 'message': 'Payment confirmed', 'payment_status': payment.payment_status}
        if intent.status == 'requires_payment_method':
            return {'success': False, 'error': 'Your card was declined. Please try a different card.'}
        if intent.status == 'processing':
            return {'success': True, 'message': 'Payment is processing', 'payment_status': 'processing'}
        return {'success': False, 'error': f'Payment status: {intent.status}'}

    # ------------------------------------------------------------------- M-Pesa
    @staticmethod
    def initiate_mpesa_stk_push(order_id, phone, user=None):
        try:
            order = PaymentService._payable_order(order_id, user)
            normalized_phone = MPesaSTKPushService.normalize_phone(phone)
            PaymentService._release_active_attempts(order, Payment.Provider.MPESA)
        except (PaymentError, ValueError) as exc:
            return {'success': False, 'error': str(exc)}

        try:
            with transaction.atomic():
                payment = Payment.objects.create(
                    order=order, user=order.user, amount=order.total_amount, currency='KES',
                    provider=Payment.Provider.MPESA, phone=normalized_phone,
                    payment_status=Payment.PaymentStatus.PENDING,
                )
        except IntegrityError:
            return {'success': False, 'error': 'A payment is already in progress for this order.'}

        try:
            response_data = MPesaSTKPushService.initiate(payment, normalized_phone)
        except MPesaConfigurationError as exc:
            logger.error('M-Pesa misconfigured: %s', exc)
            Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.FAILED, {'error': str(exc)}, str(exc))
            return {'success': False, 'error': 'M-Pesa is temporarily unavailable. Please try again or pay by card.', 'payment_id': str(payment.id)}
        except Exception as exc:  # network / Daraja errors
            logger.exception('STK push failed for order %s', order.order_number)
            Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.FAILED, {'error': str(exc)}, str(exc))
            return {'success': False, 'error': 'We could not reach M-Pesa. Please try again in a moment.', 'payment_id': str(payment.id)}

        if str(response_data.get('ResponseCode')) != '0':
            description = response_data.get('ResponseDescription') or response_data.get('errorMessage') or 'M-Pesa rejected the request'
            Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.FAILED, response_data, description)
            return {'success': False, 'error': description, 'payment_id': str(payment.id)}

        payment.expires_at = timezone.now() + MPESA_PROMPT_TTL
        payment.save(update_fields=['expires_at', 'updated_at'])
        Finalizer.mark_mpesa_sent(payment, response_data)
        return {
            'success': True, 'payment_id': str(payment.id),
            'checkout_request_id': payment.checkout_request_id,
            'merchant_request_id': payment.merchant_request_id,
            'status': payment.payment_status,
            'customer_message': response_data.get('CustomerMessage', 'Check your phone and enter your M-Pesa PIN'),
        }

    @staticmethod
    def reconcile_mpesa(payment):
        """If the callback is late/lost, ask Daraja directly and settle the payment."""
        if payment.provider != Payment.Provider.MPESA or payment.payment_status not in ACTIVE:
            return payment
        if not payment.checkout_request_id:
            # Push never left our server.
            if timezone.now() - payment.created_at > MPESA_GRACE:
                return Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.EXPIRED, {}, 'STK push was not sent')
            return payment
        if timezone.now() < (payment.expires_at or payment.created_at) :
            return payment  # prompt may still be open; give the customer time

        try:
            outcome = MPesaSTKPushService.query_status(payment.checkout_request_id)
        except Exception:  # noqa: BLE001
            logger.exception('STK query failed for %s', payment.checkout_request_id)
            outcome = {'state': 'unknown'}

        if outcome['state'] == 'success':
            return Finalizer.mark_payment_succeeded(payment, outcome['payload'])
        if outcome['state'] == 'failed':
            status = MPesaCallbackService._map_failure_status(outcome['result_code'])
            payment.result_code = outcome['result_code']
            payment.result_description = outcome.get('description', '')
            payment.save(update_fields=['result_code', 'result_description', 'updated_at'])
            return Finalizer.mark_payment_failed(payment, status, outcome['payload'], outcome.get('description', ''))
        # pending/unknown: after the grace window, stop waiting so the customer can retry
        if timezone.now() > (payment.expires_at or payment.created_at) + MPESA_GRACE:
            return Finalizer.mark_payment_failed(
                payment, Payment.PaymentStatus.EXPIRED, outcome.get('payload', {}), 'No response from M-Pesa',
            )
        return payment

    # ------------------------------------------------------------------ webhooks
    @staticmethod
    def handle_webhook_event(event):
        event_id, event_type = event.get('id'), event.get('type')
        if not event_id or not event_type:
            return {'success': False, 'error': 'Invalid webhook event'}

        with transaction.atomic():
            _, created = ProcessedWebhookEvent.objects.get_or_create(
                provider='stripe', event_id=event_id, defaults={'event_type': event_type},
            )
            if not created:
                return {'success': True, 'message': 'Webhook event already processed'}

            obj = event.get('data', {}).get('object', {})
            handlers = {
                'payment_intent.succeeded': PaymentService._on_intent_succeeded,
                'payment_intent.payment_failed': PaymentService._on_intent_failed,
                'charge.refunded': PaymentService._on_charge_refunded,
            }
            handler = handlers.get(event_type)
            if handler is None:
                return {'success': True, 'message': 'Webhook event ignored'}
            return handler(obj)

    @staticmethod
    def _find_payment(payment_intent_id):
        return Payment.objects.select_related('order').filter(stripe_payment_intent_id=payment_intent_id).first()

    @staticmethod
    def _on_intent_succeeded(intent):
        payment = PaymentService._find_payment(intent.get('id'))
        if payment is None:
            logger.warning('Stripe webhook for unknown intent %s', intent.get('id'))
            return {'success': True, 'message': 'Unknown payment intent'}
        if from_minor_units(intent.get('amount', 0), intent.get('currency', 'kes')) != payment.amount:
            Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.FAILED, intent, 'Amount mismatch')
            return {'success': True, 'message': 'Amount mismatch recorded'}
        Finalizer.mark_payment_succeeded(payment, intent)
        return {'success': True, 'message': 'Payment marked succeeded'}

    @staticmethod
    def _on_intent_failed(intent):
        payment = PaymentService._find_payment(intent.get('id'))
        if payment is None:
            return {'success': True, 'message': 'Unknown payment intent'}
        error = (intent.get('last_payment_error') or {}).get('message', '')
        Finalizer.mark_payment_failed(payment, Payment.PaymentStatus.FAILED, intent, error)
        return {'success': True, 'message': 'Payment marked failed'}

    @staticmethod
    def _on_charge_refunded(charge):
        payment = PaymentService._find_payment(charge.get('payment_intent'))
        if payment is None:
            return {'success': True, 'message': 'Unknown payment intent'}
        payment = Payment.objects.select_for_update().get(pk=payment.pk)
        fully = bool(charge.get('refunded'))
        payment.payment_status = Payment.PaymentStatus.REFUNDED if fully else Payment.PaymentStatus.PARTIALLY_REFUNDED
        payment.refunded_at = timezone.now()
        payment.payment_response = charge
        payment.save(update_fields=['payment_status', 'refunded_at', 'payment_response', 'updated_at'])
        if fully:
            order = Order.objects.select_for_update().get(id=payment.order_id)
            order.payment_status = Order.PaymentStatus.REFUNDED
            order.status = Order.Status.REFUNDED
            order.save(update_fields=['payment_status', 'status', 'updated_at'])
        return {'success': True, 'message': 'Refund recorded'}

    # -------------------------------------------------------------------- refund
    @staticmethod
    def refund_payment(payment_id, amount=None, reason=None):
        try:
            payment = Payment.objects.select_related('order').get(id=payment_id)
        except Payment.DoesNotExist:
            return {'success': False, 'error': 'Payment not found'}
        if payment.payment_status != Payment.PaymentStatus.SUCCEEDED:
            return {'success': False, 'error': 'Only successful payments can be refunded'}
        if payment.provider != Payment.Provider.STRIPE:
            return {'success': False, 'error': 'M-Pesa refunds must be reversed manually from the M-Pesa portal, then marked refunded here.'}

        refund_amount = amount or payment.amount
        if refund_amount > payment.amount:
            return {'success': False, 'error': 'Refund cannot exceed the amount paid'}

        result = StripeService.refund_payment(
            payment.stripe_payment_intent_id, amount=refund_amount, currency=payment.currency, reason=reason,
        )
        if not result['success']:
            return {'success': False, 'error': result.get('error', 'Refund failed')}

        with transaction.atomic():
            full = refund_amount == payment.amount
            payment.payment_status = Payment.PaymentStatus.REFUNDED if full else Payment.PaymentStatus.PARTIALLY_REFUNDED
            payment.refund_amount = refund_amount
            payment.refund_reason = reason or ''
            payment.refunded_at = timezone.now()
            payment.stripe_refund_id = result['refund_id']
            payment.save()
            if full:
                order = payment.order
                order.status = Order.Status.REFUNDED
                order.payment_status = Order.PaymentStatus.REFUNDED
                order.save(update_fields=['status', 'payment_status', 'updated_at'])
        return {'success': True, 'message': 'Payment refunded', 'refund_amount': refund_amount, 'refund_id': result['refund_id']}
