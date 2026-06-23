from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0008_add_product_image_column'),  # Make sure this matches your last migration
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='product_image',
            field=models.URLField(default=''),
            preserve_default=False,
        ),
    ]