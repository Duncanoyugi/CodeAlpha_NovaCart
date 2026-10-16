# backend/payments/views/__init__.py
import hmac
import logging

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes, throttle_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from config.permissions import IsAdminRole

from ..models.base import Payment
from ..serializers import (
    ConfirmPaymentSerializer, CreatePaymentIntentSerializer,
    MPesaSTKPushSerializer, RefundPaymentSerializer,
)
from ..services.payment_service import PaymentService
from ..services.providers.mpesa.callback import MPesaCallbackService
from ..services.stripe_service import SignatureVerificationError, StripeService

logger = logging.getLogger(__name__)


def _bad(serializer):
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def payment_config(request):
    """Public, non-secret settings the checkout needs."""
    return Response({'success': True, 'data': {
        'currency': settings.STORE_CURRENCY,
        'stripe_public_key': settings.STRIPE_PUBLIC_KEY,
        'card_enabled': bool(settings.STRIPE_PUBLIC_KEY and settings.STRIPE_SECRET_KEY),
        'mpesa_enabled': bool(settings.MPESA_CONSUMER_KEY and settings.MPESA_PASSKEY and settings.MPESA_CALLBACK_URL),
    }})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    serializer = CreatePaymentIntentSerializer(data=request.data)
    if not serializer.is_valid():
        return _bad(serializer)
    result = PaymentService.process_payment(
        order_id=serializer.validated_data['order_id'],
        payment_method=serializer.validated_data.get('payment_method', 'stripe'),
        user=request.user,
    )
    if not result['success']:
        return Response({'success': False, 'message': result.get('error', 'Payment processing failed')},
                        status=status.HTTP_400_BAD_REQUEST)
    return Response({'success': True, 'data': {
        'client_secret': result.get('client_secret'),
        'payment_intent_id': result.get('payment_intent_id'),
        'requires_action': result.get('requires_action', False),
    }})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mpesa_stk_push(request):
    serializer = MPesaSTKPushSerializer(data=request.data)
    if not serializer.is_valid():
        return _bad(serializer)
    result = PaymentService.initiate_mpesa_stk_push(
        order_id=serializer.validated_data['order_id'],
        phone=serializer.validated_data['phone'],
        user=request.user,
    )
    if result['success']:
        return Response({'success': True, 'message': result['customer_message'], 'data': {
            'payment_id': result['payment_id'],
            'checkout_request_id': result['checkout_request_id'],
            'merchant_request_id': result['merchant_request_id'],
            'status': result['status'],
        }})
    return Response({'success': False, 'message': result.get('error', 'Unable to start M-Pesa payment'), 'data': {
        'payment_id': result.get('payment_id'),
    }}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    serializer = ConfirmPaymentSerializer(data=request.data)
    if not serializer.is_valid():
        return _bad(serializer)
    result = PaymentService.confirm_payment(serializer.validated_data['payment_intent_id'], user=request.user)
    if result['success']:
        return Response({'success': True, 'message': result.get('message', 'Payment confirmed'),
                         'data': {'payment_status': result.get('payment_status')}})
    return Response({'success': False, 'message': result.get('error', 'Payment confirmation failed')},
                    status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminRole])
def refund_payment(request):
    serializer = RefundPaymentSerializer(data=request.data)
    if not serializer.is_valid():
        return _bad(serializer)
    result = PaymentService.refund_payment(
        payment_id=serializer.validated_data['payment_id'],
        amount=serializer.validated_data.get('amount'),
        reason=serializer.validated_data.get('reason', ''),
    )
    if result['success']:
        return Response({'success': True, 'message': result['message'],
                         'data': {'refund_amount': result['refund_amount'], 'refund_id': result['refund_id']}})
    return Response({'success': False, 'message': result.get('error', 'Refund failed')},
                    status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_payment_status(request, payment_intent_id):
    """Stripe intent status — only for the caller's own payments."""
    if not Payment.objects.filter(stripe_payment_intent_id=payment_intent_id, user=request.user).exists():
        return Response({'success': False, 'message': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    result = StripeService.retrieve_payment_intent(payment_intent_id)
    if not result['success']:
        return Response({'success': False, 'message': 'Failed to retrieve payment status'},
                        status=status.HTTP_400_BAD_REQUEST)
    return Response({'success': True, 'data': {
        'status': result['status'], 'amount': result['amount'], 'currency': result['currency'],
    }})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mpesa_payment_status(request, payment_id):
    """Polled by the checkout while the customer approves the prompt on their phone."""
    try:
        payment = Payment.objects.select_related('order').get(
            id=payment_id, user=request.user, provider=Payment.Provider.MPESA,
        )
    except Payment.DoesNotExist:
        return Response({'success': False, 'message': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

    payment = PaymentService.reconcile_mpesa(payment)
    payment.refresh_from_db()
    return Response({'success': True, 'data': {
        'payment_id': str(payment.id),
        'order_id': str(payment.order_id),
        'status': payment.payment_status,
        'order_payment_status': payment.order.payment_status,
        'phone': payment.phone,
        'receipt_number': payment.mpesa_receipt_number,
        'result_code': payment.result_code,
        'result_description': payment.result_description,
        'paid_at': payment.paid_at,
        'expires_at': payment.expires_at,
    }})


# ============================================
# Provider callbacks — called by Stripe / Safaricom, never by a logged-in user,
# so they must bypass the default "authenticated or read-only" permission.
# ============================================

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([])
def stripe_webhook(request):
    signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.error('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured')
        return HttpResponse(status=503)
    try:
        event = StripeService.construct_event(request.body, signature)
    except (ValueError, SignatureVerificationError):
        return HttpResponse(status=400)

    try:
        PaymentService.handle_webhook_event(event)
    except Exception:  # noqa: BLE001 — let Stripe retry on a real failure
        logger.exception('Stripe webhook handling failed for %s', event.get('id'))
        return HttpResponse(status=500)
    return HttpResponse(status=200)


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([])
def mpesa_callback(request):
    """Daraja STK result. The URL carries a shared-secret token we gave Safaricom."""
    expected = settings.MPESA_CALLBACK_TOKEN
    if expected and not hmac.compare_digest(request.query_params.get('token', ''), expected):
        logger.warning('M-Pesa callback rejected: bad token')
        return Response({'ResultCode': 1, 'ResultDesc': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    payload = request.data if isinstance(request.data, dict) else {}
    try:
        result = MPesaCallbackService.process(payload)
    except Exception:  # noqa: BLE001
        logger.exception('M-Pesa callback processing failed')
        return Response({'ResultCode': 1, 'ResultDesc': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Always acknowledge so Safaricom stops retrying; problems are logged and stored.
    return Response({'ResultCode': 0, 'ResultDesc': 'Accepted' if result['success'] else result.get('error', 'Ignored')})
