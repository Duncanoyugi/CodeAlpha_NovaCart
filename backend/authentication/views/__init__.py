# backend/authentication/views/__init__.py
import logging
import secrets
from datetime import timedelta

from django.contrib.auth.models import update_last_login
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from users.models.base import User

from ..serializers import (
    ForgotPasswordSerializer, LoginSerializer, OTPVerifySerializer, RegisterSerializer,
    ResendOTPSerializer, ResendWelcomeSerializer, ResetPasswordSerializer,
    GoogleAuthSerializer,
)
from ..services.auth_service import AuthService, OTPService

logger = logging.getLogger(__name__)
OTP_RESEND_COOLDOWN = timedelta(seconds=60)


class _EmailScopedThrottle(SimpleRateThrottle):
    """Rate-limit per target email (falls back to client IP)."""

    def get_cache_key(self, request, view):
        email = str(request.data.get('email') or '').lower() if hasattr(request.data, 'get') else ''
        return self.cache_format % {'scope': self.scope, 'ident': email or self.get_ident(request)}


class LoginRateThrottle(_EmailScopedThrottle):
    scope = 'login'


class OtpRateThrottle(_EmailScopedThrottle):
    scope = 'otp'


def _user_payload(user):
    return {
        'id': str(user.id), 'email': user.email, 'full_name': user.full_name,
        'role': user.role, 'avatar': user.avatar, 'phone_number': user.phone_number,
        'is_verified': user.is_verified,
    }


def _errors(serializer, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'errors': serializer.errors}, status=http_status)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return _errors(serializer)
    user = serializer.save()
    email_sent = True
    try:
        AuthService.send_otp_email(user, user.otp_code, request)
    except Exception:  # noqa: BLE001
        email_sent = False
        logger.exception('Could not send OTP email to %s', user.email)
    return Response({
        'success': True,
        'message': 'Account created. Enter the 6-digit code we emailed you.' if email_sent
        else 'Account created, but we could not send your code. Tap "Resend code".',
        'data': {'email': user.email, 'full_name': user.full_name, 'email_sent': email_sent},
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    if not serializer.is_valid():
        return _errors(serializer)

    user = serializer.validated_data['user']
    user.is_active = True
    user.is_verified = True
    user.otp_code = None
    user.otp_attempts = 0
    user.save(update_fields=['is_active', 'is_verified', 'otp_code', 'otp_attempts'])
    update_last_login(None, user)

    try:
        AuthService.send_welcome_email(user)
    except Exception:  # noqa: BLE001
        logger.exception('Could not send welcome email to %s', user.email)

    return Response({
        'success': True,
        'message': 'Email verified. Welcome to NovaCart!',
        'data': {'user': _user_payload(user), 'tokens': AuthService.generate_tokens(user)},
    })


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def resend_otp(request):
    serializer = ResendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return _errors(serializer)

    generic = Response({'success': True, 'message': 'If that account is waiting for verification, a new code is on its way.'})
    user = User.objects.filter(email__iexact=serializer.validated_data['email']).first()
    if user is None or user.is_verified:
        return generic  # never reveal whether an account exists
    if user.otp_created_at and timezone.now() - user.otp_created_at < OTP_RESEND_COOLDOWN:
        return generic

    user.otp_code = OTPService.generate()
    user.otp_created_at = timezone.now()
    user.otp_attempts = 0
    user.save(update_fields=['otp_code', 'otp_created_at', 'otp_attempts'])
    try:
        AuthService.send_otp_email(user, user.otp_code, request)
    except Exception:  # noqa: BLE001
        logger.exception('Could not resend OTP to %s', user.email)
        return Response({'success': False, 'message': 'We could not send the email. Please try again shortly.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return generic


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    serializer = GoogleAuthSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return _errors(serializer, status.HTTP_401_UNAUTHORIZED)

    user = serializer.validated_data['user']
    AuthService.record_login_history(user, request, success=True)
    update_last_login(None, user)
    return Response({
        'success': True,
        'message': 'Welcome to NovaCart!',
        'data': {'user': _user_payload(user), 'tokens': AuthService.generate_tokens(user)},
    })


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        email = str(request.data.get('email', '')).strip().lower() if hasattr(request.data, 'get') else ''
        user = User.objects.filter(email__iexact=email).first() if email else None
        if user:
            AuthService.record_login_history(user, request, success=False, failure_reason='Login rejected')
        return _errors(serializer, status.HTTP_401_UNAUTHORIZED)

    user = serializer.validated_data['user']
    AuthService.record_login_history(user, request, success=True)
    update_last_login(None, user)
    return Response({
        'success': True,
        'message': 'Welcome back!',
        'data': {'user': _user_payload(user), 'tokens': AuthService.generate_tokens(user)},
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    # Blacklist all refresh tokens for this user so no stale token can be reused.
    AuthService.revoke_all_tokens(request.user)
    return Response({'success': True, 'message': 'Logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({'success': True, 'data': {
        **_user_payload(user),
        'address': {
            'line1': user.address_line1, 'line2': user.address_line2, 'city': user.city,
            'state': user.state, 'postal_code': user.postal_code, 'country': user.country,
        },
        'created_at': user.created_at,
        'last_login': user.last_login,
    }})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([OtpRateThrottle])
def resend_welcome(request):
    try:
        AuthService.send_welcome_email(request.user)
    except Exception:  # noqa: BLE001
        logger.exception('Could not send welcome email')
        return Response({'success': False, 'message': 'We could not send the email. Please try again.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response({'success': True, 'message': 'Welcome email sent.'})


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return _errors(serializer)

    generic = Response({'success': True, 'message': 'If that account exists, a reset link is on its way.'})
    user = User.objects.filter(email__iexact=serializer.validated_data['email'], is_active=True).first()
    if user is None:
        return generic

    user.reset_token = secrets.token_urlsafe(32)
    user.reset_token_expiry = timezone.now() + timedelta(minutes=30)
    user.save(update_fields=['reset_token', 'reset_token_expiry'])
    try:
        AuthService.send_password_reset_email(user)
    except Exception:  # noqa: BLE001
        logger.exception('Could not send password reset email')
    return generic


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return _errors(serializer)

    user = serializer.validated_data['user']
    user.set_password(serializer.validated_data['password'])
    user.reset_token = None
    user.reset_token_expiry = None
    user.save(update_fields=['password', 'reset_token', 'reset_token_expiry', 'updated_at'])
    AuthService.revoke_all_tokens(user)
    return Response({'success': True, 'message': 'Password updated. You can log in now.'})


class CustomTokenRefreshView(TokenRefreshView):
    """Returns the rotated refresh token too — with rotation on, the old one is dead."""

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except Exception:  # noqa: BLE001 — any invalid/expired/blacklisted token
            return Response({'success': False, 'message': 'Session expired. Please log in again.'},
                            status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'success': True,
            'access': response.data.get('access'),
            'refresh': response.data.get('refresh'),
        })
