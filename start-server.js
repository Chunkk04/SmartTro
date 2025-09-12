#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Đang khởi động RoomStay Server...\n');

// Kiểm tra xem có file .env không
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.log('⚠️  File .env không tồn tại, tạo file .env mẫu...');
    
    const envContent = `# RoomStay Environment Variables
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/roomstay

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Email (Optional - for future use)
EMAIL_FROM=noreply@roomstay.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Đã tạo file .env mẫu');
    console.log('📝 Vui lòng cập nhật MONGODB_URI và JWT_SECRET trong file .env\n');
}

// Khởi động server
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
});

server.on('error', (error) => {
    console.error('❌ Lỗi khởi động server:', error.message);
    console.log('\n💡 Hướng dẫn khắc phục:');
    console.log('1. Đảm bảo đã cài đặt dependencies: npm install');
    console.log('2. Kiểm tra MongoDB đang chạy');
    console.log('3. Cập nhật MONGODB_URI trong file .env');
});

server.on('close', (code) => {
    if (code !== 0) {
        console.log(`\n❌ Server dừng với mã lỗi: ${code}`);
    } else {
        console.log('\n✅ Server đã dừng');
    }
});

// Xử lý tín hiệu dừng
process.on('SIGINT', () => {
    console.log('\n🛑 Đang dừng server...');
    server.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Đang dừng server...');
    server.kill('SIGTERM');
});

console.log('📡 Server đang chạy tại: http://localhost:3000');
console.log('🔗 API endpoints:');
console.log('   - POST /api/auth/register');
console.log('   - POST /api/auth/login');
console.log('   - GET  /api/user/profile');
console.log('   - PUT  /api/user/profile');
console.log('\n💡 Nhấn Ctrl+C để dừng server\n');
