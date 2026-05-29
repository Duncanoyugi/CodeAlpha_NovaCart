# backend/reviews/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404

from ..models.base import Review
from ..serializers import (
    ReviewSerializer, CreateReviewSerializer, UpdateReviewSerializer,
    AdminReviewActionSerializer, ReviewHelpfulSerializer
)
from ..services.review_service import ReviewService, AdminReviewService

# ==================== PUBLIC REVIEW ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def product_reviews(request, product_id):
    """Get reviews for a specific product"""
    result = ReviewService.get_product_reviews(product_id, request.query_params)
    serializer = ReviewSerializer(result['reviews'], many=True)
    
    return Response({
        'success': True,
        'data': {
            'reviews': serializer.data,
            'pagination': {
                'total_count': result['total_count'],
                'page': result['page'],
                'page_size': result['page_size'],
                'total_pages': result['total_pages']
            }
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def review_statistics(request, product_id):
    """Get review statistics for a product"""
    stats = ReviewService.get_review_statistics(product_id)
    
    return Response({
        'success': True,
        'data': stats
    }, status=status.HTTP_200_OK)

# ==================== AUTHENTICATED REVIEW ENDPOINTS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """Create a new review"""
    serializer = CreateReviewSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        review = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Review submitted successfully. It will be visible after admin approval.',
            'data': ReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_review(request, review_id):
    """Update own review"""
    review = get_object_or_404(Review, id=review_id, user=request.user)
    serializer = UpdateReviewSerializer(review, data=request.data, partial=True)
    
    if serializer.is_valid():
        review = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Review updated successfully',
            'data': ReviewSerializer(review).data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    """Delete own review"""
    review = get_object_or_404(Review, id=review_id, user=request.user)
    review.delete()
    
    return Response({
        'success': True,
        'message': 'Review deleted successfully'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_helpful(request, review_id):
    """Mark a review as helpful or not helpful"""
    serializer = ReviewHelpfulSerializer(data=request.data)
    
    if serializer.is_valid():
        review = ReviewService.mark_helpful(
            review_id=review_id,
            user=request.user,
            is_helpful=serializer.validated_data['is_helpful']
        )
        
        return Response({
            'success': True,
            'message': 'Vote recorded',
            'data': {
                'helpful_count': review.helpful_count,
                'not_helpful_count': review.not_helpful_count
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# ==================== ADMIN REVIEW ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_pending_reviews(request):
    """Get all pending reviews (admin only)"""
    reviews = AdminReviewService.get_pending_reviews()
    serializer = ReviewSerializer(reviews, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_all_reviews(request):
    """Get all reviews with filters (admin only)"""
    queryset = Review.objects.all().order_by('-created_at')
    
    # Filter by approval status
    is_approved = request.query_params.get('is_approved')
    if is_approved is not None:
        queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
    
    # Filter by product
    product_id = request.query_params.get('product_id')
    if product_id:
        queryset = queryset.filter(product_id=product_id)
    
    # Pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    paginated = queryset[start:end]
    serializer = ReviewSerializer(paginated, many=True)
    
    return Response({
        'success': True,
        'data': {
            'reviews': serializer.data,
            'pagination': {
                'total': queryset.count(),
                'page': page,
                'page_size': page_size,
                'total_pages': (queryset.count() + page_size - 1) // page_size
            }
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_review_action(request, review_id):
    """Approve, reject, or respond to a review (admin only)"""
    serializer = AdminReviewActionSerializer(data=request.data)
    
    if serializer.is_valid():
        action = serializer.validated_data['action']
        
        if action == 'approve':
            review = AdminReviewService.approve_review(review_id)
            message = 'Review approved successfully'
        elif action == 'reject':
            AdminReviewService.reject_review(review_id)
            return Response({
                'success': True,
                'message': 'Review rejected and removed'
            }, status=status.HTTP_200_OK)
        elif action == 'respond':
            response_text = serializer.validated_data.get('admin_response', '')
            if not response_text:
                return Response({
                    'success': False,
                    'message': 'Admin response is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            review = AdminReviewService.add_admin_response(review_id, response_text)
            message = 'Admin response added'
        else:
            return Response({
                'success': False,
                'message': 'Invalid action'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': message,
            'data': ReviewSerializer(review).data if 'review' in locals() else None
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)