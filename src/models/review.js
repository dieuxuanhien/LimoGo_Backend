const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
  trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true},
  rating: { type: Number, required: true, min: 1, max: 5 },
  desc: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true}
}, { timestamps: true });

reviewSchema.index({ trip: 1, user: 1 }, { unique: true });