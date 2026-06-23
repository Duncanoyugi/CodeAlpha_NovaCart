# backend/orders/migrations/0010_add_variant_attributes_column.py
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_add_product_image_column'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_name = 'order_items' 
                        AND column_name = 'variant_attributes'
                    ) THEN 
                        ALTER TABLE order_items 
                        ADD COLUMN variant_attributes JSONB DEFAULT '{}';
                    END IF;
                END $$;
            """,
            reverse_sql="""
                ALTER TABLE order_items DROP COLUMN IF EXISTS variant_attributes;
            """
        ),
    ]