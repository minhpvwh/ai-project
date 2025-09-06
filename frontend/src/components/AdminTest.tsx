import React from 'react';
import { useAuthStore } from '@/stores/authStore';

const AdminTest: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h2>Admin Test Component</h2>
      <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
      <p><strong>User Roles:</strong> {user?.roles ? JSON.stringify(user.roles) : 'No roles'}</p>
      <p><strong>Is Admin:</strong> {user?.roles?.includes('ADMIN') ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default AdminTest;
