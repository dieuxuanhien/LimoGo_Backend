const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  origin_station_id: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  destination_station_id: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  distanceKm: { type: Number },
  estimatedDurationMin: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);