const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/hashing');
const jwt = require('jsonwebtoken'); 
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { filterObject } = require('../utils/helpers');

// === HÀM QUẢN LÝ CÁ NHÂN ===

exports.getMe = (req, res, next) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
};

exports.updateMe = catchAsync(async (req, res, next) => {
    const updateData = {};
    const allowedFields = ['name', 'dateOfBirth', 'gender', 'phoneNumber'];
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null) {
            updateData[field] = req.body[field];
        }
    });

    if (Object.keys(updateData).length === 0) {
        return next(new AppError('Không có trường dữ liệu hợp lệ nào được cung cấp để cập nhật.', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true
    }).select('-password');

    if (!updatedUser) {
        return next(new AppError('Không tìm thấy người dùng tương ứng với token này. Có thể tài khoản đã bị xóa.', 404));
    }

    // THAY ĐỔI: Thêm message
    res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin cá nhân thành công!',
        data: updatedUser,
    });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');

    const { passwordCurrent, password } = req.body;
    if (!user || !(await comparePassword(passwordCurrent, user.password))) {
        return next(new AppError('Mật khẩu hiện tại không đúng', 401));
    }

    user.password = await hashPassword(password);
    await user.save();

    const token = jwt.sign({ _id: user._id, role: user.userRole }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });

    res.status(200).json({
        success: true,
        message: 'Cập nhật mật khẩu thành công!',
        token,
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id);
    
    // THAY ĐỔI: Chuyển sang 200 và thêm message
    res.status(200).json({
        success: true,
        message: 'Tài khoản của bạn đã được xóa thành công.',
    });
});


// === HÀM QUẢN LÝ CHO ADMIN ===

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const directFilterableFields = ['userRole', 'verified', 'gender'];
    const regexFilterableFields = ['email', 'phoneNumber', 'name'];
    let filter = {};

    Object.keys(req.query).forEach(key => {
        if (directFilterableFields.includes(key)) {
            filter[key] = req.query[key];
        } else if (regexFilterableFields.includes(key)) {
            filter[key] = { $regex: req.query[key], $options: 'i' };
        }
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        count: users.length,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        data: users
    });
});

exports.getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }
    res.status(200).json({ success: true, data: user });
});

exports.createUser = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'name', 'email', 'password', 'phoneNumber', 'gender', 'dateOfBirth', 'userRole', 'verified');
    
    if (filteredBody.password) {
        filteredBody.password = await hashPassword(filteredBody.password);
    }
    
    const newUser = await User.create(filteredBody);
    newUser.password = undefined;

    // THAY ĐỔI: Thêm message
    res.status(201).json({ 
        success: true, 
        message: 'Tạo người dùng mới thành công!',
        data: newUser 
    });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const updateData = filterObject(req.body, 'name', 'email', 'phoneNumber', 'gender', 'dateOfBirth', 'userRole', 'verified');

    if (req.body.password) {
        updateData.password = await hashPassword(req.body.password);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    }).select('-password');

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }
    
    // THAY ĐỔI: Thêm message
    res.status(200).json({ 
        success: true, 
        message: `Cập nhật thông tin người dùng thành công.`,
        data: user 
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    if (String(req.user._id) === req.params.id) {
        return next(new AppError('Admin không thể tự xóa tài khoản qua API này.', 400));
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    // THAY ĐỔI: Chuyển sang 200 và thêm message
    res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công.',
    });
});
