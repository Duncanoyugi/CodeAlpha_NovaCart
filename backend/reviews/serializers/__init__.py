# backend/reviews/serializers/__init__.py
from rest_framework import serializers
from ..models.base import Review, ReviewHelpful
from products.serializers import ProductListSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.URLField(source='user.avatar', read_only=True)
    helpful_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'user_name', 'user_avatar', 'order',
            'rating', 'title', 'comment', 'images', 'video_url',
            'is_verified_purchase', 'is_approved', 'helpful_count',
            'not_helpful_count', 'helpful_percentage', 'admin_response',
            'admin_response_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_verified_purchase', 'helpful_count', 
                           'not_helpful_count', 'created_at', 'updated_at']

class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'order', 'rating', 'title', 'comment', 'images', 'video_url']
    
    def validate_product(self, value):
        """Check if product exists and is available"""
        from products.models.base import Product
        if not Product.objects.filter(id=value.id, is_available=True).exists():
            raise serializers.ValidationError("Product not found or unavailable")
        return value
    
    def validate(self, attrs):
        """Check if user has already reviewed this product"""
        user = self.context['request'].user
        product = attrs.get('product')
        
        if Review.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError({"product": "You have already reviewed this product"})
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UpdateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment', 'images', 'video_url']
    
    def validate(self, attrs):
        """Only allow updates within 30 days of creation"""
        instance = self.instance
        from django.utils import timezone
        from datetime import timedelta
        
        if instance.created_at < timezone.now() - timedelta(days=30):
            raise serializers.ValidationError("Reviews can only be edited within 30 days of posting")
        
        return attrs

class AdminReviewActionSerializer(serializers.Serializer):
    """Admin approval/rejection serializer"""
    action = serializers.ChoiceField(choices=['approve', 'reject', 'respond'])
    admin_response = serializers.CharField(required=False, allow_blank=True)

class ReviewHelpfulSerializer(serializers.Serializer):
    is_helpful = serializers.BooleanField(required=True)