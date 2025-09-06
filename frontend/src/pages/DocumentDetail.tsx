import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Tag, 
  Spin, 
  Empty, 
  Descriptions,
  Modal,
  App
} from 'antd';
import { 
  ArrowLeftOutlined, 
  DownloadOutlined, 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  TagsOutlined, 
  StarOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { documentApi } from '@/api/documentApi';
import { commentApi } from '@/api/commentApi';
import { ratingApi } from '@/api/ratingApi';
import { useAuthStore } from '@/stores/authStore';
import CommentBox from '@/components/CommentBox';
import RatingStars from '@/components/RatingStars';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Document, Comment, Rating } from '@/types';

const { Title, Text, Paragraph } = Typography;

const DocumentDetail: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    fetchDocumentDetails()
    fetchComments()
    fetchUserRating()
  }, [id])

  const fetchDocumentDetails = async () => {
    try {
      const data = await documentApi.getById(id!);
      // Transform backend response to frontend format
      const transformedDocument = {
        ...data,
        owner: {
          id: data.ownerId,
          username: data.ownerName,
          fullName: data.ownerName,
          email: '',
          roles: [],
          createdAt: ''
        }
      };
      setDocument(transformedDocument);
      console.log('Document ownerId:', data.ownerId, 'Current user id:', user?.id);
      setIsOwner(data.ownerId === user?.id);
    } catch (error: any) {
      console.error('Error fetching document details:', error);
      message.error('Không thể tải thông tin tài liệu');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentApi.getByDocument(id!);
      setComments(response.content);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      if (error.response?.status === 403) {
        message.warning('Bạn cần đăng nhập để xem bình luận');
      } else if (error.response?.status !== 404) {
        message.error('Không thể tải bình luận');
      }
    }
  };

  const fetchUserRating = async () => {
    try {
      const data = await ratingApi.getUserRating(id!);
      setUserRating(data.hasRating ? data.score : null);
    } catch (error: any) {
      console.error('Error fetching user rating:', error);
      if (error.response?.status === 403) {
        message.warning('Bạn cần đăng nhập để xem đánh giá');
      } else if (error.response?.status !== 404) {
        message.error('Không thể tải đánh giá');
      }
    }
  };

  const handleRatingChange = async (rating: number) => {
    try {
      console.log('Rating change:', rating, 'Document ID:', id);
      await ratingApi.addOrUpdateRating(id!, rating);
      setUserRating(rating);
      message.success('Đánh giá đã được cập nhật');
      // Refresh document to get updated rating
      fetchDocumentDetails();
    } catch (error) {
      console.error('Rating error:', error);
      message.error('Không thể cập nhật đánh giá');
    }
  };

  const handleCommentAdded = async (documentId: string, content: string) => {
    await commentApi.add(documentId, content);
    fetchComments();
  };

  const handleCommentUpdated = async (commentId: string, content: string) => {
    await commentApi.update(commentId, content);
    fetchComments();
  };

  const handleCommentDeleted = async (commentId: string) => {
    await commentApi.delete(commentId);
    fetchComments();
  };

  const handleDownload = async () => {
    try {
      const data = await documentApi.download(id!);
      
      // Create blob URL and trigger download
      const blob = new Blob([data], { type: document?.fileType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document?.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Tải file thành công');
    } catch (error: any) {
      console.error('Download error:', error);
      message.error('Không thể tải file');
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xóa tài liệu',
      content: 'Bạn có chắc muốn xóa tài liệu này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await documentApi.delete(id!);
          message.success('Tài liệu đã được xóa');
          navigate('/');
        } catch (error) {
          message.error('Không thể xóa tài liệu');
        }
      }
    });
  };

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

  if (!document) {
    return (
      <Empty
        image={<FileTextOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
        description={
          <div>
            <Title level={4} style={{ color: '#8c8c8c' }}>
              Tài liệu không tồn tại
            </Title>
            <Text type="secondary">
              Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </Text>
          </div>
        }
      >
        <Button 
          type="primary" 
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          Về trang chủ
        </Button>
      </Empty>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: '16px' }}
        >
          Quay lại
        </Button>

        <Row justify="space-between" align="top">
          <Col flex="auto">
            <Title level={1} style={{ margin: 0, marginBottom: '16px' }}>
              {document.title}
            </Title>
            <Space size="large" style={{ marginBottom: '16px' }}>
              <Space>
                <UserOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary">
                  {document.owner?.username || 'Unknown'}
                  {isOwner && <Tag color="blue" size="small" style={{ marginLeft: '8px' }}>Owner</Tag>}
                </Text>
              </Space>
              <Space>
                <CalendarOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary">
                  {formatDistanceToNow(new Date(document.createdAt), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </Text>
              </Space>
              <Space>
                <EyeOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary">{document.viewCount} lượt xem</Text>
              </Space>
            </Space>
          </Col>

          <Col>
            <Space>
              <Tag color={getVisibilityColor(document.visibility)}>
                {getVisibilityText(document.visibility)}
              </Tag>
              
              {isOwner && (
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/edit/${id}`)}
                    title="Chỉnh sửa"
                  />
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    title="Xóa"
                  />
                </Space>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Description */}
            <Card title="Mô tả">
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {document.description}
              </Paragraph>
            </Card>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <Card title="Tags">
                <Space wrap>
                  {document.tags.map((tag, index) => (
                    <Tag key={index} icon={<TagsOutlined />}>
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}

            {/* Comments */}
            <CommentBox
              documentId={id!}
              comments={comments}
              onCommentAdded={handleCommentAdded}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          </Space>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* File Info */}
            <Card title="Thông tin file">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tên file">
                  <Text strong>{document.fileName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại file">
                  <Text>{document.fileType}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Kích thước">
                  <Text>{formatFileSize(document.fileSize)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người upload">
                  <Space>
                    <Text>{document.owner?.username || 'Unknown'}</Text>
                    {isOwner && <Tag color="blue" size="small">Owner</Tag>}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  <Text>{new Date(document.createdAt).toLocaleDateString('vi-VN')}</Text>
                </Descriptions.Item>
              </Descriptions>
              
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                block
                style={{
                  marginTop: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Tải xuống
              </Button>
            </Card>

            {/* Rating */}
            <Card title="Đánh giá">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Space align="center" style={{ marginBottom: '8px' }}>
                  <StarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                  <Title level={2} style={{ margin: 0, color: '#faad14' }}>
                    {document.averageRating.toFixed(1)}
                  </Title>
                </Space>
                <Text type="secondary">
                  {document.totalRatings} đánh giá
                </Text>
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  Đánh giá của bạn:
                </Text>
                <RatingStars
                  rating={userRating || undefined}
                  onRatingChange={handleRatingChange}
                  interactive={true}
                  size="lg"
                />
              </div>
            </Card>

            {/* Summary */}
            {document.summary && (
              <Card title="Tóm tắt">
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {document.summary}
                </Paragraph>
              </Card>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default DocumentDetail
