const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/hashing');
const jwt = require('jsonwebtoken'); 
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { filterObject } = require('../utils/helpers');

// === HÀM QUẢN LÝ CÁ NHÂN ===

exports.getMe = catchAsync(async (req, res, next) => {
    // 1. Lấy ID từ token (đã được middleware `loggedin` xử lý)
    const userId = req.user._id;

    // 2. Dùng ID đó để truy vấn CSDL và lấy thông tin người dùng mới nhất
    const me = await User.findById(userId);

    if (!me) {
        return next(new AppError('Không tìm thấy người dùng tương ứng với token này.', 404));
    }
    
    // 3. Trả về document user đầy đủ và mới nhất
    res.status(200).json({
        success: true,
        data: me,
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {    
    const updateData = filterObject(req.body, 'name', 'dateOfBirth', 'gender', 'phoneNumber');

    if (Object.keys(updateData).length === 0) {
        return next(new AppError('Không có trường dữ liệu hợp lệ nào được cung cấp để cập nhật.', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true
    }).select('-password');

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
    // Lọc theo các trường có thể tìm kiếm trực tiếp
    const directFilterableFields = ['userRole', 'verified', 'gender'];
    const regexFilterableFields = ['email', 'phoneNumber', 'name'];
    
    let filter = {};
    
    // Xử lý các trường lọc trực tiếp
    directFilterableFields.forEach(field => {
        if (req.query[field] !== undefined) {
            filter[field] = req.query[field];
        }
    });
    
    // Xử lý các trường lọc bằng regex (tìm kiếm gần đúng)
    regexFilterableFields.forEach(field => {
        if (req.query[field]) {
            filter[field] = { $regex: req.query[field], $options: 'i' };
        }
    });
    
    // Tìm kiếm tổng quát (q parameter)
    if (req.query.q) {
        filter.$or = [
            { name: { $regex: req.query.q, $options: 'i' } },
            { email: { $regex: req.query.q, $options: 'i' } },
            { phoneNumber: { $regex: req.query.q, $options: 'i' } }
        ];
    }
    
    // Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [users, totalCount] = await Promise.all([
        User.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter)
    ]);
    
    res.status(200).json({
        success: true,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        data: users,
    });
});

exports.getUserById = catchAsync(async (req, res, next) => {
    // Validator đã gắn user vào req.foundUser
    const user = await User.findById(req.params.id).select('+password');
    res.status(200).json({
        success: true,
        data: user,
    });
});

exports.createUser = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'name', 'email', 'password', 'phoneNumber', 'userRole', 'gender', 'dateOfBirth', 'verified');
    
    // Hash password nếu có
    if (filteredBody.password) {
        filteredBody.password = await hashPassword(filteredBody.password);
    }
    
    const newUser = await User.create(filteredBody);
    
    // Loại bỏ password khỏi response
   newUser.password = undefined;

   res.status(201).json({
       success: true,
       message: 'Tạo người dùng thành công!',
       data: newUser,
   });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    // Validator đã gắn user vào req.foundUser
    const user = await User.findById(req.params.id).select('+password');
    
    const filteredBody = filterObject(req.body, 'name', 'email', 'phoneNumber', 'userRole', 'gender', 'dateOfBirth', 'verified');
    
    // Hash password nếu có
    if (req.body.password) {
        filteredBody.password = await hashPassword(req.body.password);
    }
    
    const updatedUser = await User.findByIdAndUpdate(user._id, filteredBody, {
        new: true,
        runValidators: true
    }).select('-password');
    
    res.status(200).json({
        success: true,
        message: 'Cập nhật người dùng thành công!',
        data: updatedUser,
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    // Validator đã gắn user vào req.foundUser
    const user = await User.findById(req.params.id).select('+password');

    await User.findByIdAndDelete(user);

    res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công.',
    });
});

