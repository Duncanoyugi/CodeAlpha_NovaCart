# backend/wishlist/urls/__init__.py
from django.urls import path
from ..views import (
    get_wishlist, add_to_wishlist, remove_from_wishlist,
    clear_wishlist, check_in_wishlist
)

urlpatterns = [
    path('', get_wishlist, name='get-wishlist'),
    path('add/', add_to_wishlist, name='add-to-wishlist'),
    path('remove/<uuid:product_id>/', remove_from_wishlist, name='remove-from-wishlist'),
    path('clear/', clear_wishlist, name='clear-wishlist'),
    path('check/<uuid:product_id>/', check_in_wishlist, name='check-in-wishlist'),
]