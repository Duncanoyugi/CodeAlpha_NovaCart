from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from users.models.base import User
from users.serializers.admin_serializers import AdminUserSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_admin_users(request):
    """List users for admin dashboard with filtering + pagination."""
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", 20))
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 20

    search = request.query_params.get("search")
    role = request.query_params.get("role")
    is_verified = request.query_params.get("is_verified")
    is_active = request.query_params.get("is_active")

    qs = User.objects.all().order_by("-created_at")

    if search:
        qs = qs.filter(Q(full_name__icontains=search) | Q(email__icontains=search))

    if role:
        qs = qs.filter(role=role)

    if is_verified is not None:
        if str(is_verified).lower() in ["true", "1", "yes"]:
            qs = qs.filter(is_verified=True)
        elif str(is_verified).lower() in ["false", "0", "no"]:
            qs = qs.filter(is_verified=False)

    if is_active is not None:
        if str(is_active).lower() in ["true", "1", "yes"]:
            qs = qs.filter(is_active=True)
        elif str(is_active).lower() in ["false", "0", "no"]:
            qs = qs.filter(is_active=False)

    total_count = qs.count()
    total_pages = (total_count + page_size - 1) // page_size if page_size else 1
    if total_pages < 1:
        total_pages = 1

    if page > total_pages:
        page = total_pages

    start = (page - 1) * page_size
    end = start + page_size
    users = qs[start:end]

    serializer = AdminUserSerializer(users, many=True)

    return Response(
        {
            "success": True,
            "data": {
                "users": serializer.data,
                "pagination": {
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "current_page": page,
                    "page_size": page_size,
                    "has_next": page < total_pages,
                    "has_previous": page > 1,
                },
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_user_role(request, user_id):
    user = User.objects.get(id=user_id)
    role = request.data.get("role")
    if role not in [User.Role.CUSTOMER, User.Role.STAFF, User.Role.ADMIN, User.Role.VENDOR]:
        return Response({"success": False, "message": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
    user.role = role
    user.save(update_fields=["role", "updated_at"])
    return Response({"success": True, "data": AdminUserSerializer(user).data})


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_user_status(request, user_id):
    user = User.objects.get(id=user_id)
    is_active = request.data.get("is_active")
    if is_active is None:
        return Response({"success": False, "message": "is_active is required"}, status=status.HTTP_400_BAD_REQUEST)
    if str(is_active).lower() in ["true", "1", "yes"]:
        user.is_active = True
    elif str(is_active).lower() in ["false", "0", "no"]:
        user.is_active = False
    else:
        return Response({"success": False, "message": "Invalid is_active value"}, status=status.HTTP_400_BAD_REQUEST)

    user.save(update_fields=["is_active", "updated_at"])
    return Response({"success": True, "data": AdminUserSerializer(user).data})


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def verify_user(request, user_id):
    user = User.objects.get(id=user_id)
    is_verified = request.data.get("is_verified")
    if is_verified is None:
        return Response({"success": False, "message": "is_verified is required"}, status=status.HTTP_400_BAD_REQUEST)

    if str(is_verified).lower() in ["true", "1", "yes"]:
        user.is_verified = True
    elif str(is_verified).lower() in ["false", "0", "no"]:
        user.is_verified = False
    else:
        return Response({"success": False, "message": "Invalid is_verified value"}, status=status.HTTP_400_BAD_REQUEST)

    user.save(update_fields=["is_verified", "updated_at"])
    return Response({"success": True, "data": AdminUserSerializer(user).data})

