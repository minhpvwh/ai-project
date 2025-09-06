# User Management - Quản trị người dùng

## Tổng quan
Màn hình quản trị người dùng cho phép ADMIN quản lý tất cả người dùng trong hệ thống Knowledge Hub.

## Tính năng chính

### 1. Xem danh sách người dùng
- **Bảng danh sách** với thông tin: username, họ tên, email, vai trò, trạng thái, số tài liệu, ngày tạo
- **Phân trang** với tùy chọn số lượng hiển thị (5, 10, 20, 50)
- **Tìm kiếm** theo username, email, họ tên
- **Thống kê** tổng quan: tổng số user, user hoạt động, user bị khóa, admin

### 2. Thêm người dùng mới
- **Form tạo user** với validation:
  - Username (bắt buộc, tối thiểu 3 ký tự)
  - Email (bắt buộc, định dạng email)
  - Họ và tên (bắt buộc)
  - Mật khẩu (bắt buộc, tối thiểu 6 ký tự)
  - Xác nhận mật khẩu (phải khớp với mật khẩu)
- **Kiểm tra trùng lặp** username và email
- **Tự động gán role USER** cho user mới

### 3. Chỉnh sửa thông tin người dùng
- **Cập nhật email** và họ tên
- **Bật/tắt trạng thái hoạt động** (enabled)
- **Khóa/mở khóa tài khoản** (accountNonLocked)
- **Không cho phép** admin chỉnh sửa chính mình

### 4. Đổi mật khẩu
- **Form đổi mật khẩu** với validation:
  - Mật khẩu mới (bắt buộc, tối thiểu 6 ký tự)
  - Xác nhận mật khẩu (phải khớp)
- **Bảo mật**: Admin không thể đổi mật khẩu của chính mình

### 5. Khóa/Mở khóa người dùng
- **Toggle trạng thái** khóa tài khoản
- **Tự động cập nhật** cả enabled và accountNonLocked
- **Không cho phép** admin khóa chính mình

### 6. Xóa người dùng
- **Confirmation dialog** trước khi xóa
- **Không cho phép** admin xóa chính mình
- **Xóa vĩnh viễn** (không thể hoàn tác)

## Bảo mật

### Authorization
- **Chỉ ADMIN** mới có thể truy cập
- **Route protection** với AdminRoute component
- **Backend validation** cho tất cả operations

### Data Protection
- **Admin không thể** xóa/chỉnh sửa/khóa chính mình
- **Password hashing** với BCrypt
- **Input validation** trên cả frontend và backend

## UI/UX Features

### Responsive Design
- **Mobile-friendly** với horizontal scroll cho table
- **Responsive grid** cho statistics cards
- **Adaptive pagination** với size options

### User Experience
- **Loading states** cho tất cả operations
- **Success/error messages** với Ant Design message
- **Confirmation dialogs** cho delete operations
- **Form validation** với real-time feedback
- **Disabled states** cho admin self-actions

### Data Display
- **Status tags** với màu sắc phân biệt:
  - Hoạt động: xanh lá
  - Tạm khóa: đỏ
  - Mở khóa: xanh lá
  - Khóa: đỏ
- **Role tags**:
  - ADMIN: đỏ
  - USER: xanh dương
- **Current user highlighting** với tag "Bạn"
- **Document count** hiển thị số tài liệu của user
- **Date formatting** theo định dạng Việt Nam

## Components

### UserManagement.tsx
- **Main component** chứa toàn bộ logic quản lý user
- **State management** cho users, modals, pagination, search
- **API integration** với userManagementApi
- **Form handling** cho create, edit, password change

### UserStats.tsx
- **Statistics component** hiển thị tổng quan
- **Real-time updates** khi data thay đổi
- **Icon indicators** cho từng loại thống kê

### UserActions.tsx
- **Action buttons** cho mỗi user trong table
- **Conditional rendering** dựa trên user status
- **Event handlers** cho edit, block, password, delete

### AdminRoute.tsx
- **Route protection** component
- **Role-based access control**
- **Redirect logic** cho unauthorized users

## API Integration

### userManagementApi.ts
- **TypeScript interfaces** cho request/response
- **Axios integration** với authentication
- **Error handling** cho tất cả endpoints
- **Type safety** cho tất cả operations

### Endpoints
- `GET /admin/users` - Lấy danh sách user với pagination và search
- `GET /admin/users/{id}` - Lấy thông tin user theo ID
- `POST /admin/users` - Tạo user mới
- `PUT /admin/users/{id}` - Cập nhật thông tin user
- `PUT /admin/users/{id}/password` - Đổi mật khẩu user
- `PUT /admin/users/{id}/block` - Khóa/mở khóa user
- `DELETE /admin/users/{id}` - Xóa user

## Cách sử dụng

1. **Đăng nhập** với tài khoản ADMIN
2. **Truy cập menu** "Quản trị người dùng" trong sidebar
3. **Xem thống kê** tổng quan ở đầu trang
4. **Tìm kiếm user** bằng search box
5. **Thêm user mới** bằng nút "Thêm người dùng"
6. **Chỉnh sửa user** bằng nút "Sửa" trong bảng
7. **Đổi mật khẩu** bằng nút "Đổi mật khẩu"
8. **Khóa/mở khóa** bằng nút "Khóa"/"Mở khóa"
9. **Xóa user** bằng nút "Xóa" (có confirmation)
10. **Phân trang** bằng pagination controls

## Lưu ý

- **Chỉ ADMIN** mới thấy menu và có thể truy cập
- **Admin không thể** thực hiện các thao tác trên chính mình
- **Tất cả operations** đều có confirmation và error handling
- **Responsive design** hoạt động tốt trên mọi thiết bị
- **Real-time validation** cho tất cả forms
- **Type safety** với TypeScript cho tất cả components
