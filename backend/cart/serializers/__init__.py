# backend/cart/serializers/__init__.py
from rest_framework import serializers
from ..models.base import Cart, CartItem
from products.serializers import ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.FloatField(read_only=True)
    current_price = serializers.FloatField(read_only=True)
    savings = serializers.FloatField(read_only=True)
    price_at_add = serializers.FloatField(read_only=True)
    variant = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'variant', 'quantity', 
            'price_at_add', 'subtotal', 'current_price', 'savings', 'created_at'
        ]
        read_only_fields = ['id', 'price_at_add', 'created_at']
    
    def get_variant(self, obj):
        if obj.variant:
            return {
                'id': str(obj.variant.id),
                'name': obj.variant.name,
                'sku': obj.variant.sku,
                'price': float(obj.variant.price) if obj.variant.price else None,
            }
        return None

class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.UUIDField(required=True)
    variant_id = serializers.UUIDField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, max_value=999, default=1)
    
    def validate_product_id(self, value):
        from products.models.base import Product
        try:
            product = Product.objects.get(id=value, is_available=True)
            if product.stock_quantity < self.initial_data.get('quantity', 1):
                raise serializers.ValidationError(f"Only {product.stock_quantity} items available")
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or unavailable")

class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0, max_value=999)
    
    def validate_quantity(self, value):
        if value == 0:
            return value
        # Check stock availability when updating
        cart_item_id = self.context.get('cart_item_id')
        if cart_item_id:
            from .models import CartItem
            try:
                cart_item = CartItem.objects.get(id=cart_item_id)
                if cart_item.product.stock_quantity < value:
                    raise serializers.ValidationError(
                        f"Only {cart_item.product.stock_quantity} items available"
                    )
            except CartItem.DoesNotExist:
                pass
        return value

class CartSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)