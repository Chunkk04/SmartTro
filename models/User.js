const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  fullName: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Họ và tên không được quá 50 ký tự']
  },
  
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Email không hợp lệ'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    unique: true,
    trim: true,
    match: [
      /^[0-9]{10,11}$/,
      'Số điện thoại phải có 10-11 chữ số'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  
  // Thông tin cá nhân
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value < new Date();
      },
      message: 'Ngày sinh không hợp lệ'
    }
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  
  address: {
    street: String,
    ward: String,
    district: String,
    city: String,
    fullAddress: String
  },
  
  // Thông tin tài khoản
  role: {
    type: String,
    enum: ['tenant', 'landlord', 'admin'],
    default: 'tenant'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Thông tin xác thực
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Thông tin đăng nhập
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Thông tin tìm phòng
  preferences: {
    budget: {
      min: Number,
      max: Number
    },
    location: [String],
    roomType: {
      type: String,
      enum: ['single', 'shared', 'studio', 'apartment']
    },
    amenities: [String]
  },
  
  // Thông tin liên hệ khẩn cấp
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field cho tên đầy đủ
userSchema.virtual('displayName').get(function() {
  return this.fullName;
});

// Virtual field cho trạng thái khóa tài khoản
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index cho tìm kiếm
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ fullName: 'text' });

// Middleware: Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó được modify
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password với salt rounds = 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware: Cập nhật lastLogin
userSchema.pre('save', function(next) {
  if (this.isModified('loginAttempts') && this.loginAttempts === 0) {
    this.lockUntil = undefined;
  }
  next();
});

// Method: So sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method: Tăng số lần đăng nhập sai
userSchema.methods.incLoginAttempts = function() {
  // Nếu đã có lockUntil và chưa hết hạn, tăng attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Nếu đạt 5 lần sai và chưa bị khóa, khóa tài khoản 2 giờ
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method: Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Method: Tạo JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Static method: Tìm user theo email hoặc phone
userSchema.statics.findByCredentials = async function(emailOrPhone, password) {
  const user = await this.findOne({
    $or: [
      { email: emailOrPhone },
      { phone: emailOrPhone }
    ],
    isActive: true
  }).select('+password');
  
  if (!user) {
    throw new Error('Thông tin đăng nhập không chính xác');
  }
  
  if (user.isLocked) {
    throw new Error('Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Thông tin đăng nhập không chính xác');
  }
  
  // Reset login attempts nếu đăng nhập thành công
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  return user;
};

// Static method: Tạo user mới
userSchema.statics.createUser = async function(userData) {
  // Kiểm tra email và phone đã tồn tại chưa
  const existingUser = await this.findOne({
    $or: [
      { email: userData.email },
      { phone: userData.phone }
    ]
  });
  
  if (existingUser) {
    if (existingUser.email === userData.email) {
      throw new Error('Email này đã được sử dụng');
    }
    if (existingUser.phone === userData.phone) {
      throw new Error('Số điện thoại này đã được sử dụng');
    }
  }
  
  const user = new this(userData);
  await user.save();
  
  // Không trả về password
  const userObj = user.toObject();
  delete userObj.password;
  
  return userObj;
};

module.exports = mongoose.model('User', userSchema);
