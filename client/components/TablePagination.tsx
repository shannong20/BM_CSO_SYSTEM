'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [1];
    if (safePage > 3) pages.push('ellipsis');
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <nav
      aria-label="Table pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-[#374151]"
    >
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span>
          {'–'}
          <span className="font-semibold text-gray-900">
            {Math.min(startIndex + pageSize, totalItems)}
          </span>{' '}
          of <span className="font-semibold text-gray-900">{totalItems}</span>
        </span>
        <label className="inline-flex items-center gap-1.5">
          <span className="text-gray-600">Rows:</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="min-h-9 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-800 focus:border-[#245b29] focus:outline-none focus:ring-2 focus:ring-[#4E8D42]"
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {getPageNumbers().map((item, idx) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400" aria-hidden="true">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === safePage ? 'page' : undefined}
              className={`min-h-10 min-w-10 rounded-lg px-2.5 py-1.5 font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] ${
                item === safePage
                  ? 'bg-[#143C2C] text-white shadow-sm'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};
