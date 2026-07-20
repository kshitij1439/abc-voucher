import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FilePlus, Clock, CheckSquare, XSquare, DollarSign } from 'lucide-react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/vouchers/stats/dashboard');
      setStats(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-stone-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Dashboard
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">Overview of your expense vouchers</p>
        </div>
        <button
          onClick={() => navigate('/employee/create-voucher')}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm rounded hover:bg-stone-800 cursor-pointer transition-colors"
        >
          <FilePlus className="w-4 h-4" />
          New Voucher
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <StatsCard label="Total" value={stats?.totalVouchers || 0} icon={FileText} />
        <StatsCard label="Draft" value={stats?.draftCount || 0} icon={FilePlus} />
        <StatsCard label="Pending" value={stats?.submittedCount || 0} icon={Clock} />
        <StatsCard label="Approved" value={stats?.approvedCount || 0} icon={CheckSquare} />
        <StatsCard label="Rejected" value={stats?.rejectedCount || 0} icon={XSquare} />
        <StatsCard label="Total Claimed" value={formatCurrency(stats?.totalAmount)} icon={DollarSign} accent />
      </div>

      {/* Recent Vouchers */}
      <div className="bg-white border border-stone-200 rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-800" style={{ fontFamily: 'var(--font-heading)' }}>
            Recent Vouchers
          </h2>
          <button
            onClick={() => navigate('/employee/my-vouchers')}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
          >
            View all →
          </button>
        </div>

        {stats?.recentVouchers?.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {stats.recentVouchers.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/employee/vouchers/${v.id}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-stone-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-teal-700">{v.voucherNumber}</span>
                  <span className="text-sm text-stone-600 truncate max-w-[200px]">{v.expenseTitle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-stone-700">{formatCurrency(v.amount)}</span>
                  <StatusBadge status={v.status} />
                  <span className="text-xs text-stone-400 w-20 text-right">
                    {format(new Date(v.updatedAt), 'dd MMM')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-stone-400">
            No vouchers yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
