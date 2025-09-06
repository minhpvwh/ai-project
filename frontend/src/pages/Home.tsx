import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Spin, Empty, Button, Space, App } from 'antd';
import { FileTextOutlined, RiseOutlined, ClockCircleOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { homeApi } from '@/api/homeApi';
import DocumentCard from '@/components/DocumentCard';
import { HomeData, Document } from '@/types';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const { message } = App.useApp();
  const [dashboardData, setDashboardData] = useState<HomeData>({
    newestDocuments: [],
    popularDocuments: [],
    userDocuments: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await homeApi.getDashboard();
      setDashboardData(data || {
        newestDocuments: [],
        popularDocuments: [],
        userDocuments: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Không thể tải dữ liệu trang chủ');
      // Set default data on error
      setDashboardData({
        newestDocuments: [],
        popularDocuments: [],
        userDocuments: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Welcome Section */}
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white'
          }}
        >
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Chào mừng đến với Knowledge Hub
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Nền tảng chia sẻ kiến thức nội bộ của công ty. Tìm kiếm, chia sẻ và học hỏi cùng đồng nghiệp.
          </Text>
        </Card>

        {/* Quick Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tài liệu mới"
                value={dashboardData?.newestDocuments?.length || 0}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tài liệu nổi bật"
                value={dashboardData?.popularDocuments?.length || 0}
                prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tài liệu của tôi"
                value={dashboardData?.userDocuments?.length || 0}
                prefix={<UserOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Truy cập"
                value="24/7"
                prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Documents */}
        <Card>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <Space>
              <ClockCircleOutlined style={{ color: '#667eea' }} />
              <Title level={3} style={{ margin: 0 }}>Tài liệu mới nhất</Title>
            </Space>
            <Link to="/search" style={{ color: '#667eea' }}>
              Xem tất cả →
            </Link>
          </div>
          
          {(dashboardData?.newestDocuments?.length || 0) > 0 ? (
            <Row gutter={[16, 16]}>
              {(dashboardData?.newestDocuments || []).map((document: Document) => (
                <Col xs={24} sm={12} lg={8} key={document.id}>
                  <DocumentCard document={document} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              image={<FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
              description="Chưa có tài liệu nào"
            />
          )}
        </Card>

        {/* Popular Documents */}
        <Card>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <Space>
              <RiseOutlined style={{ color: '#667eea' }} />
              <Title level={3} style={{ margin: 0 }}>Tài liệu nổi bật</Title>
            </Space>
            <Link to="/search" style={{ color: '#667eea' }}>
              Xem tất cả →
            </Link>
          </div>
          
          {(dashboardData?.popularDocuments?.length || 0) > 0 ? (
            <Row gutter={[16, 16]}>
              {(dashboardData?.popularDocuments || []).map((document: Document) => (
                <Col xs={24} sm={12} lg={8} key={document.id}>
                  <DocumentCard document={document} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              image={<RiseOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
              description="Chưa có tài liệu nổi bật nào"
            />
          )}
        </Card>

        {/* My Recent Documents */}
        <Card>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <Space>
              <UserOutlined style={{ color: '#667eea' }} />
              <Title level={3} style={{ margin: 0 }}>Tài liệu của tôi</Title>
            </Space>
            <Link to="/search?my=true" style={{ color: '#667eea' }}>
              Xem tất cả →
            </Link>
          </div>
          
          {(dashboardData?.userDocuments?.length || 0) > 0 ? (
            <Row gutter={[16, 16]}>
              {(dashboardData?.userDocuments || []).map((document: Document) => (
                <Col xs={24} sm={12} lg={8} key={document.id}>
                  <DocumentCard document={document} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              image={<UserOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
              description="Bạn chưa upload tài liệu nào"
            >
              <Button type="primary" icon={<PlusOutlined />}>
                <Link to="/upload">Upload tài liệu đầu tiên</Link>
              </Button>
            </Empty>
          )}
        </Card>
      </Space>
    </div>
  );
}

export default Home
