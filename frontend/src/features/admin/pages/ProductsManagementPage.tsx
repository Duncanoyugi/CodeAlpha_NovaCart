import React from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProductMutation, useDeleteProductMutation, useGetAdminProductsQuery, useUpdateInventoryMutation, useUpdateProductMutation } from '../api/adminApi';
import { useGetCategoryTreeQuery } from '../../../redux/api/storeApi';
import { PageTitle, Pager, SearchInput, TableShell, Td, Th } from '../components/AdminBits';
import { Badge, Button, Input, Modal, Select, Skeleton, Textarea } from '../../../components/ui';
import { formatPrice } from '../../../utils/formatPrice';
import { onImageError, PLACEHOLDER_IMAGE } from '../../../utils/media';
import type { Category, Product } from '../../../types';

const num = (label: string, min = 0) => z.coerce.number({ message: `${label} must be a number` }).min(min, `${label} can't be negative`);
const schema = z.object({
  name: z.string().trim().min(2, 'Enter a product name'),
  sku: z.string().trim().min(2, 'Enter a SKU'),
  short_description: z.string().trim().min(5, 'Add a short description'),
  description: z.string().trim().min(10, 'Add a full description'),
  category: z.string().min(1, 'Choose a category'),
  image_url: z.string().trim().url('Enter a valid image URL'),
  price: num('Price', 1),
  compare_price: z.coerce.number().min(0).optional(),
  discount_percentage: z.coerce.number().min(0).max(90).optional(),
  stock_quantity: num('Stock').int('Whole numbers only'),
  tags: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
  is_new_arrival: z.boolean().optional(),
  is_available: z.boolean().optional(),
});
type Values = z.input<typeof schema>;

const flatten = (cats: Category[]): Category[] => cats.flatMap((c) => [c, ...flatten(c.children ?? [])]);

const ProductForm: React.FC<{ product?: Product; onClose: () => void }> = ({ product, onClose }) => {
  const { data: tree = [] } = useGetCategoryTreeQuery();
  const [create, { isLoading: creating }] = useCreateProductMutation();
  const [update, { isLoading: updating }] = useUpdateProductMutation();
  const cats = flatten(tree).filter((c) => c.slug !== 'brands');
  const catId = (product as unknown as { category?: string })?.category ?? '';
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: product?.name ?? '', sku: product?.sku ?? '', short_description: product?.short_description ?? '', description: product?.description ?? '',
      category: typeof catId === 'string' ? catId : '', image_url: product?.image_url ?? '', price: product?.price ?? undefined, compare_price: product?.compare_price ?? 0,
      discount_percentage: product?.discount_percentage ?? 0, stock_quantity: product?.stock_quantity ?? 0, tags: product?.tags?.join(', ') ?? '',
      is_featured: product?.is_featured ?? false, is_best_seller: product?.is_best_seller ?? false, is_new_arrival: product?.is_new_arrival ?? true, is_available: product?.is_available ?? true,
    },
  });

  const onSubmit = async (v: Values) => {
    const body = { ...v, tags: (v.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean), compare_price: v.compare_price || null };
    try {
      if (product) await update({ id: product.id, data: body }).unwrap(); else await create(body).unwrap();
      toast.success(product ? 'Product updated' : 'Product created');
      onClose();
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not save the product');
    }
  };

  const check = (name: keyof Values, label: string) => (<label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...register(name)} className="h-4 w-4 accent-[#0b5d46]" /> {label}</label>);

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" {...register('name')} error={errors.name?.message} />
        <Input label="SKU" {...register('sku')} error={errors.sku?.message} />
        <Select label="Category" {...register('category')} error={errors.category?.message}><option value="">Select…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Input label="Image URL" {...register('image_url')} error={errors.image_url?.message} />
        <Input label="Price (KES)" type="number" step="1" {...register('price')} error={errors.price?.message} />
        <Input label="Compare-at price" type="number" step="1" {...register('compare_price')} />
        <Input label="Discount %" type="number" step="1" {...register('discount_percentage')} error={errors.discount_percentage?.message} />
        <Input label="Stock" type="number" step="1" {...register('stock_quantity')} error={errors.stock_quantity?.message} />
      </div>
      <Input label="Short description" {...register('short_description')} error={errors.short_description?.message} />
      <Textarea label="Description" {...register('description')} error={errors.description?.message} />
      <Input label="Tags (comma separated)" {...register('tags')} />
      <div className="flex flex-wrap gap-x-6 gap-y-2">{check('is_available', 'Available')}{check('is_featured', 'Featured')}{check('is_best_seller', 'Best seller')}{check('is_new_arrival', 'New arrival')}</div>
      <Button type="submit" block loading={creating || updating}>{product ? 'Save changes' : 'Create product'}</Button>
    </form>
  );
};

export const ProductsManagementPage: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<'all' | 'available' | 'out_of_stock'>('all');
  const [editing, setEditing] = React.useState<Product | 'new' | null>(null);
  const { data, isLoading, isFetching } = useGetAdminProductsQuery({ page, page_size: 15, search: search || undefined, status });
  const [remove] = useDeleteProductMutation();
  const [setStock] = useUpdateInventoryMutation();
  const onSearch = React.useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  const del = async (p: Product) => {
    if (!window.confirm(`Delete “${p.name}”? Past orders keep their snapshot.`)) return;
    try { await remove(p.id).unwrap(); toast.success('Product deleted'); } catch { toast.error('Could not delete (it may be referenced by orders)'); }
  };
  const saveStock = async (p: Product, value: string) => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n === p.stock_quantity) return;
    try { await setStock({ id: p.id, stock_quantity: n }).unwrap(); toast.success('Stock updated'); } catch { toast.error('Could not update stock'); }
  };

  return (
    <div>
      <PageTitle title="Products" subtitle="Manage your catalogue and inventory." action={<Button leftIcon={<Plus className="h-4.5 w-4.5" />} onClick={() => setEditing('new')}>Add product</Button>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <SearchInput value={search} onChange={onSearch} placeholder="Search products…" />
        <select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} aria-label="Stock filter" className="h-11 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium"><option value="all">All stock</option><option value="available">In stock</option><option value="out_of_stock">Out of stock</option></select>
      </div>
      {isLoading ? <Skeleton className="h-96" /> : (
        <div className={isFetching ? 'opacity-70' : ''}>
          <TableShell>
            <thead><tr><Th>Product</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th /></tr></thead>
            <tbody>
              {data?.products.map((p) => (
                <tr key={p.id}>
                  <Td><div className="flex items-center gap-3"><img src={p.image_url || PLACEHOLDER_IMAGE} onError={onImageError} alt="" className="h-12 w-12 rounded-lg bg-ink-100 object-cover" /><div className="min-w-0"><p className="line-clamp-1 font-semibold">{p.name}</p><p className="text-xs text-ink-500">{p.sku}</p></div></div></Td>
                  <Td><p className="font-bold">{formatPrice(p.final_price)}</p>{p.discount_percentage > 0 && <p className="text-xs text-ink-400 line-through">{formatPrice(p.price)}</p>}</Td>
                  <Td><input type="number" min={0} defaultValue={p.stock_quantity} key={`${p.id}-${p.stock_quantity}`} onBlur={(e) => saveStock(p, e.target.value)} aria-label={`Stock for ${p.name}`} className="h-9 w-20 rounded-lg border border-ink-200 px-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100" /></Td>
                  <Td>{p.is_available && p.stock_quantity > 0 ? <Badge tone="brand">Live</Badge> : p.stock_quantity === 0 ? <Badge tone="danger">Sold out</Badge> : <Badge>Hidden</Badge>}</Td>
                  <Td className="text-right"><button onClick={() => setEditing(p)} className="rounded-lg p-2 hover:bg-ink-100" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></button><button onClick={() => del(p)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button></Td>
                </tr>
              ))}
              {data?.products.length === 0 && <tr><Td colSpan={5} className="py-12 text-center text-ink-500">No products found</Td></tr>}
            </tbody>
          </TableShell>
          <Pager page={page} totalPages={data?.pagination?.total_pages ?? 1} onChange={setPage} />
        </div>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add product' : 'Edit product'} size="lg">
        {editing !== null && <ProductForm product={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  );
};

export default ProductsManagementPage;
