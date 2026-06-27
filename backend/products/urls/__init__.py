from django.urls import path
from ..views import (
    # Category views
    list_categories, category_tree, category_detail,
    create_category, update_category, delete_category,
    # Product views
    list_products, featured_products, best_selling_products,
    new_arrivals, product_detail, create_product, update_product,
    delete_product, update_inventory,
)
from ..views.admin_products_view import list_admin_products

urlpatterns = [
    # Category endpoints
    path('categories/', list_categories, name='list-categories'),
    path('categories/tree/', category_tree, name='category-tree'),
    path('categories/<slug:slug>/', category_detail, name='category-detail'),
    path('admin/categories/', create_category, name='create-category'),
    path('admin/categories/<uuid:id>/', update_category, name='update-category'),
    path('admin/categories/<uuid:id>/delete/', delete_category, name='delete-category'),
    
    # Product endpoints (public)
    path('', list_products, name='list-products'),
    path('featured/', featured_products, name='featured-products'),
    path('best-selling/', best_selling_products, name='best-selling'),
    path('new-arrivals/', new_arrivals, name='new-arrivals'),
    path('<slug:slug>/', product_detail, name='product-detail'),
    
    # Admin product endpoints
    path('admin/products/', list_admin_products, name='list-admin-products'),
    path('admin/products/create/', create_product, name='create-product'),
    path('admin/products/<uuid:id>/', update_product, name='update-product'),
    path('admin/products/<uuid:id>/delete/', delete_product, name='delete-product'),
    path('admin/products/<uuid:id>/inventory/', update_inventory, name='update-inventory'),

]