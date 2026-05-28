# backend/config/settings/development.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import base settings
from .base import *

# Override for development
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# ============================================
# NEON POSTGRESQL DATABASE CONFIGURATION
# ============================================

# Get database credentials from environment variables
DB_NAME = os.getenv('DB_NAME', 'neondb')
DB_USER = os.getenv('DB_USER', 'neondb_owner')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST', 'ep-silent-resonance-ap817xfn-pooler.c-7.us-east-1.aws.neon.tech')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_SSLMODE = os.getenv('DB_SSLMODE', 'require')

# Verify critical credentials exist
if not DB_PASSWORD:
    raise ValueError(
        "❌ Database password not found in environment variables!\n"
        "Please ensure DB_PASSWORD is set in your .env file"
    )

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
        'OPTIONS': {
            'sslmode': DB_SSLMODE,
            'connect_timeout': 10,
        },
        'CONN_MAX_AGE': 600,  # Keep connections alive for better performance
        'CONN_HEALTH_CHECKS': True,
    }
}

# Optional: Use DATABASE_URL if preferred (uncomment to use)
# import dj_database_url
# DATABASES['default'] = dj_database_url.config(
#     default=os.getenv('DATABASE_URL'),
#     conn_max_age=600,
#     conn_health_checks=True,
#     ssl_require=True
# )

# Print database configuration for verification (only in development)
print(f"✅ Database configured:")
print(f"   📍 Host: {DB_HOST}")
print(f"   💾 Database: {DB_NAME}")
print(f"   👤 User: {DB_USER}")
print(f"   🔒 SSL Mode: {DB_SSLMODE}")

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]
CORS_ALLOW_CREDENTIALS = True

# Email backend for development (console - no actual emails sent)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging configuration for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'formatter': 'simple',
        },
        # Avoid file logging issues on dev machines (directory may not exist)
        'file': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'DEBUG',
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'INFO',  # Set to DEBUG to see SQL queries
            'propagate': False,
        },
    },
}

# Django Debug Toolbar (optional)
# Disabled by default for this environment because debug_toolbar may not be installed.
# if DEBUG:
#     try:
#         INSTALLED_APPS += ['debug_toolbar']
#         MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
#         INTERNAL_IPS = ['127.0.0.1']
#     except NameError:
#         pass
