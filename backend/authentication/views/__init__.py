# backend/authentication/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import SimpleRateThrottle
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import secrets

from ..serializers import (
    RegisterSerializer, OTPVerifySerializer, ResendOTPSerializer,
    LoginSerializer, ResendWelcomeSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer
)
from ..services.auth_service import AuthService
from users.models.base import User


class LoginRateThrottle(SimpleRateThrottle):
    scope = 'login'

    def get_cache_key(self, request, view):
        email = (request.data.get('email') or '').lower()
        ident = email or self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}


class OtpRateThrottle(SimpleRateThrottle):
    scope = 'otp'

    def get_cache_key(self, request, view):
        email = (request.data.get('email') or '').lower()
        ident = email or self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        try:
            AuthService.send_otp_email(user, user.otp_code, request)
        except Exception as e:
            print(f"Failed to send OTP email: {e}")
        
        return Response({
            'success': True,
            'message': 'Registration successful. Please check your email for OTP verification.',
            'data': {
                'email': user.email,
                'full_name': user.full_name
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        user.is_active = True
        user.is_verified = True
        user.otp_code = None
        user.otp_attempts = 0
        user.save(update_fields=['is_active', 'is_verified', 'otp_code', 'otp_attempts'])
        
        try:
            AuthService.send_welcome_email(user)
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
        
        tokens = AuthService.generate_tokens(user)
        
        return Response({
            'success': True,
            'message': 'Email verified successfully! Welcome to NovaCart.',
            'data': {
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role
                },
                'tokens': tokens
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def resend_otp(request):
    serializer = ResendOTPSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        new_otp = str(secrets.randbelow(900000) + 100000)
        
        if user.otp_created_at and user.otp_created_at > timezone.now() - timedelta(minutes=1):
            return Response({
                'success': False,
                'message': 'Please wait 1 minute before requesting another OTP.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        user.otp_code = new_otp
        user.otp_created_at = timezone.now()
        user.otp_attempts = 0
        user.save(update_fields=['otp_code', 'otp_created_at', 'otp_attempts'])
        
        try:
            AuthService.send_otp_email(user, new_otp, request)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to send OTP email. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'message': 'New OTP sent to your email.'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login(request):
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        AuthService.record_login_history(user, request, success=True)
        tokens = AuthService.generate_tokens(user)
        
        return Response({
            'success': True,
            'message': 'Login successful.',
            'data': {
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'avatar': user.avatar
                },
                'tokens': tokens
            }
        }, status=status.HTTP_200_OK)
    
    email = request.data.get('email')
    if email:
        try:
            user = User.objects.get(email=email.lower())
            AuthService.record_login_history(user, request, success=False, failure_reason='Invalid password')
        except User.DoesNotExist:
            pass
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'success': True,
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    
    return Response({
        'success': True,
        'data': {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.full_name,
            'phone_number': user.phone_number,
            'role': user.role,
            'avatar': user.avatar,
            'is_verified': user.is_verified,
            'address': {
                'line1': user.address_line1,
                'line2': user.address_line2,
                'city': user.city,
                'state': user.state,
                'postal_code': user.postal_code,
                'country': user.country
            },
            'created_at': user.created_at,
            'last_login': user.last_login
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_welcome(request):
    serializer = ResendWelcomeSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        try:
            AuthService.send_welcome_email(user)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to send welcome email. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'message': 'Welcome email sent successfully.'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success': True,
                'message': 'If that account exists, a reset link has been sent.'
            }, status=status.HTTP_200_OK)

        user.reset_token = secrets.token_urlsafe(32)
        user.reset_token_expiry = timezone.now() + timedelta(minutes=30)
        user.save(update_fields=['reset_token', 'reset_token_expiry'])

        try:
            AuthService.send_password_reset_email(user)
        except Exception as e:
            print(f"Failed to send password reset email: {e}")

        return Response({
            'success': True,
            'message': 'If that account exists, a reset link has been sent.'
        }, status=status.HTTP_200_OK)

    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OtpRateThrottle])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['password'])
        user.reset_token = None
        user.reset_token_expiry = None
        user.save(update_fields=['password', 'reset_token', 'reset_token_expiry', 'updated_at'])

        return Response({
            'success': True,
            'message': 'Password reset successfully.'
        }, status=status.HTTP_200_OK)

    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return Response({
                'success': True,
                'access': response.data.get('access')
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Invalid or expired refresh token.'
            }, status=status.HTTP_401_UNAUTHORIZED)
