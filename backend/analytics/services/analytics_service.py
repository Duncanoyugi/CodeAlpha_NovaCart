# backend/analytics/services/analytics_service.py
from django.db.models import Sum, Count, Q, Avg, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from orders.models.base import Order
from products.models.base import Product, Category
from users.models.base import User

class AnalyticsService:
    """Admin dashboard analytics service"""
    
    @staticmethod
    def get_dashboard_stats():
        """Get main dashboard statistics"""
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Current period stats
        current_orders = Order.objects.filter(placed_at__date__gte=week_ago)
        current_revenue = current_orders.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')
        
        # Previous period stats (for comparison)
        previous_week_start = week_ago - timedelta(days=7)
        previous_week_end = week_ago
        previous_orders = Order.objects.filter(
            placed_at__date__gte=previous_week_start,
            placed_at__date__lt=previous_week_end
        )
        previous_revenue = previous_orders.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')
        
        # Calculate growth percentages
        revenue_growth = 0
        if previous_revenue > 0:
            revenue_growth = ((current_revenue - previous_revenue) / previous_revenue) * 100
        
        return {
            'total_revenue': float(current_revenue),
            'revenue_growth': float(revenue_growth),
            'total_orders': current_orders.count(),
            'average_order_value': float(current_revenue / current_orders.count()) if current_orders.count() > 0 else 0,
            'total_customers': User.objects.filter(role='CUSTOMER').count(),
            'new_customers': User.objects.filter(created_at__date__gte=week_ago, role='CUSTOMER').count(),
            'total_products': Product.objects.count(),
            'out_of_stock': Product.objects.filter(stock_quantity=0).count(),
            'pending_orders': Order.objects.filter(status='pending').count(),
            'processing_orders': Order.objects.filter(status='processing').count(),
        }
    
    @staticmethod
    def get_sales_overview(days=30):
        """Get sales overview for chart"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Generate daily sales data
        sales_data = []
        current_date = start_date
        
        while current_date <= end_date:
            daily_orders = Order.objects.filter(
                placed_at__date=current_date,
                payment_status='paid'
            )
            daily_revenue = daily_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
            
            sales_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'revenue': float(daily_revenue),
                'orders': daily_orders.count(),
                'average_order': float(daily_revenue / daily_orders.count()) if daily_orders.count() > 0 else 0
            })
            current_date += timedelta(days=1)
        
        return sales_data
    
    @staticmethod
    def get_top_products(limit=10, days=30):
        """Get top selling products"""
        start_date = timezone.now() - timedelta(days=days)
        
        top_products = Product.objects.filter(
            orderitem__order__placed_at__gte=start_date,
            orderitem__order__payment_status='paid'
        ).annotate(
            total_sold=Sum('orderitem__quantity'),
            total_revenue=Sum(F('orderitem__quantity') * F('orderitem__price_per_unit'))
        ).order_by('-total_sold')[:limit]
        
        result = []
        for product in top_products:
            result.append({
                'id': str(product.id),
                'name': product.name,
                'sku': product.sku,
                'price': float(product.price),
                'total_sold': product.total_sold or 0,
                'total_revenue': float(product.total_revenue or 0),
                'stock': product.stock_quantity
            })
        
        return result
    
    @staticmethod
    def get_category_sales(days=30):
        """Get sales by category"""
        start_date = timezone.now() - timedelta(days=days)
        
        categories = Category.objects.filter(
            products__orderitem__order__placed_at__gte=start_date,
            products__orderitem__order__payment_status='paid'
        ).annotate(
            total_sold=Sum('products__orderitem__quantity'),
            total_revenue=Sum(F('products__orderitem__quantity') * F('products__orderitem__price_per_unit'))
        ).order_by('-total_revenue')
        
        result = []
        for category in categories:
            if category.total_revenue:
                result.append({
                    'id': str(category.id),
                    'name': category.name,
                    'total_sold': category.total_sold or 0,
                    'total_revenue': float(category.total_revenue or 0),
                })
        
        return result
    
    @staticmethod
    def get_recent_orders(limit=10):
        """Get recent orders"""
        orders = Order.objects.select_related('user').order_by('-placed_at')[:limit]
        
        result = []
        for order in orders:
            result.append({
                'id': str(order.id),
                'order_number': order.order_number,
                'customer': {
                    'id': str(order.user.id),
                    'name': order.user.full_name,
                    'email': order.user.email
                },
                'total_amount': float(order.total_amount),
                'status': order.status,
                'payment_status': order.payment_status,
                'placed_at': order.placed_at.isoformat()
            })
        
        return result
    
    @staticmethod
    def get_revenue_by_period(period='month'):
        """Get revenue grouped by day/week/month"""
        today = timezone.now().date()
        
        if period == 'week':
            start_date = today - timedelta(days=7)
            interval = 'day'
        elif period == 'month':
            start_date = today - timedelta(days=30)
            interval = 'day'
        else:  # year
            start_date = today - timedelta(days=365)
            interval = 'month'
        
        # Query orders in period
        orders = Order.objects.filter(
            placed_at__date__gte=start_date,
            payment_status='paid'
        )
        
        # Group by date
        revenue_by_date = {}
        current = start_date
        while current <= today:
            revenue_by_date[current.strftime('%Y-%m-%d')] = Decimal('0')
            current += timedelta(days=1)
        
        for order in orders:
            date_key = order.placed_at.date().strftime('%Y-%m-%d')
            if date_key in revenue_by_date:
                revenue_by_date[date_key] += order.total_amount
        
        # Format for chart
        result = [
            {'date': date, 'revenue': float(amount)}
            for date, amount in revenue_by_date.items()
        ]
        
        return result
    
    @staticmethod
    def get_customer_insights():
        """Get customer behavior insights"""
        total_customers = User.objects.filter(role='CUSTOMER').count()
        
        # Customer lifetime value
        customer_lifetime_value = Order.objects.filter(
            payment_status='paid'
        ).aggregate(
            avg=Avg('total_amount')
        )['avg'] or Decimal('0')
        
        # Repeat customers (customers with >1 order)
        repeat_customers = User.objects.filter(
            role='CUSTOMER',
            orders__payment_status='paid'
        ).annotate(
            order_count=Count('orders')
        ).filter(order_count__gt=1).count()
        
        repeat_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0
        
        return {
            'total_customers': total_customers,
            'customer_lifetime_value': float(customer_lifetime_value),
            'repeat_customers': repeat_customers,
            'repeat_purchase_rate': round(repeat_rate, 1),
            'verified_customers': User.objects.filter(role='CUSTOMER', is_verified=True).count(),
            'customers_with_reviews': User.objects.filter(reviews__isnull=False).distinct().count()
        }
    
    @staticmethod
    def get_inventory_status():
        """Get inventory health metrics"""
        total_products = Product.objects.count()
        low_stock = Product.objects.filter(stock_quantity__lte=10, stock_quantity__gt=0).count()
        out_of_stock = Product.objects.filter(stock_quantity=0, is_available=True).count()
        in_stock = total_products - out_of_stock
        
        # Best selling with low stock (need reorder)
        needs_reorder = Product.objects.filter(
            stock_quantity__lte=20,
            sold_count__gt=10
        ).values('id', 'name', 'sku', 'stock_quantity', 'sold_count')[:10]
        
        return {
            'total_products': total_products,
            'in_stock': in_stock,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
            'needs_reorder': list(needs_reorder)
        }