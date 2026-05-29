# backend/cart/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from ..models.base import Cart, CartItem
from ..serializers import (
    AddToCartSerializer, UpdateCartItemSerializer, 
    CartSerializer, CartItemSerializer
)
from ..services.cart_service import CartService

@api_view(['GET'])
@permission_classes([AllowAny])
def get_cart(request):
    """Get current user's cart"""
    # Get session key from cookie or header
    session_key = request.COOKIES.get('session_key') or request.headers.get('X-Session-Key')
    
    # Get or create cart
    if request.user.is_authenticated:
        cart = CartService.get_or_create_cart(user=request.user, session_key=session_key)
    else:
        if not session_key:
            # Generate new session key for guest
            import uuid
            session_key = str(uuid.uuid4())
        cart = CartService.get_or_create_cart(session_key=session_key)
    
    # Set session key in response cookie for guest users
    response_data = CartService.get_cart_summary(cart)
    serializer = CartSerializer(response_data)
    
    response = Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)
    
    # Set session key cookie for guest users
    if not request.user.is_authenticated and session_key:
        response.set_cookie('session_key', session_key, max_age=30*24*60*60, httponly=True)
    
    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_cart(request):
    """Add item to cart"""
    serializer = AddToCartSerializer(data=request.data)
    
    if serializer.is_valid():
        # Get or create cart
        session_key = request.COOKIES.get('session_key') or request.headers.get('X-Session-Key')
        
        if request.user.is_authenticated:
            cart = CartService.get_or_create_cart(user=request.user, session_key=session_key)
        else:
            if not session_key:
                import uuid
                session_key = str(uuid.uuid4())
            cart = CartService.get_or_create_cart(session_key=session_key)
        
        try:
            cart_item = CartService.add_to_cart(
                cart=cart,
                product_id=serializer.validated_data['product_id'],
                quantity=serializer.validated_data['quantity'],
                variant_id=serializer.validated_data.get('variant_id')
            )
            
            item_serializer = CartItemSerializer(cart_item)
            
            response = Response({
                'success': True,
                'message': 'Item added to cart successfully',
                'data': item_serializer.data
            }, status=status.HTTP_200_OK)
            
            # Set session key cookie for guest users
            if not request.user.is_authenticated and session_key:
                response.set_cookie('session_key', session_key, max_age=30*24*60*60, httponly=True)
            
            return response
            
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_cart_item(request, item_id):
    """Update cart item quantity"""
    serializer = UpdateCartItemSerializer(
        data=request.data,
        context={'cart_item_id': item_id}
    )
    
    if serializer.is_valid():
        try:
            cart_item = CartService.update_cart_item(
                item_id, 
                serializer.validated_data['quantity']
            )
            
            if cart_item:
                item_serializer = CartItemSerializer(cart_item)
                return Response({
                    'success': True,
                    'message': 'Cart updated successfully',
                    'data': item_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': True,
                    'message': 'Item removed from cart'
                }, status=status.HTTP_200_OK)
                
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def remove_from_cart(request, item_id):
    """Remove item from cart"""
    try:
        CartService.remove_from_cart(item_id)
        return Response({
            'success': True,
            'message': 'Item removed from cart'
        }, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Item not found in cart'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def clear_cart(request):
    """Clear entire cart"""
    session_key = request.COOKIES.get('session_key') or request.headers.get('X-Session-Key')
    
    if request.user.is_authenticated:
        cart = CartService.get_or_create_cart(user=request.user)
    elif session_key:
        cart = CartService.get_or_create_cart(session_key=session_key)
    else:
        return Response({
            'success': False,
            'message': 'No cart found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    CartService.clear_cart(cart)
    
    return Response({
        'success': True,
        'message': 'Cart cleared successfully'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merge_cart(request):
    """Merge guest cart with user cart after login"""
    session_key = request.data.get('session_key')
    
    if not session_key:
        return Response({
            'success': False,
            'message': 'Session key required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_cart = CartService.get_or_create_cart(user=request.user)
        CartService.merge_carts(session_key, user_cart)
        
        return Response({
            'success': True,
            'message': 'Cart merged successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)