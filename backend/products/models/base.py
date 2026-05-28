# backend/products/models/base.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.IntegerField(default=0)  # For custom ordering
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        return self.name

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(unique=True, db_index=True)
    short_description = models.CharField(max_length=500)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    compare_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    cost_per_item = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # For profit calculation
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    image_url = models.URLField()
    image_public_id = models.CharField(max_length=255, blank=True, null=True)  # Cloudinary public ID
    images = models.JSONField(default=list)  # Additional images URLs
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)  # For inventory scanning
    tags = models.JSONField(default=list)
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Weight in kg")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_available = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_best_seller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    num_reviews = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    views_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    sold_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['price']),
            models.Index(fields=['sku']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['is_best_seller']),
            models.Index(fields=['sold_count']),
        ]
    
    def __str__(self):
        return f"{self.name} (${self.price})"
    
    @property
    def final_price(self):
        if self.discount_percentage > 0:
            return self.price * (1 - self.discount_percentage / 100)
        return self.price
    
    @property
    def in_stock(self):
        return self.stock_quantity > 0 and self.is_available
    
    @property
    def profit_margin(self):
        if self.cost_per_item and self.cost_per_item > 0:
            return ((self.price - self.cost_per_item) / self.price) * 100
        return None

class ProductVariant(models.Model):
    """For products with variants like size, color, etc."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)  # e.g., "Large - Red"
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    attributes = models.JSONField(default=dict)  # {"size": "Large", "color": "Red"}
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_variants'
        ordering = ['name']
        indexes = [
            models.Index(fields=['product', 'sku']),
            models.Index(fields=['sku']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"