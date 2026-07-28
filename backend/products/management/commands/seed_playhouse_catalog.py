from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models.deletion import ProtectedError

from products.models.base import Category, Product
from orders.models.base import OrderItem


class Command(BaseCommand):
    help = 'Seed the Playhouse electronics catalog with a structured category tree and sample products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Remove the existing storefront catalog before seeding Playhouse.',
        )

    def handle(self, *args, **options):
        if options['replace']:
            self.stdout.write('Removing the existing storefront catalog...')
            with transaction.atomic():
                # Product relationships such as carts, wishlists, reviews, and variants
                # cascade. Products included in completed orders are deliberately kept as
                # historical snapshots and made unavailable instead of breaking an order.
                try:
                    Product.objects.all().delete()
                    Category.objects.all().delete()
                except ProtectedError:
                    ordered_product_ids = OrderItem.objects.values_list('product_id', flat=True)
                    Product.objects.exclude(id__in=ordered_product_ids).delete()
                    Product.objects.filter(id__in=ordered_product_ids).update(is_available=False)

                    # A protected product prevents its category from being deleted. Hide
                    # every old category now; Playhouse categories are reactivated below.
                    Category.objects.update(is_active=False)

        root_categories = [
            {
                'name': 'Chargers & Cables',
                'slug': 'chargers-cables',
                'description': 'Chargers, adapters, and cables for phones, tablets, and accessories.',
                'parent': None,
                'order': 1,
            },
            {
                'name': 'Pods',
                'slug': 'pods',
                'description': 'Wireless earbuds and pod-style audio devices for everyday listening.',
                'parent': None,
                'order': 2,
            },
            {
                'name': 'Power Banks',
                'slug': 'power-banks',
                'description': 'Portable power solutions for phones, tablets, and travel needs.',
                'parent': None,
                'order': 3,
            },
            {
                'name': 'Smart Watches',
                'slug': 'smart-watches',
                'description': 'Fitness and smart lifestyle wearables for daily use.',
                'parent': None,
                'order': 4,
            },
            {
                'name': 'Shavers',
                'slug': 'shavers',
                'description': 'Modern grooming tools with reliable battery and precision.',
                'parent': None,
                'order': 5,
            },
            {
                'name': 'Earphones & Headphones',
                'slug': 'earphones-headphones',
                'description': 'Wired and wireless audio gear for calls, music, and entertainment.',
                'parent': None,
                'order': 6,
            },
            {
                'name': 'Brands',
                'slug': 'brands',
                'description': 'Browse fast-moving electronics by trusted brand collections.',
                'parent': None,
                'order': 7,
            },
        ]

        for data in root_categories:
            Category.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'name': data['name'],
                    'description': data['description'],
                    'parent': data['parent'],
                    'order': data['order'],
                    'is_active': True,
                },
            )

        # The former umbrella categories are intentionally not customer-facing.
        Category.objects.filter(slug__in=['electronics', 'audio']).update(is_active=False)

        category_specs = [
            {
                'name': 'Chargers & Cables',
                'slug': 'chargers-cables',
                'description': 'Reliable chargers, adapters, and cables for phones, tablets, and accessories.',
                'parent_slug': None,
                'order': 1,
            },
            {
                'name': 'Chargers',
                'slug': 'chargers',
                'description': 'Wall, travel, and car chargers by connector and charging speed.',
                'parent_slug': 'chargers-cables',
                'order': 1,
            },
            {
                'name': 'Cables',
                'slug': 'cables',
                'description': 'Charging and data cables by connector type.',
                'parent_slug': 'chargers-cables',
                'order': 2,
            },
            {
                'name': 'Type C Chargers',
                'slug': 'type-c-chargers',
                'description': 'Fast and standard Type-C charging solutions for modern devices.',
                'parent_slug': 'chargers',
                'order': 1,
            },
            {
                'name': 'Micro Chargers',
                'slug': 'micro-chargers',
                'description': 'Micro USB charging options for older phones and accessories.',
                'parent_slug': 'chargers',
                'order': 2,
            },
            {
                'name': 'Type C Cables',
                'slug': 'type-c-cables',
                'description': 'Premium Type-C cables for data transfer and fast charging.',
                'parent_slug': 'cables',
                'order': 3,
            },
            {
                'name': 'Micro Cables',
                'slug': 'micro-cables',
                'description': 'Micro USB cable options for compatibility and convenience.',
                'parent_slug': 'cables',
                'order': 4,
            },
            {
                'name': 'iPhone Cables',
                'slug': 'iphone-cables',
                'description': 'Reliable iPhone-compatible cable solutions.',
                'parent_slug': 'cables',
                'order': 5,
            },
            {
                'name': '4 in 1 Cables',
                'slug': 'four-in-one-cables',
                'description': 'Multi-purpose cable solutions that cover several connector needs.',
                'parent_slug': 'cables',
                'order': 6,
            },
            {
                'name': 'C to C Cables',
                'slug': 'c-to-c-cables',
                'description': 'USB-C to USB-C cables for modern fast-charging devices.',
                'parent_slug': 'cables',
                'order': 7,
            },
            {
                'name': 'Audio',
                'slug': 'audio',
                'description': 'Pods, earbuds, headphones, and sound accessories from trusted brands.',
                'parent_slug': None,
                'order': 2,
            },
            {
                'name': 'Pods',
                'slug': 'pods',
                'description': 'Wireless earbuds and pod-style audio devices for everyday listening.',
                'parent_slug': None,
                'order': 1,
            },
            {
                'name': 'Earphones & Headphones',
                'slug': 'earphones-headphones',
                'description': 'Wired and wireless audio gear for calls, music, and entertainment.',
                'parent_slug': None,
                'order': 2,
            },
            {
                'name': 'Earphones',
                'slug': 'earphones',
                'description': 'Wired earphones for calls, music, and everyday listening.',
                'parent_slug': 'earphones-headphones',
                'order': 1,
            },
            {
                'name': 'Headphones',
                'slug': 'headphones',
                'description': 'Over-ear and on-ear headphones for immersive listening.',
                'parent_slug': 'earphones-headphones',
                'order': 2,
            },
            {
                'name': 'Power Banks',
                'slug': 'power-banks',
                'description': 'Portable power solutions for phones, tablets, and travel needs.',
                'parent_slug': None,
                'order': 3,
            },
            {
                'name': 'Smart Watches',
                'slug': 'smart-watches',
                'description': 'Fitness and smart lifestyle wearables for daily use.',
                'parent_slug': None,
                'order': 4,
            },
            {
                'name': 'Car Chargers',
                'slug': 'car-chargers',
                'description': 'On-the-go charging solutions designed for vehicles.',
                'parent_slug': 'chargers',
                'order': 5,
            },
            {
                'name': 'Shavers',
                'slug': 'shavers',
                'description': 'Modern grooming tools with reliable battery and precision.',
                'parent_slug': None,
                'order': 6,
            },
            {
                'name': 'Oraimo',
                'slug': 'oraimo',
                'description': 'Oraimo electronics and accessories designed for reliable everyday performance.',
                'parent_slug': 'brands',
                'order': 1,
            },
            {
                'name': 'Amaya',
                'slug': 'amaya',
                'description': 'Amaya accessories focused on practical charging and audio options.',
                'parent_slug': 'brands',
                'order': 2,
            },
            {
                'name': 'Itel',
                'slug': 'itel',
                'description': 'Budget-friendly mobile accessories and charging solutions.',
                'parent_slug': 'brands',
                'order': 3,
            },
            {
                'name': 'Samsung',
                'slug': 'samsung',
                'description': 'Samsung charging adapters and accessories for modern devices.',
                'parent_slug': 'brands',
                'order': 4,
            },
            {
                'name': 'Havit',
                'slug': 'havit',
                'description': 'Havit accessories built for dependable charging and audio',
                'parent_slug': 'brands',
                'order': 5,
            },
            {
                'name': 'Recrsi',
                'slug': 'recrsi',
                'description': 'Recrsi audio products tailored for everyday listening.',
                'parent_slug': 'brands',
                'order': 6,
            },
        ]

        for data in category_specs:
            parent = Category.objects.filter(slug=data['parent_slug']).first() if data.get('parent_slug') else None
            Category.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'name': data['name'],
                    'description': data['description'],
                    'parent': parent,
                    'order': data['order'],
                    'is_active': True,
                },
            )

        Category.objects.filter(slug__in=['electronics', 'audio']).update(is_active=False)

        product_specs = [
            {
                'name': 'Oraimo Type-C Charger',
                'slug': 'oraimo-type-c-charger',
                'short_description': 'Fast and compact Type-C charger for daily use.',
                'description': 'A compact Playhouse charger ideal for phones, power banks, and modern accessories.',
                'price': Decimal('1800.00'),
                'compare_price': Decimal('2200.00'),
                'category_slug': 'type-c-chargers',
                'sku': 'PLAY-ORA-001',
                'tags': ['oraimo', 'type-c', 'charger'],
                'image_url': 'https://placehold.co/600x600/png?text=Oraimo+Type-C+Charger',
                'is_featured': True,
                'is_available': True,
                'is_new_arrival': True,
                'stock_quantity': 15,
            },
            {
                'name': 'Oraimo Spacebuds Neo Plus',
                'slug': 'oraimo-spacebuds-neo-plus',
                'short_description': 'Wireless pods with immersive sound and all-day comfort.',
                'description': 'A stylish pod system from Oraimo for smooth calls, entertainment, and portability.',
                'price': Decimal('2400.00'),
                'compare_price': Decimal('2900.00'),
                'category_slug': 'pods',
                'sku': 'PLAY-ORA-002',
                'tags': ['oraimo', 'pods', 'audio'],
                'image_url': 'https://placehold.co/600x600/png?text=Oraimo+Spacebuds',
                'is_featured': True,
                'is_available': True,
                'is_best_seller': True,
                'stock_quantity': 10,
            },
            {
                'name': 'Amaya Type-C Cable',
                'slug': 'amaya-type-c-cable',
                'short_description': 'Durable Type-C cable for faster charging and syncing.',
                'description': 'A practical cable solution for compatible phones, tablets, and accessories.',
                'price': Decimal('1200.00'),
                'compare_price': Decimal('1500.00'),
                'category_slug': 'type-c-cables',
                'sku': 'PLAY-AMA-001',
                'tags': ['amaya', 'type-c', 'cable'],
                'image_url': 'https://placehold.co/600x600/png?text=Amaya+Type-C+Cable',
                'is_available': True,
                'stock_quantity': 20,
            },
            {
                'name': 'Oraimo 20k mAh Power Bank',
                'slug': 'oraimo-20k-mah-power-bank',
                'short_description': 'High-capacity power bank for travel and long hours away from home.',
                'description': 'A dependable 20k mAh power bank that keeps phones and accessories charged.',
                'price': Decimal('3200.00'),
                'compare_price': Decimal('3800.00'),
                'category_slug': 'power-banks',
                'sku': 'PLAY-ORA-003',
                'tags': ['oraimo', 'power-bank', 'travel'],
                'image_url': 'https://placehold.co/600x600/png?text=Oraimo+Powerbank',
                'is_available': True,
                'is_featured': True,
                'stock_quantity': 8,
            },
            {
                'name': 'Oraimo Smart Watch 6R',
                'slug': 'oraimo-watch-6r',
                'short_description': 'Elegant smartwatch with fitness tracking and smart alerts.',
                'description': 'A stylish smartwatch ideal for health tracking, notifications, and daily routines.',
                'price': Decimal('5500.00'),
                'compare_price': Decimal('6500.00'),
                'category_slug': 'smart-watches',
                'sku': 'PLAY-ORA-004',
                'tags': ['oraimo', 'smart-watch', 'fitness'],
                'image_url': 'https://placehold.co/600x600/png?text=Oraimo+Watch+6R',
                'is_available': True,
                'is_new_arrival': True,
                'stock_quantity': 6,
            },
            {
                'name': 'Oraimo Bullet 40 Car Charger',
                'slug': 'oraimo-bullet-40-car-charger',
                'short_description': 'Fast car charger for on-the-road power.',
                'description': 'A robust car charger built for safe and reliable charging while driving.',
                'price': Decimal('2200.00'),
                'compare_price': Decimal('2600.00'),
                'category_slug': 'car-chargers',
                'sku': 'PLAY-ORA-005',
                'tags': ['oraimo', 'car-charger', 'vehicle'],
                'image_url': 'https://placehold.co/600x600/png?text=Oraimo+Car+Charger',
                'is_available': True,
                'stock_quantity': 12,
            },
            {
                'name': 'Oraimo Easy Shave',
                'slug': 'oraimo-easy-shave',
                'short_description': 'Portable shaver with smooth and flexible grooming performance.',
                'description': 'A practical grooming tool made for quick trims and convenient use.',
                'price': Decimal('4800.00'),
                'compare_price': Decimal('5600.00'),
                'category_slug': 'shavers',
                'sku': 'PLAY-ORA-006',
                'tags': ['oraimo', 'shaver', 'grooming'],
                'image_url': 'https://placehold.co/600x600/png?text=Oraimo+Easy+Shave',
                'is_available': True,
                'stock_quantity': 7,
            },
            {
                'name': 'Recrsi Re-NY002 Earbuds',
                'slug': 'recrsi-re-ny002-earbuds',
                'short_description': 'Compact earbud set for music, calls, and everyday listening.',
                'description': 'A reliable audio accessory from Recrsi for daily entertainment.',
                'price': Decimal('1600.00'),
                'compare_price': Decimal('1900.00'),
                'category_slug': 'earphones-headphones',
                'sku': 'PLAY-REC-001',
                'tags': ['recrsi', 'earbuds', 'audio'],
                'image_url': 'https://placehold.co/600x600/png?text=Recrsi+Earbuds',
                'is_available': True,
                'stock_quantity': 14,
            },
            {
                'name': 'Samsung 45W Adapter',
                'slug': 'samsung-45w-adapter',
                'short_description': 'High-output adapter for fast and efficient charging.',
                'description': 'A strong adapter suitable for modern phones and accessories.',
                'price': Decimal('2600.00'),
                'compare_price': Decimal('3100.00'),
                'category_slug': 'type-c-chargers',
                'sku': 'PLAY-SAM-001',
                'tags': ['samsung', 'adapter', 'fast-charge'],
                'image_url': 'https://placehold.co/600x600/png?text=Samsung+45W+Adapter',
                'is_available': True,
                'stock_quantity': 9,
            },
            {
                'name': 'Amaya Micro Charger',
                'slug': 'amaya-micro-charger',
                'short_description': 'Compact micro charger for older device compatibility.',
                'description': 'An affordable micro USB charging option that keeps essentials powered.',
                'price': Decimal('1400.00'),
                'compare_price': Decimal('1700.00'),
                'category_slug': 'micro-chargers',
                'sku': 'PLAY-AMA-002',
                'tags': ['amaya', 'micro', 'charger'],
                'image_url': 'https://placehold.co/600x600/png?text=Amaya+Micro+Charger',
                'is_available': True,
                'stock_quantity': 11,
            },
        ]

        for spec in product_specs:
            category = Category.objects.get(slug=spec['category_slug'])
            Product.objects.update_or_create(
                slug=spec['slug'],
                defaults={
                    'name': spec['name'],
                    'short_description': spec['short_description'],
                    'description': spec['description'],
                    'price': spec['price'],
                    'compare_price': spec.get('compare_price'),
                    'category': category,
                    'image_url': spec['image_url'],
                    'images': [spec['image_url']],
                    'stock_quantity': spec['stock_quantity'],
                    'sku': spec['sku'],
                    'tags': spec['tags'],
                    'is_available': spec.get('is_available', True),
                    'is_featured': spec.get('is_featured', False),
                    'is_best_seller': spec.get('is_best_seller', False),
                    'is_new_arrival': spec.get('is_new_arrival', False),
                    'discount_percentage': 0,
                },
            )

        self.stdout.write(self.style.SUCCESS('Playhouse catalog seeded successfully.'))
