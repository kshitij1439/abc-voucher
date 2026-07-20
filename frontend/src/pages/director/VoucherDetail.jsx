import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import SignatureUpload from '../../components/SignatureUpload';
import toast from 'react-hot-toast';

const DirectorVoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [directorSignature, setDirectorSignature] = useState(null);
  const [showApprovePanel, setShowApprovePanel] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get(`/vouchers/${id}`); setVoucher(res.data.data); }
      catch { toast.error('Not found.'); navigate('/director/all-vouchers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const fmt = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  const handleApprove = async () => {
    if (!directorSignature) { toast.error('Please upload your signature.'); return; }
    setActionLoading(true);
    try {
      await api.patch(`/vouchers/${id}/approve`, { directorSignature });
      toast.success('Voucher approved.');
      const res = await api.get(`/vouchers/${id}`);
      setVoucher(res.data.data);
      setShowApprovePanel(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Rejection reason is required.'); return; }
    setActionLoading(true);
    try {
      await api.patch(`/vouchers/${id}/reject`, { rejectionReason });
      toast.success('Voucher rejected.');
      const res = await api.get(`/vouchers/${id}`);
      setVoucher(res.data.data);
      setShowRejectModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(false); }
  };

  const [viewSignature, setViewSignature] = useState(null);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-sm text-stone-400">Loading...</div></div>;
  if (!voucher) return null;

  const canAct = voucher.status === 'submitted';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-stone-200 text-stone-500 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>{voucher.voucherNumber}</h1>
              <StatusBadge status={voucher.status} />
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Submitted by {voucher.employeeName}</p>
          </div>
        </div>
        {canAct && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowApprovePanel(true)} disabled={actionLoading} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-sm text-white rounded hover:bg-emerald-700 cursor-pointer"><Check className="w-4 h-4" />Approve</button>
            <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-sm text-red-600 rounded hover:bg-red-50 cursor-pointer"><X className="w-4 h-4" />Reject</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-stone-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Expense Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div><p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Title</p><p className="text-sm text-stone-800 mt-0.5">{voucher.expenseTitle}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Department</p><p className="text-sm text-stone-800 mt-0.5">{voucher.department}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Category</p><p className="text-sm text-stone-800 mt-0.5">{voucher.expenseCategory || '—'}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Expense Date</p><p className="text-sm text-stone-800 mt-0.5">{voucher.expenseDate ? format(new Date(voucher.expenseDate), 'dd MMM yyyy') : '—'}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Voucher Date</p><p className="text-sm text-stone-800 mt-0.5">{voucher.voucherDate ? format(new Date(voucher.voucherDate), 'dd MMM yyyy') : '—'}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Amount</p><p className="text-lg font-semibold text-stone-900 mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>{fmt(voucher.amount)}</p></div>
            </div>
            {voucher.expenseDescription && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-1">Description</p>
                <p className="text-sm text-stone-600">{voucher.expenseDescription}</p>
              </div>
            )}
          </div>

          {/* Approve Panel */}
          {showApprovePanel && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-emerald-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Approve Voucher</h3>
              <SignatureUpload currentSignature={directorSignature} onUpload={setDirectorSignature} label="Your Signature (required)" />
              <div className="flex gap-2 mt-4">
                <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">Confirm Approval</button>
                <button onClick={() => setShowApprovePanel(false)} className="px-4 py-2 text-sm text-stone-500 hover:bg-white rounded cursor-pointer">Cancel</button>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-red-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Reject Voucher</h3>
              <label className="block text-[11px] uppercase tracking-wide text-red-400 font-medium mb-1.5">Reason for Rejection <span className="text-red-500">*</span></label>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} placeholder="Explain why this voucher is being rejected..." className="w-full px-3 py-2.5 bg-white border border-red-200 rounded text-sm focus:outline-none focus:border-red-400 resize-none" />
              <div className="flex gap-2 mt-3">
                <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer">Confirm Rejection</button>
                <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm text-stone-500 hover:bg-white rounded cursor-pointer">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Employee</h3>
            <p className="text-sm text-stone-700">{voucher.employeeName}</p>
            {voucher.employeeIdNumber && <p className="text-xs text-stone-400 mt-0.5">ID: {voucher.employeeIdNumber}</p>}
            {voucher.employeeSignature && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Employee Signature</p>
                  <button onClick={() => setViewSignature({ url: voucher.employeeSignature, title: 'Employee Signature' })} className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer">View</button>
                </div>
                <img src={voucher.employeeSignature} alt="Employee Signature" onClick={() => setViewSignature({ url: voucher.employeeSignature, title: 'Employee Signature' })} className="max-h-16 border border-stone-200 rounded p-1 cursor-pointer hover:border-teal-400 transition-colors" />
              </div>
            )}
          </div>

          {voucher.status === 'approved' && voucher.directorSignature && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Approval</h3>
              {voucher.approver && <p className="text-sm text-stone-700">{voucher.approver.name}</p>}
              {voucher.approvalDate && <p className="text-xs text-stone-400 mt-1">{format(new Date(voucher.approvalDate), 'dd MMM yyyy, hh:mm a')}</p>}
              <div className="mt-3 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Director Signature</p>
                  <button onClick={() => setViewSignature({ url: voucher.directorSignature, title: 'Director Signature' })} className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer">View</button>
                </div>
                <img src={voucher.directorSignature} alt="Director Signature" onClick={() => setViewSignature({ url: voucher.directorSignature, title: 'Director Signature' })} className="max-h-16 border border-stone-200 rounded p-1 cursor-pointer hover:border-teal-400 transition-colors" />
              </div>
            </div>
          )}

          {voucher.status === 'rejected' && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Rejection</h3>
              <div className="p-3 bg-red-50 border border-red-100 rounded">
                <p className="text-sm text-red-700">{voucher.rejectionReason}</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Audit</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-stone-400">Created</span><span className="text-stone-600">{format(new Date(voucher.createdAt), 'dd MMM yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Updated</span><span className="text-stone-600">{format(new Date(voucher.updatedAt), 'dd MMM yyyy')}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature View Lightbox Modal */}
      {viewSignature && (
        <div onClick={() => setViewSignature(null)} className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div onClick={(e) => e.stopPropagation()} className="bg-white border border-stone-200 rounded-lg p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
              <h3 className="text-sm font-semibold text-stone-800" style={{ fontFamily: 'var(--font-heading)' }}>{viewSignature.title}</h3>
              <button onClick={() => setViewSignature(null)} className="text-stone-400 hover:text-stone-600 text-xs px-2 py-1 rounded bg-stone-100 cursor-pointer">Close ✕</button>
            </div>
            <div className="flex items-center justify-center bg-stone-50 border border-stone-200 rounded-lg p-6 min-h-[180px]">
              <img src={viewSignature.url} alt={viewSignature.title} className="max-h-64 object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorVoucherDetail;
