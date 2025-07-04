const { Schema, model } = require('mongoose');

const routeSchema = new Schema({
    originStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    destinationStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    distanceKm: { type: Number },
    estimatedDurationMin: { type: Number },

    // --- THÊM MỚI: Trường để xác định chủ sở hữu của tuyến đường ---
    // Sẽ là null/undefined nếu đây là tuyến đường chung của hệ thống (do Admin tạo)
    ownerProvider: {    
        type: Schema.Types.ObjectId,
        ref: 'Provider',
    }
}, { timestamps: true });

// Đảm bảo tính duy nhất cho các tuyến đường của cùng một nhà xe
// Hoặc các tuyến đường chung của hệ thống
routeSchema.index({ originStation: 1, destinationStation: 1, ownerProvider: 1 }, { unique: true });

// GIẢI THÍCH: Index này tối ưu trực tiếp cho việc tìm kiếm các tuyến đường
// của một nhà xe hoặc các tuyến của hệ thống (ownerProvider: null).
routeSchema.index({ ownerProvider: 1 });

module.exports = model('Route', routeSchema);