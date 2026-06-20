from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from users.models.base import User, UserAddress


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "phone_number",
            "avatar",
            "role",
            "is_verified",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",
            "created_at",
            "last_login",
        )
        read_only_fields = ("id", "email", "role", "is_verified", "created_at", "last_login")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "full_name",
            "phone_number",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",
        )


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = (
            "id",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default",
            "address_type",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password": "New password fields did not match."})
        return attrs


class AvatarUploadSerializer(serializers.Serializer):
    avatar = serializers.ImageField()
