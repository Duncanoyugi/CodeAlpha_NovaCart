# backend/products/models/base.py
from django.db import models
import uuid

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(unique=True, db_index=True)
    short_description = models.CharField(max_length=500)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    image_url = models.URLField()
    images = models.JSONField(default=list)  # Additional images URLs
    stock_quantity = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    tags = models.JSONField(default=list)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    num_reviews = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['is_available']),
            models.Index(fields=['price']),
            models.Index(fields=['sku']),
            models.Index(fields=['is_featured']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def final_price(self):
        if self.discount_percentage > 0:
            return self.price * (1 - self.discount_percentage / 100)
        return self.price
    
    @property
    def in_stock(self):
        return self.stock_quantity > 0 and self.is_available