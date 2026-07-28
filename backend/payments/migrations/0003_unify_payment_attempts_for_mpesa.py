# Generated manually for the M-Pesa payment-domain migration.

from django.db import migrations, models
from django.db.models import Q
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_payment_stripe_customer_id_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payment',
            old_name='payment_method',
            new_name='provider',
        ),
        migrations.AlterField(
            model_name='payment',
            name='order',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='orders.order'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='provider',
            field=models.CharField(choices=[('stripe', 'Stripe'), ('mpesa', 'M-Pesa')], db_index=True, max_length=20),
        ),
        migrations.AlterField(
            model_name='payment',
            name='payment_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('stk_sent', 'STK Push Sent'), ('awaiting_callback', 'Awaiting Callback'), ('succeeded', 'Succeeded'), ('failed', 'Failed'), ('cancelled', 'Cancelled'), ('expired', 'Expired'), ('refunded', 'Refunded'), ('partially_refunded', 'Partially Refunded')], db_index=True, default='pending', max_length=20),
        ),
        migrations.AddField(model_name='payment', name='callback_payload', field=models.JSONField(default=dict)),
        migrations.AddField(model_name='payment', name='checkout_request_id', field=models.CharField(blank=True, max_length=255, null=True, unique=True)),
        migrations.AddField(model_name='payment', name='expires_at', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='payment', name='finalized_at', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='payment', name='merchant_request_id', field=models.CharField(blank=True, max_length=255, null=True, unique=True)),
        migrations.AddField(model_name='payment', name='mpesa_receipt_number', field=models.CharField(blank=True, max_length=100, null=True, unique=True)),
        migrations.AddField(model_name='payment', name='phone', field=models.CharField(blank=True, max_length=15)),
        migrations.AddField(model_name='payment', name='result_code', field=models.IntegerField(blank=True, null=True)),
        migrations.AddField(model_name='payment', name='result_description', field=models.TextField(blank=True)),
        migrations.AddField(model_name='payment', name='transaction_date', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='paymentattempt', name='provider', field=models.CharField(default='stripe', max_length=20)),
        migrations.AddField(model_name='paymentattempt', name='provider_reference', field=models.CharField(blank=True, max_length=255)),
        migrations.AlterField(model_name='paymentattempt', name='stripe_payment_intent_id', field=models.CharField(blank=True, max_length=255)),
        migrations.AddIndex(model_name='payment', index=models.Index(fields=['provider', 'payment_status'], name='payments_provider_status_idx')),
        migrations.AddIndex(model_name='payment', index=models.Index(fields=['checkout_request_id'], name='payments_checkout_request_idx')),
        migrations.AddIndex(model_name='paymentattempt', index=models.Index(fields=['provider', 'provider_reference'], name='payment_attempt_provider_ref_idx')),
        migrations.AddConstraint(
            model_name='payment',
            constraint=models.UniqueConstraint(
                condition=Q(payment_status__in=['pending', 'stk_sent', 'awaiting_callback']),
                fields=('order',),
                name='one_active_payment_per_order',
            ),
        ),
    ]
