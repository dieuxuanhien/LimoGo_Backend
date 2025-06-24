const { Schema, model } = require('mongoose');

const vehicleSchema = new Schema({
  // Thêm trường provider vào đây
  provider: { 
    type: Schema.Types.ObjectId, 
    ref: 'Provider', 
    required: true,
    index: true // Thêm index để tối ưu truy vấn theo provider
  },
  type: { type: String, required: true }, // Ví dụ: 'Giường nằm 40 chỗ', 'Limousine 9 chỗ'
  currentStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  licensePlate: { type: String, required: true, unique: true, trim: true, uppercase: true },
  status: { type: String, enum: ['available', 'in-use', 'maintenance'], default: 'available' },
  capacity: { type: Number, required: true },
  manufacturer: { type: String }, // Hãng sản xuất
  model: { type: String }, // Đời xe
  image: { type: String } // URL hình ảnh của xe
}, { timestamps: true });

module.exports = model('Vehicle', vehicleSchema);