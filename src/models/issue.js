// src/models/issue.js
const { Schema, model } = require('mongoose');

const issueReportSchema = new Schema({
    // Người dùng tạo sự cố
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Các trường tùy chọn để cung cấp thêm ngữ cảnh
    trip: { type: Schema.Types.ObjectId, ref: 'Trip' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },

    // Phân loại sự cố
    category: {
        type: String,
        enum: ['technical', 'payment', 'service_quality', 'other'],
        default: 'other'
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    
    // Trạng thái xử lý sự cố
    status: { 
        type: String, 
        enum: ['open', 'in-progress', 'resolved', 'closed'], 
        default: 'open' 
    }
}, { timestamps: true });

issueReportSchema.index({ user: 1, status: 1 });
issueReportSchema.index({ status: 1, createdAt: -1 });
issueReportSchema.index({ category: 1 });


module.exports = model('IssueReport', issueReportSchema);