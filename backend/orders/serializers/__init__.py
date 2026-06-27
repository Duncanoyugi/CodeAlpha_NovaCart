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
    items_summary = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'status', 'payment_status',
            'placed_at', 'total_items', 'items_summary',
            'shipping_full_name', 'shipping_email',
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

class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for single order (full details)"""
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    can_refund = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

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
    shipping_country = serializers.CharField(max_length=100, default='US')

    billing_same_as_shipping = serializers.BooleanField(default=True)
    billing_full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_address_line1 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    billing_state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    billing_postal_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    billing_country = serializers.CharField(max_length=100, required=False, allow_blank=True)

    payment_method = serializers.CharField(max_length=50, default='stripe')
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
        data['shipping_country'] = shipping.get('country', 'US')

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