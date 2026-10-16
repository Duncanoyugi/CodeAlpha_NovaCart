# backend/config/settings/production.py
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403

DEBUG = False

if not SECRET_KEY or SECRET_KEY.startswith('dev-only'):  # noqa: F405
    raise ImproperlyConfigured('SECRET_KEY must be set to a strong random value in production.')
if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['localhost', '127.0.0.1']:  # noqa: F405
    raise ImproperlyConfigured('ALLOWED_HOSTS must list your production hostnames.')

# Render (and most PaaS hosts) set RENDER_EXTERNAL_HOSTNAME.
_render_host = os.getenv('RENDER_EXTERNAL_HOSTNAME')  # noqa: F405
if _render_host and _render_host not in ALLOWED_HOSTS:  # noqa: F405
    ALLOWED_HOSTS.append(_render_host)  # noqa: F405

CORS_ALLOWED_ORIGINS = [o for o in CORS_ALLOWED_ORIGINS if o != '*']  # noqa: F405
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS')  # noqa: F405

# TLS is terminated by the platform proxy.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', True)  # noqa: F405
SECURE_REDIRECT_EXEMPT = [r'^health/$']  # platform health checks hit plain HTTP
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
X_FRAME_OPTIONS = 'DENY'
