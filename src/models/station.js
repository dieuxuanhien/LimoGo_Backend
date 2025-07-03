const { Schema, model } = require('mongoose');

const stationSchema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, index: true },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    // CẬP NHẬT: Mở rộng enum để có 3 loại
    type: {
        type: String,
        enum: ['main_station', 'shared_point', 'private_point'],
        required: true
    },
    // Trường này giờ chỉ áp dụng cho 'private_point'
    ownerProvider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider'
    }
}, { timestamps: true });

// Index này vẫn hữu ích để tìm các điểm đón của một nhà xe
stationSchema.index({ type: 1, ownerProvider: 1 });
// Index để tìm kiếm theo tên và thành phố
stationSchema.index({ name: 'text', city: 1 });


module.exports = model('Station', stationSchema);