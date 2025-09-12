const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ và tên phải có từ 2-50 ký tự'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  
  body('phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Xác nhận mật khẩu không khớp');
      }
      return true;
    })
];

const loginValidation = [
  body('emailOrPhone')
    .notEmpty()
    .withMessage('Email hoặc số điện thoại là bắt buộc'),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
];

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản người thuê trọ
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { fullName, email, phone, password, dateOfBirth, gender, address } = req.body;

    // Tạo user mới
    const userData = {
      fullName,
      email,
      phone,
      password,
      role: 'tenant'
    };

    // Thêm thông tin tùy chọn nếu có
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
    if (gender) userData.gender = gender;
    if (address) userData.address = address;

    const user = await User.createUser(userData);

    // Tạo JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    if (error.message.includes('đã được sử dụng')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { emailOrPhone, password } = req.body;

    // Tìm user và xác thực
    const user = await User.findByCredentials(emailOrPhone, password);

    // Tạo JWT token
    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(401).json({
      success: false,
      message: error.message || 'Đăng nhập thất bại'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          preferences: user.preferences,
          emergencyContact: user.emergencyContact,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin người dùng'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Đăng xuất (client-side sẽ xóa token)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

// @route   POST /api/auth/change-password
// @desc    Đổi mật khẩu
// @access  Private
router.post('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu mới phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Xác nhận mật khẩu mới không khớp');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Lấy user với password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Quên mật khẩu - gửi email reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Email không hợp lệ')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    // Tạo reset token (trong thực tế sẽ gửi email)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    // TODO: Gửi email với reset token
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
      // Chỉ trả về token trong development
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý yêu cầu đặt lại mật khẩu'
    });
  }
});

module.exports = router;
