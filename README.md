# Knowledge Hub - Nền tảng chia sẻ kiến thức nội bộ

## Tổng quan

Knowledge Hub là một nền tảng chia sẻ kiến thức nội bộ được xây dựng cho công ty, giúp tập trung hóa kiến thức, hỗ trợ tìm kiếm, phân loại và tương tác giữa các nhân viên.

## Công nghệ sử dụng

### Backend
- **Spring Boot 3** với Java 21
- **MongoDB** cho database
- **JWT** cho authentication
- **Maven** cho dependency management
- **BCrypt** cho password hashing

### Frontend
- **React 18** với Vite
- **React Router** cho routing
- **TailwindCSS** cho styling
- **Zustand** cho state management
- **Axios** cho API calls
- **React Hook Form** cho form handling

## Cấu trúc dự án

```
AI-Project/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/knowledgehub/
│   │   ├── entity/            # MongoDB entities
│   │   ├── repository/        # Data repositories
│   │   ├── service/           # Business logic
│   │   ├── controller/        # REST controllers
│   │   ├── dto/              # Data transfer objects
│   │   ├── security/         # JWT & security config
│   │   └── KnowledgeHubApplication.java
│   ├── src/main/resources/
│   │   └── application.yml    # Configuration
│   └── pom.xml               # Maven dependencies
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API layer
│   │   ├── stores/          # State management
│   │   └── App.jsx          # Main app component
│   ├── package.json         # NPM dependencies
│   └── vite.config.js       # Vite configuration
├── API_CONTRACT.md          # API documentation
└── README.md               # This file
```

## Tính năng chính

### 1. Đăng nhập & Xác thực
- Đăng nhập bằng username/password
- JWT-based authentication
- Auto logout khi token hết hạn
- Đăng ký tài khoản mới

### 2. Trang chủ & Dashboard
- Top 5 tài liệu mới nhất
- Top 5 tài liệu nổi bật (theo rating)
- Top 5 tài liệu của user hiện tại
- Thống kê nhanh

### 3. Upload & Quản lý tài liệu
- Upload file (PDF, DOC, DOCX, JPG, PNG)
- Giới hạn dung lượng 10MB
- Metadata tự động (userId, createdAt)
- Tự động tạo summary từ description
- Quyền chia sẻ: Private/Group/Public

### 4. Tìm kiếm & Tra cứu
- Tìm kiếm full-text theo title
- Lọc theo tags
- Lọc theo ngày tạo
- Lọc theo quyền truy cập
- Phân trang kết quả

### 5. Xem chi tiết & Tương tác
- Xem thông tin chi tiết tài liệu
- Đánh giá sao (1-5)
- Thêm bình luận
- Chỉnh sửa quyền truy cập (chủ sở hữu)
- Tải xuống file

## Cài đặt và chạy

### Yêu cầu hệ thống
- Java 21+
- Node.js 18+
- MongoDB 5.0+
- Maven 3.6+

### Backend Setup

1. **Cài đặt MongoDB**
   ```bash
   # macOS với Homebrew
   brew install mongodb-community
   brew services start mongodb-community
   
   # Hoặc sử dụng Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Chạy Backend**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   
   Backend sẽ chạy tại: `http://localhost:8080`

### Frontend Setup

1. **Cài đặt dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Chạy Frontend**
   ```bash
   npm run dev
   ```
   
   Frontend sẽ chạy tại: `http://localhost:3000`

## Cấu hình

### Backend Configuration (`application.yml`)
```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/knowledge_hub

jwt:
  secret: knowledgeHubSecretKey2024!@#$%^&*()
  expiration: 86400000 # 24 hours

file:
  upload-dir: ./uploads
  allowed-types: pdf,doc,docx,jpg,jpeg,png
```

### Frontend Configuration (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/validate` - Validate token

### Documents
- `POST /api/documents/upload` - Upload tài liệu
- `GET /api/documents/search` - Tìm kiếm tài liệu
- `GET /api/documents/recent` - Tài liệu mới nhất
- `GET /api/documents/popular` - Tài liệu nổi bật
- `GET /api/documents/my-documents` - Tài liệu của tôi
- `GET /api/documents/{id}` - Chi tiết tài liệu
- `PUT /api/documents/{id}` - Cập nhật tài liệu
- `DELETE /api/documents/{id}` - Xóa tài liệu
- `GET /api/documents/{id}/download` - Tải xuống

### Comments
- `POST /api/comments/{documentId}` - Thêm bình luận
- `GET /api/comments/{documentId}` - Lấy bình luận
- `PUT /api/comments/{commentId}` - Cập nhật bình luận
- `DELETE /api/comments/{commentId}` - Xóa bình luận

### Ratings
- `POST /api/ratings/{documentId}` - Đánh giá
- `GET /api/ratings/{documentId}/user` - Đánh giá của user
- `GET /api/ratings/{documentId}/all` - Tất cả đánh giá
- `DELETE /api/ratings/{ratingId}` - Xóa đánh giá

### Home
- `GET /api/home/dashboard` - Dữ liệu dashboard

Chi tiết API contract xem tại [API_CONTRACT.md](./API_CONTRACT.md)

## Bảo mật

- **Password Hashing**: BCrypt với salt rounds
- **JWT Authentication**: Token-based với expiration
- **CORS**: Cấu hình cho cross-origin requests
- **File Validation**: Kiểm tra loại file và dung lượng
- **Authorization**: Role-based access control

## Hiệu năng

- **Database Indexing**: Text search và compound indexes
- **Pagination**: Tất cả list endpoints hỗ trợ phân trang
- **File Storage**: Local filesystem (có thể mở rộng sang cloud)
- **Caching**: JWT token caching ở frontend

## Mở rộng trong tương lai

### AI Integration
- Auto summary generation từ nội dung file
- Auto tagging dựa trên nội dung
- Semantic search với vector embeddings
- Content recommendation

### Cloud Integration
- AWS S3 hoặc Google Cloud Storage cho file storage
- Cloud MongoDB Atlas cho database
- CDN cho static assets

### Advanced Features
- Version control cho documents
- Collaborative editing
- Advanced analytics và reporting
- Mobile app với React Native

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Kiểm tra MongoDB đang chạy
   - Kiểm tra connection string trong `application.yml`

2. **JWT Token Expired**
   - Token tự động refresh hoặc redirect về login
   - Kiểm tra JWT secret và expiration time

3. **File Upload Failed**
   - Kiểm tra file size (max 10MB)
   - Kiểm tra file type được hỗ trợ
   - Kiểm tra quyền ghi vào upload directory

4. **CORS Issues**
   - Kiểm tra CORS configuration trong SecurityConfig
   - Đảm bảo frontend và backend chạy trên ports khác nhau

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/yourusername/knowledge-hub](https://github.com/yourusername/knowledge-hub)
