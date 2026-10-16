# backend/cart/models/base.py
import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from ..pricing import compute_totals, to_kes


class Cart(models.Model):
    """Shopping cart. Guests are identified by ``session_key``; once they log in
    the guest cart is merged into the user's cart."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='cart', null=True, blank=True,
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

    def _items(self):
        # Reuse prefetched rows when available so totals don't re-query per property.
        return list(self.items.select_related('product', 'variant').all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self._items())

    @property
    def subtotal(self):
        return sum((item.subtotal for item in self._items()), to_kes(0))

    @property
    def totals(self):
        return compute_totals(self.subtotal)

    @property
    def shipping_cost(self):
        return self.totals.shipping

    @property
    def tax_amount(self):
        return self.totals.tax

    @property
    def total_amount(self):
        return self.totals.total

    def __str__(self):
        return f"Cart for {self.user.email}" if self.user_id else f"Guest cart {self.session_key}"


class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    price_at_add = models.DecimalField(max_digits=10, decimal_places=2)
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
    def current_price(self):
        """Live price: a customer is always charged today's price, never a stale one."""
        if self.variant_id and self.variant.price:
            return to_kes(self.variant.price)
        return self.product.final_price

    @property
    def available_stock(self):
        if not self.product.is_available:
            return 0
        if self.variant_id:
            return min(self.variant.stock_quantity, self.product.stock_quantity) if self.product.stock_quantity else 0
        return self.product.stock_quantity

    @property
    def subtotal(self):
        return self.current_price * self.quantity

    @property
    def price_changed(self):
        return to_kes(self.price_at_add) != self.current_price

    @property
    def savings(self):
        if self.current_price < self.price_at_add:
            return (self.price_at_add - self.current_price) * self.quantity
        return 0

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
