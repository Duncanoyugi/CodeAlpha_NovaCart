# backend/orders/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404

from ..models.base import Order
from ..serializers import (
    OrderListSerializer, OrderDetailSerializer, CheckoutSerializer,
    OrderStatusUpdateSerializer
)
from ..services.order_service import OrderService
from cart.services.cart_service import CartService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    """Convert cart to order"""
    # Get user's cart
    cart = CartService.get_or_create_cart(user=request.user)
    
    if cart.total_items == 0:
        return Response({
            'success': False,
            'message': 'Your cart is empty'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = CheckoutSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Create order from cart
            order = OrderService.create_order_from_cart(
                user=request.user,
                cart=cart,
                checkout_data=serializer.validated_data
            )
            
            # Send confirmation email
            try:
                OrderService.send_order_confirmation_email(order)
            except Exception as e:
                print(f"Failed to send order confirmation: {e}")
            
            return Response({
                'success': True,
                'message': 'Order placed successfully',
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'total_amount': order.total_amount,
                    'status': order.status
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """Get current user's orders"""
    orders = Order.objects.filter(user=request.user).order_by('-placed_at')
    
    # Pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    start = (page - 1) * page_size
    end = start + page_size
    
    paginated_orders = orders[start:end]
    serializer = OrderListSerializer(paginated_orders, many=True)
    
    return Response({
        'success': True,
        'data': {
            'orders': serializer.data,
            'pagination': {
                'total': orders.count(),
                'page': page,
                'page_size': page_size,
                'total_pages': (orders.count() + page_size - 1) // page_size
            }
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    """Get single order details"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    serializer = OrderDetailSerializer(order)
    
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """Cancel an order"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    if not order.can_cancel:
        return Response({
            'success': False,
            'message': 'Order cannot be cancelled at this stage'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    reason = request.data.get('reason', '')
    
    try:
        OrderService.cancel_order(order, reason)
        
        return Response({
            'success': True,
            'message': 'Order cancelled successfully',
            'data': {
                'order_number': order.order_number,
                'status': order.status
            }
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# ==================== ADMIN ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_orders(request):
    """List all orders (admin only)"""
    status_filter = request.query_params.get('status')
    payment_filter = request.query_params.get('payment_status')
    
    orders = Order.objects.all().order_by('-placed_at')
    
    if status_filter:
        orders = orders.filter(status=status_filter)
    if payment_filter:
        orders = orders.filter(payment_status=payment_filter)
    
    # Pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    paginated_orders = orders[start:end]
    serializer = OrderDetailSerializer(paginated_orders, many=True)
    
    return Response({
        'success': True,
        'data': {
            'orders': serializer.data,
            'pagination': {
                'total': orders.count(),
                'page': page,
                'page_size': page_size,
                'total_pages': (orders.count() + page_size - 1) // page_size
            },
            'filters': {
                'status': status_filter,
                'payment_status': payment_filter
            }
        }
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_order_status(request, order_id):
    """Update order status (admin only)"""
    order = get_object_or_404(Order, id=order_id)
    serializer = OrderStatusUpdateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            order = OrderService.update_order_status(
                order=order,
                status=serializer.validated_data['status'],
                admin_notes=serializer.validated_data.get('admin_notes', ''),
                tracking_number=serializer.validated_data.get('tracking_number'),
                carrier=serializer.validated_data.get('carrier')
            )
            
            return Response({
                'success': True,
                'message': 'Order status updated successfully',
                'data': OrderDetailSerializer(order).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def order_statistics(request):
    """Get order statistics for dashboard (admin only)"""
    from django.db.models import Sum, Count, Q
    from datetime import timedelta
    
    today = timezone.now()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    stats = {
        'total_orders': Order.objects.count(),
        'total_revenue': Order.objects.filter(payment_status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
        'pending_orders': Order.objects.filter(status='pending').count(),
        'processing_orders': Order.objects.filter(status='processing').count(),
        'shipped_orders': Order.objects.filter(status='shipped').count(),
        'delivered_orders': Order.objects.filter(status='delivered').count(),
        'cancelled_orders': Order.objects.filter(status='cancelled').count(),
        'orders_this_week': Order.objects.filter(placed_at__gte=week_ago).count(),
        'revenue_this_week': Order.objects.filter(placed_at__gte=week_ago, payment_status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
        'orders_this_month': Order.objects.filter(placed_at__gte=month_ago).count(),
        'revenue_this_month': Order.objects.filter(placed_at__gte=month_ago, payment_status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
    }
    
    return Response({
        'success': True,
        'data': stats
    }, status=status.HTTP_200_OK)