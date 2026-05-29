# backend/products/services/product_service.py
from django.db.models import Q, F, Count, Avg
from django.core.paginator import Paginator
from ..models.base import Product, Category
import uuid

class ProductService:
    """Business logic for products"""
    
    @staticmethod
    def get_filtered_products(request_data):
        """
        Get products with filters, search, and pagination
        """
        queryset = Product.objects.filter(is_available=True)
        
        # Search by name or description
        search = request_data.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(short_description__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Filter by category
        category_id = request_data.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        category_slug = request_data.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by price range
        min_price = request_data.get('min_price')
        max_price = request_data.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by discount
        on_sale = request_data.get('on_sale')
        if on_sale and on_sale.lower() == 'true':
            queryset = queryset.filter(discount_percentage__gt=0)
        
        # Filter by featured
        featured = request_data.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        best_seller = request_data.get('best_seller')
        if best_seller and best_seller.lower() == 'true':
            queryset = queryset.filter(is_best_seller=True)
        
        new_arrival = request_data.get('new_arrival')
        if new_arrival and new_arrival.lower() == 'true':
            queryset = queryset.filter(is_new_arrival=True)
        
        # Filter by rating
        min_rating = request_data.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        
        # Sort options
        sort_by = request_data.get('sort_by', '-created_at')
        allowed_sorts = ['price', '-price', 'created_at', '-created_at', 
                        'name', '-name', 'rating', '-rating', 'sold_count', '-sold_count']
        if sort_by in allowed_sorts:
            queryset = queryset.order_by(sort_by)
        
        # Pagination
        page = int(request_data.get('page', 1))
        page_size = int(request_data.get('page_size', 20))
        
        paginator = Paginator(queryset, page_size)
        total_pages = paginator.num_pages
        current_page = paginator.page(page)
        
        return {
            'products': list(current_page.object_list),
            'total_count': paginator.count,
            'total_pages': total_pages,
            'current_page': page,
            'page_size': page_size,
            'has_next': current_page.has_next(),
            'has_previous': current_page.has_previous(),
        }
    
    @staticmethod
    def increment_view_count(product):
        """Increment product view count"""
        product.views_count = F('views_count') + 1
        product.save(update_fields=['views_count'])
        product.refresh_from_db()
    
    @staticmethod
    def update_rating(product):
        """Update product rating based on reviews"""
        from reviews.models.base import Review
        rating_data = Review.objects.filter(product=product, is_approved=True).aggregate(
            avg_rating=Avg('rating'),
            total_reviews=Count('id')
        )
        
        product.rating = rating_data['avg_rating'] or 0
        product.num_reviews = rating_data['total_reviews'] or 0
        product.save(update_fields=['rating', 'num_reviews'])

class CategoryService:
    """Business logic for categories"""
    
    @staticmethod
    def get_category_tree():
        """Get hierarchical category tree"""
        root_categories = Category.objects.filter(parent=None, is_active=True).order_by('order')
        return root_categories
    
    @staticmethod
    def get_breadcrumbs(category):
        """Get category breadcrumb trail"""
        breadcrumbs = []
        current = category
        while current:
            breadcrumbs.insert(0, {
                'id': str(current.id),
                'name': current.name,
                'slug': current.slug
            })
            current = current.parent
        return breadcrumbs