// src/models/ticket.js
const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ticketSchema = new Schema(
    {
        trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User" }, // User đang giữ chỗ hoặc đã đặt
        booking: { type: Schema.Types.ObjectId, ref: 'Booking' }, // Đơn hàng chứa vé này
        seatNumber: { type: String, required: true },
        price: { type: Number, required: true },
        lockExpires: { type: Date },
        status: {
            type: String,
            enum: ["available", "locked", "pending_approval", "booked"],
            default: "available",
        },  
        accessId: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4().slice(0, 6).toUpperCase(),
        },
    },
    { timestamps: true }
);

ticketSchema.index({ trip: 1, seatNumber: 1 }, { unique: true });
ticketSchema.index({ user: 1, status: 1});

module.exports = model("Ticket", ticketSchema);