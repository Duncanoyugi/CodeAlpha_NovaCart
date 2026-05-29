# backend/payments/services/stripe_service.py
import stripe
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

# Set Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Stripe payment processing service"""
    
    @staticmethod
    def create_payment_intent(amount, currency='usd', metadata=None, customer_id=None):
        """
        Create a Stripe Payment Intent
        """
        try:
            # Convert amount to cents for Stripe
            amount_in_cents = int(amount * 100)
            
            payment_intent_data = {
                'amount': amount_in_cents,
                'currency': currency,
                'metadata': metadata or {},
            }
            
            if customer_id:
                payment_intent_data['customer'] = customer_id
            
            payment_intent = stripe.PaymentIntent.create(**payment_intent_data)
            
            return {
                'success': True,
                'payment_intent_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'amount': amount,
                'currency': currency,
                'status': payment_intent.status
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
                'error_type': 'stripe_error'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'error_type': 'unknown_error'
            }
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id):
        """
        Retrieve a Payment Intent from Stripe
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'success': True,
                'payment_intent': payment_intent,
                'status': payment_intent.status,
                'amount': payment_intent.amount / 100,
                'currency': payment_intent.currency,
                'metadata': payment_intent.metadata
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def confirm_payment_intent(payment_intent_id, payment_method_id=None):
        """
        Confirm a Payment Intent
        """
        try:
            confirm_params = {}
            if payment_method_id:
                confirm_params['payment_method'] = payment_method_id
            
            payment_intent = stripe.PaymentIntent.confirm(payment_intent_id, **confirm_params)
            
            return {
                'success': True,
                'payment_intent': payment_intent,
                'status': payment_intent.status
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def cancel_payment_intent(payment_intent_id):
        """
        Cancel a Payment Intent
        """
        try:
            payment_intent = stripe.PaymentIntent.cancel(payment_intent_id)
            
            return {
                'success': True,
                'payment_intent': payment_intent,
                'status': payment_intent.status
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def refund_payment(payment_intent_id, amount=None, reason=None):
        """
        Refund a payment
        """
        try:
            refund_params = {
                'payment_intent': payment_intent_id,
            }
            
            if amount:
                refund_params['amount'] = int(amount * 100)
            
            if reason:
                refund_params['reason'] = reason
            
            refund = stripe.Refund.create(**refund_params)
            
            return {
                'success': True,
                'refund_id': refund.id,
                'amount': refund.amount / 100,
                'status': refund.status
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def create_customer(email, name=None, metadata=None):
        """
        Create a Stripe Customer
        """
        try:
            customer_data = {
                'email': email,
                'metadata': metadata or {},
            }
            
            if name:
                customer_data['name'] = name
            
            customer = stripe.Customer.create(**customer_data)
            
            return {
                'success': True,
                'customer_id': customer.id,
                'customer': customer
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }