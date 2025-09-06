import { Card, Statistic, Row, Col, Typography } from 'antd';
import { UserOutlined, TeamOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { UserManagementDto } from '@/api/userManagementApi';

const { Title } = Typography;

interface UserStatsProps {
  users: UserManagementDto[];
}

const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.enabled).length;
  const blockedUsers = users.filter(user => !user.accountNonLocked).length;
  const adminUsers = users.filter(user => user.roles.includes('ADMIN')).length;

  return (
    <div style={{ marginBottom: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>
        Thống kê người dùng
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Người dùng hoạt động"
              value={activeUsers}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Người dùng bị khóa"
              value={blockedUsers}
              prefix={<LockOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={adminUsers}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserStats;
