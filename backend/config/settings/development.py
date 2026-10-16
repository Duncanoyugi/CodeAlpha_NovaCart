# backend/config/settings/development.py
from .base import *  # noqa: F401,F403

DEBUG = True
SECRET_KEY = SECRET_KEY or 'dev-only-insecure-key-change-me'  # noqa: F405
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'testserver']

CORS_ALLOWED_ORIGINS = list({
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:3000', 'http://127.0.0.1:3000',
    *CORS_ALLOWED_ORIGINS,  # noqa: F405
})

# Emails print to the console when no SMTP credentials are configured
# or when MAIL_ENABLED is falsy (local development).
if not EMAIL_HOST_PASSWORD or not env_bool('MAIL_ENABLED', True):  # noqa: F405
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
