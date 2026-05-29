# backend/payments/urls/__init__.py
from django.urls import path
from ..views import (
    create_payment_intent, confirm_payment, refund_payment,
    get_payment_status, stripe_webhook
)

urlpatterns = [
    # Payment endpoints
    path('create-intent/', create_payment_intent, name='create-payment-intent'),
    path('confirm/', confirm_payment, name='confirm-payment'),
    path('refund/', refund_payment, name='refund-payment'),
    path('status/<str:payment_intent_id>/', get_payment_status, name='payment-status'),
    
    # Stripe Webhook (important for production)
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
]