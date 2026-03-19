import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

/**
 * Pagination Component
 * Provides client-side pagination for large datasets
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onItemsPerPageChange - Callback when items per page changes
 * @param {number[]} props.itemsPerPageOptions - Available items per page options
 * @param {boolean} props.showPageSizeSelector - Show/hide page size selector
 * @param {boolean} props.showTotalItems - Show/hide total items count
 */
export function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showTotalItems = true,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range if near edges
      if (currentPage <= 3) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 3, 2);
      }

      // Add ellipsis before range if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis after range if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (value) => {
    const newItemsPerPage = parseInt(value, 10);
    if (onItemsPerPageChange && newItemsPerPage !== itemsPerPage) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-2'>
      {/* Items per page selector */}
      {showPageSizeSelector && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>Rows per page:</span>
          <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Page info */}
      {showTotalItems && (
        <div className='text-sm text-muted-foreground'>
          Showing {startIndex} to {endIndex} of {totalItems} items
        </div>
      )}

      {/* Page navigation */}
      <div className='flex items-center gap-1'>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className='size-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className='size-4' />
        </Button>

        <div className='flex items-center gap-1'>
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className='px-2 text-muted-foreground'>...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className='size-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className='size-4' />
        </Button>
      </div>
    </div>
  );
}

/**
 * Hook for managing pagination state
 * 
 * @param {Object} options
 * @param {number} options.initialPage - Initial page number
 * @param {number} options.initialItemsPerPage - Initial items per page
 * @returns {Object} Pagination state and handlers
 */
export function usePagination({
  initialPage = 1,
  initialItemsPerPage = 10,
} = {}) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const paginate = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const reset = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginate,
    reset,
  };
}
