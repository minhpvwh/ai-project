import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import { 
  HomeOutlined, 
  UploadOutlined, 
  SearchOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.includes('ADMIN');
  
  // Debug logging
  console.log('Sidebar - User:', user);
  console.log('Sidebar - User roles:', user?.roles);
  console.log('Sidebar - Is Admin:', isAdmin);

  const menuItems = [
    { 
      key: '/', 
      label: 'Trang chủ', 
      icon: <HomeOutlined />,
      path: '/'
    },
    { 
      key: '/upload', 
      label: 'Upload tài liệu', 
      icon: <UploadOutlined />,
      path: '/upload'
    },
    { 
      key: '/search', 
      label: 'Tìm kiếm', 
      icon: <SearchOutlined />,
      path: '/search'
    },
    ...(isAdmin ? [{
      key: '/admin/users',
      label: 'Quản trị người dùng',
      icon: <TeamOutlined />,
      path: '/admin/users'
    }, {
      key: '/admin/test',
      label: 'Admin Test',
      icon: <TeamOutlined />,
      path: '/admin/test'
    }] : []),
  ];

  return (
    <Sider 
      width={256}
      style={{
        background: 'white',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        borderRight: '1px solid #f0f0f0'
      }}
    >
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ 
            margin: 0, 
            color: '#8c8c8c',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '12px'
          }}>
            Menu
          </Title>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            border: 'none',
            background: 'transparent'
          }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: (
              <Link 
                to={item.path} 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                {item.label}
              </Link>
            )
          }))}
        />
      </div>
    </Sider>
  );
};

export default Sidebar
