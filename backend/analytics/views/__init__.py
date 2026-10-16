# backend/analytics/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from config.permissions import IsAdminRole, IsStaffOrAdminRole
from ..services.analytics_service import AnalyticsService

@api_view(['GET'])
@permission_classes([IsAdminRole])
def dashboard_stats(request):
    """Get main dashboard statistics"""
    stats = AnalyticsService.get_dashboard_stats()
    
    return Response({
        'success': True,
        'data': stats
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminRole])
def sales_overview(request):
    """Get sales overview chart data"""
    days = int(request.query_params.get('days', 30))
    sales_data = AnalyticsService.get_sales_overview(days)
    
    return Response({
        'success': True,
        'data': sales_data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminRole])
def top_products(request):
    """Get top selling products"""
    limit = int(request.query_params.get('limit', 10))
    days = int(request.query_params.get('days', 30))
    top_products = AnalyticsService.get_top_products(limit, days)
    
    return Response({
        'success': True,
        'data': top_products
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminRole])
def category_sales(request):
    """Get sales by category"""
    days = int(request.query_params.get('days', 30))
    categories = AnalyticsService.get_category_sales(days)
    
    return Response({
        'success': True,
        'data': categories
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminRole])
def recent_orders(request):
    """Get recent orders"""
    limit = int(request.query_params.get('limit', 10))
    orders = AnalyticsService.get_recent_orders(limit)
    
    return Response({
        'success': True,
        'data': orders
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminRole])
def revenue_chart(request):
    """Get revenue chart data by period"""
    period = request.query_params.get('period', 'month')
    data = AnalyticsService.get_revenue_by_period(period)
    
    return Response({
        'success': True,
        'data': data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminRole])
def customer_insights(request):
    """Get customer insights"""
    insights = AnalyticsService.get_customer_insights()
    
    return Response({
        'success': True,
        'data': insights
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminRole])
def inventory_status(request):
    """Get inventory status"""
    inventory = AnalyticsService.get_inventory_status()
    
    return Response({
        'success': True,
        'data': inventory
    }, status=status.HTTP_200_OK)