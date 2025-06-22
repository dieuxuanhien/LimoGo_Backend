// src/models/booking.js
const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
    // Người dùng thực hiện đơn đặt vé này
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Danh sách các ID của vé trong đơn hàng này
    tickets: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Ticket', 
        required: true 
    }],
    // Tổng giá trị đơn hàng
    totalPrice: { 
        type: Number, 
        required: true 
    },
    // Trạng thái thanh toán, sẽ hữu ích cho việc tích hợp thanh toán sau này
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'expired'], 
        default: 'pending' 
    },
    // Thời điểm đơn hàng bị coi là hết hạn nếu không thanh toán
    bookingExpiresAt: { type: Date }
}, { timestamps: true });

module.exports = model('Booking', bookingSchema);