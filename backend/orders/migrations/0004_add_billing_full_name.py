from django.db import migrations, models

from ._safe import AddFieldIfMissing


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0003_add_missing_order_columns"),
    ]

    operations = [
        AddFieldIfMissing(
            model_name="order",
            name="billing_full_name",
            field=models.CharField(
                max_length=255,
                blank=True,
                null=True
            ),
        ),
    ]