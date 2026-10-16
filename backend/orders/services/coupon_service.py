# backend/orders/services/coupon_service.py
from decimal import Decimal

from django.utils import timezone

from cart.pricing import to_kes

from ..models.base import Coupon


class CouponError(ValueError):
    pass


class CouponService:
    @staticmethod
    def get_valid(code, subtotal, lock=False):
        code = (code or '').strip().upper()
        if not code:
            raise CouponError('Enter a coupon code.')
        qs = Coupon.objects.select_for_update() if lock else Coupon.objects
        coupon = qs.filter(code=code, is_active=True).first()
        if coupon is None:
            raise CouponError('That coupon code is not valid.')
        now = timezone.now()
        if coupon.valid_from and now < coupon.valid_from:
            raise CouponError('That coupon is not active yet.')
        if coupon.valid_until and now > coupon.valid_until:
            raise CouponError('That coupon has expired.')
        if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
            raise CouponError('That coupon has been fully redeemed.')
        if subtotal < coupon.min_order_amount:
            raise CouponError(f'Spend at least KES {int(coupon.min_order_amount):,} to use this coupon.')
        return coupon

    @staticmethod
    def discount_for(coupon, subtotal):
        subtotal = Decimal(subtotal)
        if coupon.discount_type == Coupon.DiscountType.PERCENT:
            amount = subtotal * coupon.value / Decimal('100')
        else:
            amount = coupon.value
        if coupon.max_discount_amount is not None:
            amount = min(amount, coupon.max_discount_amount)
        return min(to_kes(amount), to_kes(subtotal))
