# backend/authentication/serializers/__init__.py
import hmac
import re
import secrets

from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from authentication.services.auth_service import OTPService, GoogleAuthService
from users.models.base import User

PHONE_RE = re.compile(r'^\+?\d{9,15}$')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'full_name', 'phone_number', 'password', 'password2')
        # unique validator is replaced by validate_email so unverified sign-ups can be retried
        extra_kwargs = {'email': {'validators': []}}

    def validate_email(self, value):
        value = value.strip().lower()
        existing = User.objects.filter(email__iexact=value).first()
        if existing and existing.is_verified:
            raise serializers.ValidationError('An account with this email already exists. Try logging in.')
        return value

    def validate_full_name(self, value):
        value = ' '.join(value.split())
        if len(value) < 2:
            raise serializers.ValidationError('Please enter your full name.')
        return value

    def validate_phone_number(self, value):
        if value:
            value = re.sub(r'[\s\-()]', '', value)
            if not PHONE_RE.match(value):
                raise serializers.ValidationError('Enter a valid phone number, e.g. +254712345678.')
        return value or None

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        email = validated_data['email']

        # A previous sign-up that never verified is simply refreshed (new password + new OTP).
        user = User.objects.filter(email__iexact=email).first() or User(email=email)
        for field, value in validated_data.items():
            setattr(user, field, value)
        user.set_password(password)
        user.is_active = False
        user.is_verified = False
        user.otp_code = OTPService.generate()
        user.otp_created_at = timezone.now()
        user.otp_attempts = 0
        user.save()
        return user


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(min_length=6, max_length=6)

    MAX_ATTEMPTS = 5

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        code = attrs['otp_code'].strip()
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            # same message as a wrong code so emails can't be probed
            raise serializers.ValidationError({'otp_code': 'Invalid or expired code.'})
        if user.is_verified:
            raise serializers.ValidationError({'otp_code': 'This email is already verified. Please log in.'})

        if user.otp_attempts >= self.MAX_ATTEMPTS:
            raise serializers.ValidationError({'otp_code': 'Too many attempts. Please request a new code.'})

        ok, error = OTPService.is_valid(user, code)
        if not ok:
            user.otp_attempts += 1
            user.save(update_fields=['otp_attempts'])
            raise serializers.ValidationError({'otp_code': error})

        attrs['user'] = user
        return attrs


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        user = User.objects.filter(email__iexact=email).first()

        # Same response for "no such user" and "wrong password" — no account enumeration.
        if user is None or not user.check_password(attrs['password']):
            if user is None:
                User().set_password(attrs['password'])  # burn comparable time
            raise serializers.ValidationError({'detail': 'Incorrect email or password.', 'code': 'invalid_credentials'})
        if not user.is_verified:
            raise serializers.ValidationError({
                'detail': 'Please verify your email first. We can send you a new code.',
                'code': 'email_not_verified',
            })
        if not user.is_active:
            raise serializers.ValidationError({'detail': 'This account has been deactivated.', 'code': 'inactive'})

        attrs['user'] = user
        return attrs


class ResendWelcomeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': "Passwords don't match."})

        user = User.objects.filter(reset_token=attrs['token']).first()
        if (
            user is None
            or not user.reset_token_expiry
            or user.reset_token_expiry < timezone.now()
            or not hmac.compare_digest(user.reset_token or '', attrs['token'])
        ):
            raise serializers.ValidationError({'token': 'This reset link is invalid or has expired.'})
        attrs['user'] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    """Accepts the Google ID token (credential) that the SPA receives from @react-oauth/google."""

    token = serializers.CharField(write_only=True)

    def validate(self, attrs):
        id_token = attrs['token'].strip()
        if not id_token:
            raise serializers.ValidationError({'token': 'Google credential is required.'})

        request = self.context.get('request')
        try:
            google_info = GoogleAuthService.verify_id_token(id_token)
            user, _created = GoogleAuthService.find_or_create_user(google_info, request)
        except GoogleAuthService.GoogleVerificationError as exc:
            raise serializers.ValidationError({'detail': str(exc), 'code': 'google_auth_failed'})

        attrs['user'] = user
        return attrs
