/** Inline placeholder shown when a product image is missing or fails to load. */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#eef0ee'/><g fill='none' stroke='#98a19b' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'><rect x='120' y='130' width='160' height='140' rx='18'/><circle cx='168' cy='178' r='14'/><path d='M126 262l52-54 38 36 28-24 30 30'/></g></svg>`,
  );

export const onImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src !== PLACEHOLDER_IMAGE) img.src = PLACEHOLDER_IMAGE;
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg', '.bmp'];
const IMAGE_PATH_PATTERNS = ['/png', '/jpeg', '/jpg', '/webp', '/gif', '/avif', '/svg', '/bmp', '/image/'];
const NON_IMAGE_DOMAINS = ['pinterest.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com'];

export const isLikelyImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    if (NON_IMAGE_DOMAINS.some(d => parsed.hostname.includes(d))) return false;
    const pathname = parsed.pathname.toLowerCase();
    return (
      IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext)) ||
      IMAGE_PATH_PATTERNS.some(p => pathname.includes(p))
    );
  } catch {
    return false;
  }
};

export const getImageSrcSet = (product: { image_url?: string; images?: string[] }): string[] => {
  const sources: string[] = [];
  if (product.image_url && isLikelyImageUrl(product.image_url)) sources.push(product.image_url);
  if (product.images && Array.isArray(product.images)) {
    sources.push(...product.images.filter((url): url is string => typeof url === 'string' && url.length > 0 && isLikelyImageUrl(url)));
  }
  return sources;
};

export const onImageErrorWithFallback = (
  e: React.SyntheticEvent<HTMLImageElement>,
  index: number,
  srcSet: string[],
) => {
  const img = e.currentTarget;
  const nextIndex = index + 1;
  if (nextIndex < srcSet.length) {
    img.src = srcSet[nextIndex];
  } else if (img.src !== PLACEHOLDER_IMAGE) {
    img.src = PLACEHOLDER_IMAGE;
  }
};