# backend/config/permissions.py
"""Role-based permissions.

The API historically used DRF's ``IsAdminUser`` which checks Django's
``is_staff`` flag, while the application manages access through ``User.role``.
Those two could disagree (e.g. promoting a user to ADMIN in the dashboard did
not grant API access). These classes make ``role`` the single source of truth.
"""
from rest_framework.permissions import BasePermission


def _is_admin(user):
    return bool(
        user
        and user.is_authenticated
        and user.is_active
        and (user.is_superuser or getattr(user, 'role', None) == 'ADMIN')
    )


class IsAdminRole(BasePermission):
    message = 'Administrator access required.'

    def has_permission(self, request, view):
        return _is_admin(request.user)


class IsStaffOrAdminRole(BasePermission):
    message = 'Staff or administrator access required.'

    def has_permission(self, request, view):
        user = request.user
        return _is_admin(user) or bool(
            user and user.is_authenticated and user.is_active and getattr(user, 'role', None) == 'STAFF'
        )
