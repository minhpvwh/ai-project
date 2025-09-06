import { Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { UserManagementDto } from '@/api/userManagementApi';

interface UserActionsProps {
  user: UserManagementDto;
  currentUserId?: string;
  onEdit: (user: UserManagementDto) => void;
  onToggleBlock: (user: UserManagementDto) => void;
  onChangePassword: (user: UserManagementDto) => void;
  onDelete: (userId: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUserId,
  onEdit,
  onToggleBlock,
  onChangePassword,
  onDelete
}) => {
  const isCurrentUser = user.id === currentUserId;

  return (
    <Space>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => onEdit(user)}
        disabled={isCurrentUser}
      >
        Sửa
      </Button>
      
      <Button
        type="link"
        icon={user.accountNonLocked ? <LockOutlined /> : <UnlockOutlined />}
        onClick={() => onToggleBlock(user)}
        disabled={isCurrentUser}
      >
        {user.accountNonLocked ? 'Khóa' : 'Mở khóa'}
      </Button>
      
      <Button
        type="link"
        onClick={() => onChangePassword(user)}
        disabled={isCurrentUser}
      >
        Đổi mật khẩu
      </Button>
      
      <Popconfirm
        title="Bạn có chắc chắn muốn xóa người dùng này?"
        description="Hành động này không thể hoàn tác."
        onConfirm={() => onDelete(user.id)}
        okText="Xóa"
        cancelText="Hủy"
        disabled={isCurrentUser}
      >
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          disabled={isCurrentUser}
        >
          Xóa
        </Button>
      </Popconfirm>
    </Space>
  );
};

export default UserActions;
