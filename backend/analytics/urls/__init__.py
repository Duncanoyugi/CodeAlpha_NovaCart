# backend/analytics/urls/__init__.py
from django.urls import path
from ..views import (
    dashboard_stats, sales_overview, top_products, category_sales,
    recent_orders, revenue_chart, customer_insights, inventory_status
)

urlpatterns = [
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
    path('sales-overview/', sales_overview, name='sales-overview'),
    path('top-products/', top_products, name='top-products'),
    path('category-sales/', category_sales, name='category-sales'),
    path('recent-orders/', recent_orders, name='recent-orders'),
    path('revenue-chart/', revenue_chart, name='revenue-chart'),
    path('customer-insights/', customer_insights, name='customer-insights'),
    path('inventory-status/', inventory_status, name='inventory-status'),
]