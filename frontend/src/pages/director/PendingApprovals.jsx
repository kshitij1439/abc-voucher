import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import VoucherTable from '../../components/VoucherTable';
import VoucherFilters from '../../components/VoucherFilters';
import toast from 'react-hot-toast';

const PendingApprovals = () => {
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', status: 'submitted', department: '', category: '',
    dateFrom: '', dateTo: '', amountMin: '', amountMax: '',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [page, setPage] = useState(1);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sortBy, sortOrder, status: 'submitted',
        ...Object.fromEntries(Object.entries(filters).filter(([k, v]) => v && v !== 'all' && k !== 'status')),
      };
      const res = await api.get('/vouchers', { params });
      setVouchers(res.data.data.vouchers);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load.'); }
    finally { setLoading(false); }
  }, [filters, sortBy, sortOrder, page]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>Pending Approvals</h1>
        <p className="text-xs text-stone-400 mt-0.5">Vouchers awaiting your review</p>
      </div>
      <VoucherFilters filters={filters} onFilterChange={(f) => { setFilters({ ...f, status: 'submitted' }); setPage(1); }} showStatusFilter={false} />
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="text-sm text-stone-400">Loading...</div></div>
      ) : (
        <VoucherTable vouchers={vouchers} pagination={pagination} onPageChange={setPage}
          sortBy={sortBy} sortOrder={sortOrder} onSort={(f, o) => { setSortBy(f); setSortOrder(o); setPage(1); }}
          detailPath="/director/vouchers" />
      )}
    </div>
  );
};

export default PendingApprovals;
