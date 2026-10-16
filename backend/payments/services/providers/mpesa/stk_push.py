import base64
import logging
from datetime import timedelta
from decimal import Decimal

import requests
from django.conf import settings
from django.utils import timezone

from .auth import MPesaAuthService, MPesaConfigurationError

logger = logging.getLogger(__name__)


class MPesaSTKPushService:
    """Build and send Daraja STK push requests."""

    @staticmethod
    def _get_base_url():
        if getattr(settings, "MPESA_ENVIRONMENT", "sandbox") == "production":
            return "https://api.safaricom.co.ke"
        return "https://sandbox.safaricom.co.ke"

    @staticmethod
    def _get_stk_push_url():
        return getattr(settings, "MPESA_STK_PUSH_URL", "") or (
            f"{MPesaSTKPushService._get_base_url()}/mpesa/stkpush/v1/processrequest"
        )

    @staticmethod
    def normalize_phone(phone):
        digits = "".join(ch for ch in str(phone) if ch.isdigit())
        if digits.startswith("0") and len(digits) == 10:
            digits = f"254{digits[1:]}"
        if digits.startswith("7") and len(digits) == 9:
            digits = f"254{digits}"
        if not digits.startswith("254") or len(digits) != 12:
            raise ValueError("Phone number must be a valid Kenyan mobile number")
        return digits

    @staticmethod
    def _validate_amount(amount):
        if amount is None or Decimal(str(amount)) <= 0:
            raise ValueError("Payment amount must be greater than zero")

        normalized_amount = Decimal(str(amount)).quantize(Decimal("1"))
        if normalized_amount != Decimal(str(amount)):
            raise ValueError("M-Pesa STK Push amount must be a whole KES value")
        return int(normalized_amount)

    @staticmethod
    def _build_password(shortcode, passkey, timestamp):
        raw = f"{shortcode}{passkey}{timestamp}"
        return base64.b64encode(raw.encode("utf-8")).decode("utf-8")

    @staticmethod
    def _validate_configuration():
        shortcode = getattr(settings, "MPESA_BUSINESS_SHORTCODE", "") or getattr(settings, "MPESA_SHORTCODE", "")
        passkey = getattr(settings, "MPESA_PASSKEY", "")
        callback_url = getattr(settings, "MPESA_CALLBACK_URL", "")
        if not shortcode or not passkey or not callback_url:
            raise MPesaConfigurationError("M-Pesa shortcode, passkey, or callback URL is not configured")
        token = getattr(settings, "MPESA_CALLBACK_TOKEN", "")
        if getattr(settings, "MPESA_ENVIRONMENT", "sandbox") == "production" and not token:
            raise MPesaConfigurationError("MPESA_CALLBACK_TOKEN must be set in production")
        if token:
            callback_url = f"{callback_url}{'&' if '?' in callback_url else '?'}token={token}"
        return shortcode, passkey, callback_url

    @staticmethod
    def initiate(payment, phone):
        auth_result = MPesaAuthService.get_access_token()
        shortcode, passkey, callback_url = MPesaSTKPushService._validate_configuration()
        normalized_phone = MPesaSTKPushService.normalize_phone(phone)
        amount = MPesaSTKPushService._validate_amount(payment.amount)

        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        password = MPesaSTKPushService._build_password(shortcode, passkey, timestamp)

        account_reference = payment.order.order_number[-12:]
        transaction_desc = f"NovaCart {payment.order.order_number}"[:182]
        request_body = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": getattr(settings, "MPESA_TRANSACTION_TYPE", "CustomerPayBillOnline"),
            "Amount": amount,
            "PartyA": normalized_phone,
            "PartyB": shortcode,
            "PhoneNumber": normalized_phone,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc,
        }

        response = requests.post(
            MPesaSTKPushService._get_stk_push_url(),
            json=request_body,
            headers={
                "Authorization": f"Bearer {auth_result['access_token']}",
                "Content-Type": "application/json",
            },
            timeout=getattr(settings, "MPESA_REQUEST_TIMEOUT", 30),
        )
        if response.status_code >= 400:
            # Daraja returns JSON bodies like {"errorCode": "400.002.02",
            # "errorMessage": "Bad Request - Invalid CallBackURL"}.
            logger.error(
                'M-Pesa STK push rejected: HTTP %s %s',
                response.status_code, response.text[:500],
            )
            response.raise_for_status()
        payload = response.json()
        payload["normalized_phone"] = normalized_phone
        payload["expires_at"] = (timezone.now() + timedelta(minutes=2)).isoformat()
        return payload


    @staticmethod
    def _get_query_url():
        return getattr(settings, "MPESA_STK_QUERY_URL", "") or (
            f"{MPesaSTKPushService._get_base_url()}/mpesa/stkpushquery/v1/query"
        )

    @staticmethod
    def query_status(checkout_request_id):
        """Ask Daraja what happened to an STK push (fallback when the callback never arrives).

        Returns ``{"state": "success"|"failed"|"pending"|"unknown", "result_code": int|None, ...}``.
        """
        auth_result = MPesaAuthService.get_access_token()
        shortcode, passkey, _ = MPesaSTKPushService._validate_configuration()
        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        response = requests.post(
            MPesaSTKPushService._get_query_url(),
            json={
                "BusinessShortCode": shortcode,
                "Password": MPesaSTKPushService._build_password(shortcode, passkey, timestamp),
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id,
            },
            headers={"Authorization": f"Bearer {auth_result['access_token']}", "Content-Type": "application/json"},
            timeout=getattr(settings, "MPESA_REQUEST_TIMEOUT", 30),
        )
        try:
            payload = response.json()
        except ValueError:
            return {"state": "unknown", "result_code": None, "payload": {}}

        # Daraja answers HTTP 500 / errorCode 500.001.1001 while the prompt is still open.
        if payload.get("errorCode") == "500.001.1001":
            return {"state": "pending", "result_code": None, "payload": payload}
        if "ResultCode" not in payload:
            return {"state": "unknown", "result_code": None, "payload": payload}
        code = int(payload["ResultCode"])
        return {
            "state": "success" if code == 0 else "failed",
            "result_code": code,
            "description": payload.get("ResultDesc", ""),
            "payload": payload,
        }
