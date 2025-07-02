const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Lưu file vào thư mục public/uploads/images
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sửa lỗi: Tạo tên file duy nhất đơn giản và đúng đắn hơn
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
    }
});

// Cấu hình bộ lọc file
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Lỗi: Chỉ chấp nhận file ảnh!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

/**
 * Middleware upload ảnh linh hoạt.
 * @param {string} fieldName - Tên của trường chứa file trong form-data (ví dụ: 'photo', 'avatar').
 */
exports.uploadImage = (fieldName) => (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, (err) => {
        if (err) {
            // Xử lý các lỗi từ Multer
            return res.status(400).json({ success: false, message: err.message });
        }
        // Xây dựng URL để lưu vào DB với đường dẫn /public/
        if (req.file) {
            req.file.path = `/public/uploads/images/${req.file.filename}`;
        }
        next();
    });
};