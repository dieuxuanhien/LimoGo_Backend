const mongoose = require("mongoose");

const { v4: uuidv4 } = require("uuid");



const ticketSchema = new mongoose.Schema(
    {
        trip_id: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
        user_id: { type: Schema.Types.ObjectId, ref: "User" },
        seatNumber: { type: String, required: true },
        bookingDate: { type: Date },

        price: { type: Number, required: true },

        lockExpires: { type: Date },
        status: {
            type: String,
            enum: ["available", "locked", "booked"],
            default: "available",
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
        },

        accessId: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4().slice(0, 6),
        },
    },
    { timestamps: true }
);

ticketSchema.index({ trip: 1, seatNumber: 1 }, { unique: true });

ticketSchema.pre("validate", async function (next) {
  if (this.isNew && this.status === "booked") {
    const Ticket = mongoose.model("Ticket");
    const exists = await Ticket.findOne({
      trip: this.trip,
      seatNumber: this.seatNumber,
      status: "booked",
    });
    if (exists)
      return next(
        new Error(`Seat ${this.seatNumber} is already booked for this trip.`)
      );
    this.bookingDate = new Date();
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
