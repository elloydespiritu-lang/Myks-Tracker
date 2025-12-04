import React from 'react';
import { BetStatus } from '../types';
import { Icon } from './Icon';

interface FiltersProps {
  statusFilter: BetStatus | 'all';
  onStatusChange: (status: BetStatus | 'all') => void;
  dateFilter: { from: string; to: string };
  onDateChange: (type: 'from' | 'to', date: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  currentPage: number;
}

export const Filters: React.FC<FiltersProps> = ({
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  onClear,
  resultCount,
  totalCount,
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
}) => {
  const showClearButton = statusFilter !== 'all' || dateFilter.from || dateFilter.to;

  const startItem = resultCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, resultCount);

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4 flex flex-col sm:flex-row flex-wrap items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow">
        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as BetStatus | 'all')}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value={BetStatus.PENDING}>Pending</option>
            <option value={BetStatus.WON}>Won</option>
            <option value={BetStatus.LOST}>Lost</option>
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full">
            <label htmlFor="from-date" className="sr-only">From Date</label>
            <input
              id="from-date"
              type="date"
              value={dateFilter.from}
              onChange={(e) => onDateChange('from', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="From Date"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="w-full">
            <label htmlFor="to-date" className="sr-only">To Date</label>
            <input
              id="to-date"
              type="date"
              value={dateFilter.to}
              onChange={(e) => onDateChange('to', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="To Date"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Results Count */}
        <p className="text-sm text-gray-400 whitespace-nowrap">
          {totalCount !== resultCount
              ? `Showing ${startItem}-${endItem} of ${resultCount} (filtered from ${totalCount})`
              : `Showing ${startItem}-${endItem} of ${totalCount} bets`
          }
        </p>

        {/* Items Per Page */}
         <div>
          <label htmlFor="items-per-page" className="sr-only">Items per page</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>

        {/* Clear Button */}
        {showClearButton && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            title="Clear all filters"
          >
            <Icon type="XCircle" className="w-5 h-5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
