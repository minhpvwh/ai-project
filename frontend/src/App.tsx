import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { useAuthStore } from '@/stores/authStore';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Upload from '@/pages/Upload';
import Search from '@/pages/Search';
import DocumentDetail from '@/pages/DocumentDetail';
import UserManagement from '@/pages/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Routes>
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
              />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="upload" element={<Upload />} />
                <Route path="search" element={<Search />} />
                <Route path="document/:id" element={<DocumentDetail />} />
                <Route path="admin/users" element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } />
              </Route>
            </Routes>
          </div>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

export default App
