import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Clock,
  LogOut,
  Receipt,
  List,
  Menu,
  X,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    employee: 'Employee',
    director: 'Director',
    accounts: 'Accounts Team',
  };

  const navItems = {
    employee: [
      { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/employee/create-voucher', label: 'Create Voucher', icon: FilePlus },
      { to: '/employee/my-vouchers', label: 'My Vouchers', icon: FileText },
    ],
    director: [
      { to: '/director/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/director/pending-approvals', label: 'Pending Approvals', icon: Clock },
      { to: '/director/all-vouchers', label: 'All Vouchers', icon: List },
    ],
    accounts: [
      { to: '/accounts/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/accounts/all-vouchers', label: 'All Vouchers', icon: List },
    ],
  };

  const items = navItems[user?.role] || [];

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-stone-900 text-white flex items-center justify-between px-4 z-40 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-teal-600 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            ABC Vouchers
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-stone-300 hover:text-white focus:outline-none cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen w-60 bg-stone-900 text-stone-300 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand */}
        <div className="px-5 py-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                ABC Vouchers
              </h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                {roleLabel[user?.role]}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-stone-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-stone-800 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-stone-700 flex items-center justify-center text-xs font-semibold text-stone-300">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
