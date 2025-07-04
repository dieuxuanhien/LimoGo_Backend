const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const tripSchema = new Schema({
    // THAY ĐỔI: Thay thế route bằng itinerary
    itinerary: { type: Schema.Types.ObjectId, ref: 'Itinerary', required: true },
    
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
    
    // Giữ lại vai trò là thời gian tổng quan
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    
    // THAY ĐỔI: Loại bỏ price đơn lẻ
    // price: { type: Number, required: true },

    status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },

    // THÊM MỚI: Bảng giá và Lịch trình chi tiết
    priceMatrix: [{
        _id: false,
        originStop: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
        destinationStop: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
        price: { type: Number, required: true, min: 0 }
    }],
    schedule: [{
        _id: false,
        station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
        estimatedArrivalTime: { type: Date, required: true },
        estimatedDepartureTime: { type: Date, required: true }
    }]
}, { timestamps: true });


tripSchema.post('save', async function(doc, next) {
    if (!doc.isNew) return next();

    const Ticket = mongoose.model('Ticket');
    const Vehicle = mongoose.model('Vehicle');

    try {
        const vehicle = await Vehicle.findById(doc.vehicle);
        if (!vehicle) return next(new Error('Vehicle not found for ticket generation'));

        const tickets = [];
        for (let i = 1; i <= vehicle.capacity; i++) {
            tickets.push({ trip: doc._id, seatNumber: i.toString() });
        }

        await Ticket.insertMany(tickets, { ordered: false });
    } catch(err) {
        console.error("Error inserting tickets, but continuing...", err.message);
    }
    
    next();
});


  tripSchema.pre('findOneAndDelete', async function(next) {
    try {
        // `this.getFilter()` sẽ lấy điều kiện của lệnh find, ví dụ: { _id: '...' }
        const trip = await this.model.findOne(this.getFilter());
        if (trip){
            console.log(`Deleting tickets for trip: ${trip._id}`);
            // Xóa tất cả các vé có trip ID tương ứng
            await mongoose.model('Ticket').deleteMany({ trip: trip._id });
        }
        next();
    } catch (err) {
        next(err);
    }
  });


tripSchema.index({ itinerary: 1, departureTime: 1 });
tripSchema.index({ provider: 1, departureTime: -1 });


module.exports = model('Trip', tripSchema);