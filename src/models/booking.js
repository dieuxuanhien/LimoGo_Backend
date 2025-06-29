// src/models/booking.js
const { Schema, model } = require('mongoose');
const Ticket = require('./ticket');
const bookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket', required: true }],
    provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    totalPrice: { type: Number, required: true },
    
    // Phương thức thanh toán người dùng đã chọn
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer'],
        required: true
    },

    // Trạng thái phê duyệt của nhà xe
    approvalStatus: {
        type: String,
        enum: ['pending_approval', 'confirmed_by_provider', 'cancelled'],
        default: 'pending_approval'
    },

    // Trạng thái thanh toán của đơn hàng
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'expired'], 
        default: 'pending' 
    },
    
    // Hạn chót để nhà xe duyệt hoặc khách hàng thanh toán
    bookingExpiresAt: { type: Date }
}, { 
    timestamps: true 
});

bookingSchema.index({ provider: 1, approvalStatus: 1, createdAt: -1 });
bookingSchema.index({ user: 1, createdAt: -1 });

bookingSchema.post('save', function(next) {
    // tự release ticket nếu failed payment status
    if (this.paymentStatus === 'failed') {
        Ticket.updateMany(
            { _id: { $in: this.tickets } },
            { $set: { status: 'available' } },
            { multi: true }
        ).exec();

    }
    next();
});
module.exports = model('Booking', bookingSchema);