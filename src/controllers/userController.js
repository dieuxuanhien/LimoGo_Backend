const User = require('../models/user');
const { hashPassword } = require('../utils/hashing');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { filterObject } = require('../utils/helpers');


// GET /user/me
exports.getMe = (req, res, next) => {
    // Middleware loggedin đã gắn user vào req, ta chỉ cần trả về
    res.status(200).json({
        success: true,
        data: req.user,
    });
};

// PUT /user/updateMe
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1. Lọc ra các trường người dùng được phép cập nhật
    const filteredBody = filterObject(req.body, 'name', 'dateOfBirth', 'gender');
    // Nếu người dùng cập nhật SĐT, nó cần được xác thực lại, logic này có thể thêm sau.
    // Tạm thời cho phép cập nhật SĐT.
    if (req.body.phoneNumber) {
        filteredBody.phoneNumber = req.body.phoneNumber;
    }

    // 2. Cập nhật user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    }).select('-password');

    res.status(200).json({
        success: true,
        data: updatedUser,
    });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.user.id);
    res.status(204).json({ // 204 No Content là status code phù hợp cho hành động xóa thành công
        success: true,
        data: null,
    });
});


// === HÀM QUẢN LÝ CHO ADMIN ===

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
    // Tối ưu việc xây dựng bộ lọc
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



// Create user
exports.createUser = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'name', 'email', 'password', 'phoneNumber', 'gender', 'dateOfBirth', 'userRole', 'verified');
    
    if (filteredBody.password) {
        filteredBody.password = await hashPassword(filteredBody.password);
    }
    
    const newUser = await User.create(filteredBody);
    newUser.password = undefined; // Ẩn password khỏi response

    res.status(201).json({ success: true, data: newUser });
});

// Update user
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

    res.status(200).json({ success: true, data: user });
});

// Delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
    if (req.user.id === req.params.id) {
        return next(new AppError('Admin không thể tự xóa tài khoản qua API này.', 400));
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }
    res.status(204).json({
        success: true,
        data: null,
    });
});