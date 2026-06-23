from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0003_add_missing_order_columns"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="billing_full_name",
            field=models.CharField(
                max_length=255,
                blank=True,
                null=True
            ),
        ),
    ]