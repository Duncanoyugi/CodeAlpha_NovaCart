from django.core.management import call_command
from django.test import TestCase

from products.models.base import Category, Product


class PlayhouseCatalogSeedTests(TestCase):
    def test_seed_playhouse_catalog_creates_expected_categories_and_products(self):
        call_command('seed_playhouse_catalog')

        self.assertTrue(Category.objects.filter(slug='chargers-cables').exists())
        self.assertTrue(Category.objects.filter(slug='type-c-chargers').exists())
        self.assertTrue(Category.objects.filter(slug='audio').exists())
        self.assertTrue(Product.objects.filter(slug='oraimo-spacebuds-neo-plus').exists())
        self.assertTrue(Product.objects.filter(slug='oraimo-watch-6r').exists())

    def test_replace_removes_legacy_catalog_records(self):
        legacy_category = Category.objects.create(name='Legacy Fashion', slug='legacy-fashion')
        Product.objects.create(
            name='Legacy Product',
            slug='legacy-product',
            short_description='Old catalog item',
            description='This item should not remain in Playhouse.',
            price=1000,
            category=legacy_category,
            image_url='https://example.com/legacy.png',
            sku='LEGACY-001',
        )

        call_command('seed_playhouse_catalog', '--replace')

        self.assertFalse(Category.objects.filter(slug='legacy-fashion').exists())
        self.assertFalse(Product.objects.filter(slug='legacy-product').exists())
        self.assertEqual(Product.objects.count(), 10)
        self.assertEqual(Category.objects.count(), 22)
