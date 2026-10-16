# backend/orders/views/__init__.py
from datetime import timedelta

from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from cart.pricing import compute_totals
from cart.services.cart_service import CartService
from config.permissions import IsAdminRole

from ..models.base import Order
from ..serializers import (
    AdminOrderSerializer, CheckoutSerializer, OrderDetailSerializer,
    OrderListSerializer, OrderStatusUpdateSerializer,
)
from ..services.coupon_service import CouponError, CouponService
from ..services.order_service import OrderError, OrderService


def _int_param(request, name, default, minimum=1, maximum=100):
    try:
        value = int(request.query_params.get(name, default))
    except (TypeError, ValueError):
        return default
    return max(minimum, min(value, maximum))


def _paginate(request, queryset, default_size):
    page = _int_param(request, 'page', 1, maximum=10_000)
    page_size = _int_param(request, 'page_size', default_size)
    total = queryset.count()
    total_pages = max((total + page_size - 1) // page_size, 1)
    page = min(page, total_pages)
    start = (page - 1) * page_size
    return queryset[start:start + page_size], {
        'total': total, 'page': page, 'page_size': page_size, 'total_pages': total_pages,
    }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    """Convert the caller's cart into an order (payment happens next)."""
    cart = CartService.get_or_create_cart(user=request.user)
    serializer = CheckoutSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = OrderService.create_order_from_cart(
            user=request.user, cart=cart, checkout_data=serializer.validated_data,
        )
    except OrderError as exc:
        return Response({'success': False, 'message': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'success': True,
        'message': 'Order placed. Complete payment to confirm it.',
        'data': {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'total_amount': order.total_amount,
            'status': order.status,
            'payment_method': order.payment_method,
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_coupon(request):
    """Preview a coupon against the current cart without consuming it."""
    cart = CartService.get_or_create_cart(user=request.user)
    summary = CartService.get_cart_summary(cart)
    try:
        coupon = CouponService.get_valid(request.data.get('code'), summary['subtotal'])
    except CouponError as exc:
        return Response({'success': False, 'message': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    discount = CouponService.discount_for(coupon, summary['subtotal'])
    totals = compute_totals(summary['subtotal'], discount)
    return Response({'success': True, 'data': {
        'code': coupon.code, 'description': coupon.description, 'discount': discount,
        'shipping_cost': totals.shipping, 'tax_amount': totals.tax, 'total_amount': totals.total,
    }})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items').order_by('-placed_at')
    status_filter = request.query_params.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter)
    page_orders, pagination = _paginate(request, orders, 10)
    return Response({'success': True, 'data': {
        'orders': OrderListSerializer(page_orders, many=True).data,
        'pagination': pagination,
    }})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = get_object_or_404(Order.objects.prefetch_related('items'), id=order_id, user=request.user)
    return Response({'success': True, 'data': OrderDetailSerializer(order).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    try:
        order = OrderService.cancel_order(order, request.data.get('reason', ''))
    except OrderError as exc:
        return Response({'success': False, 'message': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'success': True, 'message': 'Order cancelled', 'data': {
        'order_number': order.order_number, 'status': order.status,
    }})


# ==================== ADMIN ====================

@api_view(['GET'])
@permission_classes([IsAdminRole])
def admin_list_orders(request):
    orders = Order.objects.select_related('user').prefetch_related('items').order_by('-placed_at')
    status_filter = request.query_params.get('status')
    payment_filter = request.query_params.get('payment_status')
    search = (request.query_params.get('search') or '').strip()
    if status_filter:
        orders = orders.filter(status=status_filter)
    if payment_filter:
        orders = orders.filter(payment_status=payment_filter)
    if search:
        from django.db.models import Q
        orders = orders.filter(
            Q(order_number__icontains=search) | Q(shipping_email__icontains=search)
            | Q(shipping_full_name__icontains=search) | Q(user__email__icontains=search)
        )
    page_orders, pagination = _paginate(request, orders, 20)
    return Response({'success': True, 'data': {
        'orders': AdminOrderSerializer(page_orders, many=True).data,
        'pagination': pagination,
        'filters': {'status': status_filter, 'payment_status': payment_filter},
    }})


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminRole])
def admin_update_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    serializer = OrderStatusUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    try:
        order = OrderService.update_order_status(
            order=order, status=data['status'], admin_notes=data.get('admin_notes', ''),
            tracking_number=data.get('tracking_number'), carrier=data.get('carrier'),
        )
    except OrderError as exc:
        return Response({'success': False, 'message': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'success': True, 'message': 'Order updated', 'data': AdminOrderSerializer(order).data})


@api_view(['GET'])
@permission_classes([IsAdminRole])
def order_statistics(request):
    now = timezone.now()
    week_ago, month_ago = now - timedelta(days=7), now - timedelta(days=30)
    paid = Order.objects.filter(payment_status=Order.PaymentStatus.PAID).exclude(status=Order.Status.REFUNDED)

    def revenue(qs):
        return qs.aggregate(total=Sum('total_amount'))['total'] or 0

    by_status = dict(Order.objects.values_list('status').annotate(n=Count('id')))
    return Response({'success': True, 'data': {
        'total_orders': Order.objects.count(),
        'total_revenue': revenue(paid),
        'pending_orders': by_status.get('pending', 0),
        'processing_orders': by_status.get('processing', 0),
        'shipped_orders': by_status.get('shipped', 0),
        'delivered_orders': by_status.get('delivered', 0),
        'cancelled_orders': by_status.get('cancelled', 0),
        'orders_this_week': Order.objects.filter(placed_at__gte=week_ago).count(),
        'revenue_this_week': revenue(paid.filter(placed_at__gte=week_ago)),
        'orders_this_month': Order.objects.filter(placed_at__gte=month_ago).count(),
        'revenue_this_month': revenue(paid.filter(placed_at__gte=month_ago)),
    }})
