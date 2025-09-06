import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Upload, 
  Typography, 
  Space, 
  Row, 
  Col,
  Progress,
  Alert,
  App
} from 'antd';

const { Dragger } = Upload;
import { 
  UploadOutlined, 
  FileOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { documentApi } from '@/api/documentApi';
import { DocumentFormData } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UploadPage: React.FC = () => {
  const { message } = App.useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleFileSelect = (info: any) => {
    const file = info.file.originFileObj || info.file;
    
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        message.error('Kích thước file không được vượt quá 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        message.error('Chỉ hỗ trợ file PDF, DOC, DOCX, JPG, PNG');
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const onSubmit = async (values: DocumentFormData) => {
    if (!selectedFile) {
      message.error('Vui lòng chọn file để upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('visibility', values.visibility);
      
      if (values.tags && values.tags.length > 0) {
        values.tags.forEach(tag => formData.append('tags', tag));
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await documentApi.upload(formData);
      
      setUploadProgress(100);
      message.success('Upload tài liệu thành công!');
      
      setTimeout(() => {
        form.resetFields();
        setSelectedFile(null);
        setUploadProgress(0);
        navigate('/');
      }, 1000);
      
    } catch (error: any) {
      message.error('Upload thất bại. Vui lòng thử lại.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Chỉ bạn có thể xem tài liệu này' };
      case 'GROUP':
        return { color: 'warning', icon: <InfoCircleOutlined />, text: 'Đồng nghiệp có thể xem tài liệu này' };
      case 'PUBLIC':
        return { color: 'success', icon: <CheckCircleOutlined />, text: 'Mọi người đều có thể xem tài liệu này' };
      default:
        return { color: 'info', icon: <InfoCircleOutlined />, text: '' };
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
          Upload tài liệu mới
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Chia sẻ kiến thức với đồng nghiệp bằng cách upload tài liệu mới
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        size="large"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* File Upload */}
          <Card title="Chọn file" style={{ marginBottom: '24px' }}>
            {!selectedFile ? (
              <Dragger
                name="file"
                multiple={false}
                beforeUpload={() => false}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ 
                  padding: '40px 20px',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: '48px', color: '#667eea' }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: '18px', fontWeight: '500' }}>
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="ant-upload-hint" style={{ fontSize: '14px' }}>
                  Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                </p>
              </Dragger>
            ) : (
              <Card 
                size="small"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <FileOutlined style={{ fontSize: '24px' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: 'white' }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          {formatFileSize(selectedFile.size)}
                        </div>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />}
                      onClick={removeFile}
                      style={{ color: 'white' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </Card>

          {/* Document Information */}
          <Card title="Thông tin tài liệu">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tiêu đề!' },
                    { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự!' }
                  ]}
                >
                  <Input placeholder="Nhập tiêu đề tài liệu" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mô tả!' },
                    { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' }
                  ]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Mô tả nội dung tài liệu..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="tags"
                  label="Tags"
                  tooltip="Nhập tags cách nhau bởi dấu phẩy để giúp tài liệu dễ tìm kiếm hơn"
                >
                  <Select
                    mode="tags"
                    placeholder="Nhập tags (ví dụ: hướng dẫn, quy trình, training)"
                    style={{ width: '100%' }}
                    tokenSeparators={[',']}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="visibility"
                  label="Quyền truy cập"
                  rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập!' }]}
                >
                  <Select placeholder="Chọn quyền truy cập">
                    <Option value="PRIVATE">Riêng tư (chỉ tôi)</Option>
                    <Option value="GROUP">Nhóm (đồng nghiệp)</Option>
                    <Option value="PUBLIC">Công khai (mọi người)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item shouldUpdate={(prevValues, currentValues) => 
                  prevValues.visibility !== currentValues.visibility
                }>
                  {({ getFieldValue }) => {
                    const visibility = getFieldValue('visibility');
                    if (visibility) {
                      const desc = getVisibilityDescription(visibility);
                      return (
                        <Alert
                          message={desc.text}
                          type={desc.color as any}
                          icon={desc.icon}
                          showIcon
                          style={{ marginTop: '8px' }}
                        />
                      );
                    }
                    return null;
                  }}
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Text strong>Đang upload tài liệu...</Text>
                <Progress 
                  percent={uploadProgress} 
                  status={uploadProgress === 100 ? 'success' : 'active'}
                  style={{ marginTop: '16px' }}
                />
              </div>
            </Card>
          )}

          {/* Submit Buttons */}
          <Row gutter={16}>
            <Col span={12}>
              <Button 
                size="large" 
                block
                onClick={() => navigate('/')}
                disabled={isUploading}
              >
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button 
                type="primary" 
                size="large" 
                block
                htmlType="submit"
                loading={isUploading}
                disabled={!selectedFile}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                {isUploading ? 'Đang upload...' : 'Upload tài liệu'}
              </Button>
            </Col>
          </Row>
        </Space>
      </Form>
    </div>
  );
}

export default UploadPage
