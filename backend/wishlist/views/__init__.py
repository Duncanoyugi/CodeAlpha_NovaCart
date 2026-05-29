# backend/wishlist/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..serializers import WishlistSerializer, AddToWishlistSerializer
from ..services.wishlist_service import WishlistService

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    """Get user's wishlist"""
    wishlist = WishlistService.get_or_create_wishlist(request.user)
    serializer = WishlistSerializer(wishlist)
    
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    """Add product to wishlist"""
    serializer = AddToWishlistSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            wishlist_item = WishlistService.add_to_wishlist(
                user=request.user,
                product_id=serializer.validated_data['product_id']
            )
            
            return Response({
                'success': True,
                'message': 'Product added to wishlist',
                'data': {
                    'product_id': str(wishlist_item.product_id),
                    'added_at': wishlist_item.added_at
                }
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
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    """Remove product from wishlist"""
    try:
        WishlistService.remove_from_wishlist(request.user, product_id)
        return Response({
            'success': True,
            'message': 'Product removed from wishlist'
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_wishlist(request):
    """Clear entire wishlist"""
    WishlistService.clear_wishlist(request.user)
    
    return Response({
        'success': True,
        'message': 'Wishlist cleared successfully'
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_in_wishlist(request, product_id):
    """Check if product is in wishlist"""
    is_in_wishlist = WishlistService.is_in_wishlist(request.user, product_id)
    
    return Response({
        'success': True,
        'data': {
            'product_id': str(product_id),
            'in_wishlist': is_in_wishlist
        }
    }, status=status.HTTP_200_OK)