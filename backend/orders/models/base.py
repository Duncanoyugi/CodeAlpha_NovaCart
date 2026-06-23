# backend/orders/models/base.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.db.models import Sum
import uuid
import random
import string


class Order(models.Model):

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Payment'
        PROCESSING = 'processing', 'Processing'
        CONFIRMED = 'confirmed', 'Confirmed'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # FIX: prevent truncation (was 20 in DB at some point in migrations)
    order_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders'
    )

    # -----------------------
    # Order amounts
    # -----------------------
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    # -----------------------
    # Coupon
    # -----------------------
    coupon_code = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    coupon_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # -----------------------
    # Status
    # -----------------------

    # FIX: increased from implicit 20/30 risk → safe 50
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )

    payment_status = models.CharField(
        max_length=50,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True
    )

    # -----------------------
    # Shipping information
    # -----------------------
    shipping_full_name = models.CharField(max_length=255)
    shipping_email = models.EmailField(null=True, blank=True)

    # FIX: phone numbers often exceed 20 (country codes, formatting)
    shipping_phone = models.CharField(max_length=50)

    shipping_address_line1 = models.CharField(max_length=255)
    shipping_address_line2 = models.CharField(max_length=255, blank=True)

    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)

    # FIX: postal codes vary globally (Kenya, EU, US formats)
    shipping_postal_code = models.CharField(max_length=50)

    shipping_country = models.CharField(max_length=100, default='US')

    # -----------------------
    # Billing information
    # -----------------------
    billing_same_as_shipping = models.BooleanField(default=True)

    billing_full_name = models.CharField(max_length=255, blank=True)
    billing_address_line1 = models.CharField(max_length=255, blank=True)
    billing_address_line2 = models.CharField(max_length=255, blank=True)
    billing_city = models.CharField(max_length=100, blank=True)
    billing_state = models.CharField(max_length=100, blank=True)
    billing_postal_code = models.CharField(max_length=50, blank=True)
    billing_country = models.CharField(max_length=100, blank=True)

    # -----------------------
    # Payment information
    # -----------------------
    payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_details = models.JSONField(default=dict)

    # -----------------------
    # Delivery tracking
    # -----------------------
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    carrier = models.CharField(max_length=50, blank=True, null=True)
    estimated_delivery = models.DateTimeField(blank=True, null=True)

    # -----------------------
    # Notes
    # -----------------------
    customer_notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)

    # -----------------------
    # Timestamps
    # -----------------------
    placed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    processed_at = models.DateTimeField(blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-placed_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['user', '-placed_at']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['placed_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            random_str = ''.join(
                random.choices(
                    string.ascii_uppercase + string.digits,
                    k=6
                )
            )
            self.order_number = f"ORD-{timestamp}-{random_str}"

        super().save(*args, **kwargs)

    @property
    def total_items(self):
        return self.items.aggregate(
            total=Sum('quantity')
        )['total'] or 0

    @property
    def can_cancel(self):
        return self.status in [
            self.Status.PENDING,
            self.Status.PROCESSING
        ]

    @property
    def can_refund(self):
        return (
            self.payment_status == self.PaymentStatus.PAID
            and self.status not in [
                self.Status.REFUNDED,
                self.Status.CANCELLED
            ]
        )

    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"


class OrderItem(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT
    )

    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    product_image = models.URLField()

    variant_name = models.CharField(max_length=100, blank=True)
    variant_attributes = models.JSONField(default=dict)

    quantity = models.IntegerField(validators=[MinValueValidator(1)])

    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_items'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['product']),
        ]

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"