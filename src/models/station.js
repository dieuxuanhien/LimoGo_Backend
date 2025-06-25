const { Schema, model } = require('mongoose');

const stationSchema = new Schema({

  name: { type: String, required: true }, // Tên bến xe hoặc điểm đón
  city: { type: String, required: true, index: true },
  address: { type: String, required: true }, // Thêm địa chỉ chi tiết

  type: {
        type: String,
        enum: ['main_station', 'pickup_point'], // main_station: bến xe chính thức, pickup_point: điểm đón/trả riêng
        required: true
  },

  // --- TRƯỜNG MỚI ĐỂ XÁC ĐỊNH CHỦ SỞ HỮU ---
    // Chỉ có giá trị khi type là 'pickup_point'
    ownerProvider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider'
    },

  country: { type: String, default: 'VietNam' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = model('Station', stationSchema);