# backend/authentication/urls/__init__.py
from django.urls import path
from ..views import (
    register, verify_otp, resend_otp, login, logout, me, 
    resend_welcome, CustomTokenRefreshView
)

urlpatterns = [
    # Authentication endpoints
    path('register/', register, name='register'),
    path('verify-otp/', verify_otp, name='verify-otp'),
    path('resend-otp/', resend_otp, name='resend-otp'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('me/', me, name='me'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('resend-welcome/', resend_welcome, name='resend-welcome'),
]