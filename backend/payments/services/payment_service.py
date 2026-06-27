# backend/payments/services/payment_service.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from django.core.exceptions import PermissionDenied
from ..models.base import Payment, PaymentAttempt, ProcessedWebhookEvent
from orders.models.base import Order
from .stripe_service import StripeService


class InvalidPaymentTransition(Exception):
    pass


class PaymentService:
    """Main payment processing service"""
    
    @staticmethod
    def process_payment(order_id, payment_method='stripe', user=None):
        """
        Process payment for an order
        """
        try:
            order = Order.objects.get(id=order_id)
            if user is not None and order.user_id != user.id:
                raise PermissionDenied("You do not have permission to pay for this order.")
            
            # Check if payment already exists
            if hasattr(order, 'payment'):
                payment = order.payment
                if payment.payment_status in [Payment.PaymentStatus.SUCCEEDED, Payment.PaymentStatus.REFUNDED]:
                    return {'success': False, 'error': 'Payment is already in a terminal state'}
                if payment.stripe_payment_intent_id:
                    return {
                        'success': True,
                        'requires_action': True,
                        'payment_intent_id': payment.stripe_payment_intent_id,
                    }
            
            # Create payment record
            payment = Payment.objects.create(
                order=order,
                user=order.user,
                amount=order.total_amount,
                currency='usd',
                payment_method=payment_method,
                payment_status=Payment.PaymentStatus.PENDING
            )
            
            # Process with Stripe
            if payment_method == 'stripe':
                return PaymentService.process_stripe_payment(payment, order)
            else:
                return {
                    'success': False,
                    'error': f'Payment method {payment_method} not supported'
                }
        except Order.DoesNotExist:
            return {
                'success': False,
                'error': 'Order not found'
            }
    
    @staticmethod
    def process_stripe_payment(payment, order):
        """
        Process Stripe payment
        """
        # Create metadata for Stripe
        metadata = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'user_id': str(order.user.id),
            'user_email': order.user.email
        }
        
        # Create Stripe Payment Intent
        result = StripeService.create_payment_intent(
            amount=float(order.total_amount),
            currency='usd',
            metadata=metadata
        )
        
        if result['success']:
            # Update payment record
            payment.stripe_payment_intent_id = result['payment_intent_id']
            payment.save()
            
            # Log payment attempt
            PaymentAttempt.objects.create(
                payment=payment,
                order=order,
                stripe_payment_intent_id=result['payment_intent_id'],
                amount=order.total_amount,
                status='pending',
                response_data=result
            )
            
            return {
                'success': True,
                'requires_action': True,
                'client_secret': result['client_secret'],
                'payment_intent_id': result['payment_intent_id']
            }
        else:
            # Log failed attempt
            PaymentAttempt.objects.create(
                order=order,
                stripe_payment_intent_id='',
                amount=order.total_amount,
                status='failed',
                error_message=result.get('error', 'Unknown error'),
                response_data=result
            )
            
            # Update payment status
            payment.payment_status = Payment.PaymentStatus.FAILED
            payment.save()
            
            return {
                'success': False,
                'error': result.get('error', 'Payment processing failed')
            }
    
    @staticmethod
    def confirm_payment(payment_intent_id, user=None):
        """
        Confirm a payment after successful Stripe confirmation
        """
        try:
            with transaction.atomic():
                payment = Payment.objects.select_for_update().select_related('order').get(
                    stripe_payment_intent_id=payment_intent_id
                )
                if user is not None and payment.user_id != user.id:
                    raise PermissionDenied("You do not have permission to confirm this payment.")
                if payment.payment_status in [Payment.PaymentStatus.SUCCEEDED, Payment.PaymentStatus.REFUNDED]:
                    return {
                        'success': True,
                        'message': 'Payment already confirmed',
                        'payment_status': payment.payment_status
                    }

            # Retrieve payment intent from Stripe after locking/idempotency guard.
            result = StripeService.retrieve_payment_intent(payment_intent_id)
            
            if not result['success']:
                return {
                    'success': False,
                    'error': result.get('error', 'Failed to retrieve payment intent')
                }
            
            payment_intent = result['payment_intent']
            
            # Update payment based on Stripe status
            if payment_intent.status == 'succeeded':
                with transaction.atomic():
                    payment = Payment.objects.select_for_update().select_related('order').get(
                        stripe_payment_intent_id=payment_intent_id
                    )
                    if payment.payment_status in [Payment.PaymentStatus.SUCCEEDED, Payment.PaymentStatus.REFUNDED]:
                        return {
                            'success': True,
                            'message': 'Payment already confirmed',
                            'payment_status': payment.payment_status
                        }
                    order = Order.objects.select_for_update().get(id=payment.order_id)
                    PaymentService._mark_payment_succeeded(payment, order, payment_intent)
                
                return {
                    'success': True,
                    'message': 'Payment confirmed successfully',
                    'payment_status': payment.payment_status
                }
            elif payment_intent.status == 'requires_payment_method':
                PaymentService._mark_payment_failed(payment, {'stripe_status': payment_intent.status})
                
                return {
                    'success': False,
                    'error': 'Payment requires different payment method'
                }
            else:
                return {
                    'success': False,
                    'error': f'Payment status: {payment_intent.status}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def handle_webhook_event(event):
        event_id = event.get('id')
        event_type = event.get('type')
        if not event_id or not event_type:
            return {'success': False, 'error': 'Invalid webhook event'}

        with transaction.atomic():
            _, created = ProcessedWebhookEvent.objects.get_or_create(
                provider='stripe',
                event_id=event_id,
                defaults={'event_type': event_type},
            )
            if not created:
                return {'success': True, 'message': 'Webhook event already processed'}

            data_object = event.get('data', {}).get('object', {})
            if event_type == 'payment_intent.succeeded':
                return PaymentService._handle_payment_intent_succeeded(data_object)
            if event_type == 'payment_intent.payment_failed':
                return PaymentService._handle_payment_intent_failed(data_object)
            if event_type == 'charge.refunded':
                return PaymentService._handle_charge_refunded(data_object)

        return {'success': True, 'message': 'Webhook event ignored'}

    @staticmethod
    def _handle_payment_intent_succeeded(payment_intent):
        payment_intent_id = payment_intent.get('id')
        payment = Payment.objects.select_for_update().select_related('order').get(
            stripe_payment_intent_id=payment_intent_id
        )
        if payment.payment_status in [Payment.PaymentStatus.SUCCEEDED, Payment.PaymentStatus.REFUNDED]:
            return {'success': True, 'message': 'Payment already terminal'}
        order = Order.objects.select_for_update().get(id=payment.order_id)
        PaymentService._mark_payment_succeeded(payment, order, payment_intent)
        return {'success': True, 'message': 'Payment marked succeeded'}

    @staticmethod
    def _handle_payment_intent_failed(payment_intent):
        payment_intent_id = payment_intent.get('id')
        payment = Payment.objects.select_for_update().select_related('order').get(
            stripe_payment_intent_id=payment_intent_id
        )
        PaymentService._mark_payment_failed(payment, payment_intent)
        return {'success': True, 'message': 'Payment marked failed'}

    @staticmethod
    def _handle_charge_refunded(charge):
        payment_intent_id = charge.get('payment_intent')
        payment = Payment.objects.select_for_update().select_related('order').get(
            stripe_payment_intent_id=payment_intent_id
        )
        payment.payment_status = Payment.PaymentStatus.REFUNDED
        payment.refunded_at = timezone.now()
        payment.payment_response = charge
        payment.save(update_fields=['payment_status', 'refunded_at', 'payment_response', 'updated_at'])

        order = Order.objects.select_for_update().get(id=payment.order_id)
        order.payment_status = Order.PaymentStatus.REFUNDED
        order.status = Order.Status.REFUNDED
        order.save(update_fields=['payment_status', 'status', 'updated_at'])
        return {'success': True, 'message': 'Payment marked refunded'}

    @staticmethod
    def _mark_payment_succeeded(payment, order, payment_intent):
        payment.payment_status = Payment.PaymentStatus.SUCCEEDED
        payment.stripe_charge_id = getattr(payment_intent, 'latest_charge', None) or payment_intent.get('latest_charge')
        payment.paid_at = timezone.now()
        payment.payment_response = dict(payment_intent)
        payment.save(update_fields=[
            'payment_status', 'stripe_charge_id', 'paid_at', 'payment_response', 'updated_at'
        ])

        order.payment_status = Order.PaymentStatus.PAID
        order.status = Order.Status.PROCESSING
        order.processed_at = order.processed_at or timezone.now()
        order.save(update_fields=['payment_status', 'status', 'processed_at', 'updated_at'])

        PaymentAttempt.objects.create(
            payment=payment,
            order=order,
            stripe_payment_intent_id=payment.stripe_payment_intent_id,
            amount=payment.amount,
            status='succeeded',
            response_data=payment.payment_response,
        )

    @staticmethod
    def _mark_payment_failed(payment, payment_intent):
        payment.payment_status = Payment.PaymentStatus.FAILED
        payment.payment_response = dict(payment_intent)
        payment.save(update_fields=['payment_status', 'payment_response', 'updated_at'])

        order = payment.order
        order.payment_status = Order.PaymentStatus.FAILED
        order.save(update_fields=['payment_status', 'updated_at'])
    
    @staticmethod
    def refund_payment(payment_id, amount=None, reason=None):
        """
        Refund a payment
        """
        try:
            payment = Payment.objects.get(id=payment_id)
            
            if payment.payment_status != Payment.PaymentStatus.SUCCEEDED:
                return {
                    'success': False,
                    'error': 'Only successful payments can be refunded'
                }
            
            # Process refund with Stripe
            result = StripeService.refund_payment(
                payment.stripe_payment_intent_id,
                amount=float(amount) if amount else None,
                reason=reason
            )
            
            if result['success']:
                refund_amount = amount if amount else payment.amount
                
                payment.payment_status = Payment.PaymentStatus.REFUNDED if refund_amount == payment.amount else Payment.PaymentStatus.PARTIALLY_REFUNDED
                payment.refund_amount = refund_amount
                payment.refund_reason = reason or ''
                payment.refunded_at = timezone.now()
                payment.stripe_refund_id = result['refund_id']
                payment.save()
                
                # Update order status
                order = payment.order
                if refund_amount == payment.amount:
                    order.status = Order.Status.REFUNDED
                order.save()
                
                return {
                    'success': True,
                    'message': 'Payment refunded successfully',
                    'refund_amount': refund_amount,
                    'refund_id': result['refund_id']
                }
            else:
                return {
                    'success': False,
                    'error': result.get('error', 'Refund failed')
                }
                
        except Payment.DoesNotExist:
            return {
                'success': False,
                'error': 'Payment not found'
            }
