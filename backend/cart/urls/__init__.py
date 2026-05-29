# backend/cart/urls/__init__.py
from django.urls import path
from ..views import (
    get_cart, add_to_cart, update_cart_item, 
    remove_from_cart, clear_cart, merge_cart
)

urlpatterns = [
    path('', get_cart, name='get-cart'),
    path('add/', add_to_cart, name='add-to-cart'),
    path('item/<uuid:item_id>/', update_cart_item, name='update-cart-item'),
    path('item/<uuid:item_id>/remove/', remove_from_cart, name='remove-from-cart'),
    path('clear/', clear_cart, name='clear-cart'),
    path('merge/', merge_cart, name='merge-cart'),
]