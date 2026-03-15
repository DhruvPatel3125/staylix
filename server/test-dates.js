const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./src/models/booking');

async function testOverlap() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const roomId = '60d5ec42cff6fa00155b9a8a'; // Dummy ID, won't match but we can test date logic
    const checkIn = '2026-05-04';
    const checkOut = '2026-05-10';

    const checkInDate = new Date(checkIn);
    checkInDate.setUTCHours(0, 0, 0, 0);
    const checkOutDate = new Date(checkOut);
    checkOutDate.setUTCHours(0, 0, 0, 0);

    console.log(`Testing overlap against CheckIn: ${checkInDate.toISOString()} and CheckOut: ${checkOutDate.toISOString()}`);

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const query = {
        roomId,
        $or: [
            { bookingStatus: "confirmed" },
            { 
                bookingStatus: "pending", 
                createdAt: { $gt: tenMinutesAgo } 
            }
        ],
        $and: [
            { checkIn: { $lt: checkOutDate } },
            { checkOut: { $gt: checkInDate } }
        ]
    };

    console.dir(query, { depth: null });

    const activeBookings = await Booking.find(query);
    console.log(`Found ${activeBookings.length} bookings.`);

    await mongoose.disconnect();
}

testOverlap().catch(console.error);
