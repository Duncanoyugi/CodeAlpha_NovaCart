from django.core.management.base import BaseCommand

from orders.services.order_service import OrderService


class Command(BaseCommand):
    help = 'Cancel unpaid orders past the payment window and return their stock to inventory.'

    def handle(self, *args, **options):
        count = OrderService.expire_unpaid_orders()
        self.stdout.write(self.style.SUCCESS(f'Expired {count} unpaid order(s).'))
