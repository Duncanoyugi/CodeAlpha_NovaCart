import React from 'react';
import { getImageSrcSet, onImageErrorWithFallback, PLACEHOLDER_IMAGE } from '../../utils/media';

interface ProductImageProps {
  product?: { image_url?: string; images?: string[] };
  imageUrl?: string;
  images?: string[];
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  imageUrl,
  images,
  className = '',
  alt = '',
  loading = 'lazy',
  onError,
}) => {
  const srcSet = React.useMemo(
    () => getImageSrcSet(product ?? { image_url: imageUrl, images }),
    [product?.image_url, product?.images, imageUrl, images],
  );
  const [currentSrcIndex, setCurrentSrcIndex] = React.useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onImageErrorWithFallback(e, currentSrcIndex, srcSet);
    setCurrentSrcIndex((i) => i + 1);
    onError?.(e);
  };

  return (
    <img
      src={srcSet[0] || PLACEHOLDER_IMAGE}
      onError={handleImageError}
      alt={alt}
      loading={loading}
      className={className}
    />
  );
};

export default ProductImage;