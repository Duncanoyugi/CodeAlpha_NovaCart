# backend/cart/services/cart_service.py
from django.db import transaction
from ..models.base import Cart, CartItem
from products.models.base import Product, ProductVariant
import uuid

class CartService:
    """Business logic for shopping cart"""
    
    @staticmethod
    def get_or_create_cart(user=None, session_key=None):
        """Get existing cart or create new one"""
        if user and user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=user)
            # If there was a session cart, merge it
            if session_key and not created:
                CartService.merge_carts(session_key, cart)
            return cart
        
        if session_key:
            cart, created = Cart.objects.get_or_create(session_key=session_key)
            return cart
        
        # Create new cart with session key
        new_session_key = str(uuid.uuid4())
        return Cart.objects.create(session_key=new_session_key)
    
    @staticmethod
    def add_to_cart(cart, product_id, quantity=1, variant_id=None):
        """Add item to cart or update quantity if exists"""
        product = Product.objects.get(id=product_id, is_available=True)
        
        # Check stock
        if product.stock_quantity < quantity:
            raise ValueError(f"Only {product.stock_quantity} items available")
        
        # Get variant if specified
        variant = None
        price = product.final_price
        if variant_id:
            variant = ProductVariant.objects.get(id=variant_id, product=product)
            price = variant.price if variant.price else product.final_price
        
        # Check if item already exists
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity, 'price_at_add': price}
        )
        
        if not created:
            # Update quantity
            new_quantity = cart_item.quantity + quantity
            if product.stock_quantity < new_quantity:
                raise ValueError(f"Only {product.stock_quantity} items available")
            cart_item.quantity = new_quantity
            cart_item.save()
        
        return cart_item
    
    @staticmethod
    def update_cart_item(cart_item_id, quantity):
        """Update cart item quantity"""
        cart_item = CartItem.objects.get(id=cart_item_id)
        
        if quantity <= 0:
            cart_item.delete()
            return None
        
        # Check stock
        if cart_item.product.stock_quantity < quantity:
            raise ValueError(f"Only {cart_item.product.stock_quantity} items available")
        
        cart_item.quantity = quantity
        cart_item.save()
        return cart_item
    
    @staticmethod
    def remove_from_cart(cart_item_id):
        """Remove item from cart"""
        cart_item = CartItem.objects.get(id=cart_item_id)
        cart_item.delete()
        return True
    
    @staticmethod
    def clear_cart(cart):
        """Remove all items from cart"""
        cart.items.all().delete()
        return True
    
    @staticmethod
    def merge_carts(session_key, user_cart):
        """Merge guest cart with user cart after login"""
        try:
            guest_cart = Cart.objects.get(session_key=session_key)
            
            for guest_item in guest_cart.items.all():
                try:
                    # Check if item already exists in user cart
                    existing_item = CartItem.objects.get(
                        cart=user_cart,
                        product=guest_item.product,
                        variant=guest_item.variant
                    )
                    # Update quantity
                    existing_item.quantity += guest_item.quantity
                    existing_item.save()
                except CartItem.DoesNotExist:
                    # Move item to user cart
                    guest_item.cart = user_cart
                    guest_item.save()
            
            # Delete guest cart
            guest_cart.delete()
            
        except Cart.DoesNotExist:
            pass
    
    @staticmethod
    def get_cart_summary(cart):
        """Get cart summary with all calculations"""
        return {
            'id': str(cart.id),
            'items': cart.items.all(),
            'total_items': cart.total_items,
            'subtotal': cart.subtotal,
            'shipping_cost': cart.shipping_cost,
            'tax_amount': cart.tax_amount,
            'total_amount': cart.total_amount,
        }