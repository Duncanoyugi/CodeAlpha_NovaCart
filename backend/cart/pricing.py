# backend/cart/pricing.py
"""Single source of truth for money maths (KES, whole shillings).

Everything that quotes or charges a customer (cart, checkout, order, Stripe,
M-Pesa) goes through here so the numbers can never drift apart.
M-Pesa STK Push only accepts whole-shilling amounts, hence the rounding.
"""
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings

ZERO = Decimal('0')


def to_kes(amount):
    """Round to whole shillings, half-up."""
    return Decimal(str(amount)).quantize(Decimal('1'), rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class Totals:
    subtotal: Decimal
    discount: Decimal
    shipping: Decimal
    tax: Decimal
    total: Decimal


def compute_totals(subtotal, discount=ZERO):
    """Prices are VAT-inclusive (standard Kenyan retail practice): ``tax`` is the
    VAT portion already contained in the price, shown for transparency."""
    subtotal = to_kes(subtotal)
    discount = min(to_kes(discount), subtotal)
    payable = subtotal - discount

    if subtotal == 0:
        shipping = ZERO
    elif payable >= settings.STORE_FREE_SHIPPING_THRESHOLD:
        shipping = ZERO
    else:
        shipping = to_kes(settings.STORE_FLAT_SHIPPING)

    rate = Decimal(str(settings.STORE_VAT_RATE))
    tax = to_kes(payable * rate / (Decimal('1') + rate))
    return Totals(subtotal, discount, shipping, tax, payable + shipping)
