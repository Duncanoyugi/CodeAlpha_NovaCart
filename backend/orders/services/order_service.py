# backend/orders/services/order_service.py
import logging
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import F
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from cart.models.base import Cart
from cart.pricing import compute_totals, to_kes
from products.models.base import Product, ProductVariant

from ..models.base import Coupon, Order, OrderItem
from .coupon_service import CouponError, CouponService

logger = logging.getLogger(__name__)


class OrderError(ValueError):
    """A rule was violated; the message is safe to show to the customer."""


# Admin-driven lifecycle. Payment moves orders pending -> processing on its own.
ALLOWED_TRANSITIONS = {
    Order.Status.PENDING: {Order.Status.CANCELLED},
    Order.Status.PROCESSING: {Order.Status.CONFIRMED, Order.Status.SHIPPED, Order.Status.CANCELLED},
    Order.Status.CONFIRMED: {Order.Status.SHIPPED, Order.Status.CANCELLED},
    Order.Status.SHIPPED: {Order.Status.DELIVERED},
    Order.Status.DELIVERED: {Order.Status.REFUNDED},
    Order.Status.CANCELLED: set(),
    Order.Status.REFUNDED: set(),
}


class OrderService:
    """Business logic for orders."""

    # ---------------------------------------------------------------- checkout
    @staticmethod
    def create_order_from_cart(user, cart, checkout_data):
        """Turn a cart into an order, reserving stock atomically.

        * Rows are locked (cart, products, variants) so two shoppers can't buy
          the last unit simultaneously and a double-click can't create two orders.
        * Prices are the *current* prices, never what was cached in the cart.
        """
        with transaction.atomic():
            cart = Cart.objects.select_for_update().get(pk=cart.pk)
            items = list(cart.items.select_related('product', 'variant').order_by('product_id'))
            if not items:
                raise OrderError('Your cart is empty.')

            product_ids = sorted({i.product_id for i in items})
            products = {p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids).order_by('id')}
            variant_ids = [i.variant_id for i in items if i.variant_id]
            variants = {
                v.id: v for v in ProductVariant.objects.select_for_update().filter(id__in=variant_ids).order_by('id')
            }

            # 1) validate stock against locked rows
            problems = []
            for item in items:
                product = products[item.product_id]
                variant = variants.get(item.variant_id)
                limit = product.stock_quantity if variant is None else min(product.stock_quantity, variant.stock_quantity)
                if not product.is_available or limit < item.quantity:
                    problems.append(
                        f'"{product.name}" is out of stock.' if limit <= 0 or not product.is_available
                        else f'Only {limit} of "{product.name}" left in stock.'
                    )
            if problems:
                raise OrderError(' '.join(problems))

            # 2) price from live data
            line_prices = []
            for item in items:
                product = products[item.product_id]
                variant = variants.get(item.variant_id)
                unit = to_kes(variant.price) if variant and variant.price else product.final_price
                line_prices.append(unit)
            subtotal = sum((unit * i.quantity for unit, i in zip(line_prices, items)), to_kes(0))

            # 3) coupon
            coupon, discount = None, to_kes(0)
            code = (checkout_data.get('coupon_code') or '').strip()
            if code:
                try:
                    coupon = CouponService.get_valid(code, subtotal, lock=True)
                except CouponError as exc:
                    raise OrderError(str(exc))
                discount = CouponService.discount_for(coupon, subtotal)
            totals = compute_totals(subtotal, discount)

            order = Order.objects.create(
                user=user,
                subtotal=totals.subtotal,
                discount_amount=totals.discount,
                shipping_cost=totals.shipping,
                tax_amount=totals.tax,
                total_amount=totals.total,
                coupon_code=coupon.code if coupon else '',
                coupon_discount=totals.discount,
                shipping_full_name=checkout_data['shipping_full_name'],
                shipping_email=checkout_data.get('shipping_email') or user.email,
                shipping_phone=checkout_data['shipping_phone'],
                shipping_address_line1=checkout_data['shipping_address_line1'],
                shipping_address_line2=checkout_data.get('shipping_address_line2', ''),
                shipping_city=checkout_data['shipping_city'],
                shipping_state=checkout_data['shipping_state'],
                shipping_postal_code=checkout_data['shipping_postal_code'],
                shipping_country=checkout_data.get('shipping_country', 'Kenya'),
                billing_same_as_shipping=checkout_data.get('billing_same_as_shipping', True),
                customer_notes=checkout_data.get('customer_notes', ''),
                payment_method=checkout_data.get('payment_method', 'mpesa'),
            )

            if not order.billing_same_as_shipping:
                for field in ('full_name', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country'):
                    setattr(order, f'billing_{field}', checkout_data.get(f'billing_{field}', ''))
                order.save()

            # 4) snapshot items + reserve stock
            for item, unit in zip(items, line_prices):
                product = products[item.product_id]
                variant = variants.get(item.variant_id)
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_sku=variant.sku if variant else product.sku,
                    product_image=(variant.image_url if variant and variant.image_url else product.image_url) or '',
                    variant_name=variant.name if variant else '',
                    variant_attributes=variant.attributes if variant else {},
                    quantity=item.quantity,
                    price_per_unit=unit,
                    total_price=unit * item.quantity,
                )
                OrderService._adjust_stock(product, variant, -item.quantity)
                Product.objects.filter(pk=product.pk).update(sold_count=F('sold_count') + item.quantity)

            if coupon:
                Coupon.objects.filter(pk=coupon.pk).update(used_count=F('used_count') + 1)

            cart.items.all().delete()
            return order

    @staticmethod
    def _adjust_stock(product, variant, delta):
        """Apply a stock change (negative reserves, positive releases)."""
        product.stock_quantity = max(product.stock_quantity + delta, 0)
        product.is_available = product.stock_quantity > 0
        product.save(update_fields=['stock_quantity', 'is_available', 'updated_at'])
        if variant is not None:
            variant.stock_quantity = max(variant.stock_quantity + delta, 0)
            variant.save(update_fields=['stock_quantity'])

    @staticmethod
    def release_stock(order):
        """Return an order's reserved units to inventory (idempotency is the caller's job)."""
        for item in order.items.select_related('product'):
            product = Product.objects.select_for_update().get(pk=item.product_id)
            variant = None
            if item.variant_name:
                variant = ProductVariant.objects.select_for_update().filter(
                    product=product, name=item.variant_name,
                ).first()
            OrderService._adjust_stock(product, variant, item.quantity)
            Product.objects.filter(pk=product.pk, sold_count__gte=item.quantity).update(
                sold_count=F('sold_count') - item.quantity
            )
        if order.coupon_code:
            Coupon.objects.filter(code=order.coupon_code, used_count__gt=0).update(used_count=F('used_count') - 1)

    # ------------------------------------------------------------ cancellation
    @staticmethod
    def cancel_order(order, reason=None, by_admin=False):
        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status == Order.Status.CANCELLED:
                return order
            if not by_admin and not order.can_cancel:
                raise OrderError('This order can no longer be cancelled. Please contact support.')
            if order.status not in (Order.Status.PENDING, Order.Status.PROCESSING, Order.Status.CONFIRMED):
                raise OrderError('This order can no longer be cancelled.')

            OrderService.release_stock(order)
            order.status = Order.Status.CANCELLED
            order.cancelled_at = timezone.now()
            note = f'Cancellation reason: {reason}' if reason else 'Order cancelled'
            if order.payment_status == Order.PaymentStatus.PAID:
                note += ' | PAID ORDER CANCELLED - REFUND REQUIRED'
            order.admin_notes = f'{note}\n{order.admin_notes}'.strip()
            order.save()
            OrderService._close_open_payments(order)
            return order

    @staticmethod
    def _close_open_payments(order):
        from payments.models.base import Payment
        open_states = [Payment.PaymentStatus.PENDING, Payment.PaymentStatus.STK_SENT, Payment.PaymentStatus.AWAITING_CALLBACK]
        order.payments.filter(payment_status__in=open_states).update(
            payment_status=Payment.PaymentStatus.CANCELLED, updated_at=timezone.now(),
        )

    @staticmethod
    def expire_unpaid_orders(now=None):
        """Cancel unpaid orders older than the payment window and free their stock."""
        now = now or timezone.now()
        cutoff = now - timedelta(minutes=settings.ORDER_PAYMENT_WINDOW_MINUTES)
        expired = 0
        stale = Order.objects.filter(
            status=Order.Status.PENDING, payment_status__in=[Order.PaymentStatus.PENDING, Order.PaymentStatus.FAILED],
            placed_at__lt=cutoff,
        )
        for order in stale:
            try:
                OrderService.cancel_order(order, reason='Payment not completed in time', by_admin=True)
                expired += 1
            except OrderError:
                logger.exception('Could not expire order %s', order.order_number)
        return expired

    # -------------------------------------------------------- admin status flow
    @staticmethod
    def update_order_status(order, status, admin_notes=None, tracking_number=None, carrier=None):
        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if status == order.status:
                raise OrderError(f'Order is already {order.get_status_display().lower()}.')
            if status not in ALLOWED_TRANSITIONS.get(order.status, set()):
                raise OrderError(
                    f'An order that is {order.get_status_display().lower()} cannot be moved to {status}.'
                )
            needs_payment = {Order.Status.CONFIRMED, Order.Status.SHIPPED, Order.Status.DELIVERED}
            if status in needs_payment and order.payment_status != Order.PaymentStatus.PAID:
                raise OrderError('This order has not been paid yet.')

            if status == Order.Status.CANCELLED:
                return OrderService.cancel_order(order, reason=admin_notes, by_admin=True)

            order.status = status
            if admin_notes:
                order.admin_notes = f'{admin_notes}\n{order.admin_notes}'.strip()
            if tracking_number:
                order.tracking_number = tracking_number
            if carrier:
                order.carrier = carrier
            now = timezone.now()
            if status == Order.Status.PROCESSING and not order.processed_at:
                order.processed_at = now
            elif status == Order.Status.SHIPPED and not order.shipped_at:
                order.shipped_at = now
            elif status == Order.Status.DELIVERED and not order.delivered_at:
                order.delivered_at = now
            order.save()

        transaction.on_commit(lambda: OrderService.safe_send(OrderService.send_status_update_email, order))
        return order

    # ------------------------------------------------------------------ emails
    @staticmethod
    def safe_send(sender, order):
        """Emails are best-effort: a mail outage must never break an order."""
        try:
            sender(order)
        except Exception:  # noqa: BLE001
            logger.exception('Email "%s" failed for order %s', sender.__name__, order.order_number)

    @staticmethod
    def _recipient(order):
        return order.shipping_email or order.user.email

    @staticmethod
    def send_order_confirmation_email(order):
        html_message = render_to_string('emails/order_confirmation.html', {
            'order': order, 'user': order.user, 'items': order.items.all(),
            'year': timezone.now().year, 'frontend_url': settings.FRONTEND_URL,
        })
        send_mail(
            subject=f'Order Confirmation - {order.order_number}',
            message=strip_tags(html_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[OrderService._recipient(order)],
            html_message=html_message,
            fail_silently=False,
        )

    @staticmethod
    def send_status_update_email(order):
        html_message = render_to_string('emails/order_status_update.html', {
            'order': order, 'user': order.user,
            'year': timezone.now().year, 'frontend_url': settings.FRONTEND_URL,
        })
        send_mail(
            subject=f'Order Update - {order.order_number}',
            message=strip_tags(html_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[OrderService._recipient(order)],
            html_message=html_message,
            fail_silently=False,
        )
