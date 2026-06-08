import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const buttonBase = 'min-w-[36px] h-9 rounded-[var(--radius-md)] transition flex items-center justify-center text-sm font-ui';

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${buttonBase} border border-[var(--color-border-medium)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`${buttonBase} ${
            page === currentPage
              ? 'bg-[var(--color-gold-400)] text-[var(--color-gold-800)] font-bold border-transparent'
              : page === '...'
                ? 'cursor-default text-[var(--color-text-tertiary)]'
                : 'border border-[var(--color-border-medium)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${buttonBase} border border-[var(--color-border-medium)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
