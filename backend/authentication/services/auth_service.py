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
import secrets


class OTPService:
    """Shared OTP validation rules for all OTP-consuming endpoints."""

    EXPIRY_MINUTES = 10

    @staticmethod
    def is_valid(user, otp_code):
        if not user.otp_code or user.otp_code != otp_code:
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
            ip = x_forwarded_for.split(',')[0]
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
