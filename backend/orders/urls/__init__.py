# backend/orders/urls/__init__.py
from django.urls import path
from ..views import (
    checkout, my_orders, order_detail, cancel_order,
    admin_list_orders, admin_update_order_status, order_statistics
)

urlpatterns = [
    # Customer endpoints
    path('checkout/', checkout, name='checkout'),
    path('my-orders/', my_orders, name='my-orders'),
    path('<uuid:order_id>/', order_detail, name='order-detail'),
    path('<uuid:order_id>/cancel/', cancel_order, name='cancel-order'),
    
    # Admin endpoints
    path('admin/orders/', admin_list_orders, name='admin-orders'),
    path('admin/orders/<uuid:order_id>/status/', admin_update_order_status, name='admin-update-status'),
    path('admin/statistics/', order_statistics, name='order-statistics'),
]