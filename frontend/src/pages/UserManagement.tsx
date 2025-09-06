import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Typography, Input, Modal, Form, Switch, 
  Tag, Row, Col, App, Pagination, message
} from 'antd';
import {
  PlusOutlined, SearchOutlined, UserOutlined
} from '@ant-design/icons';
import { userManagementApi, UserManagementDto, CreateUserRequest, UpdateUserRequest } from '@/api/userManagementApi';
import { useAuthStore } from '@/stores/authStore';
import UserStats from '@/components/UserStats';
import UserActions from '@/components/UserActions';

const { Title, Text } = Typography;
const { Search } = Input;

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

const UserManagement: React.FC = () => {
  const { message } = App.useApp();
  const { user } = useAuthStore();

  // Debug logging
  console.log('UserManagement - Component rendered');
  console.log('UserManagement - User:', user);
  const [users, setUsers] = useState<UserManagementDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserManagementDto | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchText]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userManagementApi.getUsers(currentPage, pageSize, searchText || undefined);
      setUsers(response.content);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền truy cập tính năng này');
      } else {
        message.error('Không thể tải danh sách người dùng');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page - 1);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  const handleCreateUser = async (values: UserFormData) => {
    try {
      const userData: CreateUserRequest = {
        username: values.username,
        email: values.email,
        fullName: values.fullName,
        password: values.password,
      };
      
      await userManagementApi.createUser(userData);
      message.success('Tạo người dùng thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      message.error(error.response?.data?.error || 'Không thể tạo người dùng');
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;
    
    try {
      const userData: UpdateUserRequest = {
        email: values.email,
        fullName: values.fullName,
        enabled: values.enabled,
        accountNonLocked: values.accountNonLocked,
      };
      
      await userManagementApi.updateUser(editingUser.id, userData);
      message.success('Cập nhật người dùng thành công');
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      message.error(error.response?.data?.error || 'Không thể cập nhật người dùng');
    }
  };

  const handleUpdatePassword = async (values: { password: string; confirmPassword: string }) => {
    if (!editingUser) return;
    
    try {
      await userManagementApi.updatePassword(editingUser.id, { password: values.password });
      message.success('Cập nhật mật khẩu thành công');
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating password:', error);
      message.error(error.response?.data?.error || 'Không thể cập nhật mật khẩu');
    }
  };

  const handleToggleBlock = async (user: UserManagementDto) => {
    try {
      const blockData = { block: user.accountNonLocked };
      await userManagementApi.toggleUserBlock(user.id, blockData);
      message.success(user.accountNonLocked ? 'Đã khóa người dùng' : 'Đã mở khóa người dùng');
      fetchUsers();
    } catch (error: any) {
      console.error('Error toggling user block:', error);
      message.error(error.response?.data?.error || 'Không thể thay đổi trạng thái người dùng');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userManagementApi.deleteUser(userId);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      message.error(error.response?.data?.error || 'Không thể xóa người dùng');
    }
  };

  const openEditModal = (user: UserManagementDto) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      email: user.email,
      fullName: user.fullName,
      enabled: user.enabled,
      accountNonLocked: user.accountNonLocked,
    });
    setIsEditModalVisible(true);
  };

  const openPasswordModal = (user: UserManagementDto) => {
    setEditingUser(user);
    setIsPasswordModalVisible(true);
  };

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: UserManagementDto) => (
        <Space>
          <UserOutlined />
          <Text strong={record.id === user?.id}>{text}</Text>
          {record.id === user?.id && <Tag color="blue">Bạn</Tag>}
        </Space>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space>
          {roles.map(role => (
            <Tag key={role} color={role === 'ADMIN' ? 'red' : 'blue'}>
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: UserManagementDto) => (
        <Space>
          <Tag color={record.enabled ? 'green' : 'red'}>
            {record.enabled ? 'Hoạt động' : 'Tạm khóa'}
          </Tag>
          <Tag color={record.accountNonLocked ? 'green' : 'red'}>
            {record.accountNonLocked ? 'Mở khóa' : 'Khóa'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Số tài liệu',
      dataIndex: 'documentCount',
      key: 'documentCount',
      render: (count: number) => <Text>{count}</Text>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: UserManagementDto) => (
        <UserActions
          user={record}
          currentUserId={user?.id}
          onEdit={openEditModal}
          onToggleBlock={handleToggleBlock}
          onChangePassword={openPasswordModal}
          onDelete={handleDeleteUser}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Quản trị người dùng
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Thêm người dùng
            </Button>
          </Col>
        </Row>

        <UserStats users={users} />

        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Search
              placeholder="Tìm kiếm theo tên, email..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Text type="secondary">
              Tổng cộng: {totalElements} người dùng
            </Text>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 1200 }}
        />

        {totalElements > pageSize && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Pagination
              current={currentPage + 1}
              total={totalElements}
              pageSize={pageSize}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`
              }
              pageSizeOptions={['5', '10', '20', '50']}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
            />
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Thêm người dùng mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo người dùng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setEditingUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateUser}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
          </Form.Item>

          <Form.Item
            name="accountNonLocked"
            label="Trạng thái khóa tài khoản"
            valuePropName="checked"
          >
            <Switch checkedChildren="Mở khóa" unCheckedChildren="Khóa" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
          setEditingUser(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleUpdatePassword}
        >
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsPasswordModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
