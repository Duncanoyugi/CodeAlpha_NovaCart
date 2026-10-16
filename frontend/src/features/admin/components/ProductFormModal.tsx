import React, { useEffect, useState } from 'react';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import type { Product, Category } from '../../../types';
import { getErrorMessage } from '../../../services/errorHandler';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useUploadProductImagesMutation,
  useGetCategoriesQuery,
} from '../api/adminApi';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  short_description: z.string().min(10, 'Short description must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  compare_price: z.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  images: z.array(z.string()).default([]),
  stock_quantity: z.number().min(0, 'Stock cannot be negative'),
  sku: z.string().min(1, 'SKU is required'),
  tags: z.string(),
  discount_percentage: z.number().min(0).max(100).default(0),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
});

type FormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [imageInput, setImageInput] = useState('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [uploadProductImages] = useUploadProductImagesMutation();

  const methods = useForm<FormValues>({
    resolver: zodResolver(productSchema) as Resolver<FormValues>,
    defaultValues: {
      name: '',
      short_description: '',
      description: '',
      price: 0,
      compare_price: null,
      category: '',
      image_url: '',
      images: [],
      stock_quantity: 0,
      sku: '',
      tags: '',
      discount_percentage: 0,
      is_available: true,
      is_featured: false,
      is_best_seller: false,
      is_new_arrival: false,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const images = watch('images');
  const imageUrl = watch('image_url');

  useEffect(() => {
    if (product) {
      const categoryValue = typeof product.category === 'object'
        ? product.category.id
        : product.category;
      reset({
        name: product.name,
        short_description: product.short_description,
        description: product.description,
        price: product.price,
        compare_price: product.compare_price || null,
        category: categoryValue || '',
        image_url: product.image_url,
        images: product.images || [],
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        tags: product.tags?.join(', ') || '',
        discount_percentage: product.discount_percentage,
        is_available: product.is_available,
        is_featured: product.is_featured,
        is_best_seller: product.is_best_seller,
        is_new_arrival: product.is_new_arrival,
      });
      setMainImageFile(null);
      setAdditionalImageFiles([]);
    } else {
      reset({
        name: '',
        short_description: '',
        description: '',
        price: 0,
        compare_price: null,
        category: '',
        image_url: '',
        images: [],
        stock_quantity: 0,
        sku: '',
        tags: '',
        discount_percentage: 0,
        is_available: true,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
      });
      setMainImageFile(null);
      setAdditionalImageFiles([]);
    }
  }, [product, reset]);

  const addImage = () => {
    if (imageInput && !images.includes(imageInput)) {
      setValue('images', [...images, imageInput]);
      setImageInput('');
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setMainImageFile(file);
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setValue('image_url', previewUrl);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: Not an image file`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: Must be less than 10MB`);
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setAdditionalImageFiles(prev => [...prev, ...validFiles]);
      // Create previews
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setValue('images', [...images, ...newPreviews]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = [...images];
    const removedUrl = newImages.splice(index, 1)[0];
    setValue('images', newImages);
    if (removedUrl.startsWith('blob:')) {
      const fileIndex = images.slice(0, index).filter((url) => url.startsWith('blob:')).length;
      setAdditionalImageFiles(prev => {
        const newFiles = [...prev];
        newFiles.splice(fileIndex, 1);
        return newFiles;
      });
    }
  };

  const uploadImages = async (productId: string): Promise<void> => {
    if (!mainImageFile && additionalImageFiles.length === 0) {
      return;
    }

    setUploadingImages(true);
    try {
      if (mainImageFile) {
        const body = new FormData();
        body.append('image', mainImageFile);
        body.append('is_main', 'true');
        await uploadProductImage({ id: productId, body }).unwrap();
      }

      if (additionalImageFiles.length > 0) {
        const body = new FormData();
        additionalImageFiles.forEach(file => {
          body.append('images', file);
        });
        await uploadProductImages({ id: productId, body }).unwrap();
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    let savedProduct: Product;
    try {
      const payload = {
        ...data,
        image_url: mainImageFile ? product?.image_url ?? '' : data.image_url,
        images: data.images.filter((url) => !url.startsWith('blob:')),
        tags: data.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      if (product) {
        savedProduct = await updateProduct({ id: product.id, data: payload }).unwrap();
      } else {
        savedProduct = await createProduct(payload).unwrap();
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save product'));
      return;
    }

    try {
      await uploadImages(savedProduct.id);
      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
    } catch (error: unknown) {
      toast.error(`Product saved, but image upload failed: ${getErrorMessage(error, 'Please edit the product and try again.')}`);
    }
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input {...register('name')} className="input-field" />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input {...register('sku')} className="input-field" />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>
            </div>

            {/* Category & Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select {...register('category')} className="input-field">
                  <option value="">Select Category</option>
                  {categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="input-field"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('compare_price', { valueAsNumber: true })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Stock & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  {...register('stock_quantity', { valueAsNumber: true })}
                  className="input-field"
                />
                {errors.stock_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  {...register('discount_percentage', { valueAsNumber: true })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description *
              </label>
              <textarea {...register('short_description')} rows={2} className="input-field" />
              {errors.short_description && (
                <p className="mt-1 text-sm text-red-600">{errors.short_description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description *
              </label>
              <textarea {...register('description')} rows={4} className="input-field" />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Image
              </label>
              <div className="space-y-3">
                {/* File upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleMainImageChange}
                    className="hidden"
                    id="main-image-upload"
                    disabled={uploadingImages}
                  />
                  <label htmlFor="main-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-400">JPEG, PNG, WebP, GIF up to 10MB</span>
                  </label>
                </div>
                
                {/* URL input (alternative) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or enter image URL</label>
                  <input {...register('image_url')} className="input-field" placeholder="https://example.com/image.jpg" />
                  {errors.image_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
                  )}
                </div>

                {/* Preview */}
                {(mainImageFile || imageUrl) && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    {mainImageFile && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">New image selected</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Images
              </label>
              <div className="space-y-3">
                {/* File upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                    id="additional-images-upload"
                    disabled={uploadingImages}
                  />
                  <label htmlFor="additional-images-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-400">Multiple files allowed, up to 10MB each</span>
                  </label>
                </div>

                {/* URL input (alternative) */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter image URL"
                  />
                  <button type="button" onClick={addImage} className="btn-secondary" disabled={uploadingImages}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Previews */}
                <div className="flex flex-wrap gap-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        disabled={uploadingImages}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {url.startsWith('blob:') && (
                        <div className="absolute bottom-0 left-0 right-0 bg-brand-600 text-white text-xs text-center py-0.5">
                          New
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input {...register('tags')} className="input-field" placeholder="electronics, new, sale" />
            </div>

            {/* Status Toggles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('is_available')} />
                <span className="text-sm">Available</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('is_featured')} />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('is_best_seller')} />
                <span className="text-sm">Best Seller</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('is_new_arrival')} />
                <span className="text-sm">New Arrival</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={isCreating || isUpdating || uploadingImages}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating || uploadingImages}
                className="btn-primary flex items-center gap-2"
              >
                {(isCreating || isUpdating || uploadingImages) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                {uploadingImages ? 'Uploading images...' : product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};