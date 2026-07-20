import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Receipt, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      const dashboardMap = {
        employee: '/employee/dashboard',
        director: '/director/dashboard',
        accounts: '/accounts/dashboard',
      };

      toast.success(`Welcome back, ${user.name}`);
      navigate(dashboardMap[user.role] || '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
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
            Sign in
          </h2>
          <p className="text-xs text-stone-400 mb-6">
            Enter your credentials to access the system.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@abc.com"
                autoComplete="email"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] uppercase tracking-wide text-stone-400 font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 text-white text-sm font-medium rounded hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo credentials
        <div className="mt-5 bg-white border border-stone-200 rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-wide text-stone-400 font-medium mb-2.5">Demo Accounts</p>
          <div className="space-y-1.5">
            {[
              { role: 'Employee', email: 'employee@abc.com' },
              { role: 'Director', email: 'director@abc.com' },
              { role: 'Accounts', email: 'accounts@abc.com' },
            ].map((demo) => (
              <button
                key={demo.email}
                onClick={() => { setEmail(demo.email); setPassword('password123'); }}
                className="flex items-center justify-between w-full px-2.5 py-1.5 rounded text-xs hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <span className="text-stone-600">{demo.role}</span>
                <span className="text-stone-400 font-mono text-[11px]">{demo.email}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-300 mt-2">Password: password123</p>
        </div>  */}
      </div>
    </div>
  );
};

export default Login;
