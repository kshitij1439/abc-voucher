import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardForRole } from '../utils/roleUtils';
import { Receipt, Eye, EyeOff } from 'lucide-react';
import { DEPARTMENTS } from '../components/VoucherFilters';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    employeeId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(getDashboardForRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (!form.department) {
      toast.error('Please select a department.');
      return;
    }

    setLoading(true);

    try {
      await register(form);
      toast.success('Account created! Welcome aboard.');
      navigate('/employee/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-900 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              ABC Company
            </h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">
              Expense Voucher System
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-lg p-7">
          <h2 className="text-base font-semibold text-stone-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Create Account
          </h2>
          <p className="text-xs text-stone-400 mb-6">
            Register as an employee to submit expense vouchers.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Full Name *
              </label>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Email *
              </label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@abc.com"
                autoComplete="email"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 pr-10 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-department" className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Department *
              </label>
              <select
                id="reg-department"
                value={form.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 cursor-pointer"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reg-empid" className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Employee ID <span className="text-stone-300">(Optional)</span>
              </label>
              <input
                id="reg-empid"
                type="text"
                value={form.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="e.g. EMP-004"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 text-white text-sm font-medium rounded hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className="text-center text-xs text-stone-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-stone-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
