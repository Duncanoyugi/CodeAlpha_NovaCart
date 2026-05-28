# backend/inventory/models/base.py
from django.db import models
from django.core.validators import MinValueValidator
import uuid

class InventoryTransaction(models.Model):
    class TransactionType(models.TextChoices):
        PURCHASE = 'purchase', 'Purchase'  # Stock received from supplier
        SALE = 'sale', 'Sale'  # Stock sold to customer
        RETURN = 'return', 'Return'  # Customer return
        ADJUSTMENT = 'adjustment', 'Adjustment'  # Manual adjustment
        DAMAGED = 'damaged', 'Damaged'  # Damaged goods
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='inventory_transactions')
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE, null=True, blank=True)
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices, db_index=True)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    reference_id = models.CharField(max_length=255, null=True, blank=True)  # Order ID, Purchase Order ID, etc.
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='inventory_changes')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'inventory_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', '-created_at']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['reference_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.transaction_type}: {self.quantity}x {self.product.name}"