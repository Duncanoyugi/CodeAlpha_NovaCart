# backend/wishlist/services/wishlist_service.py
from ..models.base import Wishlist, WishlistItem

class WishlistService:
    """Business logic for wishlist"""
    
    @staticmethod
    def get_or_create_wishlist(user):
        """Get or create user's wishlist"""
        wishlist, created = Wishlist.objects.get_or_create(user=user)
        return wishlist
    
    @staticmethod
    def add_to_wishlist(user, product_id):
        """Add product to wishlist"""
        wishlist = WishlistService.get_or_create_wishlist(user)
        
        # Check if already exists
        if WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).exists():
            raise ValueError("Product already in wishlist")
        
        wishlist_item = WishlistItem.objects.create(
            wishlist=wishlist,
            product_id=product_id
        )
        
        return wishlist_item
    
    @staticmethod
    def remove_from_wishlist(user, product_id):
        """Remove product from wishlist"""
        wishlist = WishlistService.get_or_create_wishlist(user)
        deleted_count = WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).delete()
        
        if deleted_count[0] == 0:
            raise ValueError("Product not found in wishlist")
        
        return True
    
    @staticmethod
    def clear_wishlist(user):
        """Clear entire wishlist"""
        wishlist = WishlistService.get_or_create_wishlist(user)
        wishlist.items.all().delete()
        return True
    
    @staticmethod
    def is_in_wishlist(user, product_id):
        """Check if product is in user's wishlist"""
        if not user.is_authenticated:
            return False
        return WishlistItem.objects.filter(wishlist__user=user, product_id=product_id).exists()