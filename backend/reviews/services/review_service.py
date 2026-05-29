# backend/reviews/services/review_service.py
from django.db import transaction
from django.utils import timezone
from django.db.models import Avg, Count, Q
from ..models.base import Review, ReviewHelpful
from products.services.product_service import ProductService

class ReviewService:
    """Business logic for reviews"""
    
    @staticmethod
    def get_product_reviews(product_id, request_data):
        """Get reviews for a specific product with filters"""
        queryset = Review.objects.filter(product_id=product_id, is_approved=True)
        
        # Filter by rating
        rating = request_data.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Filter by verified purchase only
        verified_only = request_data.get('verified_only', 'false').lower() == 'true'
        if verified_only:
            queryset = queryset.filter(is_verified_purchase=True)
        
        # Sort options
        sort_by = request_data.get('sort_by', '-created_at')
        allowed_sorts = ['-created_at', 'created_at', '-rating', 'rating', '-helpful_count']
        if sort_by in allowed_sorts:
            queryset = queryset.order_by(sort_by)
        
        # Pagination
        page = int(request_data.get('page', 1))
        page_size = int(request_data.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_reviews = queryset[start:end]
        
        return {
            'reviews': list(paginated_reviews),
            'total_count': queryset.count(),
            'page': page,
            'page_size': page_size,
            'total_pages': (queryset.count() + page_size - 1) // page_size
        }
    
    @staticmethod
    def get_review_statistics(product_id):
        """Get review statistics for a product"""
        stats = Review.objects.filter(product_id=product_id, is_approved=True).aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id'),
            rating_5=Count('id', filter=Q(rating=5)),
            rating_4=Count('id', filter=Q(rating=4)),
            rating_3=Count('id', filter=Q(rating=3)),
            rating_2=Count('id', filter=Q(rating=2)),
            rating_1=Count('id', filter=Q(rating=1)),
            verified_purchases=Count('id', filter=Q(is_verified_purchase=True)),
            with_images=Count('id', filter=Q(images__len__gt=0)),
        )
        
        # Calculate percentages
        total = stats['total_reviews'] or 1
        return {
            'average_rating': round(stats['average_rating'] or 0, 1),
            'total_reviews': stats['total_reviews'],
            'rating_distribution': {
                '5': {'count': stats['rating_5'], 'percentage': round((stats['rating_5'] / total) * 100, 1)},
                '4': {'count': stats['rating_4'], 'percentage': round((stats['rating_4'] / total) * 100, 1)},
                '3': {'count': stats['rating_3'], 'percentage': round((stats['rating_3'] / total) * 100, 1)},
                '2': {'count': stats['rating_2'], 'percentage': round((stats['rating_2'] / total) * 100, 1)},
                '1': {'count': stats['rating_1'], 'percentage': round((stats['rating_1'] / total) * 100, 1)},
            },
            'verified_purchases': stats['verified_purchases'],
            'reviews_with_images': stats['with_images']
        }
    
    @staticmethod
    def mark_helpful(review_id, user, is_helpful):
        """Mark a review as helpful or not helpful"""
        review = Review.objects.get(id=review_id)
        
        # Check if user already voted
        existing_vote = ReviewHelpful.objects.filter(review=review, user=user).first()
        
        if existing_vote:
            if existing_vote.is_helpful == is_helpful:
                # Remove vote
                existing_vote.delete()
                if is_helpful:
                    review.helpful_count -= 1
                else:
                    review.not_helpful_count -= 1
            else:
                # Change vote
                existing_vote.is_helpful = is_helpful
                existing_vote.save()
                if is_helpful:
                    review.helpful_count += 1
                    review.not_helpful_count -= 1
                else:
                    review.helpful_count -= 1
                    review.not_helpful_count += 1
        else:
            # Add new vote
            ReviewHelpful.objects.create(review=review, user=user, is_helpful=is_helpful)
            if is_helpful:
                review.helpful_count += 1
            else:
                review.not_helpful_count += 1
        
        review.save(update_fields=['helpful_count', 'not_helpful_count'])
        return review

class AdminReviewService:
    """Admin review management"""
    
    @staticmethod
    def get_pending_reviews():
        """Get reviews awaiting approval"""
        return Review.objects.filter(is_approved=False).order_by('-created_at')
    
    @staticmethod
    def approve_review(review_id):
        """Approve a review"""
        review = Review.objects.get(id=review_id)
        review.is_approved = True
        review.save(update_fields=['is_approved', 'updated_at'])
        
        # Update product rating
        from products.services.product_service import ProductService
        ProductService.update_rating(review.product)
        
        return review
    
    @staticmethod
    def reject_review(review_id):
        """Reject/delete a review"""
        review = Review.objects.get(id=review_id)
        review.delete()
        return True
    
    @staticmethod
    def add_admin_response(review_id, response):
        """Add admin response to a review"""
        review = Review.objects.get(id=review_id)
        review.admin_response = response
        review.admin_response_at = timezone.now()
        review.save(update_fields=['admin_response', 'admin_response_at', 'updated_at'])
        return review