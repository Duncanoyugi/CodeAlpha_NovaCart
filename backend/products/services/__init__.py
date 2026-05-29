# backend/products/services/__init__.py
from .product_service import ProductService, CategoryService

# This makes ProductService and CategoryService available directly from the services module
__all__ = ['ProductService', 'CategoryService']