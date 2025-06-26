const { Schema, model } = require('mongoose');

const stationSchema = new Schema({
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    address: { type: String, required: true },
    country: { type: String, default: 'VietNam' },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },

    // --- THÊM MỚI: Trường để phân loại Station ---
    type: {
        type: String,
        enum: ['main_station', 'pickup_point'], // main_station: bến xe chính, pickup_point: điểm đón/trả riêng
        required: [true, 'Loại trạm (type) là bắt buộc.']
    },

    // --- THÊM MỚI: Trường để xác định chủ sở hữu của pickup_point ---
    // Chỉ có giá trị khi type là 'pickup_point'
    ownerProvider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        index: true // Tối ưu việc tìm kiếm các điểm đón của một nhà xe
    }
}, { timestamps: true });


// GIẢI THÍCH: Index này sẽ tăng tốc đáng kể cho truy vấn $or trong `getAllStations`
// khi một provider truy cập, vì DB có thể sử dụng index này để nhanh chóng
// tìm các document có type='main_station' hoặc có ownerProvider khớp.
stationSchema.index({ type: 1, ownerProvider: 1 });

module.exports = model('Station', stationSchema);