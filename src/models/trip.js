const mongoose = require('mongoose');
const driver = require('./driver');


const tripSchema = new Schema({
  route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price: { type: Number, required: true }
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

  await Ticket.insertMany(tickets, { ordered: false }).catch(() => {});
  next();
});

module.exports = mongoose.model('Trip', tripSchema);