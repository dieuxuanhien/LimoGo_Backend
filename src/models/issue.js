
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const issueSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' }
}, { timestamps: true });

issueSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});


module.exports = mongoose.model('Issue', issueSchema);