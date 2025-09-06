import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  // Debug logging
  console.log('AdminRoute - User:', user);
  console.log('AdminRoute - Is Authenticated:', isAuthenticated);
  console.log('AdminRoute - User roles:', user?.roles);
  console.log('AdminRoute - Is Admin:', user?.roles?.includes('ADMIN'));

  if (!isAuthenticated) {
    console.log('AdminRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!user?.roles?.includes('ADMIN')) {
    console.log('AdminRoute - Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - Access granted');
  return <>{children}</>;
};

export default AdminRoute;
