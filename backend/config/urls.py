# backend/config/urls.py
"""
URL configuration for NovaCart project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Liveness/readiness probe for the hosting platform. Never leaks DB host or credentials."""
    from django.db import connection
    from django.utils import timezone

    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        db_ok = True
    except Exception:  # noqa: BLE001
        db_ok = False
    return JsonResponse(
        {'status': 'healthy' if db_ok else 'degraded', 'database': 'connected' if db_ok else 'unreachable',
         'timestamp': timezone.now().isoformat()},
        status=200 if db_ok else 503,
    )


urlpatterns = [
    # Admin and health check
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    
    # API routes
    path('api/auth/', include('authentication.urls')),
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/wishlist/', include('wishlist.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
