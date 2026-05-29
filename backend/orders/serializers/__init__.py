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
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'status', 'payment_status',
            'placed_at', 'total_items'
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
    """Serializer for checkout process"""
    # Shipping information
    shipping_full_name = serializers.CharField(max_length=255)
    shipping_email = serializers.EmailField()
    shipping_phone = serializers.CharField(max_length=20)
    shipping_address_line1 = serializers.CharField(max_length=255)
    shipping_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=100, default='US')
    
    # Billing information
    billing_same_as_shipping = serializers.BooleanField(default=True)
    billing_full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_address_line1 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    billing_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    billing_state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    billing_postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    billing_country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Payment
    payment_method = serializers.CharField(max_length=50, default='stripe')
    
    # Notes
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    
    # Coupon (optional)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validate checkout data"""
        # If billing is not same as shipping, ensure billing details are provided
        if not attrs.get('billing_same_as_shipping', True):
            required_billing_fields = ['billing_full_name', 'billing_address_line1', 
                                       'billing_city', 'billing_state', 'billing_postal_code']
            for field in required_billing_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({field: "This field is required when billing differs from shipping"})
        
        return attrs

class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status (admin only)"""
    status = serializers.ChoiceField(choices=Order.Status.choices)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    tracking_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    carrier = serializers.CharField(max_length=50, required=False, allow_blank=True)
    estimated_delivery = serializers.DateTimeField(required=False, allow_null=True)