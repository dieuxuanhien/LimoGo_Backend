// src/models/review.js
const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
}, { timestamps: true });

// Đảm bảo một user chỉ review một trip một lần
reviewSchema.index({ trip: 1, user: 1 }, { unique: true });

reviewSchema.index({ createAt: -1 });

module.exports = model('Review', reviewSchema);