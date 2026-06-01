import React, { useEffect, useState } from 'react';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Product, Category } from '../../../types';
import type { ProductFormData } from '../../../types/admin.types';
import { useCreateProductMutation, useUpdateProductMutation, useGetCategoriesQuery } from '../api/adminApi';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  short_description: z.string().min(10, 'Short description must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  compare_price: z.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().url('Must be a valid URL'),
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
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

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

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        short_description: product.short_description,
        description: product.description,
        price: product.price,
        compare_price: product.compare_price || null,
        category: product.category.id,
        image_url: product.image_url,
        images: product.images || [],
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        tags: product.tags.join(', '),
        discount_percentage: product.discount_percentage,
        is_available: product.is_available,
        is_featured: product.is_featured,
        is_best_seller: product.is_best_seller,
        is_new_arrival: product.is_new_arrival,
      });
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
    }
  }, [product, reset]);

  const addImage = () => {
    if (imageInput && !images.includes(imageInput)) {
      setValue('images', [...images, imageInput]);
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setValue('images', newImages);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const formData = new FormData();
      const productData: ProductFormData = {
        ...data,
        tags: data.tags,
      };
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (product) {
        await updateProduct({ id: product.id, data: formData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData).unwrap();
        toast.success('Product created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save product');
    }
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
                Main Image URL *
              </label>
              <input {...register('image_url')} className="input-field" />
              {errors.image_url && (
                <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Images
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Enter image URL"
                />
                <button type="button" onClick={addImage} className="btn-secondary">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
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
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="btn-primary flex items-center gap-2"
              >
                {(isCreating || isUpdating) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                {product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};