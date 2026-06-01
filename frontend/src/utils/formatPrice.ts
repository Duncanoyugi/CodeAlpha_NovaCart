/**
 * Format price to USD currency format
 * @param price - The price to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Calculate discount percentage between original and final price
 * @param originalPrice - Original price
 * @param finalPrice - Final price after discount
 * @returns Discount percentage (0-100)
 */
export const calculateDiscountPercentage = (originalPrice: number, finalPrice: number): number => {
  if (originalPrice <= 0 || finalPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};