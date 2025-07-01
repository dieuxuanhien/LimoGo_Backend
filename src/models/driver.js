const { Schema, model } = require('mongoose');

const driverSchema = new Schema({
    name: { 
        type: String, 
        required: true,
        // Thêm text index để hỗ trợ tìm kiếm toàn văn bản (full-text search) hiệu quả.
        // Điều này rất hữu ích cho các tính năng tìm kiếm nâng cao trong tương lai.
        text: true 
    },
    currentStation: { 
        type: Schema.Types.ObjectId, 
        ref: 'Station', 
        required: true 
    },
    provider: { 
        type: Schema.Types.ObjectId, 
        ref: 'Provider', 
        required: true,
        // Đánh chỉ mục (index) cho trường provider để tăng tốc các truy vấn lọc
        // tài xế theo nhà xe. Đây là truy vấn phổ biến nhất.
        index: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    photo: { 
        type: String, 
        required: false,
    },
    status: { 
        type: String, 
        enum: ['assigned', 'available'], 
        default: 'available',
        // Đánh chỉ mục cho trường status để tăng tốc việc tìm kiếm các tài xế
        // đang rảnh hoặc đang được phân công.
        index: true
    }
}, { timestamps: true });

// Mongoose sẽ tự động tạo các chỉ mục này trong MongoDB khi ứng dụng khởi động.
// Lưu ý: Đối với môi trường production với lượng dữ liệu lớn, việc tạo index
// có thể mất thời gian và cần được thực hiện cẩn thận.

module.exports = model('Driver', driverSchema);
