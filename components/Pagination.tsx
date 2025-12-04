import React from 'react';
import { Icon } from './Icon';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PageButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  isCurrent?: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}> = ({ onClick, disabled = false, isCurrent = false, children, ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-current={isCurrent ? 'page' : undefined}
    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
      ${isCurrent 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
  >
    {children}
  </button>
);

const Ellipsis: React.FC = () => (
  <span className="px-3 py-2 text-sm font-medium text-gray-400">...</span>
);

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageNumbers = generatePageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-2 mt-4" aria-label="Pagination">
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        ariaLabel="Go to previous page"
      >
        <Icon type="ChevronLeft" className="w-5 h-5" />
      </PageButton>

      {pageNumbers.map((page, index) =>
        typeof page === 'number' ? (
          <PageButton
            key={page}
            onClick={() => onPageChange(page)}
            isCurrent={currentPage === page}
            ariaLabel={`Go to page ${page}`}
          >
            {page}
          </PageButton>
        ) : (
          <Ellipsis key={`ellipsis-${index}`} />
        )
      )}

      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        ariaLabel="Go to next page"
      >
        <Icon type="ChevronRight" className="w-5 h-5" />
      </PageButton>
    </nav>
  );
};
