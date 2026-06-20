from django.urls import path

from users.views import address_detail, addresses, avatar, change_password, profile

urlpatterns = [
    path("me/profile/", profile, name="user-profile"),
    path("addresses/", addresses, name="user-addresses"),
    path("addresses/<uuid:id>/", address_detail, name="user-address-detail"),
    path("change-password/", change_password, name="user-change-password"),
    path("avatar/", avatar, name="user-avatar"),
]
