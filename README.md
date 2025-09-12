# RoomStay Backend API

Backend API cho hệ thống quản lý phòng trọ RoomStay, hỗ trợ đăng ký và đăng nhập cho người thuê trọ.

## 🚀 Tính năng

- ✅ Đăng ký tài khoản người thuê trọ
- ✅ Đăng nhập với email/số điện thoại
- ✅ Xác thực JWT
- ✅ Quản lý profile người dùng
- ✅ Đổi mật khẩu
- ✅ Quên mật khẩu
- ✅ Bảo mật tài khoản (khóa sau 5 lần đăng nhập sai)
- ✅ Validation dữ liệu đầu vào
- ✅ Rate limiting
- ✅ CORS support

## 📋 Yêu cầu hệ thống

- Node.js >= 14.0.0
- MongoDB >= 4.0
- npm hoặc yarn

## 🛠️ Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd roomstay-backend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật các giá trị trong file `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/roomstay
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
```

4. **Khởi động MongoDB**
```bash
# Với Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Hoặc cài đặt MongoDB locally
```

5. **Chạy ứng dụng**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Đăng ký tài khoản
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "password": "Password123",
  "confirmPassword": "Password123",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP.HCM"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0123456789",
      "role": "tenant",
      "isVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### 2. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0123456789",
      "role": "tenant",
      "isVerified": false,
      "lastLogin": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### 3. Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### 4. Đổi mật khẩu
```http
POST /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmNewPassword": "NewPassword123"
}
```

#### 5. Quên mật khẩu
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### User Management Endpoints

#### 1. Lấy thông tin profile
```http
GET /api/user/profile
Authorization: Bearer <jwt_token>
```

#### 2. Cập nhật profile
```http
PUT /api/user/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "fullName": "Nguyễn Văn B",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "456 Đường XYZ",
    "ward": "Phường 2",
    "district": "Quận 2",
    "city": "TP.HCM"
  },
  "emergencyContact": {
    "name": "Nguyễn Thị C",
    "phone": "0987654321",
    "relationship": "Vợ/Chồng"
  }
}
```

#### 3. Cập nhật preferences tìm phòng
```http
PUT /api/user/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "budget": {
    "min": 3000000,
    "max": 8000000
  },
  "roomType": "single",
  "location": ["Quận 1", "Quận 3", "Quận 7"],
  "amenities": ["wifi", "air_conditioner", "refrigerator"]
}
```

#### 4. Xóa tài khoản
```http
DELETE /api/user/account
Authorization: Bearer <jwt_token>
```

#### 5. Lấy thống kê user
```http
GET /api/user/stats
Authorization: Bearer <jwt_token>
```

## 🔒 Bảo mật

- **JWT Authentication**: Sử dụng JWT token cho xác thực
- **Password Hashing**: Mật khẩu được hash với bcrypt (salt rounds: 12)
- **Rate Limiting**: Giới hạn 100 requests/15 phút
- **Account Locking**: Khóa tài khoản sau 5 lần đăng nhập sai
- **Input Validation**: Validation tất cả dữ liệu đầu vào
- **CORS**: Cấu hình CORS cho frontend
- **Helmet**: Bảo mật HTTP headers

## 📊 Database Schema

### User Model
```javascript
{
  fullName: String (required),
  email: String (required, unique),
  phone: String (required, unique),
  password: String (required, hashed),
  dateOfBirth: Date,
  gender: String (enum: ['male', 'female', 'other']),
  address: {
    street: String,
    ward: String,
    district: String,
    city: String,
    fullAddress: String
  },
  role: String (enum: ['tenant', 'landlord', 'admin'], default: 'tenant'),
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  preferences: {
    budget: { min: Number, max: Number },
    location: [String],
    roomType: String,
    amenities: [String]
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

```bash
# Chạy tests (sẽ được thêm sau)
npm test

# Health check
curl http://localhost:3000/api/health
```

## 🚀 Deployment

### Với Docker
```bash
# Build image
docker build -t roomstay-backend .

# Run container
docker run -d -p 3000:3000 --name roomstay-api roomstay-backend
```

### Với PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "roomstay-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/roomstay` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**RoomStay Team** - Hệ thống quản lý phòng trọ hiện đại