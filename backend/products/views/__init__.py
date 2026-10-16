# backend/products/views/__init__.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from config.permissions import IsAdminRole, IsStaffOrAdminRole
from django.shortcuts import get_object_or_404
from django.db import transaction

from ..models.base import Category, Product
from ..serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer
)
from ..services.product_service import ProductService, CategoryService
from ..services.cloudinary_service import CloudinaryImageService

# ==================== CATEGORY VIEWS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_categories(request):
    """List active storefront categories and their nested navigation options."""
    categories = Category.objects.filter(is_active=True, parent=None)
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
@permission_classes([IsAdminRole])
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
@permission_classes([IsAdminRole])
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
@permission_classes([IsAdminRole])
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
@permission_classes([IsAdminRole])
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
@permission_classes([IsAdminRole])
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
@permission_classes([IsAdminRole])
def delete_product(request, id):
    """Delete product (admin only)"""
    product = get_object_or_404(Product, id=id)
    product.delete()
    return Response({
        'success': True,
        'message': 'Product deleted successfully'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsStaffOrAdminRole])
def update_inventory(request, id):
    """Update product inventory (admin/staff only)"""
    product = get_object_or_404(Product, id=id)
    stock_quantity = request.data.get('stock_quantity')
    
    if stock_quantity is None:
        return Response({
            'success': False,
            'message': 'stock_quantity is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    try:
        stock_quantity = int(stock_quantity)
        if stock_quantity < 0:
            raise ValueError
    except (TypeError, ValueError):
        return Response({
            'success': False,
            'message': 'stock_quantity must be a non-negative integer'
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


# ==================== IMAGE UPLOAD VIEWS ====================

@api_view(['POST'])
@permission_classes([IsAdminRole])
@parser_classes([MultiPartParser, FormParser])
def upload_product_image(request, product_id):
    """Upload a single product image to Cloudinary."""
    product = get_object_or_404(Product, id=product_id)
    
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({
            'success': False,
            'message': 'No image file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if image_file.content_type not in allowed_types:
        return Response({
            'success': False,
            'message': 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file size (max 10MB)
    if image_file.size > 10 * 1024 * 1024:
        return Response({
            'success': False,
            'message': 'File too large. Maximum size: 10MB'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        is_main = request.data.get('is_main', 'false').lower() == 'true'
        result = CloudinaryImageService.upload_product_image(image_file, product_id=product.id, is_main=is_main)
        
        # Update product with new image
        if is_main:
            product.image_url = result['url']
            product.image_public_id = result['public_id']
            product.save(update_fields=['image_url', 'image_public_id', 'updated_at'])
        else:
            # Add to images array
            images = list(product.images) if product.images else []
            images.append(result['url'])
            product.images = images
            product.save(update_fields=['images', 'updated_at'])
        
        return Response({
            'success': True,
            'message': 'Image uploaded successfully',
            'data': result
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Upload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminRole])
@parser_classes([MultiPartParser, FormParser])
def upload_product_images(request, product_id):
    """Upload multiple product images to Cloudinary."""
    product = get_object_or_404(Product, id=product_id)
    
    image_files = request.FILES.getlist('images')
    if not image_files:
        return Response({
            'success': False,
            'message': 'No image files provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate files
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    for image_file in image_files:
        if image_file.content_type not in allowed_types:
            return Response({
                'success': False,
                'message': f'Invalid file type for {image_file.name}. Allowed: JPEG, PNG, WebP, GIF'
            }, status=status.HTTP_400_BAD_REQUEST)
        if image_file.size > 10 * 1024 * 1024:
            return Response({
                'success': False,
                'message': f'File {image_file.name} too large. Maximum size: 10MB'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        results = CloudinaryImageService.upload_product_images(image_files, product.id)
        
        # Update product images array
        images = list(product.images) if product.images else []
        for result in results:
            images.append(result['url'])
        product.images = images
        product.save(update_fields=['images', 'updated_at'])
        
        return Response({
            'success': True,
            'message': f'{len(results)} images uploaded successfully',
            'data': results
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Upload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAdminRole])
def delete_product_image(request, product_id):
    """Delete a product image from Cloudinary."""
    product = get_object_or_404(Product, id=product_id)
    
    public_id = request.data.get('public_id')
    is_main = request.data.get('is_main', False)
    
    if not public_id and not is_main:
        return Response({
            'success': False,
            'message': 'public_id or is_main=true is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if is_main and product.image_public_id:
            # Delete main image
            CloudinaryImageService.delete_product_image(product.image_public_id)
            product.image_url = ''
            product.image_public_id = ''
            product.save(update_fields=['image_url', 'image_public_id', 'updated_at'])
            return Response({
                'success': True,
                'message': 'Main image deleted successfully'
            })
        elif public_id:
            # Delete from images array
            CloudinaryImageService.delete_product_image(public_id)
            images = list(product.images) if product.images else []
            # Remove by URL containing public_id
            images = [img for img in images if public_id not in img]
            product.images = images
            product.save(update_fields=['images', 'updated_at'])
            return Response({
                'success': True,
                'message': 'Image deleted successfully'
            })
        else:
            return Response({
                'success': False,
                'message': 'Image not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Delete failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminRole])
@parser_classes([MultiPartParser, FormParser])
def upload_category_image(request, category_id):
    """Upload a category image to Cloudinary."""
    category = get_object_or_404(Category, id=category_id)
    
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({
            'success': False,
            'message': 'No image file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if image_file.content_type not in allowed_types:
        return Response({
            'success': False,
            'message': 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if image_file.size > 10 * 1024 * 1024:
        return Response({
            'success': False,
            'message': 'File too large. Maximum size: 10MB'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        result = CloudinaryImageService.upload_category_image(image_file, category_id=category.id)
        
        category.image = result['url']
        category.save(update_fields=['image', 'updated_at'])
        
        return Response({
            'success': True,
            'message': 'Category image uploaded successfully',
            'data': result
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Upload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
