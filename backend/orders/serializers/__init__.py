# backend/orders/serializers/__init__.py
from rest_framework import serializers
from ..models.base import Order, OrderItem
from products.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_details', 'product_name', 'product_sku',
            'product_image', 'variant_name', 'variant_attributes', 'quantity',
            'price_per_unit', 'total_price', 'discount_applied'
        ]

class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders (minimal fields)"""
    total_items = serializers.IntegerField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    is_payable = serializers.BooleanField(read_only=True)
    items_summary = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'status', 'payment_status',
            'placed_at', 'total_items', 'items_summary', 'payment_method',
            'shipping_full_name', 'shipping_email', 'can_cancel', 'is_payable',
        ]

    def get_items_summary(self, obj):
        items = obj.items.all()[:3]
        return [
            {
                'id': str(item.id),
                'product_name': item.product_name,
                'product_image': item.product_image,
                'quantity': item.quantity,
                'total_price': float(item.total_price),
            }
            for item in items
        ]

CUSTOMER_ORDER_FIELDS = [
    'id', 'order_number', 'status', 'payment_status', 'payment_method',
    'subtotal', 'discount_amount', 'shipping_cost', 'tax_amount', 'total_amount',
    'coupon_code', 'coupon_discount',
    'shipping_full_name', 'shipping_email', 'shipping_phone', 'shipping_address_line1',
    'shipping_address_line2', 'shipping_city', 'shipping_state', 'shipping_postal_code',
    'shipping_country', 'billing_same_as_shipping', 'billing_full_name', 'billing_address_line1',
    'billing_address_line2', 'billing_city', 'billing_state', 'billing_postal_code', 'billing_country',
    'tracking_number', 'carrier', 'estimated_delivery', 'customer_notes',
    'placed_at', 'updated_at', 'processed_at', 'shipped_at', 'delivered_at', 'cancelled_at',
]


class OrderDetailSerializer(serializers.ModelSerializer):
    """What a *customer* may see about their own order (no internal notes or gateway payloads)."""
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    can_refund = serializers.BooleanField(read_only=True)
    is_payable = serializers.BooleanField(read_only=True)
    latest_payment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = CUSTOMER_ORDER_FIELDS + ['items', 'total_items', 'can_cancel', 'can_refund', 'is_payable', 'latest_payment']
        read_only_fields = fields

    def get_latest_payment(self, obj):
        payment = obj.payments.order_by('-created_at').first()
        if not payment:
            return None
        return {
            'id': str(payment.id),
            'provider': payment.provider,
            'status': payment.payment_status,
            'receipt_number': payment.mpesa_receipt_number,
            'paid_at': payment.paid_at,
        }


class AdminOrderSerializer(OrderDetailSerializer):
    """Full order for the admin dashboard."""
    customer = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_customer(self, obj):
        return {'id': str(obj.user_id), 'email': obj.user.email, 'full_name': obj.user.full_name}


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout process.

    Accepts the frontend's *nested* payload:
    {
      shipping_address: {...},
      billing_address: {...},
      payment_method, customer_notes, coupon_code
    }

    Backend uses the flattened Order fields, so we normalize nested -> flat here.
    """

    # Flat fields used by OrderService
    shipping_full_name = serializers.CharField(max_length=255)
    shipping_email = serializers.EmailField()
    shipping_phone = serializers.CharField(max_length=50)
    shipping_address_line1 = serializers.CharField(max_length=255)
    shipping_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=50)
    shipping_country = serializers.CharField(max_length=100, default='Kenya')

    billing_same_as_shipping = serializers.BooleanField(default=True)
    billing_full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_address_line1 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    billing_state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    billing_postal_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    billing_country = serializers.CharField(max_length=100, required=False, allow_blank=True)

    payment_method = serializers.ChoiceField(choices=['mpesa', 'stripe'], default='mpesa')
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def to_internal_value(self, data):
        # Make a copy since we're mutating input
        data = dict(data)

        shipping = data.pop('shipping_address', None) or {}
        billing = data.pop('billing_address', None) or {}

        if not isinstance(shipping, dict):
            raise serializers.ValidationError({'shipping_address': 'Must be an object'})
        if not isinstance(billing, dict):
            raise serializers.ValidationError({'billing_address': 'Must be an object'})

        # Normalize nested -> flat
        data['shipping_full_name'] = shipping.get('full_name', '')
        data['shipping_email'] = shipping.get('email', '')
        data['shipping_phone'] = shipping.get('phone', '')
        data['shipping_address_line1'] = shipping.get('address_line1', '')
        data['shipping_address_line2'] = shipping.get('address_line2', '')
        data['shipping_city'] = shipping.get('city', '')
        data['shipping_state'] = shipping.get('state', '')
        data['shipping_postal_code'] = shipping.get('postal_code', '')
        data['shipping_country'] = shipping.get('country') or 'Kenya'

        data['billing_same_as_shipping'] = billing.get('same_as_shipping', True)
        if not data['billing_same_as_shipping']:
            data['billing_full_name'] = billing.get('full_name', '')
            data['billing_address_line1'] = billing.get('address_line1', '')
            data['billing_address_line2'] = billing.get('address_line2', '')
            data['billing_city'] = billing.get('city', '')
            data['billing_state'] = billing.get('state', '')
            data['billing_postal_code'] = billing.get('postal_code', '')
            data['billing_country'] = billing.get('country', '')

        return super().to_internal_value(data)

    def validate_shipping_phone(self, value):
        digits = ''.join(ch for ch in value if ch.isdigit())
        if len(digits) < 9 or len(digits) > 15:
            raise serializers.ValidationError('Enter a valid phone number.')
        return value

    def validate(self, attrs):
        # Enforce required billing fields only when billing differs.
        if not attrs.get('billing_same_as_shipping', True):
            required_billing_fields = [
                'billing_full_name',
                'billing_address_line1',
                'billing_city',
                'billing_state',
                'billing_postal_code',
            ]
            missing = {f: "This field is required when billing differs from shipping" for f in required_billing_fields if not attrs.get(f)}
            if missing:
                raise serializers.ValidationError(missing)

        return attrs

class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status (admin only)"""
    status = serializers.ChoiceField(choices=Order.Status.choices)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    tracking_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    carrier = serializers.CharField(max_length=50, required=False, allow_blank=True)
    estimated_delivery = serializers.DateTimeField(required=False, allow_null=True)