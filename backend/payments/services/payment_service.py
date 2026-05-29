# backend/payments/services/payment_service.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from ..models.base import Payment, PaymentAttempt
from orders.models.base import Order
from .stripe_service import StripeService

class PaymentService:
    """Main payment processing service"""
    
    @staticmethod
    def process_payment(order_id, payment_method='stripe'):
        """
        Process payment for an order
        """
        try:
            order = Order.objects.get(id=order_id)
            
            # Check if payment already exists
            if hasattr(order, 'payment'):
                return {
                    'success': False,
                    'error': 'Payment already exists for this order'
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
    def confirm_payment(payment_intent_id):
        """
        Confirm a payment after successful Stripe confirmation
        """
        try:
            # Retrieve payment intent from Stripe
            result = StripeService.retrieve_payment_intent(payment_intent_id)
            
            if not result['success']:
                return {
                    'success': False,
                    'error': result.get('error', 'Failed to retrieve payment intent')
                }
            
            payment_intent = result['payment_intent']
            
            # Find the payment record
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            except Payment.DoesNotExist:
                return {
                    'success': False,
                    'error': 'Payment record not found'
                }
            
            # Update payment based on Stripe status
            if payment_intent.status == 'succeeded':
                payment.payment_status = Payment.PaymentStatus.SUCCEEDED
                payment.stripe_charge_id = payment_intent.latest_charge
                payment.paid_at = timezone.now()
                payment.save()
                
                # Update order status
                order = payment.order
                order.payment_status = Order.PaymentStatus.PAID
                order.status = Order.Status.PROCESSING
                order.save()
                
                # Log successful attempt
                PaymentAttempt.objects.create(
                    payment=payment,
                    order=order,
                    stripe_payment_intent_id=payment_intent_id,
                    amount=payment.amount,
                    status='succeeded',
                    response_data=payment_intent
                )
                
                return {
                    'success': True,
                    'message': 'Payment confirmed successfully',
                    'payment_status': payment.payment_status
                }
            elif payment_intent.status == 'requires_payment_method':
                payment.payment_status = Payment.PaymentStatus.FAILED
                payment.save()
                
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