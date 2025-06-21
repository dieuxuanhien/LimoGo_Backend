const { Schema, model } = require('mongoose');

const driverSchema = new Schema({
  name: { type: String, required: true }, // driver's name
  currentStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true }, // current station of the driver
  provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true }, // provider associated with the driver
  age: { type: Number, required: true },
  photo: { type: String, required: true },
  status: { type: String, enum: ['assigned', 'available'], default: 'available' }
}, { timestamps: true });

module.exports = model('Driver', driverSchema);