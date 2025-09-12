const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT
const auth = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Không có token, truy cập bị từ chối'
      });
    }

    // Kiểm tra format Bearer token
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Tìm user trong database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ - người dùng không tồn tại'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // Thêm user vào request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực'
    });
  }
};

// Middleware kiểm tra quyền admin
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Middleware kiểm tra quyền landlord
const landlordAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!['landlord', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ chủ nhà mới có quyền truy cập'
        });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Middleware kiểm tra quyền tenant
const tenantAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!['tenant', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ người thuê trọ mới có quyền truy cập'
        });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Middleware optional auth - không bắt buộc phải đăng nhập
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);
    
    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
    }

    next();
  } catch (error) {
    // Nếu có lỗi với token, vẫn tiếp tục mà không set req.user
    next();
  }
};

module.exports = {
  auth,
  adminAuth,
  landlordAuth,
  tenantAuth,
  optionalAuth
};
