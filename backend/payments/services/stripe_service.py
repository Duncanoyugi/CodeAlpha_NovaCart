# backend/payments/services/stripe_service.py
import logging
from decimal import Decimal

import stripe
from django.conf import settings

logger = logging.getLogger(__name__)

# stripe-python moved its exception classes out of ``stripe.error`` in v8.
StripeError = getattr(stripe, 'StripeError', None) or stripe.error.StripeError
SignatureVerificationError = (
    getattr(stripe, 'SignatureVerificationError', None) or stripe.error.SignatureVerificationError
)

# KES is a two-decimal currency on Stripe (amount in cents).
ZERO_DECIMAL = {'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'}


def to_minor_units(amount, currency):
    amount = Decimal(str(amount))
    return int(amount) if currency.lower() in ZERO_DECIMAL else int((amount * 100).to_integral_value())


def from_minor_units(amount, currency):
    return Decimal(amount) if currency.lower() in ZERO_DECIMAL else Decimal(amount) / 100


def _configure():
    key = getattr(settings, 'STRIPE_SECRET_KEY', '') or ''
    if not key:
        raise StripeError('Card payments are not configured on this server.')
    stripe.api_key = key


class StripeService:
    """Thin wrapper over Stripe returning plain dicts."""

    @staticmethod
    def create_payment_intent(amount, currency='kes', metadata=None, customer_id=None, idempotency_key=None):
        try:
            _configure()
            params = {
                'amount': to_minor_units(amount, currency),
                'currency': currency.lower(),
                'metadata': metadata or {},
                'automatic_payment_methods': {'enabled': True, 'allow_redirects': 'never'},
            }
            if customer_id:
                params['customer'] = customer_id
            options = {'idempotency_key': idempotency_key} if idempotency_key else {}
            intent = stripe.PaymentIntent.create(**params, **options)
            return {
                'success': True, 'payment_intent_id': intent.id, 'client_secret': intent.client_secret,
                'amount': amount, 'currency': currency, 'status': intent.status,
            }
        except StripeError as exc:
            logger.warning('Stripe create_payment_intent failed: %s', exc)
            return {'success': False, 'error': getattr(exc, 'user_message', None) or str(exc)}

    @staticmethod
    def retrieve_payment_intent(payment_intent_id):
        try:
            _configure()
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'success': True, 'payment_intent': intent, 'status': intent.status,
                'client_secret': intent.client_secret, 'amount': from_minor_units(intent.amount, intent.currency),
                'currency': intent.currency, 'metadata': dict(intent.metadata or {}),
            }
        except StripeError as exc:
            return {'success': False, 'error': str(exc)}

    @staticmethod
    def cancel_payment_intent(payment_intent_id):
        try:
            _configure()
            intent = stripe.PaymentIntent.cancel(payment_intent_id)
            return {'success': True, 'status': intent.status}
        except StripeError as exc:
            return {'success': False, 'error': str(exc)}

    @staticmethod
    def refund_payment(payment_intent_id, amount=None, currency='kes', reason=None):
        try:
            _configure()
            params = {'payment_intent': payment_intent_id, 'reason': 'requested_by_customer'}
            if amount:
                params['amount'] = to_minor_units(amount, currency)
            if reason:
                params['metadata'] = {'note': reason[:500]}
            refund = stripe.Refund.create(**params)
            return {'success': True, 'refund_id': refund.id, 'status': refund.status}
        except StripeError as exc:
            return {'success': False, 'error': str(exc)}

    @staticmethod
    def construct_event(payload, signature):
        return stripe.Webhook.construct_event(payload, signature, settings.STRIPE_WEBHOOK_SECRET)
