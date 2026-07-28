from datetime import datetime

from django.db import transaction
from django.utils import timezone

from ....models.base import Payment
from ...payment_finalization import PaymentFinalizationService


class MPesaCallbackService:
    """Handle Daraja callback payloads idempotently."""

    SUCCESS_RESULT_CODE = 0

    @staticmethod
    def _extract_callback(payload):
        return payload.get("Body", {}).get("stkCallback", {})

    @staticmethod
    def _extract_metadata(callback):
        items = callback.get("CallbackMetadata", {}).get("Item", [])
        metadata = {}
        for item in items:
            name = item.get("Name")
            if name:
                metadata[name] = item.get("Value")
        return metadata

    @staticmethod
    def _parse_transaction_datetime(value):
        if not value:
            return None
        try:
            parsed = datetime.strptime(str(value), "%Y%m%d%H%M%S")
            return timezone.make_aware(parsed, timezone.get_current_timezone())
        except ValueError:
            return None

    @staticmethod
    def _map_failure_status(result_code):
        if result_code == 1032:
            return Payment.PaymentStatus.CANCELLED
        if result_code in {1037, 1019}:
            return Payment.PaymentStatus.EXPIRED
        return Payment.PaymentStatus.FAILED

    @staticmethod
    def process(payload):
        callback = MPesaCallbackService._extract_callback(payload)
        checkout_request_id = callback.get("CheckoutRequestID")
        if not checkout_request_id:
            return {"success": False, "error": "Missing CheckoutRequestID"}

        with transaction.atomic():
            try:
                payment = (
                    Payment.objects.select_for_update()
                    .select_related("order")
                    .get(checkout_request_id=checkout_request_id)
                )
            except Payment.DoesNotExist:
                return {"success": False, "error": "Unknown CheckoutRequestID"}

            result_code = callback.get("ResultCode")
            result_description = callback.get("ResultDesc", "")
            metadata = MPesaCallbackService._extract_metadata(callback)

            payment.callback_payload = payload
            payment.result_code = result_code
            payment.result_description = result_description
            payment.merchant_request_id = callback.get("MerchantRequestID") or payment.merchant_request_id
            payment.save(
                update_fields=[
                    "callback_payload",
                    "result_code",
                    "result_description",
                    "merchant_request_id",
                    "updated_at",
                ]
            )

            if payment.payment_status in PaymentFinalizationService.TERMINAL_PAYMENT_STATUSES:
                return {"success": True, "message": "Callback already processed", "payment_id": str(payment.id)}

            if result_code == MPesaCallbackService.SUCCESS_RESULT_CODE:
                payment.mpesa_receipt_number = metadata.get("MpesaReceiptNumber") or payment.mpesa_receipt_number
                payment.transaction_id = metadata.get("MpesaReceiptNumber") or payment.transaction_id
                payment.transaction_date = (
                    MPesaCallbackService._parse_transaction_datetime(metadata.get("TransactionDate"))
                    or payment.transaction_date
                )
                payment.phone = str(metadata.get("PhoneNumber") or payment.phone or "")
                payment.payment_status = Payment.PaymentStatus.AWAITING_CALLBACK
                payment.save(
                    update_fields=[
                        "mpesa_receipt_number",
                        "transaction_id",
                        "transaction_date",
                        "phone",
                        "payment_status",
                        "updated_at",
                    ]
                )
                PaymentFinalizationService.mark_payment_succeeded(payment, payload)
                return {"success": True, "message": "Payment marked paid", "payment_id": str(payment.id)}

            failure_status = MPesaCallbackService._map_failure_status(result_code)
            PaymentFinalizationService.mark_payment_failed(
                payment,
                failure_status,
                payload,
                error_message=result_description,
            )
            return {"success": True, "message": "Payment marked failed", "payment_id": str(payment.id)}
