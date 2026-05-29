# backend/reviews/models/base.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Review(models.Model):
    """Product review and rating model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    
    # Rating (1-5 stars)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], db_index=True)
    
    # Review content
    title = models.CharField(max_length=200)
    comment = models.TextField()
    
    # Images/Media
    images = models.JSONField(default=list)  # List of image URLs
    video_url = models.URLField(blank=True, null=True)
    
    # Verification and approval
    is_verified_purchase = models.BooleanField(default=False, help_text="User actually purchased this product")
    is_approved = models.BooleanField(default=False, db_index=True, help_text="Approved by admin")
    
    # Helpfulness votes
    helpful_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    not_helpful_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Admin response
    admin_response = models.TextField(blank=True)
    admin_response_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ['product', 'user']  # One review per product per user
        indexes = [
            models.Index(fields=['product', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['rating']),
            models.Index(fields=['is_approved']),
            models.Index(fields=['is_verified_purchase']),
            models.Index(fields=['-helpful_count']),
        ]
    
    @property
    def helpful_percentage(self):
        """Calculate helpfulness percentage"""
        total_votes = self.helpful_count + self.not_helpful_count
        if total_votes == 0:
            return 0
        return (self.helpful_count / total_votes) * 100
    
    def save(self, *args, **kwargs):
        """Auto-verify purchase if user has ordered this product"""
        if not self.is_verified_purchase and self.order is None:
            from orders.models.base import OrderItem
            has_purchased = OrderItem.objects.filter(
                order__user=self.user,
                product=self.product,
                order__payment_status='paid',
                order__status__in=['delivered', 'shipped']
            ).exists()
            self.is_verified_purchase = has_purchased
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Review by {self.user.email} for {self.product.name} - {self.rating}★"

class ReviewHelpful(models.Model):
    """Track which users found a review helpful"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_helpful = models.BooleanField(default=True)  # True=helpful, False=not helpful
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'review_helpful'
        unique_together = ['review', 'user']  # One vote per user per review
        indexes = [
            models.Index(fields=['review']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"User {self.user.email} found review {self.review.id} {'helpful' if self.is_helpful else 'not helpful'}"