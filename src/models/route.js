const { Schema, model } = require('mongoose');

const routeSchema = new Schema({
  originStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  destinationStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  distanceKm: { type: Number },
  estimatedDurationMin: { type: Number }
}, { timestamps: true });

routeSchema.index({ originStation: 1, destinationStation: 1 });

module.exports = model('Route', routeSchema);