# backend/wishlist/serializers/__init__.py
from rest_framework import serializers
from ..models.base import Wishlist, WishlistItem
from products.serializers import ProductListSerializer

class WishlistItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_details', 'added_at']
        read_only_fields = ['id', 'added_at']

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class AddToWishlistSerializer(serializers.Serializer):
    product_id = serializers.UUIDField(required=True)
    
    def validate_product_id(self, value):
        from products.models.base import Product
        if not Product.objects.filter(id=value, is_available=True).exists():
            raise serializers.ValidationError("Product not found or unavailable")
        return value