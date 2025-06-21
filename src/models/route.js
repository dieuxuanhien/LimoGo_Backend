const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const routeSchema = new mongoose.Schema({
  origin_station_id: { type: Schema.Types.ObjectId , ref: 'Station', required: true },
  destination_station_id: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  distanceKm: { type: Number , required: false},
  estimatedDurationMin: { type: Number , required: false},
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
