import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.roles?.includes('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
