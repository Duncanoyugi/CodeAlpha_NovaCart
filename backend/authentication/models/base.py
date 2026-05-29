# backend/auth/models/base.py
from django.db import models
from django.conf import settings
import uuid

class OTPVerification(models.Model):
    """Track OTP verifications for audit"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='otp_verifications')
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'authentication_otp_verifications'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['email', 'otp_code']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"OTP for {self.email} - {'Verified' if self.is_verified else 'Pending'}"

class LoginHistory(models.Model):
    """Track user login history for security"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='login_history')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_type = models.CharField(max_length=50, blank=True)
    browser = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    login_successful = models.BooleanField(default=True)
    failure_reason = models.CharField(max_length=255, blank=True)
    logged_in_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'authentication_login_history'
        ordering = ['-logged_in_at']
        indexes = [
            models.Index(fields=['user', '-logged_in_at']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['logged_in_at']),
        ]
    
    def __str__(self):
        return f"Login for {self.user.email} at {self.logged_in_at}"