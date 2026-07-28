# backend/payments/urls/__init__.py
from django.urls import path
from ..views import (
    create_payment_intent, confirm_payment, refund_payment,
    get_payment_status, get_mpesa_payment_status, mpesa_callback,
    mpesa_stk_push, stripe_webhook
)

urlpatterns = [
    # Payment endpoints
    path('create-intent/', create_payment_intent, name='create-payment-intent'),
    path('stk-push/', mpesa_stk_push, name='mpesa-stk-push'),
    path('confirm/', confirm_payment, name='confirm-payment'),
    path('refund/', refund_payment, name='refund-payment'),
    path('status/<str:payment_intent_id>/', get_payment_status, name='payment-status'),
    path('mpesa/status/<uuid:payment_id>/', get_mpesa_payment_status, name='mpesa-payment-status'),
    
    # Provider callbacks
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
    path('mpesa/callback/', mpesa_callback, name='mpesa-callback'),
]