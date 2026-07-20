import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckSquare, XSquare, DollarSign, Activity } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const DirectorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get('/vouchers/stats/dashboard'); setStats(res.data.data); }
      catch { toast.error('Failed to load dashboard.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const fmt = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-sm text-stone-400">Loading...</div></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>Director Dashboard</h1>
        <p className="text-xs text-stone-400 mt-0.5">Voucher approval overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <StatsCard label="Pending Approval" value={stats?.submittedCount || 0} icon={Clock} accent />
        <StatsCard label="Approved Today" value={stats?.approvedToday || 0} icon={CheckSquare} />
        <StatsCard label="Rejected Today" value={stats?.rejectedToday || 0} icon={XSquare} />
        <StatsCard label="Pending Amount" value={fmt(stats?.pendingAmount)} icon={DollarSign} />
        <StatsCard label="Total Vouchers" value={stats?.totalVouchers || 0} icon={Activity} />
      </div>

      <div className="bg-white border border-stone-200 rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-800" style={{ fontFamily: 'var(--font-heading)' }}>Recent Activity</h2>
          <button onClick={() => navigate('/director/pending-approvals')} className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer">View pending →</button>
        </div>
        {stats?.recentVouchers?.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {stats.recentVouchers.map((v) => (
              <div key={v.id} onClick={() => navigate(`/director/vouchers/${v.id}`)} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-teal-700">{v.voucherNumber}</span>
                  <span className="text-sm text-stone-600">{v.employeeName}</span>
                  <span className="text-sm text-stone-500 truncate max-w-[150px]">{v.expenseTitle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-stone-700">{fmt(v.amount)}</span>
                  <StatusBadge status={v.status} />
                  <span className="text-xs text-stone-400 w-20 text-right">{format(new Date(v.updatedAt), 'dd MMM')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-stone-400">No recent activity.</div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;
