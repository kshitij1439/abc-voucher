import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import CreateVoucher from './pages/employee/CreateVoucher';
import MyVouchers from './pages/employee/MyVouchers';
import EditVoucher from './pages/employee/EditVoucher';
import EmployeeVoucherDetail from './pages/employee/VoucherDetail';

// Director pages
import DirectorDashboard from './pages/director/Dashboard';
import PendingApprovals from './pages/director/PendingApprovals';
import DirectorAllVouchers from './pages/director/AllVouchers';
import DirectorVoucherDetail from './pages/director/VoucherDetail';

// Accounts pages
import AccountsDashboard from './pages/accounts/Dashboard';
import AccountsAllVouchers from './pages/accounts/AllVouchers';
import AccountsVoucherDetail from './pages/accounts/VoucherDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']}><Layout /></ProtectedRoute>}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/create-voucher" element={<CreateVoucher />} />
            <Route path="/employee/my-vouchers" element={<MyVouchers />} />
            <Route path="/employee/edit-voucher/:id" element={<EditVoucher />} />
            <Route path="/employee/vouchers/:id" element={<EmployeeVoucherDetail />} />
          </Route>

          {/* Director Routes */}
          <Route element={<ProtectedRoute allowedRoles={['director']}><Layout /></ProtectedRoute>}>
            <Route path="/director/dashboard" element={<DirectorDashboard />} />
            <Route path="/director/pending-approvals" element={<PendingApprovals />} />
            <Route path="/director/all-vouchers" element={<DirectorAllVouchers />} />
            <Route path="/director/vouchers/:id" element={<DirectorVoucherDetail />} />
          </Route>

          {/* Accounts Routes */}
          <Route element={<ProtectedRoute allowedRoles={['accounts']}><Layout /></ProtectedRoute>}>
            <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
            <Route path="/accounts/all-vouchers" element={<AccountsAllVouchers />} />
            <Route path="/accounts/vouchers/:id" element={<AccountsVoucherDetail />} />
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
