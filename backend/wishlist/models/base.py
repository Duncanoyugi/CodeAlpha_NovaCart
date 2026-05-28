# backend/wishlist/models/base.py
from django.db import models
from django.conf import settings
import uuid

class Wishlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'wishlists'
        indexes = [
            models.Index(fields=['user']),
        ]
    
    @property
    def total_items(self):
        return self.items.count()
    
    def __str__(self):
        return f"Wishlist for {self.user.email}"

class WishlistItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'wishlist_items'
        unique_together = ['wishlist', 'product']  # Can't add same product twice
        ordering = ['-added_at']
        indexes = [
            models.Index(fields=['wishlist']),
            models.Index(fields=['product']),
            models.Index(fields=['-added_at']),
        ]
    
    def __str__(self):
        return f"{self.product.name} in wishlist"