from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from ..models.base import Product
from ..serializers import ProductListSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_admin_products(request):
    """List products for admin dashboard with filtering + pagination.

    Supports query params expected by frontend:
    - page (default 1)
    - page_size (default 20)
    - search (name/short_description/description/tags)
    - status: all | available | out_of_stock
    """

    try:
        page = int(request.query_params.get("page", 1))
    except (TypeError, ValueError):
        page = 1

    try:
        page_size = int(request.query_params.get("page_size", 20))
    except (TypeError, ValueError):
        page_size = 20

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 20

    search = request.query_params.get("search")
    status_filter = request.query_params.get("status")

    qs = Product.objects.all().order_by("-created_at")

    # Search
    if search:
        qs = qs.filter(
            Q(name__icontains=search)
            | Q(short_description__icontains=search)
            | Q(description__icontains=search)
            | Q(tags__icontains=search)
        )

    # Inventory status filtering (per your requirement):
    # available => stock_quantity > 0
    # out_of_stock => stock_quantity == 0
    if status_filter == "available":
        qs = qs.filter(stock_quantity__gt=0)
    elif status_filter == "out_of_stock":
        qs = qs.filter(stock_quantity=0)

    total_count = qs.count()
    total_pages = (total_count + page_size - 1) // page_size if page_size else 1
    if total_pages < 1:
        total_pages = 1

    if page > total_pages:
        page = total_pages

    start = (page - 1) * page_size
    end = start + page_size
    products = qs[start:end]

    serializer = ProductListSerializer(products, many=True)

    return Response(
        {
            "success": True,
            "data": {
                "products": serializer.data,
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

