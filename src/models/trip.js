  const mongoose = require('mongoose');
  const { Schema, model } = mongoose;
  const driver = require('./driver');


  const tripSchema = new Schema({
    route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true }, // Thêm trường provider
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });


  tripSchema.post('save', async function(doc, next) {
    const Ticket = mongoose.model('Ticket');
    const Vehicle = mongoose.model('Vehicle');

    const vehicle = await Vehicle.findById(doc.vehicle);
    if (!vehicle) return next(new Error('Vehicle not found for ticket generation'));

    const tickets = [];
    for (let i = 1; i <= vehicle.capacity; i++) {
      tickets.push({ trip: doc._id, seatNumber: i.toString(), price: doc.price });
    }

    await Ticket.insertMany(tickets, { ordered: false }).catch((err) => {
      console.error("Error inserting tickets, but continuing...", err.message);
    });
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


  tripSchema.index({ route: 1, departureTime: 1 });

  module.exports = model('Trip', tripSchema);