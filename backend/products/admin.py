# backend/products/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models.base import Category, Product, ProductVariant

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'image')
        }),
        ('Hierarchy', {
            'fields': ('parent', 'order')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['name', 'sku', 'price', 'stock_quantity', 'attributes']
    show_change_link = True

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'price', 'final_price_display', 'stock_quantity', 
                   'is_available', 'is_featured', 'category', 'rating', 'sold_count']
    list_filter = ['is_available', 'is_featured', 'is_best_seller', 'is_new_arrival', 
                  'category', 'created_at']
    search_fields = ['name', 'sku', 'barcode', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'stock_quantity', 'is_available', 'is_featured']
    readonly_fields = ['rating', 'num_reviews', 'views_count', 'sold_count', 'created_at', 'updated_at']
    inlines = [ProductVariantInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'sku', 'barcode', 'category', 'short_description', 'description')
        }),
        ('Pricing', {
            'fields': ('price', 'compare_price', 'cost_per_item', 'discount_percentage')
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'weight', 'tags')
        }),
        ('Images', {
            'fields': ('image_url', 'images')
        }),
        ('Status', {
            'fields': ('is_available', 'is_featured', 'is_best_seller', 'is_new_arrival')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('rating', 'num_reviews', 'views_count', 'sold_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def final_price_display(self, obj):
        return f"${obj.final_price}"
    final_price_display.short_description = 'Final Price'
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;" />', obj.image_url)
        return "No Image"
    image_preview.short_description = 'Image'

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['name', 'product', 'sku', 'price', 'stock_quantity']
    list_filter = ['product']
    search_fields = ['name', 'sku']