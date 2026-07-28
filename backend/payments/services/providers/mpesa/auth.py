import base64
from datetime import timedelta

import requests
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone


class MPesaConfigurationError(Exception):
    pass


class MPesaAuthService:
    """OAuth token generation with cache-aware refresh."""

    CACHE_KEY = "mpesa:oauth:access_token"
    CACHE_TIMEOUT_KEY = "mpesa:oauth:expires_at"

    @staticmethod
    def _get_base_url():
        if getattr(settings, "MPESA_ENVIRONMENT", "sandbox") == "production":
            return "https://api.safaricom.co.ke"
        return "https://sandbox.safaricom.co.ke"

    @staticmethod
    def _get_oauth_url():
        return getattr(settings, "MPESA_OAUTH_URL", "") or (
            f"{MPesaAuthService._get_base_url()}/oauth/v1/generate?grant_type=client_credentials"
        )

    @staticmethod
    def _validate_credentials():
        key = getattr(settings, "MPESA_CONSUMER_KEY", "")
        secret = getattr(settings, "MPESA_CONSUMER_SECRET", "")
        if not key or not secret:
            raise MPesaConfigurationError("M-Pesa consumer credentials are not configured")
        return key, secret

    @staticmethod
    def get_access_token(force_refresh=False):
        if not force_refresh:
            cached_token = cache.get(MPesaAuthService.CACHE_KEY)
            expires_at = cache.get(MPesaAuthService.CACHE_TIMEOUT_KEY)
            if cached_token and expires_at and timezone.now() < expires_at:
                return {"success": True, "access_token": cached_token, "cached": True}

        consumer_key, consumer_secret = MPesaAuthService._validate_credentials()
        raw_credentials = f"{consumer_key}:{consumer_secret}"
        encoded_credentials = base64.b64encode(raw_credentials.encode("utf-8")).decode("utf-8")

        response = requests.get(
            MPesaAuthService._get_oauth_url(),
            headers={"Authorization": f"Basic {encoded_credentials}"},
            timeout=getattr(settings, "MPESA_REQUEST_TIMEOUT", 30),
        )
        response.raise_for_status()
        payload = response.json()

        access_token = payload.get("access_token")
        expires_in = int(payload.get("expires_in", 3599))
        if not access_token:
            raise MPesaConfigurationError("Daraja OAuth response did not include an access token")

        refresh_ttl = max(expires_in - 60, 60)
        expires_at = timezone.now() + timedelta(seconds=refresh_ttl)
        cache.set(MPesaAuthService.CACHE_KEY, access_token, refresh_ttl)
        cache.set(MPesaAuthService.CACHE_TIMEOUT_KEY, expires_at, refresh_ttl)

        return {
            "success": True,
            "access_token": access_token,
            "expires_in": expires_in,
            "cached": False,
        }
