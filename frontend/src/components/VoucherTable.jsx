import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const VoucherTable = ({
  vouchers,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  detailPath,
  showEmployee = true,
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSort = (field) => {
    if (onSort) {
      const newOrder = sortBy === field && sortOrder === 'DESC' ? 'ASC' : 'DESC';
      onSort(field, newOrder);
    }
  };

  const SortHeader = ({ field, children }) => (
    <th
      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 cursor-pointer hover:text-stone-600 select-none"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortBy === field ? 'text-teal-600' : 'text-stone-300'}`} />
      </span>
    </th>
  );

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
        <p className="text-sm text-stone-400">No vouchers found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/50">
              <SortHeader field="voucher_number">Voucher #</SortHeader>
              {showEmployee && <SortHeader field="employee_name">Employee</SortHeader>}
              <SortHeader field="department">Department</SortHeader>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">Title</th>
              <SortHeader field="expense_date">Expense Date</SortHeader>
              <SortHeader field="amount">Amount</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="created_at">Created</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {vouchers.map((voucher) => (
              <tr
                key={voucher.id}
                className="hover:bg-stone-50/50 cursor-pointer transition-colors"
                onClick={() => navigate(`${detailPath}/${voucher.id}`)}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-teal-700">{voucher.voucherNumber}</span>
                </td>
                {showEmployee && (
                  <td className="px-4 py-3 text-sm text-stone-700">{voucher.employeeName}</td>
                )}
                <td className="px-4 py-3 text-sm text-stone-600">{voucher.department}</td>
                <td className="px-4 py-3 text-sm text-stone-700 max-w-[200px] truncate">{voucher.expenseTitle}</td>
                <td className="px-4 py-3 text-sm text-stone-600">
                  {voucher.expenseDate ? format(new Date(voucher.expenseDate), 'dd MMM yyyy') : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-stone-800">
                  {formatCurrency(voucher.amount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={voucher.status} />
                </td>
                <td className="px-4 py-3 text-xs text-stone-400">
                  {voucher.createdAt ? format(new Date(voucher.createdAt), 'dd MMM yyyy') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-stone-100">
          <p className="text-xs text-stone-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} – {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.totalPages)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-stone-300 text-xs">…</span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`w-7 h-7 rounded text-xs font-medium cursor-pointer ${
                      p === pagination.page
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherTable;
