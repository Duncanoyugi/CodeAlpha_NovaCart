# backend/orders/services/order_service.py
from django.db import transaction
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from ..models.base import Order, OrderItem
from cart.models.base import Cart
from products.models.base import Product

class OrderService:
    """Business logic for orders"""
    
    @staticmethod
    def create_order_from_cart(user, cart, checkout_data):
        """Create an order from cart items"""
        with transaction.atomic():
            # Calculate totals
            subtotal = cart.subtotal
            shipping_cost = cart.shipping_cost
            tax_amount = cart.tax_amount
            total_amount = cart.total_amount
            
            # Apply coupon discount if provided (will implement later)
            discount_amount = 0
            coupon_discount = 0
            
            # Create order
            order = Order.objects.create(
                user=user,
                subtotal=subtotal,
                discount_amount=discount_amount,
                shipping_cost=shipping_cost,
                tax_amount=tax_amount,
                total_amount=total_amount,
                coupon_code=checkout_data.get('coupon_code', ''),
                coupon_discount=coupon_discount,
                shipping_full_name=checkout_data['shipping_full_name'],
                shipping_email=checkout_data['shipping_email'],
                shipping_phone=checkout_data['shipping_phone'],
                shipping_address_line1=checkout_data['shipping_address_line1'],
                shipping_address_line2=checkout_data.get('shipping_address_line2', ''),
                shipping_city=checkout_data['shipping_city'],
                shipping_state=checkout_data['shipping_state'],
                shipping_postal_code=checkout_data['shipping_postal_code'],
                shipping_country=checkout_data.get('shipping_country', 'US'),
                billing_same_as_shipping=checkout_data.get('billing_same_as_shipping', True),
                customer_notes=checkout_data.get('customer_notes', ''),
                payment_method=checkout_data.get('payment_method', 'stripe')
            )
            
            # Set billing address if different
            if not order.billing_same_as_shipping:
                order.billing_full_name = checkout_data.get('billing_full_name', '')
                order.billing_address_line1 = checkout_data.get('billing_address_line1', '')
                order.billing_address_line2 = checkout_data.get('billing_address_line2', '')
                order.billing_city = checkout_data.get('billing_city', '')
                order.billing_state = checkout_data.get('billing_state', '')
                order.billing_postal_code = checkout_data.get('billing_postal_code', '')
                order.billing_country = checkout_data.get('billing_country', '')
                order.save()
            
            # Create order items from cart
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    product_sku=cart_item.product.sku,
                    product_image=cart_item.product.image_url,
                    variant_name=cart_item.variant.name if cart_item.variant else '',
                    variant_attributes=cart_item.variant.attributes if cart_item.variant else {},
                    quantity=cart_item.quantity,
                    price_per_unit=cart_item.price_at_add,
                    total_price=cart_item.subtotal
                )
                
                # Update product stock
                product = cart_item.product
                product.stock_quantity -= cart_item.quantity
                product.sold_count += cart_item.quantity
                if product.stock_quantity <= 0:
                    product.is_available = False
                product.save(update_fields=['stock_quantity', 'sold_count', 'is_available', 'updated_at'])
            
            # Clear the cart
            cart.items.all().delete()
            
            return order
    
    @staticmethod
    def send_order_confirmation_email(order):
        """Send order confirmation email to customer"""
        subject = f'Order Confirmation - {order.order_number}'
        
        context = {
            'order': order,
            'user': order.user,
            'items': order.items.all(),
            'year': timezone.now().year,
            'frontend_url': settings.FRONTEND_URL
        }
        
        html_message = render_to_string('emails/order_confirmation.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.shipping_email],
            html_message=html_message,
            fail_silently=False,
        )
    
    @staticmethod
    def update_order_status(order, status, admin_notes=None, tracking_number=None, carrier=None):
        """Update order status with timestamps"""
        order.status = status
        order.admin_notes = admin_notes or order.admin_notes
        
        if tracking_number:
            order.tracking_number = tracking_number
        if carrier:
            order.carrier = carrier
        
        # Set appropriate timestamps
        if status == Order.Status.PROCESSING and not order.processed_at:
            order.processed_at = timezone.now()
        elif status == Order.Status.SHIPPED and not order.shipped_at:
            order.shipped_at = timezone.now()
        elif status == Order.Status.DELIVERED and not order.delivered_at:
            order.delivered_at = timezone.now()
        elif status == Order.Status.CANCELLED and not order.cancelled_at:
            order.cancelled_at = timezone.now()
        
        order.save()
        
        # Send status update email
        OrderService.send_status_update_email(order)
        
        return order
    
    @staticmethod
    def send_status_update_email(order):
        """Send order status update email"""
        subject = f'Order Status Update - {order.order_number}'
        
        context = {
            'order': order,
            'user': order.user,
            'year': timezone.now().year
        }
        
        html_message = render_to_string('emails/order_status_update.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.shipping_email],
            html_message=html_message,
            fail_silently=False,
        )
    
    @staticmethod
    def cancel_order(order, reason=None):
        """Cancel an order and restore stock"""
        if not order.can_cancel:
            raise ValueError("Order cannot be cancelled at this stage")
        
        with transaction.atomic():
            # Restore product stock
            for item in order.items.all():
                product = item.product
                product.stock_quantity += item.quantity
                if not product.is_available and product.stock_quantity > 0:
                    product.is_available = True
                product.save(update_fields=['stock_quantity', 'is_available'])
            
            order.status = Order.Status.CANCELLED
            order.cancelled_at = timezone.now()
            if reason:
                order.admin_notes = f"Cancellation reason: {reason}\n{order.admin_notes}"
            order.save()
            
            return order