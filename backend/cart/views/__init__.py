# backend/cart/views/__init__.py
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..models.base import CartItem
from ..serializers import (
    AddToCartSerializer, CartItemSerializer, CartSerializer, UpdateCartItemSerializer,
)
from ..services.cart_service import CartError, CartService

SESSION_COOKIE = 'session_key'
SESSION_MAX_AGE = 30 * 24 * 60 * 60


def _incoming_session_key(request):
    key = (
        request.headers.get('X-Session-Key')
        or request.COOKIES.get(SESSION_COOKIE)
        or (request.data.get('session_key') if hasattr(request.data, 'get') else None)
    )
    key = (key or '').strip()
    return key if 0 < len(key) <= 40 else None


def resolve_cart(request):
    """Return ``(cart, guest_session_key)`` for whoever is calling."""
    session_key = _incoming_session_key(request)
    if request.user.is_authenticated:
        return CartService.get_or_create_cart(user=request.user, session_key=session_key), None
    cart = CartService.get_or_create_cart(session_key=session_key)
    return cart, cart.session_key


def _respond(request, payload, guest_key, http_status=status.HTTP_200_OK):
    response = Response(payload, status=http_status)
    if guest_key:
        response['X-Session-Key'] = guest_key
        response.set_cookie(
            SESSION_COOKIE, guest_key, max_age=SESSION_MAX_AGE, httponly=True,
            secure=not settings.DEBUG, samesite='None' if not settings.DEBUG else 'Lax',
        )
    return response


def _cart_payload(cart):
    return CartSerializer(CartService.get_cart_summary(cart)).data


def _fail(message, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message}, status=http_status)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_cart(request):
    cart, guest_key = resolve_cart(request)
    return _respond(request, {'success': True, 'data': _cart_payload(cart)}, guest_key)


@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_cart(request):
    serializer = AddToCartSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    cart, guest_key = resolve_cart(request)
    try:
        item = CartService.add_to_cart(
            cart=cart,
            product_id=serializer.validated_data['product_id'],
            quantity=serializer.validated_data['quantity'],
            variant_id=serializer.validated_data.get('variant_id'),
        )
    except CartError as exc:
        return _respond(request, {'success': False, 'message': str(exc)}, guest_key, status.HTTP_400_BAD_REQUEST)

    payload = {
        'success': True,
        'message': 'Added to your cart',
        'data': {**CartItemSerializer(item).data, 'session_key': guest_key},
        'cart': _cart_payload(cart),
    }
    return _respond(request, payload, guest_key)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_cart_item(request, item_id):
    serializer = UpdateCartItemSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    cart, guest_key = resolve_cart(request)
    try:
        item = CartService.update_cart_item(cart, item_id, serializer.validated_data['quantity'])
    except CartItem.DoesNotExist:
        return _respond(request, {'success': False, 'message': 'Item not found in your cart'}, guest_key,
                        status.HTTP_404_NOT_FOUND)
    except CartError as exc:
        return _respond(request, {'success': False, 'message': str(exc)}, guest_key, status.HTTP_400_BAD_REQUEST)

    return _respond(request, {
        'success': True,
        'message': 'Cart updated' if item else 'Item removed from your cart',
        'data': CartItemSerializer(item).data if item else None,
        'cart': _cart_payload(cart),
    }, guest_key)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def remove_from_cart(request, item_id):
    cart, guest_key = resolve_cart(request)
    try:
        CartService.remove_from_cart(cart, item_id)
    except CartItem.DoesNotExist:
        return _respond(request, {'success': False, 'message': 'Item not found in your cart'}, guest_key,
                        status.HTTP_404_NOT_FOUND)
    return _respond(request, {
        'success': True, 'message': 'Item removed from your cart', 'cart': _cart_payload(cart),
    }, guest_key)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def clear_cart(request):
    cart, guest_key = resolve_cart(request)
    CartService.clear_cart(cart)
    return _respond(request, {'success': True, 'message': 'Cart cleared', 'cart': _cart_payload(cart)}, guest_key)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merge_cart(request):
    """Explicit merge hook the SPA calls right after login."""
    session_key = _incoming_session_key(request)
    if not session_key:
        return _fail('Session key required')
    user_cart = CartService.get_or_create_cart(user=request.user)
    CartService.merge_carts(session_key, user_cart)
    return Response({'success': True, 'message': 'Cart merged', 'data': _cart_payload(user_cart)})
