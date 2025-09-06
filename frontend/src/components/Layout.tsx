import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const { Content } = AntLayout;

const Layout: React.FC = () => {
  return (
    <AntLayout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      <AntLayout>
        <Sidebar />
        <Content style={{ 
          margin: '0', 
          padding: '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout
