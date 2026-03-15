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
        const { roomId, checkIn, checkOut, guests, totalAmount, hotelId, ownerId, discountCode } = req.body;

        if (!roomId || !checkIn || !checkOut || !guests || !totalAmount || !hotelId || !ownerId) {
            return res.status(400).json({ success: false, message: "All booking details are required" });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // --- AVAILABILITY CHECK (Including Pending) ---
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const activeBookings = await Booking.find({
            roomId,
            $or: [
                { bookingStatus: "confirmed" },
                { 
                    bookingStatus: "pending", 
                    createdAt: { $gt: tenMinutesAgo } 
                }
            ],
            checkOut: { $gt: checkInDate },
            checkIn: { $lt: checkOutDate }
        });

        const currentOccupiedRooms = activeBookings.length;
        const availableCount = room.availableRooms || 0;

        if (currentOccupiedRooms >= availableCount) {
            return res.status(400).json({
                success: false,
                message: `No rooms available for the selected dates. (Sold out: ${currentOccupiedRooms}/${availableCount} rooms)`
            });
        }

        // Handle discount if provided (Pre-calculate for the order)
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
                    if (discount.discountType === "percentage") {
                        discountAmount = (totalAmount * discount.discountValue) / 100;
                    } else {
                        discountAmount = discount.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, totalAmount);
                    finalAmount = totalAmount - discountAmount;
                    validatedDiscountCode = discount.code;
                }
            }
        }

        const options = {
            amount: Math.round(finalAmount * 100), // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        // CREATE PENDING BOOKING to "lock" the room
        const pendingBooking = await Booking.create({
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
            bookingStatus: 'pending',
            paymentStatus: 'pending',
            paymentInfo: {
                orderId: order.id
            }
        });

        res.json({
            success: true,
            order,
            bookingId: pendingBooking._id
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order"
        });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { bookingId, paymentId, orderId, signature } = req.body;

        if (!bookingId || !paymentId || !orderId || !signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required"
            });
        }

        // Verify Payment Signature
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

        const booking = await Booking.findById(bookingId).populate("hotelId roomId userId");
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking record not found"
            });
        }

        if (booking.bookingStatus === 'confirmed') {
            return res.status(400).json({
                success: false,
                message: "Booking is already confirmed"
            });
        }

        // Update booking status
        booking.bookingStatus = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.paymentInfo = {
            paymentId,
            orderId,
            method: 'Razorpay'
        };

        await booking.save();

        // Increment Discount Usage if applicable
        if (booking.discountCode) {
            await Discount.findOneAndUpdate(
                { code: booking.discountCode },
                { $inc: { usageCount: 1 } }
            );
        }

        const hotel = booking.hotelId;
        const room = booking.roomId;
        const user = booking.userId;

        // Send Confirmation Email
        if (user && user.email) {
            const checkInDate = booking.checkIn;
            const checkOutDate = booking.checkOut;
            const finalAmount = booking.totalAmount;
            const discountAmount = booking.discountAmount;
            const totalAmount = booking.originalAmount;
            const guests = booking.guests;

            // Calculate nights
            const oneDay = 24 * 60 * 60 * 1000;
            const nights = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay));
            const basePrice = room.pricePerNight * nights;
            const taxesAndFees = totalAmount - basePrice;

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
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
      <p>Your trip is set. Pack your bags!</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${user.name || 'Traveler'},</div>
      <p>Thank you for choosing Staylix! We are excited to confirm your reservation at <strong>${hotel ? hotel.name : 'your selected hotel'}</strong>.</p>
      
      <div class="booking-ref">
        <span>Booking Reference ID</span>
        <strong>${booking._id}</strong>
        <div class="status-badge">PAYMENT SUCCESSFUL</div>
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
          <strong>${new Date(checkInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          <p style="font-size: 12px; margin-top: 2px;">After 12:00 PM</p>
        </div>
        <div class="detail-item">
          <p>CHECK-OUT</p>
          <strong>${new Date(checkOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
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
                    email: user.email,
                    subject: emailSubject,
                    html: emailHtml
                });
                console.log("Booking confirmation email sent successfully");
            } catch (emailError) {
                console.error("Failed to send booking email:", emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: "Booking confirmed successfully",
            booking
        });
    } catch (err) {
        console.error("Booking confirmation error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to confirm booking"
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

        const isUser = booking.userId.toString() === req.user._id.toString();
        const isOwner = booking.ownerId.toString() === req.user._id.toString();

        if (!isUser && !isOwner) {
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

        // Handle Refund if paid
        if (booking.paymentStatus === "paid" && booking.paymentInfo && booking.paymentInfo.paymentId) {
            try {
                const initiator = isOwner ? "Owner" : "User";
                const refund = await razorpay.payments.refund(booking.paymentInfo.paymentId, {
                    amount: Math.round(booking.totalAmount * 100),
                    notes: {
                        reason: `${initiator} cancelled booking`,
                        bookingId: booking._id.toString(),
                        initiatedBy: initiator
                    }
                });

                booking.refundStatus = "processed";
                booking.refundId = refund.id;
            } catch (refundError) {
                console.error("Razorpay refund error:", refundError);
                booking.refundStatus = "failed";
            }
        }

        booking.bookingStatus = "cancelled";
        await booking.save();

        // Send Cancellation Email
        const user = await Booking.findById(booking._id).populate("userId hotelId roomId");
        const userEmail = user.userId ? user.userId.email : null;

        if (userEmail) {
            const emailSubject = `Booking Cancelled: Your reservation at ${user.hotelId ? user.hotelId.name : 'Staylix'}`;
            const isRefundable = booking.paymentStatus === "paid";

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
  .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: #ef4444; padding: 30px 20px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
  .content { padding: 30px 25px; color: #333333; }
  .greeting { font-size: 18px; margin-bottom: 20px; color: #1f2937; }
  .refund-box { background-color: #fef2f2; border: 1px solid #fee2e2; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
  .refund-box h2 { color: #dc2626; margin: 0 0 10px 0; font-size: 18px; }
  .refund-box p { margin: 0; font-size: 15px; color: #991b1b; }
  .details-grid { border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 25px; }
  .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
  .detail-label { color: #6b7280; }
  .detail-value { font-weight: 600; color: #1f2937; }
  .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Booking Cancelled</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${user.userId.name || 'Traveler'},</div>
      <p>This is to confirm that your booking at <strong>${user.hotelId ? user.hotelId.name : 'your selected hotel'}</strong> has been successfully cancelled.</p>
      
      ${isRefundable ? `
      <div class="refund-box">
        <h2>Refund Information</h2>
        <p>Your payment of <strong>₹${booking.totalAmount}</strong> has been initiated for refund. You will receive the money back in your original payment method <strong>within 7 days</strong>.</p>
      </div>
      ` : ''}

      <div class="details-grid">
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span>
          <span class="detail-value">${booking._id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hotel:</span>
          <span class="detail-value">${user.hotelId ? user.hotelId.name : 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in:</span>
          <span class="detail-value">${new Date(booking.checkIn).toLocaleDateString()}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>If you didn't request this cancellation, please contact us immediately.</p>
      <p>Need help? Contact us at support@staylix.com</p>
      <p>&copy; ${new Date().getFullYear()} Staylix. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

            try {
                await sendEmail({
                    email: userEmail,
                    subject: emailSubject,
                    html: emailHtml
                });
                console.log("Cancellation email sent successfully");
            } catch (emailError) {
                console.error("Failed to send cancellation email:", emailError);
            }
        }

        res.json({
            success: true,
            message: booking.paymentStatus === "paid"
                ? "Booking cancelled and refund initiated successfully"
                : "Booking cancelled successfully",
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

exports.checkAvailability = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests } = req.body;

        if (!roomId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({
                success: false,
                message: "Room ID, check-in, check-out, and guests are required"
            });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        // Check Guest Capacity
        const maxGuests = room.guestCapacity || 1;
        if (guests > maxGuests) {
            return res.status(400).json({
                success: false,
                available: false,
                message: `This room can only accommodate up to ${maxGuests} guests`
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date"
            });
        }

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const activeBookings = await Booking.find({
            roomId,
            $or: [
                { bookingStatus: "confirmed" },
                { 
                    bookingStatus: "pending", 
                    createdAt: { $gt: tenMinutesAgo } 
                }
            ],
            checkOut: { $gt: checkInDate },
            checkIn: { $lt: checkOutDate }
        });

        const currentOccupiedRooms = activeBookings.length;
        const totalCapacity = room.totalRooms || 0;

        if (currentOccupiedRooms >= totalCapacity) {
            return res.json({
                success: true,
                available: false,
                message: `Sold out for these dates (${currentOccupiedRooms}/${totalCapacity} units occupied)`
            });
        }

        res.json({
            success: true,
            available: true,
            message: "Room is available"
        });
    } catch (error) {
        console.error("Check availability error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check availability"
        });
    }
};