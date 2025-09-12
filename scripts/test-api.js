const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  fullName: 'Nguyễn Văn Test',
  email: 'test@example.com',
  phone: '0123456789',
  password: 'Test123456',
  confirmPassword: 'Test123456',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  address: {
    street: '123 Đường Test',
    ward: 'Phường Test',
    district: 'Quận Test',
    city: 'TP.HCM'
  }
};

const loginData = {
  emailOrPhone: 'test@example.com',
  password: 'Test123456'
};

// Helper function để test API
async function testAPI() {
  console.log('🧪 Bắt đầu test API...\n');

  try {
    // 1. Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // 2. Test register
    console.log('2. Testing user registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration successful:', registerResponse.data.message);
      console.log('User ID:', registerResponse.data.data.user.id);
      console.log('');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️ User already exists, continuing with login...');
      } else {
        console.log('❌ Registration failed:', error.response?.data || error.message);
      }
      console.log('');
    }

    // 3. Test login
    console.log('3. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    const token = loginResponse.data.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');
    console.log('');

    // 4. Test get profile
    console.log('4. Testing get user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('User:', profileResponse.data.data.user.fullName);
    console.log('');

    // 5. Test update profile
    console.log('5. Testing update profile...');
    const updateData = {
      fullName: 'Nguyễn Văn Test Updated',
      emergencyContact: {
        name: 'Nguyễn Thị Test',
        phone: '0987654321',
        relationship: 'Vợ/Chồng'
      }
    };
    const updateResponse = await axios.put(`${BASE_URL}/user/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile updated successfully');
    console.log('New name:', updateResponse.data.data.user.fullName);
    console.log('');

    // 6. Test update preferences
    console.log('6. Testing update preferences...');
    const preferencesData = {
      budget: {
        min: 3000000,
        max: 8000000
      },
      roomType: 'single',
      location: ['Quận 1', 'Quận 3', 'Quận 7'],
      amenities: ['wifi', 'air_conditioner', 'refrigerator']
    };
    const preferencesResponse = await axios.put(`${BASE_URL}/user/preferences`, preferencesData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Preferences updated successfully');
    console.log('Budget:', preferencesResponse.data.data.preferences.budget);
    console.log('');

    // 7. Test get stats
    console.log('7. Testing get user stats...');
    const statsResponse = await axios.get(`${BASE_URL}/user/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Stats retrieved successfully');
    console.log('Account age:', statsResponse.data.data.stats.accountAge, 'days');
    console.log('');

    console.log('🎉 Tất cả tests đều thành công!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
