from rest_framework import serializers

from users.models.base import User


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "avatar",
            "role",
            "is_verified",
            "is_active",
            "created_at",
            "last_login",
        ]

