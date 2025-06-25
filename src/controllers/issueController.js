// src/controllers/issueController.js
const Issue = require('../models/issue');
const { filterObject } = require('../utils/helpers'); // Giả sử bạn có file này

// Customer tạo một sự cố mới
exports.createIssue = async (req, res) => {
    try {
        // Chống Mass Assignment: chỉ lấy các trường được phép
        const allowedData = filterObject(req.body, 'title', 'description', 'category', 'trip', 'booking');
        
        // Gán user một cách an toàn từ token
        allowedData.user = req.user._id;

        const newIssue = await Issue.create(allowedData);
        res.status(201).json({ success: true, message: 'Báo cáo sự cố thành công!', data: newIssue });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};

// Customer xem các sự cố của chính mình
exports.getMyIssues = async (req, res) => {
    try {
        // Thêm phân trang cho API này
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [issues, totalCount] = await Promise.all([
            Issue.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Issue.countDocuments({ user: req.user._id })
        ]);

        res.status(200).json({ 
            success: true, 
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: issues 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Customer/Admin cập nhật một sự cố
exports.updateIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sự cố.' });
        }

        // Kiểm tra quyền: Hoặc là admin, hoặc là chủ sở hữu của issue
        if (req.user.role !== 'admin' && String(issue.user) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này.' });
        }
        
        // Customer chỉ được sửa khi status là 'open'
        if (req.user.role !== 'admin' && issue.status !== 'open') {
            return res.status(400).json({ success: false, message: 'Bạn chỉ có thể cập nhật sự cố đang ở trạng thái "open".' });
        }

        // Admin được phép cập nhật status, customer thì không
        const allowedFields = req.user.role === 'admin' 
            ? ['title', 'description', 'category', 'status']
            : ['title', 'description', 'category'];

        const updateData = filterObject(req.body, ...allowedFields);

        const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: 'Cập nhật sự cố thành công.', data: updatedIssue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Customer/Admin xóa một sự cố
exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sự cố.' });
        }

        // Kiểm tra quyền: Hoặc là admin, hoặc là chủ sở hữu của issue
        if (req.user.role !== 'admin' && String(issue.user) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này.' });
        }

        // Customer chỉ được xóa khi status là 'open'
        if (req.user.role !== 'admin' && issue.status !== 'open') {
            return res.status(400).json({ success: false, message: 'Bạn chỉ có thể xóa sự cố đang ở trạng thái "open".' });
        }

        await Issue.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Xóa sự cố thành công.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// === HÀM CHỈ DÀNH CHO ADMIN ===

exports.getAllIssues = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Cho phép admin filter theo status hoặc category
        const filter = filterObject(req.query, 'status', 'category', 'user');

        const [issues, totalCount] = await Promise.all([
            Issue.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Issue.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: issues
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};