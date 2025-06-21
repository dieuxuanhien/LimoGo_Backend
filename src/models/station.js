const { Schema, model } = require('mongoose');

const stationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, required: true, index: true },
  country: { type: String, default: 'VietNam' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = model('Station', stationSchema);
