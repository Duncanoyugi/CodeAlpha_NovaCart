# backend/reviews/urls/__init__.py
from django.urls import path
from ..views import (
    product_reviews, review_statistics, create_review, update_review,
    delete_review, mark_helpful, admin_pending_reviews, admin_all_reviews,
    admin_review_action
)

urlpatterns = [
    # Public endpoints
    path('product/<uuid:product_id>/', product_reviews, name='product-reviews'),
    path('product/<uuid:product_id>/statistics/', review_statistics, name='review-statistics'),
    
    # Authenticated user endpoints
    path('create/', create_review, name='create-review'),
    path('<uuid:review_id>/update/', update_review, name='update-review'),
    path('<uuid:review_id>/delete/', delete_review, name='delete-review'),
    path('<uuid:review_id>/helpful/', mark_helpful, name='mark-helpful'),
    
    # Admin endpoints
    path('admin/pending/', admin_pending_reviews, name='admin-pending'),
    path('admin/all/', admin_all_reviews, name='admin-all'),
    path('admin/<uuid:review_id>/action/', admin_review_action, name='admin-action'),
]