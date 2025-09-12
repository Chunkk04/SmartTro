# 🚀 Hướng dẫn khởi động nhanh RoomStay

## ❌ Lỗi: Đăng nhập không vào được home

### 🔧 Cách khắc phục:

#### 1. **Khởi động Backend Server**
```bash
# Cài đặt dependencies (nếu chưa)
npm install

# Khởi động server
npm run setup
# hoặc
node start-server.js
```

#### 2. **Kiểm tra MongoDB**
- Đảm bảo MongoDB đang chạy
- Cập nhật `MONGODB_URI` trong file `.env`

#### 3. **Test API**
```bash
# Test API endpoints
npm run test:api
```

#### 4. **Demo Mode (Nếu server chưa chạy)**
- Hệ thống sẽ tự động chuyển sang demo mode
- Bạn có thể đăng nhập với bất kỳ email/password nào
- Dữ liệu sẽ được lưu trong localStorage

---

## 📋 Checklist khắc phục lỗi:

- [ ] ✅ Backend server đang chạy (port 3000)
- [ ] ✅ MongoDB đang chạy
- [ ] ✅ File `.env` đã được tạo và cấu hình
- [ ] ✅ Dependencies đã được cài đặt (`npm install`)
- [ ] ✅ Browser console không có lỗi CORS

---

## 🔗 URLs quan trọng:

- **Frontend**: Mở file `home.html` trong browser
- **Backend API**: http://localhost:3000
- **API Docs**: Xem file `README.md`

---

## 🆘 Nếu vẫn lỗi:

1. **Kiểm tra Console Browser** (F12)
2. **Kiểm tra Network tab** để xem API calls
3. **Kiểm tra Terminal** để xem server logs
4. **Thử demo mode** bằng cách đăng nhập với bất kỳ thông tin nào

---

## 💡 Tips:

- Sử dụng `npm run dev` để auto-restart server khi code thay đổi
- Kiểm tra file `.env` có đúng format không
- Đảm bảo port 3000 không bị sử dụng bởi ứng dụng khác
