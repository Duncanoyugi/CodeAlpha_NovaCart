# backend/authentication/models/__init__.py
from .base import OTPVerification, LoginHistory

__all__ = ['OTPVerification', 'LoginHistory']