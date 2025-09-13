# 🚀 Hướng dẫn Deploy RoomStay lên GitHub Pages

## 📋 Tổng quan

GitHub Pages chỉ hỗ trợ static files (HTML, CSS, JS), không thể chạy backend server. Do đó, ứng dụng sẽ tự động chuyển sang **Demo Mode** khi deploy.

## 🔧 Cách Deploy

### Bước 1: Tạo GitHub Repository
```bash
# Tạo repository mới trên GitHub
# Tên: roomstay-demo (hoặc tên bạn muốn)
```

### Bước 2: Upload Files
```bash
# Clone repository về máy
git clone https://github.com/username/roomstay-demo.git
cd roomstay-demo

# Copy tất cả files frontend vào thư mục
# Bao gồm: *.html, *.css, *.js (không cần backend files)
```

### Bước 3: Enable GitHub Pages
1. Vào **Settings** của repository
2. Scroll xuống **Pages** section
3. Chọn **Source**: Deploy from a branch
4. Chọn **Branch**: main (hoặc master)
5. Chọn **Folder**: / (root)
6. Click **Save**

### Bước 4: Truy cập Website
- URL sẽ là: `https://username.github.io/roomstay-demo`
- GitHub sẽ tự động build và deploy

## 🎯 Demo Mode Features

### ✅ Hoạt động:
- **Đăng ký tài khoản**: Lưu vào localStorage
- **Đăng nhập**: Sử dụng tài khoản đã đăng ký
- **Hồ sơ cá nhân**: Hiển thị thông tin user
- **Navigation**: Tất cả các trang hoạt động
- **Responsive**: Hỗ trợ mobile/tablet
- **Persistent**: Dữ liệu được lưu trong browser

### ❌ Không hoạt động:
- **Backend API**: Không có server
- **Database**: Không có MongoDB
- **Real authentication**: Chỉ là demo
- **Email verification**: Không gửi email thật

## 📱 Test Demo Mode

### 1. Đăng ký tài khoản:
```
Họ tên: Nguyễn Văn A
Email: test@example.com
Password: 123456
```

### 2. Đăng nhập:
```
Email: test@example.com
Password: 123456
```

### 3. Sử dụng ứng dụng:
- Xem trang chủ với tên user
- Vào hồ sơ cá nhân
- Điều hướng giữa các trang
- Đăng xuất và đăng nhập lại

## 🔧 Troubleshooting

### Lỗi: "Không thể đăng nhập"
**Nguyên nhân**: Chưa đăng ký tài khoản
**Giải pháp**: Đăng ký tài khoản trước khi đăng nhập

### Lỗi: "Tài khoản chưa được đăng ký"
**Nguyên nhân**: Email/phone không khớp
**Giải pháp**: Kiểm tra lại thông tin đăng ký

### Lỗi: "Mật khẩu không chính xác"
**Nguyên nhân**: Password sai
**Giải pháp**: Nhập đúng password đã đăng ký

## 📂 Files cần Deploy

### ✅ Include (Frontend):
```
├── index.html
├── home.html
├── login.html
├── register.html
├── ├── contact.html
├── profile.html
├── styles.css
├── rent.css
├── contact.css
├── profile.css
└── README.md
```

### ❌ Exclude (Backend):
```
├── server.js
├── package.json
├── models/
├── routes/
├── middleware/
├── config/
├── scripts/
└── node_modules/
```

## 🌐 Live Demo

Sau khi deploy thành công, bạn sẽ có:
- **URL**: `https://username.github.io/roomstay-demo`
- **Demo Mode**: Hoạt động đầy đủ
- **Responsive**: Hỗ trợ mọi thiết bị
- **Persistent**: Dữ liệu được lưu trong browser

## 💡 Tips

1. **Clear localStorage**: Nếu gặp lỗi, clear browser data
2. **Test trên mobile**: Sử dụng responsive design
3. **Multiple accounts**: Có thể đăng ký nhiều tài khoản
4. **Data persistence**: Dữ liệu được lưu trong browser

## 🔄 Update Website

```bash
# Sau khi thay đổi code
git add .
git commit -m "Update RoomStay demo"
git push origin main

# GitHub sẽ tự động rebuild
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra console browser (F12)
2. Clear localStorage và thử lại
3. Đảm bảo đã đăng ký tài khoản trước
4. Kiểm tra network connection

---

**Lưu ý**: Đây là demo version, không phải production app. Để có backend thật, cần deploy server riêng (Heroku, Vercel, etc.)
