const { Schema, model } = require('mongoose');

const vehicleSchema = new Schema({
  type: { type: String, required: true },
  currentStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  licensePlate: { type: String, required: true, unique: true },
  status: { type: String, enum: ['available', 'in-use', 'maintenance'], default: 'available' },
  capacity: { type: Number, required: true },
  manufacturer: { type: String },
  model: { type: String },
  image: { type: String }
}, { timestamps: true });

module.exports = model('Vehicle', vehicleSchema);
