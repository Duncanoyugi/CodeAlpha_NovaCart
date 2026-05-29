# backend/authentication/serializers/__init__.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
from django.utils import timezone
from datetime import timedelta
from users.models.base import User
import re
import secrets

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'full_name', 'phone_number', 'password', 'password2')
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        # Check email format
        EmailValidator()(value)
        
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        return value.lower()
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value:
            phone_regex = r'^\+?1?\d{9,15}$'
            if not re.match(phone_regex, value):
                raise serializers.ValidationError("Phone number must be in international format (e.g., +1234567890)")
        return value
    
    def validate(self, attrs):
        """Check if passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        """Create user with inactive status until OTP verified"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = False
        user.is_verified = False
        
        user.otp_code = str(secrets.randbelow(900000) + 100000)
        user.otp_created_at = timezone.now()
        user.otp_attempts = 0
        
        user.save()
        
        return user

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(min_length=6, max_length=6)
    
    def validate(self, attrs):
        email = attrs.get('email').lower()
        otp_code = attrs.get('otp_code')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No user found with this email address."})
        
        # Check OTP
        if not user.otp_code or user.otp_code != otp_code:
            # Track failed attempt
            user.otp_attempts += 1
            user.save(update_fields=['otp_attempts'])
            
            if user.otp_attempts >= 5:
                user.otp_code = None
                user.save(update_fields=['otp_code'])
                raise serializers.ValidationError({"otp_code": "Maximum OTP attempts exceeded. Please request a new OTP."})
            
            raise serializers.ValidationError({"otp_code": "Invalid OTP code."})
        
        # Check if OTP expired (10 minutes)
        from django.utils import timezone
        from datetime import timedelta
        
        if user.otp_created_at and user.otp_created_at < timezone.now() - timedelta(minutes=10):
            raise serializers.ValidationError({"otp_code": "OTP has expired. Please request a new one."})
        
        attrs['user'] = user
        return attrs

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        value = value.lower()
        try:
            user = User.objects.get(email=value)
            if user.is_verified:
                raise serializers.ValidationError("This email is already verified.")
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email').lower()
        password = attrs.get('password')
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Invalid credentials."})
        
        # Check if user is verified
        if not user.is_verified:
            raise serializers.ValidationError({"email": "Please verify your email first. Check your inbox for OTP."})
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({"email": "This account has been deactivated."})
        
        # Authenticate
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError({"password": "Invalid credentials."})
        
        attrs['user'] = user
        return attrs

class ResendWelcomeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        value = value.lower()
        try:
            user = User.objects.get(email=value)
            if not user.is_verified:
                raise serializers.ValidationError("Please verify your email first.")
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        
        return value