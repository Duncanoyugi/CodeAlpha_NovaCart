# backend/products/serializers/__init__.py
from rest_framework import serializers
from rest_framework.fields import FloatField
from django.utils.text import slugify
from ..models.base import Category, Product, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'parent_name', 
                  'children', 'is_active', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []
    
    def create(self, validated_data):
        if 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price', 'stock_quantity', 'attributes', 'image_url', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product listing (minimal fields)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    final_price = serializers.FloatField(read_only=True)
    discount_percentage = serializers.FloatField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    price = serializers.FloatField(read_only=True)
    compare_price = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'short_description', 'description', 'price', 'compare_price',
                  'final_price', 'discount_percentage', 'image_url', 'images', 'category',
                  'category_name', 'category_slug', 'stock_quantity', 'sku', 'tags',
                  'rating', 'num_reviews', 'is_available', 'is_featured',
                  'is_best_seller', 'is_new_arrival', 'sold_count', 'created_at']

class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for single product (full details)"""
    category_details = CategorySerializer(source='category', read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    final_price = serializers.FloatField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    profit_margin = serializers.FloatField(read_only=True)
    discount_percentage = serializers.FloatField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    price = serializers.FloatField(read_only=True)
    compare_price = serializers.FloatField(read_only=True)
    cost_per_item = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'description', 'price', 
            'compare_price', 'final_price', 'cost_per_item', 'profit_margin',
            'category', 'category_details', 'image_url', 'images', 'stock_quantity',
            'in_stock', 'sku', 'barcode', 'tags', 'weight', 'discount_percentage',
            'is_available', 'is_featured', 'is_best_seller', 'is_new_arrival',
            'rating', 'num_reviews', 'views_count', 'sold_count', 'variants',
            'meta_title', 'meta_description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'rating', 'num_reviews', 'views_count', 
                           'sold_count', 'created_at', 'updated_at']

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products (admin only)"""
    variants = ProductVariantSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'description', 'price',
            'compare_price', 'cost_per_item', 'category', 'image_url', 'images',
            'stock_quantity', 'sku', 'barcode', 'tags', 'weight', 'discount_percentage',
            'is_available', 'is_featured', 'is_best_seller', 'is_new_arrival',
            'meta_title', 'meta_description', 'variants'
        ]
    
    def validate_sku(self, value):
        """Ensure SKU is unique"""
        instance = getattr(self, 'instance', None)
        if instance:
            if Product.objects.exclude(id=instance.id).filter(sku=value).exists():
                raise serializers.ValidationError("Product with this SKU already exists.")
        else:
            if Product.objects.filter(sku=value).exists():
                raise serializers.ValidationError("Product with this SKU already exists.")
        return value
    
    def validate_slug(self, value):
        """Ensure slug is unique"""
        if value:
            instance = getattr(self, 'instance', None)
            if instance:
                if Product.objects.exclude(id=instance.id).filter(slug=value).exists():
                    raise serializers.ValidationError("Product with this slug already exists.")
            else:
                if Product.objects.filter(slug=value).exists():
                    raise serializers.ValidationError("Product with this slug already exists.")
        return value
    
    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        
        product = Product.objects.create(**validated_data)
        
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product
    
    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if 'slug' in validated_data and validated_data['slug']:
            instance.slug = slugify(validated_data['slug'])
        elif 'name' in validated_data:
            instance.slug = slugify(validated_data['name'])
        
        instance.save()
        
        # Update variants if provided
        if variants_data is not None:
            instance.variants.all().delete()
            for variant_data in variants_data:
                ProductVariant.objects.create(product=instance, **variant_data)
        
        return instance