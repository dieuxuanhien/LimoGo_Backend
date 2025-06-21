const { Schema, model } = require('mongoose');

const issueReportSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' }
}, { timestamps: true });

module.exports = model('IssueReport', issueReportSchema);