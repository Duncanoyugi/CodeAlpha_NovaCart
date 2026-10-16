# backend/authentication/services/auth_service.py
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework_simplejwt.tokens import RefreshToken
from users.models.base import User
from authentication.models.base import LoginHistory
from datetime import timedelta
import hmac
import secrets
import logging

logger = logging.getLogger(__name__)


class OTPService:
    """Shared OTP validation rules for all OTP-consuming endpoints."""

    EXPIRY_MINUTES = 10

    @staticmethod
    def generate():
        return str(secrets.randbelow(900000) + 100000)

    @staticmethod
    def is_valid(user, otp_code):
        if not user.otp_code or not hmac.compare_digest(str(user.otp_code), str(otp_code)):
            return False, "Invalid OTP code."
        if not user.otp_created_at:
            return False, "OTP has expired. Please request a new one."
        expires_at = user.otp_created_at + timedelta(minutes=OTPService.EXPIRY_MINUTES)
        if timezone.now() > expires_at:
            return False, "OTP has expired. Please request a new one."
        return True, ""


class AuthService:
    """Authentication business logic"""
    
    @staticmethod
    def generate_otp():
        """Generate 6-digit OTP"""
        return str(secrets.randbelow(900000) + 100000)
    
    @staticmethod
    def send_otp_email(user, otp_code, request=None):
        """Send OTP verification email"""
        subject = 'Verify Your Email - NovaCart'
        
        context = {
            'user_name': user.full_name,
            'otp_code': otp_code,
            'email': user.email,
            'year': timezone.now().year,
            'frontend_url': settings.FRONTEND_URL
        }
        
        html_message = render_to_string('emails/otp_verification.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email after successful verification"""
        subject = 'Welcome to NovaCart!'
        
        context = {
            'user_name': user.full_name,
            'email': user.email,
            'year': timezone.now().year,
            'frontend_url': settings.FRONTEND_URL
        }
        
        html_message = render_to_string('emails/welcome.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )

    @staticmethod
    def send_password_reset_email(user):
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{user.reset_token}"
        message = (
            f"Hi {user.full_name},\n\n"
            f"Use this link to reset your NovaCart password: {reset_url}\n\n"
            "If you did not request this, you can ignore this email."
        )
        send_mail(
            subject='Reset Your NovaCart Password',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    
    @staticmethod
    def revoke_all_tokens(user):
        """Invalidate every refresh token (used after a password reset/change)."""
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
        for token in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=token)

    @staticmethod
    def generate_tokens(user):
        """Generate JWT tokens for user"""
        refresh = RefreshToken.for_user(user)
        
        refresh['email'] = user.email
        refresh['role'] = user.role
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    
    @staticmethod
    def record_login_history(user, request, success=True, failure_reason=''):
        """Record login attempt for security"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        device_type = 'desktop'
        if 'Mobile' in user_agent or 'Android' in user_agent:
            device_type = 'mobile'
        elif 'iPad' in user_agent or 'Tablet' in user_agent:
            device_type = 'tablet'
        
        browser = 'unknown'
        if 'Chrome' in user_agent:
            browser = 'Chrome'
        elif 'Firefox' in user_agent:
            browser = 'Firefox'
        elif 'Safari' in user_agent:
            browser = 'Safari'
        elif 'Edge' in user_agent:
            browser = 'Edge'
        
        os = 'unknown'
        if 'Windows' in user_agent:
            os = 'Windows'
        elif 'Mac' in user_agent:
            os = 'macOS'
        elif 'Linux' in user_agent:
            os = 'Linux'
        elif 'Android' in user_agent:
            os = 'Android'
        elif 'iOS' in user_agent or 'iPhone' in user_agent:
            os = 'iOS'
        
        LoginHistory.objects.create(
            user=user,
            ip_address=ip,
            user_agent=user_agent,
            device_type=device_type,
            browser=browser,
            os=os,
            login_successful=success,
            failure_reason=failure_reason
        )


class GoogleAuthService:
    """Verify Google ID tokens and resolve them to NovaCart accounts.

    Security notes
    --------------
    * The ID token is *always* verified server-side via google-auth. We never
      trust an email or user ID that comes from the browser.
    * Google's ``sub`` claim is the stable, immutable identifier for a Google
      account — we store it on ``User.google_id`` and use it as the primary key
      for lookups.
    * New Google users are always created as ``CUSTOMER`` and ``is_verified``
      is set to ``True`` (Google has already verified the email).
    * An existing email/password account that was never linked to Google is
      **never** silently linked — the caller must log in with the original
      method instead.
    """

    GOOGLE_ISSUERS = ('https://accounts.google.com', 'accounts.google.com')

    class GoogleVerificationError(Exception):
        pass

    @staticmethod
    def verify_id_token(id_token):
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        client_id = settings.GOOGLE_CLIENT_ID
        if not client_id:
            raise GoogleAuthService.GoogleVerificationError('Google OAuth is not configured.')

        try:
            info = google_id_token.verify_oauth2_token(
                id_token,
                google_requests.Request(),
                client_id,
            )
        except ValueError:
            raise GoogleAuthService.GoogleVerificationError('Invalid Google ID token.')

        issuer = info.get('iss')
        if issuer not in GoogleAuthService.GOOGLE_ISSUERS:
            raise GoogleAuthService.GoogleVerificationError('Token issuer is not Google.')

        google_subject = info.get('sub')
        email = info.get('email')
        email_verified = info.get('email_verified', False)
        if not google_subject or not email:
            raise GoogleAuthService.GoogleVerificationError('Google token is missing required claims.')
        if not email_verified:
            raise GoogleAuthService.GoogleVerificationError('Google email is not verified.')

        return {
            'google_id': google_subject,
            'email': email.lower(),
            'full_name': info.get('name', '').strip(),
            'avatar': info.get('picture'),
        }

    @staticmethod
    def find_or_create_user(google_info, request=None):
        """Return ``(user, created)`` — always as a verified CUSTOMER."""
        google_id = google_info['google_id']
        email = google_info['email']

        # 1. Match by the stored Google subject identifier first.
        user = User.objects.filter(google_id=google_id).first()
        if user:
            if not user.is_active:
                raise GoogleAuthService.GoogleVerificationError(
                    'This account has been deactivated.'
                )
            return user, False

        # 2. Match by e-mail — but only if the existing account was also
        #    created via Google (has a google_id). An email/password account
        #    is never silently linked.
        existing = User.objects.filter(email__iexact=email).first()
        if existing:
            raise GoogleAuthService.GoogleVerificationError(
                'An account with this email already exists. Please log in with your password.'
            )

        # 3. Create a new customer account.
        full_name = google_info['full_name'] or email.split('@')[0]
        user = User(
            email=email,
            full_name=full_name,
            google_id=google_id,
            is_verified=True,
            is_active=True,
            is_staff=False,
            role=User.Role.CUSTOMER,
        )
        if google_info.get('avatar'):
            user.avatar = google_info['avatar']
        user.set_unusable_password()  # no password login for Google-only accounts
        user.save()

        if request:
            AuthService.record_login_history(user, request, success=True)

        return user, True
