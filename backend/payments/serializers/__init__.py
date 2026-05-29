# backend/payments/serializers/__init__.py
from rest_framework import serializers
from ..models.base import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'currency', 'payment_method',
            'payment_status', 'stripe_payment_intent_id', 'paid_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'paid_at']

class CreatePaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField(required=True)
    payment_method = serializers.CharField(default='stripe')

class ConfirmPaymentSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField(required=True)

class RefundPaymentSerializer(serializers.Serializer):
    payment_id = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    reason = serializers.CharField(required=False, allow_blank=True)