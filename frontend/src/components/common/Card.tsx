import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  ...props
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
