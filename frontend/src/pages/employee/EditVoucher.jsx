import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import api from '../../api/axios';
import SignatureUpload from '../../components/SignatureUpload';
import { DEPARTMENTS, CATEGORIES } from '../../components/VoucherFilters';
import toast from 'react-hot-toast';

const EditVoucher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signature, setSignature] = useState(null);
  const [form, setForm] = useState({
    expenseDate: '', department: '', expenseTitle: '',
    expenseCategory: '', expenseDescription: '', amount: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const res = await api.get(`/vouchers/${id}`);
        const v = res.data.data;
        if (v.status !== 'draft') {
          toast.error('Only draft vouchers can be edited.');
          navigate('/employee/my-vouchers');
          return;
        }
        setForm({
          expenseDate: v.expenseDate || '', department: v.department || '',
          expenseTitle: v.expenseTitle || '', expenseCategory: v.expenseCategory || '',
          expenseDescription: v.expenseDescription || '', amount: v.amount || '',
        });
        setSignature(v.employeeSignature || null);
      } catch { toast.error('Failed to load voucher.'); navigate('/employee/my-vouchers'); }
      finally { setLoading(false); }
    };
    fetchVoucher();
  }, [id, navigate]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validate = (isSubmit = false) => {
    const errs = {};
    if (!form.department) errs.department = 'Required';
    if (!form.expenseTitle) errs.expenseTitle = 'Required';
    if (!form.expenseDate) errs.expenseDate = 'Required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Must be > 0';
    if (isSubmit && !signature) errs.signature = 'Signature required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveChanges = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(`/vouchers/${id}`, form);
      if (signature) await api.patch(`/vouchers/${id}/signature`, { signatureUrl: signature, type: 'employee' });
      toast.success('Voucher updated.');
      navigate('/employee/my-vouchers');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  const saveAndSubmit = async () => {
    if (!validate(true)) return;
    setSaving(true);
    try {
      await api.put(`/vouchers/${id}`, form);
      if (signature) await api.patch(`/vouchers/${id}/signature`, { signatureUrl: signature, type: 'employee' });
      await api.patch(`/vouchers/${id}/submit`);
      toast.success('Voucher submitted.');
      navigate('/employee/my-vouchers');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-sm text-stone-400">Loading...</div></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-stone-200 text-stone-500 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h1 className="text-xl font-semibold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>Edit Voucher</h1>
          <p className="text-xs text-stone-400 mt-0.5">Update draft voucher details</p>
        </div>
      </div>
      <div className="max-w-2xl">
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">Department <span className="text-red-400">*</span></label>
              <select value={form.department} onChange={(e) => handleChange('department', e.target.value)} className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm cursor-pointer focus:outline-none focus:border-teal-500 ${errors.department ? 'border-red-300' : 'border-stone-200'}`}>
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-[11px] text-red-500 mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">Category</label>
              <select value={form.expenseCategory} onChange={(e) => handleChange('expenseCategory', e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm cursor-pointer focus:outline-none focus:border-teal-500">
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">Expense Title <span className="text-red-400">*</span></label>
            <input type="text" value={form.expenseTitle} onChange={(e) => handleChange('expenseTitle', e.target.value)} className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm focus:outline-none focus:border-teal-500 ${errors.expenseTitle ? 'border-red-300' : 'border-stone-200'}`} />
            {errors.expenseTitle && <p className="text-[11px] text-red-500 mt-1">{errors.expenseTitle}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">Expense Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.expenseDate} onChange={(e) => handleChange('expenseDate', e.target.value)} className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm focus:outline-none focus:border-teal-500 ${errors.expenseDate ? 'border-red-300' : 'border-stone-200'}`} />
              {errors.expenseDate && <p className="text-[11px] text-red-500 mt-1">{errors.expenseDate}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">Amount (₹) <span className="text-red-400">*</span></label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm focus:outline-none focus:border-teal-500 ${errors.amount ? 'border-red-300' : 'border-stone-200'}`} />
              {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">Description</label>
            <textarea value={form.expenseDescription} onChange={(e) => handleChange('expenseDescription', e.target.value)} rows={3} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:border-teal-500 resize-none" />
          </div>
          <div className="pt-2 border-t border-stone-100">
            <SignatureUpload currentSignature={signature} onUpload={setSignature} label="Employee Signature" />
            {errors.signature && <p className="text-[11px] text-red-500 mt-1">{errors.signature}</p>}
          </div>
          <div className="flex items-center gap-3 pt-5 border-t border-stone-100">
            <button onClick={saveChanges} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 text-sm font-medium text-stone-700 rounded hover:bg-stone-50 disabled:opacity-50 cursor-pointer"><Save className="w-4 h-4" />Save Draft</button>
            <button onClick={saveAndSubmit} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-sm font-medium text-white rounded hover:bg-stone-800 disabled:opacity-50 cursor-pointer"><Send className="w-4 h-4" />Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVoucher;
