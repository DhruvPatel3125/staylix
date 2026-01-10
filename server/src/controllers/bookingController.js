const Booking = require("../models/booking");
const Room = require("../models/room");
const Hotel = require("../models/hotel");
const Discount = require("../models/discount");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order"
        });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests, totalAmount, hotelId, ownerId, discountCode, paymentId, orderId, signature } = req.body;

        // Check if user is owner of this hotel
        if (ownerId && req.user._id.toString() === ownerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot book a room in your own hotel"
            });
        }

        if (!roomId || !checkIn || !checkOut || !guests || !totalAmount || !hotelId || !ownerId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Verify Payment
        if (paymentId && orderId && signature) {
            const body = orderId + "|" + paymentId;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== signature) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment signature"
                });
            }
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date"
            });
        }

        if (guests <= 0) {
            return res.status(400).json({
                success: false,
                message: "Number of guests must be greater than 0"
            });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        const hotel = await Hotel.findById(hotelId);

        const activeBookings = await Booking.find({
            roomId,
            bookingStatus: { $in: ["pending", "confirmed"] },
            checkOut: { $gt: checkInDate },
            checkIn: { $lt: checkOutDate }
        });

        if (activeBookings.length >= room.totalRooms) {
            return res.status(400).json({
                success: false,
                message: "Room not available for selected dates"
            });
        }

        // Handle discount if provided
        let discountAmount = 0;
        let finalAmount = totalAmount;
        let validatedDiscountCode = null;

        if (discountCode) {
            const discount = await Discount.findOne({ code: discountCode.toUpperCase() });

            if (discount && discount.requestStatus === "approved" && discount.isActive) {
                const now = new Date();
                const isDateValid = now >= new Date(discount.startDate) && now <= new Date(discount.endDate);
                const isUsageLimitOk = !discount.usageLimit || discount.usageCount < discount.usageLimit;
                const isMinAmountMet = totalAmount >= discount.minBookingAmount;
                const isHotelApplicable = !discount.applicableHotels ||
                    discount.applicableHotels.length === 0 ||
                    discount.applicableHotels.some(id => id.toString() === hotelId.toString());

                if (isDateValid && isUsageLimitOk && isMinAmountMet && isHotelApplicable) {
                    // Calculate discount
                    if (discount.discountType === "percentage") {
                        discountAmount = (totalAmount * discount.discountValue) / 100;
                    } else {
                        discountAmount = discount.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, totalAmount);
                    finalAmount = totalAmount - discountAmount;
                    validatedDiscountCode = discount.code;

                    // Increment usage count
                    discount.usageCount += 1;
                    await discount.save();
                }
            }
        }

        const booking = await Booking.create({
            userId: req.user._id,
            ownerId,
            hotelId,
            roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests,
            originalAmount: totalAmount,
            discountCode: validatedDiscountCode,
            discountAmount,
            totalAmount: finalAmount,
            bookingStatus: 'confirmed',
            paymentStatus: paymentId ? 'paid' : 'pending',
            paymentInfo: {
                paymentId: paymentId,
                orderId: orderId
            }
        });

        // Send Confirmation Email
        if (req.user && req.user.email) {
            console.log(`Attempting to send booking confirmation email to: ${req.user.email}`);

            // Calculate nights for bill
            const oneDay = 24 * 60 * 60 * 1000;
            const nights = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay));
            const basePrice = room.pricePerNight * nights;
            const taxesAndFees = totalAmount - basePrice; // Assuming totalAmount might include taxes

            const emailSubject = `Booking Confirmed: Your stay at ${hotel ? hotel.name : 'Staylix'} is secured!`;
            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
  .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
  .header p { margin: 5px 0 0; opacity: 0.9; font-size: 16px; }
  .content { padding: 30px 25px; color: #333333; }
  .greeting { font-size: 18px; margin-bottom: 20px; color: #1f2937; }
  .booking-ref { text-align: center; margin: 25px 0; background-color: #f3f4f6; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; }
  .booking-ref span { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .booking-ref strong { display: block; font-size: 20px; color: #6366f1; letter-spacing: 2px; margin-top: 5px; }
  .hotel-info { margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 25px; }
  .hotel-name { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 5px; }
  .hotel-address { color: #6b7280; font-size: 14px; display: flex; align-items: center; gap: 5px; }
  .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
  .detail-item p { margin: 0; font-size: 13px; color: #6b7280; }
  .detail-item strong { display: block; margin-top: 4px; font-size: 15px; color: #1f2937; font-weight: 600; }
  .price-section { background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 20px; }
  .price-header { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
  .price-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #4b5563; }
  .price-row.total { border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 10px; font-weight: 700; font-size: 18px; color: #111827; margin-bottom: 0; }
  .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  .btn { display: inline-block; background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; background-color: #dcfce7; color: #166534; margin-top: 10px; }
  .status-badge.pending { background-color: #fef9c3; color: #854d0e; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
      <p>Your trip is set. Pack your bags!</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${req.user.name || 'Traveler'},</div>
      <p>Thank you for choosing Staylix! We are excited to confirm your reservation at <strong>${hotel ? hotel.name : 'your selected hotel'}</strong>.</p>
      
      <div class="booking-ref">
        <span>Booking Reference ID</span>
        <strong>${booking._id}</strong>
        <div class="status-badge ${paymentId ? 'paid' : 'pending'}">${paymentId ? 'PAYMENT SUCCESSFUL' : 'PAYMENT PENDING'}</div>
      </div>

      <div class="hotel-info">
        <div class="hotel-name">${hotel ? hotel.name : 'Unknown Hotel'}</div>
        <div class="hotel-address">
           📍 ${hotel ? `${hotel.address}, ${hotel.city}, ${hotel.state}` : 'Address not available'}
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <p>CHECK-IN</p>
          <strong>${new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          <p style="font-size: 12px; margin-top: 2px;">After 12:00 PM</p>
        </div>
        <div class="detail-item">
          <p>CHECK-OUT</p>
          <strong>${new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          <p style="font-size: 12px; margin-top: 2px;">Before 11:00 AM</p>
        </div>
        <div class="detail-item">
          <p>GUESTS & ROOMS</p>
          <strong>${guests} Guest(s)</strong>
          <p style="font-size: 12px; margin-top: 2px;">${room.roomType || room.title || 'Standard Room'} (${nights} Nights)</p>
        </div>
      </div>

      <div class="price-section">
        <div class="price-header">Payment Breakdown</div>
        <div class="price-row">
          <span>₹${room.pricePerNight} x ${nights} Nights</span>
          <span>₹${basePrice}</span>
        </div>
        ${taxesAndFees > 0 ? `
        <div class="price-row">
            <span>Taxes & Fees</span>
            <span>₹${taxesAndFees}</span>
        </div>` : ''}
        ${discountAmount > 0 ? `
        <div class="price-row" style="color: #10b981;">
          <span>Discount Applied</span>
          <span>-₹${discountAmount}</span>
        </div>` : ''}
        <div class="price-row total">
          <span>Total Paid</span>
          <span>₹${finalAmount}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/dashboard" class="btn">Manage My Booking</a>
      </div>
    </div>

    <div class="footer">
      <p>Need help? Contact us at support@staylix.com</p>
      <p>&copy; ${new Date().getFullYear()} Staylix. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
            `;

            try {
                await sendEmail({
                    email: req.user.email,
                    subject: emailSubject,
                    html: emailHtml
                });
                console.log("Booking confirmation email sent successfully");
            } catch (emailError) {
                console.error("Failed to send booking email:", emailError);
                // We don't want to fail the request if email fails, so we just log it
            }
        } else {
            console.log("Skipping email: No user email found in request object");
        }

        res.status(201).json({
            success: true,
            booking
        });
    } catch (err) {
        console.error("Booking creation error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Booking failed"
        });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate("hotelId roomId");
        res.json({
            success: true,
            bookings
        });
    } catch (err) {
        console.error("Get user bookings error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch bookings"
        });
    }
};

exports.getOwnerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ ownerId: req.user._id }).populate("userId hotelId roomId");
        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Get owner bookings error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch bookings"
        });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this booking"
            });
        }

        if (booking.bookingStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        booking.bookingStatus = "cancelled";
        await booking.save();

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            booking
        });
    } catch (error) {
        console.error("Cancel booking error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to cancel booking"
        });
    }
};