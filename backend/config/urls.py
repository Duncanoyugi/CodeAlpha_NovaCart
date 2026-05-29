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

# Simple health check view
def health_check(request):
    from django.db import connection
    from django.conf import settings as django_settings
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "connected"
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0][:50]
    except Exception as e:
        db_status = f"error: {str(e)}"
        db_version = "unknown"
    
    return JsonResponse({
        "status": "healthy",
        "environment": "development" if django_settings.DEBUG else "production",
        "database": {
            "status": db_status,
            "name": django_settings.DATABASES['default']['NAME'],
            "host": django_settings.DATABASES['default']['HOST'],
            "version": db_version
        },
        "timestamp": "2024-03-24 10:00:00"
    })

urlpatterns = [
    # Admin and health check
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    
    # API routes
    path('api/auth/', include('authentication.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)