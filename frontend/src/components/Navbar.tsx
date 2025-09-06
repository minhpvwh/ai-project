import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Typography, Avatar, Dropdown } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  SearchOutlined, 
  UploadOutlined, 
  HomeOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

const { Header } = Layout;
const { Title } = Typography;

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
      onClick: () => {
        // Handle profile navigation
      }
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout
    }
  ];

  const navItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
      path: '/'
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: 'Tìm kiếm',
      path: '/search'
    },
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: 'Upload',
      path: '/upload'
    }
  ];

  return (
    <Header style={{ 
      background: 'white', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #f0f0f0'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>K</span>
        </div>
        <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
          Knowledge Hub
        </Title>
      </Link>

      {/* Navigation Menu */}
      <Menu
        mode="horizontal"
        selectedKeys={[]}
        style={{ 
          flex: 1, 
          justifyContent: 'center',
          border: 'none',
          background: 'transparent'
        }}
        items={navItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: (
            <Link to={item.path} style={{ textDecoration: 'none' }}>
              {item.label}
            </Link>
          )
        }))}
      />

      {/* User Menu */}
      <Space>
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#667eea' }}
          />
          <span style={{ color: '#374151', fontWeight: '500' }}>
            {user?.fullName || user?.username}
          </span>
        </Space>
        
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button type="text" icon={<MenuOutlined />} />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar
