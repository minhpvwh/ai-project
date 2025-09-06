import { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Avatar, 
  Empty,
  Modal,
  message
} from 'antd';
import { 
  SendOutlined, 
  MessageOutlined, 
  UserOutlined, 
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Comment } from '@/types';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface CommentBoxProps {
  documentId: string;
  comments: Comment[];
  onCommentAdded: (documentId: string, content: string) => Promise<void>;
  onCommentUpdated: (commentId: string, content: string) => Promise<void>;
  onCommentDeleted: (commentId: string) => Promise<void>;
}

const CommentBox: React.FC<CommentBoxProps> = ({ 
  documentId, 
  comments = [], 
  onCommentAdded, 
  onCommentUpdated, 
  onCommentDeleted 
}) => {
  const [newComment, setNewComment] = useState<string>('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onCommentAdded(documentId, newComment.trim());
      setNewComment('');
      message.success('Bình luận đã được thêm');
    } catch (error) {
      message.error('Không thể thêm bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await onCommentUpdated(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      message.success('Bình luận đã được cập nhật');
    } catch (error) {
      message.error('Không thể cập nhật bình luận');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Modal.confirm({
      title: 'Xóa bình luận',
      content: 'Bạn có chắc muốn xóa bình luận này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await onCommentDeleted(commentId);
          message.success('Bình luận đã được xóa');
        } catch (error) {
          message.error('Không thể xóa bình luận');
        }
      }
    });
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <Card>
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <MessageOutlined style={{ color: '#667eea', fontSize: '20px' }} />
          <Title level={4} style={{ margin: 0 }}>
            Bình luận ({comments.length})
          </Title>
        </Space>
      </div>

      {/* Add new comment */}
      <form onSubmit={handleSubmitComment} style={{ marginBottom: '24px' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            rows={3}
            style={{ resize: 'none' }}
          />
          <Button
            type="primary"
            htmlType="submit"
            disabled={!newComment.trim() || isSubmitting}
            loading={isSubmitting}
            icon={<SendOutlined />}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          />
        </Space.Compact>
      </form>

      {/* Comments list */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {comments.length === 0 ? (
          <Empty
            image={<MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
            description="Chưa có bình luận nào. Hãy là người đầu tiên bình luận!"
          />
        ) : (
          comments.map((comment: Comment) => (
            <Card key={comment.id} size="small">
              {editingComment === comment.id ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleEditComment(comment.id)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      Lưu
                    </Button>
                    <Button size="small" onClick={cancelEdit}>
                      Hủy
                    </Button>
                  </Space>
                </Space>
              ) : (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <Space justify="space-between" style={{ width: '100%' }}>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <Text strong>{comment.authorName}</Text>
                      </Space>
                      <Space>
                        <CalendarOutlined style={{ color: '#8c8c8c' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatDistanceToNow(new Date(comment.createdAt), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </Text>
                      </Space>
                    </Space>
                  </div>
                  
                  <Paragraph style={{ marginBottom: '12px' }}>
                    {comment.content}
                  </Paragraph>
                  
                  {comment.updatedAt !== comment.createdAt && (
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                      Đã chỉnh sửa {formatDistanceToNow(new Date(comment.updatedAt), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </Text>
                  )}
                  
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => startEdit(comment)}
                      style={{ color: '#667eea' }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Xóa
                    </Button>
                  </Space>
                </>
              )}
            </Card>
          ))
        )}
      </Space>
    </Card>
  );
}

export default CommentBox
