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
  InfoCircleOutlined,
  RobotOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { documentApi } from '../api/documentApi';
import { aiApi, AIProcessResponse } from '../api/aiApi';
import { DocumentFormData } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UploadPage: React.FC = () => {
  const { message } = App.useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIProcessResponse | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleFileSelect = async (info: any) => {
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
      
      // Tự động xử lý AI khi chọn file
      await processFileWithAI(file);
    }
  };

  const processFileWithAI = async (file: File) => {
    setIsProcessingAI(true);
    setAiResult(null);
    
    try {
      message.loading('Đang kiểm tra AI service...', 0);
      
      // Kiểm tra trạng thái AI service qua backend
      const backendStatus = await aiApi.getBackendAIStatus();
      
      if (!backendStatus.available) {
        message.destroy();
        message.warning('AI service không khả dụng, bạn có thể nhập thông tin thủ công');
        return;
      }
      
      message.loading('Đang xử lý tài liệu với AI...', 0);
      
      const result = await aiApi.processFile(file);
      
      if (result.success) {
        setAiResult(result);
        
        // Tự động điền thông tin từ AI
        form.setFieldsValue({
          description: result.summary,
          tags: result.tags
        });
        
        message.destroy();
        message.success('AI đã tạo tóm tắt và tags cho tài liệu!');
      } else {
        message.destroy();
        message.warning('Không thể xử lý tài liệu với AI, bạn có thể nhập thông tin thủ công');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      message.destroy();
      message.warning('AI service không khả dụng, bạn có thể nhập thông tin thủ công');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setAiResult(null);
    form.resetFields(['description', 'tags']);
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

          {/* AI Processing Status */}
          {isProcessingAI && (
            <Card>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <RobotOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '16px' }}>AI đang xử lý tài liệu...</Text>
                  <br />
                  <Text type="secondary">Đang tạo tóm tắt và gợi ý tags</Text>
                </div>
                <Progress 
                  percent={50} 
                  status="active"
                  style={{ marginTop: '16px', maxWidth: '300px', margin: '16px auto 0' }}
                />
              </div>
            </Card>
          )}

          {/* AI Results */}
          {aiResult && (
            <Card 
              title={
                <Space>
                  <RobotOutlined style={{ color: '#52c41a' }} />
                  <span>Kết quả xử lý AI</span>
                </Space>
              }
              extra={
                <Button 
                  size="small" 
                  icon={<ReloadOutlined />}
                  onClick={() => selectedFile && processFileWithAI(selectedFile)}
                  loading={isProcessingAI}
                >
                  Xử lý lại
                </Button>
              }
              style={{ border: '1px solid #52c41a' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Ngôn ngữ phát hiện: </Text>
                  <Text code>{aiResult.language === 'vi' ? 'Tiếng Việt' : 'English'}</Text>
                </div>
                <div>
                  <Text strong>Tags được gợi ý: </Text>
                  <Space wrap>
                    {aiResult.tags.map((tag, index) => (
                      <span key={index} style={{ 
                        background: '#f0f0f0', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </Space>
                </div>
                <div>
                  <Text strong>Tóm tắt: </Text>
                  <div style={{ 
                    background: '#f6ffed', 
                    padding: '12px', 
                    borderRadius: '6px',
                    border: '1px solid #b7eb8f',
                    marginTop: '8px'
                  }}>
                    <Text>{aiResult.summary}</Text>
                  </div>
                </div>
              </Space>
            </Card>
          )}

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
                  label={
                    <Space>
                      <span>Mô tả</span>
                      {aiResult && (
                        <span style={{ color: '#52c41a', fontSize: '12px' }}>
                          (Đã được AI tạo tự động)
                        </span>
                      )}
                    </Space>
                  }
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
                  label={
                    <Space>
                      <span>Tags</span>
                      {aiResult && (
                        <span style={{ color: '#52c41a', fontSize: '12px' }}>
                          (Đã được AI gợi ý)
                        </span>
                      )}
                    </Space>
                  }
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
                loading={isUploading || isProcessingAI}
                disabled={!selectedFile || isProcessingAI}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                {isProcessingAI ? 'Đang xử lý AI...' : isUploading ? 'Đang upload...' : 'Upload tài liệu'}
              </Button>
            </Col>
          </Row>
        </Space>
      </Form>
    </div>
  );
}

export default UploadPage
