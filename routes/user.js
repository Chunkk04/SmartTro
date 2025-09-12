const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, tenantAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Lấy thông tin profile của user
// @access  Private
router.get('/profile', auth, async (req, res) => {
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
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          preferences: user.preferences,
          emergencyContact: user.emergencyContact,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Cập nhật thông tin profile
// @access  Private
router.put('/profile', [
  auth,
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ và tên phải có từ 2-50 ký tự'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Ngày sinh không hợp lệ'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Địa chỉ đường không được quá 200 ký tự'),
  
  body('address.ward')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Phường/xã không được quá 100 ký tự'),
  
  body('address.district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Quận/huyện không được quá 100 ký tự'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Thành phố không được quá 100 ký tự'),
  
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tên người liên hệ khẩn cấp không được quá 50 ký tự'),
  
  body('emergencyContact.phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại liên hệ khẩn cấp không hợp lệ'),
  
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Mối quan hệ không được quá 50 ký tự')
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

    const {
      fullName,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    } = req.body;

    const updateData = {};
    
    if (fullName) updateData.fullName = fullName;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (address) {
      updateData.address = address;
      // Tạo fullAddress nếu có đủ thông tin
      if (address.street && address.ward && address.district && address.city) {
        updateData.address.fullAddress = `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
      }
    }
    if (emergencyContact) updateData.emergencyContact = emergencyContact;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          emergencyContact: user.emergencyContact,
          isVerified: user.isVerified,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin'
    });
  }
});

// @route   PUT /api/user/preferences
// @desc    Cập nhật preferences tìm phòng
// @access  Private (chỉ tenant)
router.put('/preferences', [
  tenantAuth,
  body('budget.min')
    .optional()
    .isNumeric()
    .withMessage('Ngân sách tối thiểu phải là số'),
  
  body('budget.max')
    .optional()
    .isNumeric()
    .withMessage('Ngân sách tối đa phải là số'),
  
  body('roomType')
    .optional()
    .isIn(['single', 'shared', 'studio', 'apartment'])
    .withMessage('Loại phòng không hợp lệ'),
  
  body('location')
    .optional()
    .isArray()
    .withMessage('Địa điểm phải là mảng'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Tiện ích phải là mảng')
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

    const { budget, roomType, location, amenities } = req.body;

    const updateData = {};
    if (budget) updateData['preferences.budget'] = budget;
    if (roomType) updateData['preferences.roomType'] = roomType;
    if (location) updateData['preferences.location'] = location;
    if (amenities) updateData['preferences.amenities'] = amenities;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật preferences thành công',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật preferences'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Xóa tài khoản (soft delete)
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Tài khoản đã được vô hiệu hóa thành công'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tài khoản'
    });
  }
});

// @route   GET /api/user/stats
// @desc    Lấy thống kê của user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // TODO: Thêm thống kê từ các collection khác (bookings, favorites, etc.)
    const stats = {
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      // Các thống kê khác sẽ được thêm sau
      totalBookings: 0,
      totalFavorites: 0,
      totalReviews: 0
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê'
    });
  }
});

module.exports = router;
