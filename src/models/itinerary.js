const { Schema, model } = require('mongoose');

const itinerarySchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Tên hành trình là bắt buộc.'] 
    },
    provider: { 
        type: Schema.Types.ObjectId, 
        ref: 'Provider', 
        required: true,
        index: true
    },
    baseRoute: { 
        type: Schema.Types.ObjectId, 
        ref: 'Route', 
        required: true 
    },
    stops: [{
        _id: false,
        station: { 
            type: Schema.Types.ObjectId, 
            ref: 'Station', 
            required: true 
        },
        order: { 
            type: Number, 
            required: true 
        }
    }]
}, { timestamps: true });

itinerarySchema.index({ provider: 1, name: 1 }, { unique: true });

module.exports = model('Itinerary', itinerarySchema);