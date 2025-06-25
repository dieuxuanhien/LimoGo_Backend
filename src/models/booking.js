// src/models/booking.js
const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket', required: true }],
    provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    totalPrice: { type: Number, required: true },
    
    // THÊM TRƯỜNG NÀY: Để theo dõi vòng đời của đơn hàng
    status: {
        type: String,
        enum: ['pending_approval', 'confirmed', 'cancelled', 'expired'],
        default: 'pending_approval'
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

bookingSchema.index({ provider: 1, status: 1, createdAt: -1 });

bookingSchema.index({ user: 1, createdAt: -1 });


module.exports = model('Booking', bookingSchema);