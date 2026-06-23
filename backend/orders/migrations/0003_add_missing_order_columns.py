# backend/orders/migrations/0003_add_missing_order_columns.py
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_add_coupon_and_discount'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='shipping_full_name',
            field=models.CharField(max_length=255),
        ),
        migrations.AddField(
            model_name='order',
            name='shipping_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='billing_same_as_shipping',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='order',
            name='tracking_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='carrier',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='estimated_delivery',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='processed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='shipped_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
