# backend/products/services/product_service.py
from django.db.models import Q, F, Count, Avg
from django.core.paginator import Paginator
from ..models.base import Product, Category
import uuid
from decimal import Decimal, InvalidOperation

class ProductService:
    """Business logic for products"""
    
    @staticmethod
    def get_filtered_products(request_data):
        """
        Get products with filters, search, and pagination
        """
        queryset = Product.objects.filter(is_available=True).select_related('category')
        
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
            category = Category.objects.filter(id=category_id, is_active=True).first()
            queryset = queryset.filter(category_id__in=CategoryService.get_descendant_ids(category)) if category else queryset.none()
        
        category_slug = request_data.get('category_slug')
        if category_slug:
            category = Category.objects.filter(slug=category_slug, is_active=True).first()
            if not category:
                queryset = queryset.none()
            elif category.slug == 'brands':
                # Brand is a cross-cutting collection, not a physical product
                # category. Products retain their real category and are matched
                # by their normalized brand tag.
                brand_slugs = Category.objects.filter(parent=category, is_active=True).values_list('slug', flat=True)
                brand_query = Q()
                for brand_slug in brand_slugs:
                    brand_query |= Q(tags__contains=[brand_slug])
                queryset = queryset.filter(brand_query)
            elif category.parent_id and category.parent.slug == 'brands':
                queryset = queryset.filter(tags__contains=[category.slug])
            else:
                queryset = queryset.filter(category_id__in=CategoryService.get_descendant_ids(category))
        
        # Filter by price range
        min_price = request_data.get('min_price')
        max_price = request_data.get('max_price')
        try:
            if min_price:
                queryset = queryset.filter(price__gte=Decimal(str(min_price)))
            if max_price:
                queryset = queryset.filter(price__lte=Decimal(str(max_price)))
        except (InvalidOperation, ValueError):
            pass
        
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
            try:
                queryset = queryset.filter(rating__gte=Decimal(str(min_rating)))
            except (InvalidOperation, ValueError):
                pass
        
        # Sort options
        sort_by = request_data.get('sort_by', '-created_at')
        allowed_sorts = ['price', '-price', 'created_at', '-created_at', 
                        'name', '-name', 'rating', '-rating', 'sold_count', '-sold_count']
        if sort_by in allowed_sorts:
            queryset = queryset.order_by(sort_by, 'id')
        
        # Pagination (bad/oversized input is clamped instead of raising a 500)
        def _int(value, default, minimum=1, maximum=None):
            try:
                number = int(value)
            except (TypeError, ValueError):
                return default
            number = max(number, minimum)
            return min(number, maximum) if maximum else number

        page = _int(request_data.get('page', 1), 1)
        page_size = _int(request_data.get('page_size', 20), 20, maximum=100)
        
        paginator = Paginator(queryset, page_size)
        total_pages = paginator.num_pages
        current_page = paginator.get_page(page)
        page = current_page.number
        
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
        
        product.rating = round(rating_data['avg_rating'] or 0, 2)
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
    def get_descendant_ids(category):
        """Return a category and every nested category below it.

        Storefront navigation is built around collection landing pages (for
        example, Chargers & Cables). A product can live in a precise leaf
        category while its parent collection still returns it.
        """
        category_ids = [category.id]
        pending_ids = [category.id]

        while pending_ids:
            child_ids = list(
                Category.objects.filter(parent_id__in=pending_ids, is_active=True)
                .values_list('id', flat=True)
            )
            category_ids.extend(child_ids)
            pending_ids = child_ids

        return category_ids
    
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
