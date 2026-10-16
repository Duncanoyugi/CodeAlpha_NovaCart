# backend/cart/serializers/__init__.py
from rest_framework import serializers

from products.serializers import ProductListSerializer

from ..models.base import CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.FloatField(read_only=True)
    current_price = serializers.FloatField(read_only=True)
    savings = serializers.FloatField(read_only=True)
    price_at_add = serializers.FloatField(read_only=True)
    price_changed = serializers.BooleanField(read_only=True)
    available_stock = serializers.IntegerField(read_only=True)
    variant = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'variant', 'quantity', 'price_at_add', 'subtotal',
            'current_price', 'price_changed', 'available_stock', 'savings', 'created_at',
        ]
        read_only_fields = fields

    def get_variant(self, obj):
        if obj.variant_id:
            return {
                'id': str(obj.variant.id),
                'name': obj.variant.name,
                'sku': obj.variant.sku,
                'price': float(obj.variant.price) if obj.variant.price else None,
            }
        return None


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    variant_id = serializers.UUIDField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, max_value=99, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0, max_value=99)


class CartSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    session_key = serializers.CharField(read_only=True, allow_null=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    free_shipping_threshold = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
