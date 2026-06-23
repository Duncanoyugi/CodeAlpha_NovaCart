import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  className = '',
  ...props
}) => {
  const baseClass = 'animate-pulse bg-[var(--color-bg-muted)]';

  const variants = {
    rect: 'rounded-[var(--radius-md)]',
    text: 'h-4 rounded-[var(--radius-sm)] w-full',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 space-y-4">
      <Skeleton variant="rect" className="aspect-[4/5] w-full" />
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" className="w-3/4 h-5" />
      <div className="flex gap-2">
        <Skeleton variant="text" className="w-1/4 h-5" />
        <Skeleton variant="text" className="w-1/4 h-5" />
      </div>
      <Skeleton variant="rect" className="h-10 w-full" />
    </div>
  );
};

export const OrderItemSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="rect" className="w-16 h-16" />
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-5" />
          <Skeleton variant="text" className="w-24" />
        </div>
      </div>
      <div className="space-y-2 md:text-right">
        <Skeleton variant="text" className="w-24 h-5" />
        <Skeleton variant="text" className="w-16" />
      </div>
    </div>
  );
};

export const ReviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 py-4 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="space-y-1">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rect" className="w-4 h-4" />
        ))}
      </div>
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-5/6" />
    </div>
  );
};

export default Skeleton;
