# backend/cart/models/base.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid

class Cart(models.Model):
    """Shopping cart model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='cart', 
        null=True, 
        blank=True
    )
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'carts'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['session_key']),
            models.Index(fields=['updated_at']),
        ]
    
    @property
    def total_items(self):
        """Total number of items in cart"""
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0
    
    @property
    def subtotal(self):
        """Subtotal without shipping and tax"""
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def shipping_cost(self):
        """Shipping cost (free over $50)"""
        if self.subtotal >= 50:
            return 0
        return 5.99
    
    @property
    def tax_amount(self):
        """Tax amount (10% tax rate)"""
        return self.subtotal * 0.10
    
    @property
    def total_amount(self):
        """Final total including shipping and tax"""
        return self.subtotal + self.shipping_cost + self.tax_amount
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Cart for session {self.session_key}"

class CartItem(models.Model):
    """Individual item in cart"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    price_at_add = models.DecimalField(max_digits=10, decimal_places=2)  # Price when added
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_items'
        unique_together = ['cart', 'product', 'variant']
        indexes = [
            models.Index(fields=['cart']),
            models.Index(fields=['product']),
            models.Index(fields=['created_at']),
        ]
    
    @property
    def subtotal(self):
        """Subtotal for this item"""
        return self.price_at_add * self.quantity
    
    @property
    def current_price(self):
        """Get current product price (with discount)"""
        if self.variant and self.variant.price:
            return self.variant.price
        return self.product.final_price
    
    @property
    def savings(self):
        """Savings if price changed since added"""
        if self.current_price < self.price_at_add:
            return (self.price_at_add - self.current_price) * self.quantity
        return 0
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"