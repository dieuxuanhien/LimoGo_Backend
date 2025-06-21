const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const providerSchema = new Schema({
    name: { type: String, required: true }, // Name of the provider
    email : { type: String, required: true, unique: true }, // Email of the provider
    phone: { type: String, required: true }, // Phone number of the provider
    address: { type: String, required: true }, // Address of the provider
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // Status of the provider
    taxId: { type: String, required: false }, // Tax ID of the provider
    mainUser : { type: Schema.Types.ObjectId, ref: 'User', required: false, select : false}

}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);

