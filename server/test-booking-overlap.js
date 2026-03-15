const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./src/models/booking');

async function testOverlap() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Pick an exact date range to test
    const testCheckIn = '2026-05-04';
    const testCheckOut = '2026-05-10';
    
    // We need a dummy roomId to tie everything together. 
    // This doesn't have to exist in the Room collection for this query test.
    const dummyRoomId = new mongoose.Types.ObjectId(); 
    
    // Convert strings to Normalized UTC Dates
    const existingCheckIn = new Date(testCheckIn); existingCheckIn.setUTCHours(0,0,0,0);
    const existingCheckOut = new Date(testCheckOut); existingCheckOut.setUTCHours(0,0,0,0);

    // 1. Create a Confirmed Booking in the database
    console.log(`\n--- 1. Creating Confirmed Booking for: ${existingCheckIn.toDateString()} to ${existingCheckOut.toDateString()} ---`);
    const newBooking = await Booking.create({
        roomId: dummyRoomId,
        userId: new mongoose.Types.ObjectId(), // Dummy User
        ownerId: new mongoose.Types.ObjectId(), // Dummy Owner
        hotelId: new mongoose.Types.ObjectId(), // Dummy Hotel
        checkIn: existingCheckIn,
        checkOut: existingCheckOut,
        guests: 2,
        totalAmount: 5000,
        bookingStatus: "confirmed",
        paymentStatus: "paid"
    });
    console.log(`Created Booking ID: ${newBooking._id}`);

    // Helper function to test availability logic
    async function checkAvailability(reqCheckInStr, reqCheckOutStr, scenarioDesc) {
        console.log(`\nScenario: ${scenarioDesc}`);
        console.log(`Requested Dates: ${reqCheckInStr} to ${reqCheckOutStr}`);
        
        const reqCheckIn = new Date(reqCheckInStr); reqCheckIn.setUTCHours(0,0,0,0);
        const reqCheckOut = new Date(reqCheckOutStr); reqCheckOut.setUTCHours(0,0,0,0);

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        // The exact query from bookingController.js
        const activeBookings = await Booking.find({
            roomId: dummyRoomId,
            $or: [
                { bookingStatus: "confirmed" },
                { bookingStatus: "pending", createdAt: { $gt: tenMinutesAgo } }
            ],
            $and: [
                { checkIn: { $lt: reqCheckOut } },
                { checkOut: { $gt: reqCheckIn } }
            ]
        });

        const overlapCount = activeBookings.length;
        if (overlapCount > 0) {
            console.log(`❌ FAILED (Room is Occupied) -> Overlaps with ${overlapCount} booking(s).`);
        } else {
            console.log(`✅ SUCCESS (Room is Available) -> No overlapping bookings found.`);
        }
    }

    // 2. Run Tests
    
    // Test A: Exact same dates (Your specific scenario)
    await checkAvailability('2026-05-04', '2026-05-10', 'Exact Same Dates (should be occupied)');
    
    // Test B: Partial Overlap (starts before, ends during)
    await checkAvailability('2026-05-02', '2026-05-06', 'Partial Overlap Start (should be occupied)');

    // Test C: Partial Overlap (starts during, ends after)
    await checkAvailability('2026-05-08', '2026-05-12', 'Partial Overlap End (should be occupied)');

    // Test D: Enclosing Overlap (starts before, ends after)
    await checkAvailability('2026-05-01', '2026-05-15', 'Enclosing Overlap (should be occupied)');

    // Test E: Completely inside (starts after, ends before)
    await checkAvailability('2026-05-06', '2026-05-08', 'Inside Overlap (should be occupied)');

    // Test F: Adjacent Before (checkOut = booking checkIn)
    await checkAvailability('2026-05-01', '2026-05-04', 'Adjacent Before (should be available)');

    // Test G: Adjacent After (checkIn = booking checkOut)
    await checkAvailability('2026-05-10', '2026-05-15', 'Adjacent After (should be available)');


    // 3. Clean up the dummy booking
    console.log(`\nCleaning up dummy data...`);
    await Booking.findByIdAndDelete(newBooking._id);
    console.log('Done.');

    await mongoose.disconnect();
}

testOverlap().catch(console.error);
