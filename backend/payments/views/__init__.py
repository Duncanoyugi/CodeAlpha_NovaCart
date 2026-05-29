# backend/payments/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
import json
import stripe

from ..services.payment_service import PaymentService
from ..services.stripe_service import StripeService
from ..serializers import CreatePaymentIntentSerializer, ConfirmPaymentSerializer, RefundPaymentSerializer
from orders.models.base import Order

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Create a payment intent for an order
    """
    serializer = CreatePaymentIntentSerializer(data=request.data)
    
    if serializer.is_valid():
        result = PaymentService.process_payment(
            order_id=serializer.validated_data['order_id'],
            payment_method=serializer.validated_data.get('payment_method', 'stripe')
        )
        
        if result['success']:
            return Response({
                'success': True,
                'data': {
                    'client_secret': result.get('client_secret'),
                    'payment_intent_id': result.get('payment_intent_id'),
                    'requires_action': result.get('requires_action', False)
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': result.get('error', 'Payment processing failed')
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """
    Confirm a payment after Stripe confirmation
    """
    serializer = ConfirmPaymentSerializer(data=request.data)
    
    if serializer.is_valid():
        result = PaymentService.confirm_payment(
            serializer.validated_data['payment_intent_id']
        )
        
        if result['success']:
            return Response({
                'success': True,
                'message': result.get('message', 'Payment confirmed'),
                'data': {
                    'payment_status': result.get('payment_status')
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': result.get('error', 'Payment confirmation failed')
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def refund_payment(request):
    """
    Refund a payment (admin only)
    """
    serializer = RefundPaymentSerializer(data=request.data)
    
    if serializer.is_valid():
        result = PaymentService.refund_payment(
            payment_id=serializer.validated_data['payment_id'],
            amount=serializer.validated_data.get('amount'),
            reason=serializer.validated_data.get('reason', '')
        )
        
        if result['success']:
            return Response({
                'success': True,
                'message': result['message'],
                'data': {
                    'refund_amount': result['refund_amount'],
                    'refund_id': result['refund_id']
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': result.get('error', 'Refund failed')
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_payment_status(request, payment_intent_id):
    """
    Get payment status from Stripe
    """
    result = StripeService.retrieve_payment_intent(payment_intent_id)
    
    if result['success']:
        return Response({
            'success': True,
            'data': {
                'status': result['status'],
                'amount': result['amount'],
                'currency': result['currency']
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'success': False,
            'message': result.get('error', 'Failed to retrieve payment status')
        }, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# STRIPE WEBHOOK (Important for production)
# ============================================

@csrf_exempt
@api_view(['POST'])
def stripe_webhook(request):
    """
    Stripe webhook endpoint for payment events
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        # Update payment status
        PaymentService.confirm_payment(payment_intent['id'])
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        # Log failed payment
        print(f"Payment failed: {payment_intent['id']}")
        
    elif event['type'] == 'charge.refunded':
        charge = event['data']['object']
        # Handle refund
        print(f"Refund processed: {charge['id']}")
    
    return HttpResponse(status=200)