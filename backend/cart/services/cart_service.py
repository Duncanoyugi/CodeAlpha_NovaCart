# backend/cart/services/cart_service.py
import uuid

from django.conf import settings
from django.db import transaction

from products.models.base import Product, ProductVariant

from ..models.base import Cart, CartItem
from ..pricing import compute_totals, to_kes


class CartError(ValueError):
    """A cart rule was violated; the message is safe to show to customers."""


class CartService:
    """Business logic for the shopping cart."""

    # ------------------------------------------------------------------ lookup
    @staticmethod
    def new_session_key():
        return uuid.uuid4().hex  # 32 chars

    @staticmethod
    def _guest_cart(session_key):
        cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
        if cart is None:
            cart = Cart.objects.create(session_key=session_key)
        return cart

    @staticmethod
    def get_or_create_cart(user=None, session_key=None):
        """Return the caller's cart, merging any guest cart into a user's cart."""
        if user is not None and user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=user)
            if session_key:
                CartService.merge_carts(session_key, cart)
            return cart
        return CartService._guest_cart(session_key or CartService.new_session_key())

    @staticmethod
    def get_item_for(cart, item_id):
        """Fetch an item *only* if it belongs to ``cart`` (prevents cross-cart tampering)."""
        try:
            return cart.items.select_related('product', 'variant').get(id=item_id)
        except (CartItem.DoesNotExist, ValueError):
            raise CartItem.DoesNotExist

    # --------------------------------------------------------------- mutations
    @staticmethod
    def _limit_for(product, variant):
        if not product.is_available:
            return 0
        if variant is not None:
            return min(variant.stock_quantity, product.stock_quantity)
        return product.stock_quantity

    @staticmethod
    @transaction.atomic
    def add_to_cart(cart, product_id, quantity=1, variant_id=None):
        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except Product.DoesNotExist:
            raise CartError('This product is no longer available.')

        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id, product=product)
            except ProductVariant.DoesNotExist:
                raise CartError('That option is not available for this product.')

        limit = CartService._limit_for(product, variant)
        if limit <= 0:
            raise CartError('Sorry, this item is out of stock.')

        item = CartItem.objects.select_for_update().filter(cart=cart, product=product, variant=variant).first()
        new_quantity = quantity + (item.quantity if item else 0)
        if new_quantity > limit:
            raise CartError(f'Only {limit} in stock — you already have {item.quantity if item else 0} in your cart.')

        price = variant.price if variant and variant.price else product.final_price
        if item is None:
            return CartItem.objects.create(
                cart=cart, product=product, variant=variant,
                quantity=quantity, price_at_add=price,
            )
        item.quantity = new_quantity
        item.price_at_add = price
        item.save(update_fields=['quantity', 'price_at_add', 'updated_at'])
        return item

    @staticmethod
    @transaction.atomic
    def update_cart_item(cart, item_id, quantity):
        item = CartService.get_item_for(cart, item_id)
        if quantity <= 0:
            item.delete()
            return None
        limit = CartService._limit_for(item.product, item.variant)
        if quantity > limit:
            raise CartError(f'Only {limit} in stock.' if limit else 'Sorry, this item is out of stock.')
        item.quantity = quantity
        item.price_at_add = item.current_price
        item.save(update_fields=['quantity', 'price_at_add', 'updated_at'])
        return item

    @staticmethod
    def remove_from_cart(cart, item_id):
        CartService.get_item_for(cart, item_id).delete()
        return True

    @staticmethod
    def clear_cart(cart):
        cart.items.all().delete()
        return True

    @staticmethod
    @transaction.atomic
    def merge_carts(session_key, user_cart):
        """Fold a guest cart into the user's cart (quantities add up, capped at stock)."""
        guest_cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
        if guest_cart is None or guest_cart.id == user_cart.id:
            return
        for guest_item in guest_cart.items.select_related('product', 'variant'):
            existing = CartItem.objects.filter(
                cart=user_cart, product=guest_item.product, variant=guest_item.variant,
            ).first()
            limit = CartService._limit_for(guest_item.product, guest_item.variant)
            if existing:
                existing.quantity = max(1, min(existing.quantity + guest_item.quantity, limit or existing.quantity))
                existing.save(update_fields=['quantity', 'updated_at'])
            elif limit > 0:
                guest_item.cart = user_cart
                guest_item.quantity = min(guest_item.quantity, limit)
                guest_item.save(update_fields=['cart', 'quantity', 'updated_at'])
        guest_cart.delete()

    # ----------------------------------------------------------------- summary
    @staticmethod
    def get_cart_summary(cart):
        items = list(cart.items.select_related('product__category', 'variant').order_by('created_at'))
        subtotal = sum((i.subtotal for i in items), to_kes(0))
        totals = compute_totals(subtotal)
        return {
            'id': str(cart.id),
            'session_key': cart.session_key,
            'items': items,
            'total_items': sum(i.quantity for i in items),
            'subtotal': totals.subtotal,
            'shipping_cost': totals.shipping,
            'tax_amount': totals.tax,
            'total_amount': totals.total,
            'free_shipping_threshold': settings.STORE_FREE_SHIPPING_THRESHOLD,
        }
