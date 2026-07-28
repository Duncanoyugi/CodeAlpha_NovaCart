# backend/payments/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.conf import settings
import json
import stripe

from ..services.payment_service import PaymentService
from ..services.providers.mpesa.callback import MPesaCallbackService
from ..services.stripe_service import StripeService
from ..serializers import (
    CreatePaymentIntentSerializer,
    ConfirmPaymentSerializer,
    RefundPaymentSerializer,
    MPesaSTKPushSerializer,
)
from ..models.base import Payment

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
            payment_method=serializer.validated_data.get('payment_method', 'stripe'),
            user=request.user
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
def mpesa_stk_push(request):
    """Initiate an M-Pesa STK push for an order."""
    serializer = MPesaSTKPushSerializer(data=request.data)

    if serializer.is_valid():
        result = PaymentService.initiate_mpesa_stk_push(
            order_id=serializer.validated_data['order_id'],
            phone=serializer.validated_data['phone'],
            user=request.user,
        )
        if result['success']:
            return Response({
                'success': True,
                'message': result.get('customer_message', 'STK Push sent'),
                'data': {
                    'payment_id': result.get('payment_id'),
                    'checkout_request_id': result.get('checkout_request_id'),
                    'merchant_request_id': result.get('merchant_request_id'),
                    'status': result.get('status'),
                }
            }, status=status.HTTP_200_OK)

        return Response({
            'success': False,
            'message': result.get('error', 'Unable to start M-Pesa payment'),
            'data': {
                'payment_id': result.get('payment_id'),
                'checkout_request_id': result.get('checkout_request_id'),
                'status': result.get('status'),
            }
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
            serializer.validated_data['payment_intent_id'],
            user=request.user
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mpesa_payment_status(request, payment_id):
    """Get the status of a customer-owned M-Pesa payment attempt."""
    try:
        payment = Payment.objects.select_related('order').get(
            id=payment_id,
            user=request.user,
            provider=Payment.Provider.MPESA,
        )
    except Payment.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Payment not found'
        }, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'success': True,
        'data': {
            'payment_id': str(payment.id),
            'order_id': str(payment.order_id),
            'status': payment.payment_status,
            'phone': payment.phone,
            'checkout_request_id': payment.checkout_request_id,
            'merchant_request_id': payment.merchant_request_id,
            'receipt_number': payment.mpesa_receipt_number,
            'result_code': payment.result_code,
            'result_description': payment.result_description,
            'paid_at': payment.paid_at,
            'expires_at': payment.expires_at,
        }
    }, status=status.HTTP_200_OK)

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
    
    PaymentService.handle_webhook_event(event)
    
    return HttpResponse(status=200)


@csrf_exempt
@api_view(['POST'])
def mpesa_callback(request):
    """Daraja callback endpoint for STK push results."""
    payload = request.data if isinstance(request.data, dict) else {}
    result = MPesaCallbackService.process(payload)

    if result['success']:
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

    # Safaricom may retry on non-2xx responses; returning 200 avoids tight retry
    # loops for unknown references while still surfacing the problem in logs/db.
    return Response({
        'ResultCode': 0,
        'ResultDesc': result.get('error', 'Ignored'),
    }, status=status.HTTP_200_OK)
