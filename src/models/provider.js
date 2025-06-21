const { Schema, model } = require('mongoose');

const providerSchema = new Schema({
    name: { type: String, required: true }, // Name of the provider
    email : { type: String, required: true, unique: true }, // Email of the provider
    phone: { type: String, required: true }, // Phone number of the provider
    address: { type: String, required: true }, // Address of the provider
    username: { type: String, required: true, unique: true }, // Username for the provider
    password: { type: String, required: true }, // Password for the provider
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // Status of the provider
    taxId: { type: String, required: true }, // Tax ID of the provider
    
}, { timestamps: true });

module.exports = model('Provider', providerSchema);