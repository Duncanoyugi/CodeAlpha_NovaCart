# backend/reviews/models/base.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], db_index=True)
    title = models.CharField(max_length=200)
    comment = models.TextField()
    
    # Optional fields
    images = models.JSONField(default=list)  # Review images
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False, db_index=True)  # Admin approval
    
    # Helpfulness votes
    helpful_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Admin response
    admin_response = models.TextField(blank=True)
    admin_response_at = models.DateTimeField(null=True, blank=True)
    
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
        ]
    
    def __str__(self):
        return f"Review by {self.user.email} for {self.product.name} - {self.rating}★"