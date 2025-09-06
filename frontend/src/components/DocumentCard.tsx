import { Link } from 'react-router-dom';
import { Card, Tag, Space, Typography, Button, Row, Col } from 'antd';
import { CalendarOutlined, UserOutlined, EyeOutlined, StarFilled, TagsOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Document } from '@/types';

const { Text, Title } = Typography;

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVisibilityColor = (visibility: string): string => {
    switch (visibility) {
      case 'PUBLIC':
        return 'green';
      case 'GROUP':
        return 'orange';
      case 'PRIVATE':
        return 'red';
      default:
        return 'default';
    }
  };

  const getVisibilityText = (visibility: string): string => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Công khai';
      case 'GROUP':
        return 'Nhóm';
      case 'PRIVATE':
        return 'Riêng tư';
      default:
        return visibility;
    }
  };

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      actions={[
        <Link key="view" to={`/document/${document.id}`}>
          <Button type="primary" block>
            Xem chi tiết
          </Button>
        </Link>
      ]}
    >
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <Title level={4} style={{ 
            margin: 0, 
            fontSize: '16px',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {document.title}
          </Title>
          <Tag color={getVisibilityColor(document.visibility)}>
            {getVisibilityText(document.visibility)}
          </Tag>
        </div>

        {document.description && (
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '14px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {document.description}
          </Text>
        )}
      </div>

      {document.tags && document.tags.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <Space wrap size={[4, 4]}>
            {document.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} icon={<TagsOutlined />} size="small">
                {tag}
              </Tag>
            ))}
            {document.tags.length > 3 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                +{document.tags.length - 3} khác
              </Text>
            )}
          </Space>
        </div>
      )}

      <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
        <Col span={12}>
          <Space size="small">
            <UserOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {document.owner.username}
            </Text>
          </Space>
        </Col>
        <Col span={12}>
          <Space size="small">
            <CalendarOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatDistanceToNow(new Date(document.createdAt), { 
                addSuffix: true, 
                locale: vi 
              })}
            </Text>
          </Space>
        </Col>
      </Row>

      <Row justify="space-between" align="middle">
        <Col>
          <Space size="small">
            <StarFilled style={{ color: '#faad14' }} />
            <Text strong style={{ fontSize: '14px' }}>
              {document.averageRating.toFixed(1)}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({document.totalRatings} đánh giá)
            </Text>
          </Space>
        </Col>
        <Col>
          <Space size="small">
            <EyeOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {document.viewCount}
            </Text>
          </Space>
        </Col>
      </Row>

      <div style={{ 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {formatFileSize(document.fileSize)}
        </Text>
      </div>
    </Card>
  );
}

export default DocumentCard
