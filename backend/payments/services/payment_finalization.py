from django.db import transaction
from django.utils import timezone

from orders.models.base import Order

from ..models.base import Payment, PaymentAttempt


class PaymentFinalizationService:
    """Provider-agnostic payment state transitions."""

    TERMINAL_PAYMENT_STATUSES = {
        Payment.PaymentStatus.SUCCEEDED,
        Payment.PaymentStatus.FAILED,
        Payment.PaymentStatus.CANCELLED,
        Payment.PaymentStatus.EXPIRED,
        Payment.PaymentStatus.REFUNDED,
        Payment.PaymentStatus.PARTIALLY_REFUNDED,
    }

    @staticmethod
    def mark_mpesa_sent(payment, response_data):
        payment.payment_status = Payment.PaymentStatus.STK_SENT
        payment.merchant_request_id = response_data.get("MerchantRequestID", "") or None
        payment.checkout_request_id = response_data.get("CheckoutRequestID", "") or None
        payment.result_code = response_data.get("ResponseCode")
        payment.result_description = response_data.get("ResponseDescription", "")
        payment.payment_response = response_data
        payment.save(
            update_fields=[
                "payment_status",
                "merchant_request_id",
                "checkout_request_id",
                "result_code",
                "result_description",
                "payment_response",
                "updated_at",
            ]
        )

        PaymentAttempt.objects.create(
            payment=payment,
            order=payment.order,
            provider=payment.provider,
            provider_reference=payment.checkout_request_id or "",
            amount=payment.amount,
            status=Payment.PaymentStatus.STK_SENT,
            response_data=response_data,
        )

    @staticmethod
    def mark_mpesa_callback_received(payment, payload, result_code, result_description):
        payment.payment_status = Payment.PaymentStatus.AWAITING_CALLBACK
        payment.callback_payload = payload
        payment.result_code = result_code
        payment.result_description = result_description or ""
        payment.save(
            update_fields=[
                "payment_status",
                "callback_payload",
                "result_code",
                "result_description",
                "updated_at",
            ]
        )

    @staticmethod
    def mark_payment_succeeded(payment, provider_payload):
        with transaction.atomic():
            payment = Payment.objects.select_for_update().select_related("order").get(id=payment.id)
            if payment.payment_status in PaymentFinalizationService.TERMINAL_PAYMENT_STATUSES:
                return payment

            order = Order.objects.select_for_update().get(id=payment.order_id)

            payment.payment_status = Payment.PaymentStatus.SUCCEEDED
            payment.payment_response = provider_payload
            payment.paid_at = timezone.now()
            payment.finalized_at = payment.finalized_at or timezone.now()
            payment.save(
                update_fields=[
                    "payment_status",
                    "payment_response",
                    "paid_at",
                    "finalized_at",
                    "updated_at",
                ]
            )

            order.payment_status = Order.PaymentStatus.PAID
            order.status = Order.Status.PROCESSING
            order.processed_at = order.processed_at or timezone.now()
            order.save(update_fields=["payment_status", "status", "processed_at", "updated_at"])

            PaymentAttempt.objects.create(
                payment=payment,
                order=order,
                provider=payment.provider,
                provider_reference=payment.checkout_request_id or payment.transaction_id or "",
                amount=payment.amount,
                status=Payment.PaymentStatus.SUCCEEDED,
                response_data=provider_payload,
            )

            return payment

    @staticmethod
    def mark_payment_failed(payment, payment_status, provider_payload, error_message=""):
        with transaction.atomic():
            payment = Payment.objects.select_for_update().select_related("order").get(id=payment.id)
            if payment.payment_status in PaymentFinalizationService.TERMINAL_PAYMENT_STATUSES:
                return payment

            order = Order.objects.select_for_update().get(id=payment.order_id)

            payment.payment_status = payment_status
            payment.payment_response = provider_payload
            payment.finalized_at = payment.finalized_at or timezone.now()
            payment.save(
                update_fields=[
                    "payment_status",
                    "payment_response",
                    "finalized_at",
                    "updated_at",
                ]
            )

            order.payment_status = Order.PaymentStatus.FAILED
            order.save(update_fields=["payment_status", "updated_at"])

            PaymentAttempt.objects.create(
                payment=payment,
                order=order,
                provider=payment.provider,
                provider_reference=payment.checkout_request_id or payment.transaction_id or "",
                amount=payment.amount,
                status=payment_status,
                response_data=provider_payload,
                error_message=error_message,
            )

            return payment
