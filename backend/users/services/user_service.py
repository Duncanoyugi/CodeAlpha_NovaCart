from django.core.exceptions import PermissionDenied, ValidationError
from django.core.files.storage import default_storage
from django.db import transaction
from django.utils.text import get_valid_filename

from users.models.base import UserAddress


class UserService:
    """User profile and address-book business rules."""

    ALLOWED_AVATAR_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024

    @staticmethod
    def update_profile(user, validated_data):
        for field, value in validated_data.items():
            setattr(user, field, value)
        user.save(update_fields=[*validated_data.keys(), "updated_at"])
        return user

    @staticmethod
    def change_password(user, current_password, new_password):
        if not user.check_password(current_password):
            raise ValidationError({"current_password": "Current password is incorrect."})
        user.set_password(new_password)
        user.save(update_fields=["password", "updated_at"])
        return user

    @staticmethod
    def list_addresses(user):
        return UserAddress.objects.filter(user=user)

    @staticmethod
    @transaction.atomic
    def create_address(user, validated_data):
        if validated_data.get("is_default"):
            UserAddress.objects.select_for_update().filter(user=user, is_default=True).update(is_default=False)
        elif not UserAddress.objects.filter(user=user).exists():
            validated_data["is_default"] = True

        return UserAddress.objects.create(user=user, **validated_data)

    @staticmethod
    @transaction.atomic
    def update_address(user, address_id, validated_data):
        address = UserService.get_owned_address(user, address_id, for_update=True)
        if validated_data.get("is_default"):
            UserAddress.objects.filter(user=user, is_default=True).exclude(id=address.id).update(is_default=False)

        for field, value in validated_data.items():
            setattr(address, field, value)
        address.save()
        return address

    @staticmethod
    @transaction.atomic
    def delete_address(user, address_id):
        address = UserService.get_owned_address(user, address_id, for_update=True)
        was_default = address.is_default
        address.delete()

        if was_default:
            next_address = UserAddress.objects.filter(user=user).order_by("-created_at").first()
            if next_address:
                next_address.is_default = True
                next_address.save(update_fields=["is_default"])

    @staticmethod
    def get_owned_address(user, address_id, for_update=False):
        queryset = UserAddress.objects.filter(user=user)
        if for_update:
            queryset = queryset.select_for_update()

        try:
            return queryset.get(id=address_id)
        except UserAddress.DoesNotExist as exc:
            raise PermissionDenied("Address not found.") from exc

    @staticmethod
    def validate_avatar(uploaded_file):
        content_type = getattr(uploaded_file, "content_type", "")
        if content_type not in UserService.ALLOWED_AVATAR_CONTENT_TYPES:
            raise ValidationError({"avatar": "Avatar must be a JPEG, PNG, or WebP image."})
        if uploaded_file.size > UserService.MAX_AVATAR_SIZE_BYTES:
            raise ValidationError({"avatar": "Avatar must be smaller than 2MB."})

    @staticmethod
    def upload_avatar(user, uploaded_file):
        UserService.validate_avatar(uploaded_file)
        filename = get_valid_filename(uploaded_file.name)
        path = default_storage.save(f"avatars/{user.id}/{filename}", uploaded_file)
        user.avatar = default_storage.url(path)
        user.save(update_fields=["avatar", "updated_at"])
        return user
