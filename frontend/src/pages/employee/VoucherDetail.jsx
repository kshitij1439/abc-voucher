import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import ImageLightboxModal from '../../components/ImageLightboxModal';
import toast from 'react-hot-toast';

const EmployeeVoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/vouchers/${id}`);
        setVoucher(res.data.data);
      } catch { toast.error('Voucher not found.'); navigate('/employee/my-vouchers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const fmt = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  const handleDelete = async () => {
    if (!window.confirm('Delete this voucher?')) return;
    setActionLoading(true);
    try { await api.delete(`/vouchers/${id}`); toast.success('Deleted.'); navigate('/employee/my-vouchers'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(false); }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try { await api.patch(`/vouchers/${id}/submit`); toast.success('Submitted!'); const res = await api.get(`/vouchers/${id}`); setVoucher(res.data.data); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(false); }
  };

  const [viewSignature, setViewSignature] = useState(null);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-sm text-stone-400">Loading...</div></div>;
  if (!voucher) return null;

  const isDraft = voucher.status === 'draft';

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
            <p className="text-xs text-stone-400 mt-0.5">Created {format(new Date(voucher.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
        </div>
        {isDraft && (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/employee/edit-voucher/${id}`)} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 border border-stone-300 text-sm text-stone-600 rounded hover:bg-stone-50 cursor-pointer"><Edit className="w-3.5 h-3.5" />Edit</button>
            <button onClick={handleSubmit} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-sm text-white rounded hover:bg-stone-800 cursor-pointer"><Send className="w-3.5 h-3.5" />Submit</button>
            <button onClick={handleDelete} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-sm text-red-600 rounded hover:bg-red-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" />Delete</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-lg p-6">
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

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Employee Info */}
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Employee</h3>
            <p className="text-sm text-stone-700">{voucher.employeeName}</p>
            {voucher.employeeIdNumber && <p className="text-xs text-stone-400 mt-0.5">ID: {voucher.employeeIdNumber}</p>}
            {voucher.employeeSignature && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Employee Signature</p>
                  <button
                    onClick={() => setViewSignature({ url: voucher.employeeSignature, title: 'Employee Signature' })}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    View
                  </button>
                </div>
                <img
                  src={voucher.employeeSignature}
                  alt="Employee Signature"
                  onClick={() => setViewSignature({ url: voucher.employeeSignature, title: 'Employee Signature' })}
                  className="max-h-16 border border-stone-200 rounded p-1 cursor-pointer hover:border-teal-400 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Approval Info */}
          {(voucher.status === 'approved' || voucher.status === 'rejected') && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Approval</h3>
              {voucher.status === 'approved' && (
                <>
                  {voucher.approver && <p className="text-sm text-stone-700">By: {voucher.approver.name}</p>}
                  {voucher.approvalDate && <p className="text-xs text-stone-400 mt-1">{format(new Date(voucher.approvalDate), 'dd MMM yyyy, hh:mm a')}</p>}
                  {voucher.directorSignature && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium">Director Signature</p>
                        <button
                          onClick={() => setViewSignature({ url: voucher.directorSignature, title: 'Director Signature' })}
                          className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                      <img
                        src={voucher.directorSignature}
                        alt="Director Signature"
                        onClick={() => setViewSignature({ url: voucher.directorSignature, title: 'Director Signature' })}
                        className="max-h-16 border border-stone-200 rounded p-1 cursor-pointer hover:border-teal-400 transition-colors"
                      />
                    </div>
                  )}
                </>
              )}
              {voucher.status === 'rejected' && (
                <>
                  {voucher.approver && <p className="text-sm text-stone-700">By: {voucher.approver.name}</p>}
                  <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded">
                    <p className="text-[10px] uppercase tracking-wide text-red-400 font-medium mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{voucher.rejectionReason}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Audit */}
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
      <ImageLightboxModal
        isOpen={Boolean(viewSignature)}
        onClose={() => setViewSignature(null)}
        imageUrl={viewSignature?.url}
        title={viewSignature?.title || 'Signature View'}
      />
    </div>
  );
};

export default EmployeeVoucherDetail;
