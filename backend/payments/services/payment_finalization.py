# backend/payments/services/payment_finalization.py
import logging

from django.db import transaction
from django.utils import timezone

from orders.models.base import Order

from ..models.base import Payment, PaymentAttempt

logger = logging.getLogger(__name__)


class PaymentFinalizationService:
    """Provider-agnostic payment state transitions (idempotent)."""

    TERMINAL_PAYMENT_STATUSES = {
        Payment.PaymentStatus.SUCCEEDED,
        Payment.PaymentStatus.FAILED,
        Payment.PaymentStatus.CANCELLED,
        Payment.PaymentStatus.EXPIRED,
        Payment.PaymentStatus.REFUNDED,
        Payment.PaymentStatus.PARTIALLY_REFUNDED,
    }
    ACTIVE_PAYMENT_STATUSES = [
        Payment.PaymentStatus.PENDING,
        Payment.PaymentStatus.STK_SENT,
        Payment.PaymentStatus.AWAITING_CALLBACK,
    ]

    @staticmethod
    def mark_mpesa_sent(payment, response_data):
        payment.payment_status = Payment.PaymentStatus.STK_SENT
        payment.merchant_request_id = response_data.get("MerchantRequestID", "") or None
        payment.checkout_request_id = response_data.get("CheckoutRequestID", "") or None
        payment.result_code = int(response_data["ResponseCode"]) if str(response_data.get("ResponseCode", "")).isdigit() else None
        payment.result_description = response_data.get("ResponseDescription", "")
        payment.payment_response = response_data
        payment.save(update_fields=[
            "payment_status", "merchant_request_id", "checkout_request_id",
            "result_code", "result_description", "payment_response", "updated_at",
        ])
        PaymentAttempt.objects.create(
            payment=payment, order=payment.order, provider=payment.provider,
            provider_reference=payment.checkout_request_id or "", amount=payment.amount,
            status=Payment.PaymentStatus.STK_SENT, response_data=response_data,
        )

    @staticmethod
    def mark_payment_succeeded(payment, provider_payload):
        with transaction.atomic():
            payment = Payment.objects.select_for_update().select_related("order").get(id=payment.id)
            if payment.payment_status in PaymentFinalizationService.TERMINAL_PAYMENT_STATUSES:
                return payment

            order = Order.objects.select_for_update().get(id=payment.order_id)
            now = timezone.now()

            payment.payment_status = Payment.PaymentStatus.SUCCEEDED
            payment.payment_response = provider_payload
            payment.paid_at = now
            payment.finalized_at = payment.finalized_at or now
            payment.save(update_fields=["payment_status", "payment_response", "paid_at", "finalized_at", "updated_at"])

            order.payment_status = Order.PaymentStatus.PAID
            order.payment_method = payment.provider
            if order.status == Order.Status.PENDING:
                order.status = Order.Status.PROCESSING
                order.processed_at = order.processed_at or now
            elif order.status == Order.Status.CANCELLED:
                # Money arrived after the order was cancelled/expired: keep it cancelled
                # but make the refund obligation impossible to miss.
                order.admin_notes = (
                    f"PAID AFTER CANCELLATION ({payment.provider} {payment.mpesa_receipt_number or payment.transaction_id or ''})"
                    f" - REFUND REQUIRED\n{order.admin_notes}"
                ).strip()
            order.save(update_fields=["payment_status", "payment_method", "status", "processed_at", "admin_notes", "updated_at"])

            PaymentAttempt.objects.create(
                payment=payment, order=order, provider=payment.provider,
                provider_reference=payment.checkout_request_id or payment.stripe_payment_intent_id or payment.transaction_id or "",
                stripe_payment_intent_id=payment.stripe_payment_intent_id or "",
                amount=payment.amount, status=Payment.PaymentStatus.SUCCEEDED, response_data=provider_payload,
            )

            if order.status != Order.Status.CANCELLED:
                from orders.services.order_service import OrderService
                transaction.on_commit(lambda: OrderService.safe_send(OrderService.send_order_confirmation_email, order))
            return payment

    @staticmethod
    def mark_payment_failed(payment, payment_status, provider_payload, error_message=""):
        """Record a failed/cancelled/expired attempt. The order stays pending so the
        customer can retry; stock is released later by the unpaid-order expiry."""
        with transaction.atomic():
            payment = Payment.objects.select_for_update().select_related("order").get(id=payment.id)
            if payment.payment_status in PaymentFinalizationService.TERMINAL_PAYMENT_STATUSES:
                return payment

            order = Order.objects.select_for_update().get(id=payment.order_id)
            payment.payment_status = payment_status
            payment.payment_response = provider_payload
            payment.finalized_at = payment.finalized_at or timezone.now()
            payment.save(update_fields=["payment_status", "payment_response", "finalized_at", "updated_at"])

            if order.payment_status != Order.PaymentStatus.PAID:
                order.payment_status = Order.PaymentStatus.FAILED
                order.save(update_fields=["payment_status", "updated_at"])

            PaymentAttempt.objects.create(
                payment=payment, order=order, provider=payment.provider,
                provider_reference=payment.checkout_request_id or payment.stripe_payment_intent_id or payment.transaction_id or "",
                stripe_payment_intent_id=payment.stripe_payment_intent_id or "",
                amount=payment.amount, status=payment_status, response_data=provider_payload,
                error_message=error_message,
            )
            return payment
