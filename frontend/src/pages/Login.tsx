import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';
import { LoginRequest, RegisterRequest } from '@/types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { message } = App.useApp();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { login } = useAuthStore();

  const onSubmit = async (values: LoginRequest | RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = isLogin 
        ? await authApi.login(values as LoginRequest)
        : await authApi.register(values as RegisterRequest);
      
      login(response.user, response.token);
      
      message.success(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    form.resetFields();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              K
            </div>
            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
              {isLogin ? 'Đăng nhập' : 'Đăng ký'} Knowledge Hub
            </Title>
            <Text type="secondary">
              {isLogin 
                ? 'Chào mừng bạn quay trở lại!' 
                : 'Tạo tài khoản mới để bắt đầu'
              }
            </Text>
          </div>

          <Form
            form={form}
            name="auth-form"
            onFinish={onSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Nhập tên đăng nhập" 
              />
            </Form.Item>

            {!isLogin && (
              <>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Nhập email" 
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Nhập mật khẩu" 
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                style={{ 
                  width: '100%',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
                icon={isLogin ? <LoginOutlined /> : <UserAddOutlined />}
              >
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={toggleMode}
              style={{ 
                color: '#667eea',
                fontWeight: '500'
              }}
            >
              {isLogin 
                ? 'Chưa có tài khoản? Đăng ký ngay' 
                : 'Đã có tài khoản? Đăng nhập'
              }
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default Login
