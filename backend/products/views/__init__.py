# backend/products/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction

from ..models.base import Category, Product
from ..serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer
)
from ..services.product_service import ProductService, CategoryService

# ==================== CATEGORY VIEWS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_categories(request):
    """List all active categories"""
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def category_tree(request):
    """Get hierarchical category tree"""
    categories = CategoryService.get_category_tree()
    serializer = CategorySerializer(categories, many=True)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def category_detail(request, slug):
    """Get category details by slug"""
    category = get_object_or_404(Category, slug=slug, is_active=True)
    serializer = CategorySerializer(category)
    breadcrumbs = CategoryService.get_breadcrumbs(category)
    
    return Response({
        'success': True,
        'data': {
            'category': serializer.data,
            'breadcrumbs': breadcrumbs
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_category(request):
    """Create new category (admin only)"""
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        category = serializer.save()
        return Response({
            'success': True,
            'message': 'Category created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def update_category(request, id):
    """Update category (admin only)"""
    category = get_object_or_404(Category, id=id)
    serializer = CategorySerializer(category, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Category updated successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_category(request, id):
    """Delete category (admin only)"""
    category = get_object_or_404(Category, id=id)
    category.delete()
    return Response({
        'success': True,
        'message': 'Category deleted successfully'
    }, status=status.HTTP_200_OK)

# ==================== PRODUCT VIEWS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_products(request):
    """List products with filters and pagination"""
    result = ProductService.get_filtered_products(request.query_params)
    
    serializer = ProductListSerializer(result['products'], many=True)
    
    return Response({
        'success': True,
        'data': {
            'products': serializer.data,
            'pagination': {
                'total_count': result['total_count'],
                'total_pages': result['total_pages'],
                'current_page': result['current_page'],
                'page_size': result['page_size'],
                'has_next': result['has_next'],
                'has_previous': result['has_previous']
            }
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """Get featured products"""
    products = Product.objects.filter(is_featured=True, is_available=True)[:10]
    serializer = ProductListSerializer(products, many=True)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def best_selling_products(request):
    """Get best selling products"""
    products = Product.objects.filter(is_best_seller=True, is_available=True)[:10]
    serializer = ProductListSerializer(products, many=True)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def new_arrivals(request):
    """Get new arrivals"""
    products = Product.objects.filter(is_new_arrival=True, is_available=True)[:10]
    serializer = ProductListSerializer(products, many=True)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, slug):
    """Get single product details by slug"""
    product = get_object_or_404(Product, slug=slug, is_available=True)
    
    # Increment view count
    ProductService.increment_view_count(product)
    
    serializer = ProductDetailSerializer(product)
    
    # Get related products (same category)
    related_products = Product.objects.filter(
        category=product.category, 
        is_available=True
    ).exclude(id=product.id)[:5]
    
    related_serializer = ProductListSerializer(related_products, many=True)
    
    return Response({
        'success': True,
        'data': {
            'product': serializer.data,
            'related_products': related_serializer.data
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_product(request):
    """Create new product (admin only)"""
    serializer = ProductCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        with transaction.atomic():
            product = serializer.save()
            return Response({
                'success': True,
                'message': 'Product created successfully',
                'data': ProductDetailSerializer(product).data
            }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def update_product(request, id):
    """Update product (admin only)"""
    product = get_object_or_404(Product, id=id)
    serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        with transaction.atomic():
            product = serializer.save()
            return Response({
                'success': True,
                'message': 'Product updated successfully',
                'data': ProductDetailSerializer(product).data
            }, status=status.HTTP_200_OK)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, id):
    """Delete product (admin only)"""
    product = get_object_or_404(Product, id=id)
    product.delete()
    return Response({
        'success': True,
        'message': 'Product deleted successfully'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_inventory(request, id):
    """Update product inventory (admin/staff only)"""
    from rest_framework.permissions import IsAuthenticated
    from users.models.base import User
    
    if request.user.role not in [User.Role.ADMIN, User.Role.STAFF]:
        return Response({
            'success': False,
            'message': 'Permission denied'
        }, status=status.HTTP_403_FORBIDDEN)
    
    product = get_object_or_404(Product, id=id)
    stock_quantity = request.data.get('stock_quantity')
    
    if stock_quantity is None:
        return Response({
            'success': False,
            'message': 'stock_quantity is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    product.stock_quantity = stock_quantity
    product.is_available = stock_quantity > 0
    product.save(update_fields=['stock_quantity', 'is_available', 'updated_at'])
    
    return Response({
        'success': True,
        'message': 'Inventory updated successfully',
        'data': {
            'stock_quantity': product.stock_quantity,
            'is_available': product.is_available
        }
    }, status=status.HTTP_200_OK)