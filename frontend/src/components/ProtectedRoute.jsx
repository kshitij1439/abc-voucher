import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="text-stone-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const dashboardMap = {
      employee: '/employee/dashboard',
      director: '/director/dashboard',
      accounts: '/accounts/dashboard',
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
