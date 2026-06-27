from django.urls import path

from users.views import (
    address_detail,
    addresses,
    avatar,
    change_password,
    profile,
    list_admin_users,
    update_user_role,
    toggle_user_status,
    verify_user,
)

urlpatterns = [
    path("me/profile/", profile, name="user-profile"),
    path("addresses/", addresses, name="user-addresses"),
    path("addresses/<uuid:id>/", address_detail, name="user-address-detail"),
    path("change-password/", change_password, name="user-change-password"),
    path("avatar/", avatar, name="user-avatar"),

    # Admin user management
    path("admin/users/", list_admin_users, name="admin-users"),
    path("admin/users/<uuid:user_id>/role/", update_user_role, name="admin-user-role"),
    path("admin/users/<uuid:user_id>/toggle-status/", toggle_user_status, name="admin-user-toggle-status"),
    path("admin/users/<uuid:user_id>/verify/", verify_user, name="admin-user-verify"),
]

