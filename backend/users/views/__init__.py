from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.serializers import (
    AvatarUploadSerializer,
    ChangePasswordSerializer,
    UserAddressSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)
from users.services import UserService


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == "GET":
        return Response({"success": True, "data": UserProfileSerializer(request.user).data})

    serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        user = UserService.update_profile(request.user, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Profile updated successfully.",
            "data": UserProfileSerializer(user).data,
        })
    return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def addresses(request):
    if request.method == "GET":
        serializer = UserAddressSerializer(UserService.list_addresses(request.user), many=True)
        return Response({"success": True, "data": serializer.data})

    serializer = UserAddressSerializer(data=request.data)
    if serializer.is_valid():
        address = UserService.create_address(request.user, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Address created successfully.",
            "data": UserAddressSerializer(address).data,
        }, status=status.HTTP_201_CREATED)
    return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def address_detail(request, id):
    if request.method == "DELETE":
        UserService.delete_address(request.user, id)
        return Response({"success": True, "message": "Address deleted successfully."})

    serializer = UserAddressSerializer(data=request.data, partial=True)
    if serializer.is_valid():
        address = UserService.update_address(request.user, id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Address updated successfully.",
            "data": UserAddressSerializer(address).data,
        })
    return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        try:
            UserService.change_password(
                request.user,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
        except DjangoValidationError as exc:
            return Response({"success": False, "errors": exc.message_dict}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "Password changed successfully."})
    return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def avatar(request):
    serializer = AvatarUploadSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = UserService.upload_avatar(request.user, serializer.validated_data["avatar"])
        except DjangoValidationError as exc:
            errors = getattr(exc, "message_dict", {"avatar": exc.messages})
            return Response({"success": False, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            "success": True,
            "message": "Avatar uploaded successfully.",
            "data": UserProfileSerializer(user).data,
        })
    return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
