"""Cloudinary image upload service."""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings


def configure_cloudinary():
    """Configure Cloudinary with settings from Django config."""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def upload_image(file, folder="novacart/products", public_id=None, transformation=None):
    """
    Upload an image to Cloudinary.
    
    Args:
        file: File object or path to upload
        folder: Cloudinary folder to store the image
        public_id: Optional custom public ID
        transformation: Optional transformation dict
    
    Returns:
        dict: Contains 'url', 'public_id', 'width', 'height', 'format'
    """
    configure_cloudinary()
    
    upload_options = {
        "folder": folder,
        "resource_type": "image",
        "overwrite": True,
        "invalidate": True,
    }
    
    if public_id:
        upload_options["public_id"] = public_id
    
    if transformation:
        upload_options["transformation"] = transformation
    else:
        # Default transformation: optimize for web, max 1920px width
        upload_options["transformation"] = [
            {"width": 1920, "height": 1920, "crop": "limit", "quality": "auto:good"},
            {"fetch_format": "auto"},
        ]
    
    result = cloudinary.uploader.upload(file, **upload_options)
    
    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "width": result.get("width"),
        "height": result.get("height"),
        "format": result.get("format"),
        "bytes": result.get("bytes"),
    }


def upload_multiple_images(files, folder="novacart/products", transformation=None):
    """
    Upload multiple images to Cloudinary.
    
    Args:
        files: List of file objects or paths
        folder: Cloudinary folder
        transformation: Optional transformation dict
    
    Returns:
        list: List of upload results
    """
    results = []
    for file in files:
        result = upload_image(file, folder=folder, transformation=transformation)
        results.append(result)
    return results


def delete_image(public_id):
    """
    Delete an image from Cloudinary.
    
    Args:
        public_id: Cloudinary public ID
    
    Returns:
        dict: Deletion result
    """
    configure_cloudinary()
    return cloudinary.uploader.destroy(public_id, resource_type="image", invalidate=True)


def get_image_url(public_id, transformation=None):
    """
    Generate a Cloudinary URL for an image.
    
    Args:
        public_id: Cloudinary public ID
        transformation: Optional transformation dict
    
    Returns:
        str: Cloudinary URL
    """
    configure_cloudinary()
    
    if transformation:
        return cloudinary.CloudinaryImage(public_id).build_url(**transformation)
    
    return cloudinary.CloudinaryImage(public_id).build_url(
        width=1920, height=1920, crop="limit", quality="auto:good", fetch_format="auto", secure=True
    )


def list_images(folder="novacart/products", max_results=100):
    """
    List images in a Cloudinary folder.
    
    Args:
        folder: Cloudinary folder prefix
        max_results: Maximum number of results
    
    Returns:
        list: List of image resources
    """
    configure_cloudinary()
    result = cloudinary.api.resources(
        type="upload",
        prefix=folder,
        max_results=max_results,
        resource_type="image",
    )
    return result.get("resources", [])


class CloudinaryImageService:
    """Service class for handling product image operations with Cloudinary."""
    
    PRODUCT_FOLDER = "novacart/products"
    CATEGORY_FOLDER = "novacart/categories"
    
    @staticmethod
    def upload_product_image(file, product_id=None, is_main=False):
        """Upload a product image."""
        folder = f"{CloudinaryImageService.PRODUCT_FOLDER}/{product_id}" if product_id else CloudinaryImageService.PRODUCT_FOLDER
        public_id = f"product_{product_id}_main" if is_main and product_id else None
        
        return upload_image(file, folder=folder, public_id=public_id)
    
    @staticmethod
    def upload_product_images(files, product_id):
        """Upload multiple product images."""
        folder = f"{CloudinaryImageService.PRODUCT_FOLDER}/{product_id}"
        results = []
        for i, file in enumerate(files):
            public_id = f"product_{product_id}_{i}"
            result = upload_image(file, folder=folder, public_id=public_id)
            results.append(result)
        return results
    
    @staticmethod
    def upload_category_image(file, category_id=None):
        """Upload a category image."""
        folder = CloudinaryImageService.CATEGORY_FOLDER
        public_id = f"category_{category_id}" if category_id else None
        
        return upload_image(file, folder=folder, public_id=public_id)
    
    @staticmethod
    def delete_product_image(public_id):
        """Delete a product image."""
        return delete_image(public_id)
    
    @staticmethod
    def delete_product_images(public_ids):
        """Delete multiple product images."""
        results = []
        for public_id in public_ids:
            results.append(delete_image(public_id))
        return results
    
    @staticmethod
    def get_optimized_url(public_id, width=None, height=None, crop="limit", quality="auto:good"):
        """Get an optimized Cloudinary URL."""
        transformation = {"quality": quality, "fetch_format": "auto", "secure": True}
        if width:
            transformation["width"] = width
        if height:
            transformation["height"] = height
        if crop:
            transformation["crop"] = crop
        
        return get_image_url(public_id, transformation)