import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import api from '../../api/axios';
import SignatureUpload from '../../components/SignatureUpload';
import { DEPARTMENTS, CATEGORIES } from '../../components/VoucherFilters';
import toast from 'react-hot-toast';

const CreateVoucher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState(null);
  const [form, setForm] = useState({
    expenseDate: '',
    department: '',
    expenseTitle: '',
    expenseCategory: '',
    expenseDescription: '',
    amount: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = (isSubmit = false) => {
    const errs = {};

    if (!form.department) errs.department = 'Department is required.';
    if (!form.expenseTitle) errs.expenseTitle = 'Expense title is required.';
    if (!form.expenseDate) errs.expenseDate = 'Expense date is required.';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Amount must be greater than zero.';
    if (isSubmit && !signature) errs.signature = 'Signature is required before submitting.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveAsDraft = async () => {
    if (!validate(false)) return;

    setLoading(true);
    try {
      const res = await api.post('/vouchers', form);
      const voucher = res.data.data;

      // Upload signature if present
      if (signature) {
        await api.patch(`/vouchers/${voucher.id}/signature`, {
          signatureUrl: signature,
          type: 'employee',
        });
      }

      toast.success('Voucher saved as draft.');
      navigate('/employee/my-vouchers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save voucher.');
    } finally {
      setLoading(false);
    }
  };

  const saveAndSubmit = async () => {
    if (!validate(true)) return;

    setLoading(true);
    try {
      // Create voucher
      const res = await api.post('/vouchers', form);
      const voucher = res.data.data;

      // Upload signature
      await api.patch(`/vouchers/${voucher.id}/signature`, {
        signatureUrl: signature,
        type: 'employee',
      });

      // Submit
      await api.patch(`/vouchers/${voucher.id}/submit`);

      toast.success('Voucher submitted for approval.');
      navigate('/employee/my-vouchers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit voucher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded hover:bg-stone-200 text-stone-500 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Create Voucher
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">Fill in expense details below</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <div className="space-y-5">
            {/* Row 1: Department + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                  Department <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 cursor-pointer ${
                    errors.department ? 'border-red-300' : 'border-stone-200'
                  }`}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.department && <p className="text-[11px] text-red-500 mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                  Category
                </label>
                <select
                  value={form.expenseCategory}
                  onChange={(e) => handleChange('expenseCategory', e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 cursor-pointer"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Title */}
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Expense Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.expenseTitle}
                onChange={(e) => handleChange('expenseTitle', e.target.value)}
                placeholder="e.g., Client meeting travel reimbursement"
                className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 ${
                  errors.expenseTitle ? 'border-red-300' : 'border-stone-200'
                }`}
              />
              {errors.expenseTitle && <p className="text-[11px] text-red-500 mt-1">{errors.expenseTitle}</p>}
            </div>

            {/* Row 3: Date + Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                  Expense Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => handleChange('expenseDate', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 ${
                    errors.expenseDate ? 'border-red-300' : 'border-stone-200'
                  }`}
                />
                {errors.expenseDate && <p className="text-[11px] text-red-500 mt-1">{errors.expenseDate}</p>}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                  Amount (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-3 py-2.5 bg-stone-50 border rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 ${
                    errors.amount ? 'border-red-300' : 'border-stone-200'
                  }`}
                />
                {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Description
              </label>
              <textarea
                value={form.expenseDescription}
                onChange={(e) => handleChange('expenseDescription', e.target.value)}
                rows={3}
                placeholder="Additional details about the expense..."
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 resize-none"
              />
            </div>

            {/* Signature */}
            <div className="pt-2 border-t border-stone-100">
              <SignatureUpload
                currentSignature={signature}
                onUpload={setSignature}
                label="Employee Signature"
              />
              {errors.signature && <p className="text-[11px] text-red-500 mt-1">{errors.signature}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-5 border-t border-stone-100">
            <button
              onClick={saveAsDraft}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-300 text-sm font-medium text-stone-700 rounded hover:bg-stone-50 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button
              onClick={saveAndSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-sm font-medium text-white rounded hover:bg-stone-800 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVoucher;
