/** Store currency is Kenyan Shillings end to end (cart, Stripe, M-Pesa). */
export const CURRENCY = 'KES';

const kes = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export const formatPrice = (price: number | string | null | undefined, currency: string = CURRENCY): string => {
  const value = Number(price ?? 0);
  if (!Number.isFinite(value)) return kes.format(0);
  if (currency === CURRENCY) return kes.format(value).replace(/\u00a0/g, ' ');
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(value);
};

export const calculateDiscountPercentage = (originalPrice: number, finalPrice: number): number => {
  if (originalPrice <= 0 || finalPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};
