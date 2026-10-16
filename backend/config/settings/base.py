# backend/config/settings/base.py
"""Shared settings for every environment.

Environment-specific modules (development / production / testing) import
from here and override only what differs.
"""
import os
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / '.env')


def env_bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {'1', 'true', 'yes', 'on'}


def env_list(name, default=''):
    return [item.strip() for item in os.getenv(name, default).split(',') if item.strip()]


# --------------------------------------------------------------------------
# Core
# --------------------------------------------------------------------------
SECRET_KEY = os.getenv('SECRET_KEY', '')
DEBUG = env_bool('DEBUG', False)
ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # required for logout + refresh rotation
    'corsheaders',
    'drf_yasg',

    # Local apps
    'authentication',
    'users',
    'products',
    'cart',
    'orders',
    'payments',
    'reviews',
    'wishlist',
    'analytics',
    'mail',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# --------------------------------------------------------------------------
# Database: DATABASE_URL wins, then discrete DB_* vars, then SQLite.
# --------------------------------------------------------------------------
def _database_config():
    url = os.getenv('DATABASE_URL')
    if url:
        return dj_database_url.parse(
            url,
            conn_max_age=int(os.getenv('DB_CONN_MAX_AGE', '60')),
            conn_health_checks=True,
        )
    if os.getenv('DB_HOST') and os.getenv('DB_PASSWORD'):
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'neondb'),
            'USER': os.getenv('DB_USER', ''),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'OPTIONS': {'sslmode': os.getenv('DB_SSLMODE', 'require'), 'connect_timeout': 10},
            'CONN_MAX_AGE': int(os.getenv('DB_CONN_MAX_AGE', '60')),
            'CONN_HEALTH_CHECKS': True,
        }
    return {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}


DATABASES = {'default': _database_config()}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --------------------------------------------------------------------------
# i18n / static / media
# --------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
_static_dir = BASE_DIR / 'static'
STATICFILES_DIRS = [_static_dir] if _static_dir.exists() else []

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'

# --------------------------------------------------------------------------
# Django REST Framework
# --------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('config.authentication.GracefulJWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticatedOrReadOnly',),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'config.api_exceptions.custom_exception_handler',
    'DEFAULT_RENDERER_CLASSES': ('rest_framework.renderers.JSONRenderer',),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '300/min',
        'user': '600/min',
        'login': '10/min',
        'otp': '5/min',
        'payment': '20/min',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 30))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', 7))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# --------------------------------------------------------------------------
# CORS (headers the SPA needs for guest carts)
# --------------------------------------------------------------------------
from corsheaders.defaults import default_headers  # noqa: E402

CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = (*default_headers, 'x-session-key')
CORS_EXPOSE_HEADERS = ['X-Session-Key']

# --------------------------------------------------------------------------
# Google OAuth
# --------------------------------------------------------------------------
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')

# --------------------------------------------------------------------------
# Email (Brevo SMTP relay by default; override EMAIL_HOST for another provider)
# --------------------------------------------------------------------------
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')

_brevo_key = os.getenv('BREVO_API_KEY', '').strip()
BREVO_API_KEY = _brevo_key
_from_email = os.getenv('MAIL_FROM_EMAIL', '').strip() or os.getenv('DEFAULT_FROM_EMAIL', '').strip()
_from_name = os.getenv('MAIL_FROM_NAME', '').strip()

# Brevo requires the "from" address to be a verified sender on the account.
DEFAULT_FROM_EMAIL = (
    f"{_from_name} <{_from_email}>" if _from_email and _from_name
    else _from_email or 'NovaCart <noreply@novacart.com>'
)

EMAIL_BACKEND = (
    # Brevo's API rides on HTTPS (443); SMTP ports 587/465 are blocked on
    # some networks, so prefer the API whenever a Brevo key is configured.
    'mail.backends.BrevoApiEmailBackend' if _brevo_key
    else 'django.core.mail.backends.smtp.EmailBackend'
)
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp-relay.brevo.com' if _brevo_key else 'smtp.resend.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
# Brevo's SMTP relay authenticates with the API key as both login and password.
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', _brevo_key or 'resend')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', _brevo_key or os.getenv('RESEND_API_KEY', ''))
EMAIL_TIMEOUT = 10

# --------------------------------------------------------------------------
# Store / pricing policy. Single currency (KES) end to end so that Stripe,
# M-Pesa and the UI always agree on the amount the customer is charged.
# --------------------------------------------------------------------------
STORE_CURRENCY = os.getenv('STORE_CURRENCY', 'KES')
STORE_VAT_RATE = Decimal(os.getenv('STORE_VAT_RATE', '0.16'))
STORE_FREE_SHIPPING_THRESHOLD = Decimal(os.getenv('STORE_FREE_SHIPPING_THRESHOLD', '5000'))
STORE_FLAT_SHIPPING = Decimal(os.getenv('STORE_FLAT_SHIPPING', '300'))
# Unpaid orders release their reserved stock after this many minutes.
ORDER_PAYMENT_WINDOW_MINUTES = int(os.getenv('ORDER_PAYMENT_WINDOW_MINUTES', '30'))

# --------------------------------------------------------------------------
# Payments
# --------------------------------------------------------------------------
STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY', '')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# ---- Cloudinary --------------------------------------------------
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', '')

# ---- M-Pesa Daraja -------------------------------------------------------
MPESA_ENVIRONMENT = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
MPESA_CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY', '')
MPESA_CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET', '')
MPESA_SHORTCODE = os.getenv('MPESA_SHORTCODE', '')
MPESA_BUSINESS_SHORTCODE = os.getenv('MPESA_BUSINESS_SHORTCODE', MPESA_SHORTCODE)
MPESA_PASSKEY = os.getenv('MPESA_PASSKEY', '')
MPESA_CALLBACK_URL = os.getenv('MPESA_CALLBACK_URL', '')
# Shared secret appended to the callback URL as ?token=... so only Safaricom
# (who we gave the URL to) can reach the callback handler.
MPESA_CALLBACK_TOKEN = os.getenv('MPESA_CALLBACK_TOKEN', '')
MPESA_TRANSACTION_TYPE = os.getenv('MPESA_TRANSACTION_TYPE', 'CustomerPayBillOnline')
MPESA_REQUEST_TIMEOUT = int(os.getenv('MPESA_REQUEST_TIMEOUT', '30'))
MPESA_OAUTH_URL = os.getenv('MPESA_OAUTH_URL', '')
MPESA_STK_PUSH_URL = os.getenv('MPESA_STK_PUSH_URL', '')
MPESA_STK_QUERY_URL = os.getenv('MPESA_STK_QUERY_URL', '')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {'simple': {'format': '{levelname} {asctime} {name} {message}', 'style': '{'}},
    'handlers': {'console': {'class': 'logging.StreamHandler', 'formatter': 'simple'}},
    'root': {'handlers': ['console'], 'level': os.getenv('LOG_LEVEL', 'INFO')},
}
