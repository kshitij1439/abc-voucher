import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'Finance', 'HR',
  'Operations', 'Management', 'Design', 'Support',
];

const CATEGORIES = [
  'Travel', 'Office Supplies', 'Meals & Entertainment', 'Software',
  'Hardware', 'Training', 'Utilities', 'Miscellaneous',
];

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const VoucherFilters = ({ filters, onFilterChange, showStatusFilter = true }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      department: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    });
  };

  const hasActiveFilters = filters.department || filters.category ||
    filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 mb-5">
      {/* Top row: search + status + toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search vouchers..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        {showStatusFilter && (
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm text-stone-700 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded border text-sm cursor-pointer transition-colors ${
            showAdvanced || hasActiveFilters
              ? 'bg-teal-50 border-teal-200 text-teal-700'
              : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-2 text-xs text-stone-500 hover:text-red-500 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-stone-100">
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-1">Department</label>
            <select
              value={filters.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="">All</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-1">Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-1">Min Amount</label>
            <input
              type="number"
              placeholder="₹0"
              value={filters.amountMin || ''}
              onChange={(e) => handleChange('amountMin', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-1">Max Amount</label>
            <input
              type="number"
              placeholder="₹∞"
              value={filters.amountMax || ''}
              onChange={(e) => handleChange('amountMax', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { DEPARTMENTS, CATEGORIES };
export default VoucherFilters;
