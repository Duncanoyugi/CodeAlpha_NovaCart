# backend/orders/migrations/0010_add_all_missing_columns.py
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_add_product_image_column'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                -- Add discount_applied
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'order_items' AND column_name = 'discount_applied'
                    ) THEN 
                        ALTER TABLE order_items ADD COLUMN discount_applied DECIMAL(10,2) DEFAULT 0;
                    END IF;
                END $$;

                -- Add variant_attributes if missing
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'order_items' AND column_name = 'variant_attributes'
                    ) THEN 
                        ALTER TABLE order_items ADD COLUMN variant_attributes JSONB DEFAULT '{}';
                    END IF;
                END $$;

                -- Add created_at if missing
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'order_items' AND column_name = 'created_at'
                    ) THEN 
                        ALTER TABLE order_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                    END IF;
                END $$;
            """,
            reverse_sql="""
                ALTER TABLE order_items DROP COLUMN IF EXISTS discount_applied;
                ALTER TABLE order_items DROP COLUMN IF EXISTS variant_attributes;
                ALTER TABLE order_items DROP COLUMN IF EXISTS created_at;
            """
        ),
    ]