# backend/products/filters/__init__.py
from django.db.models import Q
from decimal import Decimal

class ProductFilter:
    """
    Filter class for products with various filtering options
    """
    
    @staticmethod
    def filter_by_search(queryset, search_term):
        """Filter products by search term in name, description, or tags"""
        if search_term:
            return queryset.filter(
                Q(name__icontains=search_term) |
                Q(short_description__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(tags__icontains=search_term) |
                Q(sku__icontains=search_term)
            )
        return queryset
    
    @staticmethod
    def filter_by_category(queryset, category_id=None, category_slug=None):
        """Filter products by category ID or slug"""
        if category_id:
            return queryset.filter(category_id=category_id)
        if category_slug:
            return queryset.filter(category__slug=category_slug)
        return queryset
    
    @staticmethod
    def filter_by_price_range(queryset, min_price=None, max_price=None):
        """Filter products by price range"""
        if min_price is not None:
            try:
                min_price_decimal = Decimal(str(min_price))
                queryset = queryset.filter(price__gte=min_price_decimal)
            except (ValueError, TypeError):
                pass
        
        if max_price is not None:
            try:
                max_price_decimal = Decimal(str(max_price))
                queryset = queryset.filter(price__lte=max_price_decimal)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    @staticmethod
    def filter_by_discount(queryset, on_sale=None):
        """Filter products that are on sale"""
        if on_sale and on_sale.lower() == 'true':
            return queryset.filter(discount_percentage__gt=0)
        return queryset
    
    @staticmethod
    def filter_by_availability(queryset, in_stock=None):
        """Filter products by stock availability"""
        if in_stock and in_stock.lower() == 'true':
            return queryset.filter(stock_quantity__gt=0, is_available=True)
        elif in_stock and in_stock.lower() == 'false':
            return queryset.filter(Q(stock_quantity=0) | Q(is_available=False))
        return queryset
    
    @staticmethod
    def filter_by_rating(queryset, min_rating=None):
        """Filter products by minimum rating"""
        if min_rating is not None:
            try:
                min_rating_decimal = Decimal(str(min_rating))
                queryset = queryset.filter(rating__gte=min_rating_decimal)
            except (ValueError, TypeError):
                pass
        return queryset
    
    @staticmethod
    def filter_by_tags(queryset, tags=None):
        """Filter products by tags"""
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag.strip())
        return queryset
    
    @staticmethod
    def sort_products(queryset, sort_by='-created_at'):
        """
        Sort products by various criteria
        Allowed sort fields:
        - price (ascending)
        - -price (descending)
        - created_at (oldest first)
        - -created_at (newest first)
        - name (A-Z)
        - -name (Z-A)
        - rating (lowest first)
        - -rating (highest first)
        - sold_count (least sold)
        - -sold_count (most sold)
        - views_count (least viewed)
        - -views_count (most viewed)
        """
        allowed_sorts = [
            'price', '-price', 'created_at', '-created_at',
            'name', '-name', 'rating', '-rating',
            'sold_count', '-sold_count', 'views_count', '-views_count'
        ]
        
        if sort_by in allowed_sorts:
            return queryset.order_by(sort_by)
        return queryset.order_by('-created_at')

class CategoryFilter:
    """Filter class for categories"""
    
    @staticmethod
    def filter_active(queryset, is_active=None):
        """Filter categories by active status"""
        if is_active is not None:
            if is_active.lower() == 'true':
                return queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                return queryset.filter(is_active=False)
        return queryset
    
    @staticmethod
    def filter_by_parent(queryset, parent_id=None):
        """Filter categories by parent category"""
        if parent_id:
            return queryset.filter(parent_id=parent_id)
        return queryset
    
    @staticmethod
    def sort_categories(queryset, sort_by='order'):
        """Sort categories by order or name"""
        if sort_by == 'name':
            return queryset.order_by('name')
        elif sort_by == '-name':
            return queryset.order_by('-name')
        return queryset.order_by('order', 'name')