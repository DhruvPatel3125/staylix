const Hotel = require('../models/hotel');
const Booking = require('../models/booking');
const Discount = require('../models/discount');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * @desc    Handle menu-based chatbot flows
 * @route   POST /api/chat
 * @access  Public (Optional Auth)
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, isAction } = req.body;
    const lowerMsg = message?.toLowerCase() || "";

    // Auth Helper (Soft Check)
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);

        // Security Check: Only for users/guests
        if (user && (user.role === 'owner' || user.role === 'admin')) {
          return res.status(403).json({
            success: false,
            message: "Chat concierge is reserved for our guests only."
          });
        }
      } catch (err) {
        // Token invalid, treat as guest
      }
    }


    let reply = "";
    let options = [];

    // --- 1. MAIN MENU & START ---
    if (lowerMsg === "main menu" || lowerMsg === "start" || lowerMsg === "hi" || lowerMsg === "hello" || lowerMsg === "hey") {
      reply = "Welcome to Staylix. How can I assist you with your luxury stay today?";
      options = ['Hotels', 'My Bookings', 'Search by City', 'Offers', 'Become an Owner', 'Support'];
    } 

    // --- 2. HOTELS FLOW & SEARCH BY CITY ---
    else if (lowerMsg.includes("hotels") || lowerMsg.includes("search by city")) {
      const availableCities = await Hotel.distinct('address.city', { isActive: true });
      if (availableCities.length > 0) {
        reply = "Explore our world-class properties. Which city are you interested in?";
        options = [...availableCities.slice(0, 8), 'Main Menu'];
      } else {
        reply = "We are currently moving to new luxury heights and will have properties available soon!";
        options = ['Main Menu'];
      }
    } 


    // --- 3. MY BOOKINGS FLOW (Restored) ---
    else if (lowerMsg.includes("my bookings")) {
      if (!user) {
        reply = "Please log in to view and manage your reservations securely.";
        options = ['Login Now', 'Main Menu'];
      } else {
        // Filter for active/upcoming bookings only
        const now = new Date();
        const bookings = await Booking.find({ 
          userId: user._id, 
          checkOut: { $gt: now }, 
          bookingStatus: { $nin: ['cancelled', 'completed'] }
        })
          .populate('hotelId')
          .sort({ checkIn: -1 })
          .limit(3);

        console.log(`[CHATBOT] User ${user._id}: Found ${bookings.length} active bookings out of total query.`);

        if (bookings.length > 0) {
          reply = `Welcome back, ${user.name}! 👋 You have ${bookings.length} active/upcoming reservation${bookings.length > 1 ? 's' : ''}:`;
          bookings.forEach((b, i) => {
            reply += `\n${i + 1}. ${b.hotelId?.name} (Check-in: ${new Date(b.checkIn).toLocaleDateString()})`;
          });
          options = ['Cancel Booking', 'Main Menu'];
        } else {
          reply = "You don't have any active bookings yet. Ready to plan your next escape?";
          options = ['Hotels', 'Main Menu'];
        }
      }
    }

    // --- 4. OFFERS FLOW (Restored) ---
    else if (lowerMsg.includes("offers")) {
      const offers = await Discount.find({ isActive: true, requestStatus: 'approved' }).limit(3);
      if (offers.length > 0) {
        reply = "Indulge in our current exclusive promotions:";
        offers.forEach(o => {
          const typeLabel = o.discountType === 'percentage' ? '%' : '₹';
          reply += `\n- ${o.code}: ${o.discountValue}${typeLabel} OFF`;
        });
        options = ['Apply Offer', 'Main Menu'];
      } else {
        reply = "Sign up for our newsletter to receive exclusive luxury offers and updates.";
        options = ['Main Menu'];
      }
    }


    // --- 5. SUPPORT FLOW ---
    else if (lowerMsg.includes("support")) {
      reply = "Our dedicated team is here to ensure your experience is seamless. How can we assist you?";
      options = ['Payment Issue', 'Booking Issue', 'Talk to Human', 'Main Menu'];
    }

    else if (lowerMsg.includes("payment issue")) {
      reply = "At Staylix, your financial security is our top priority. All transactions are encrypted and processed through secure portals. Need a manual review? Our accounts team can help.";
      options = ['Talk to Human', 'Main Menu'];
    }

    else if (lowerMsg.includes("talk to human")) {
      reply = "Our premium support team is ready to assist you personally. Contact us at help@staylix.com or +91 98765 43210.";
      options = ['Main Menu'];
    }

    else if (lowerMsg.includes("booking issue")) {
      reply = "Encountering a reservation challenge? Please check your dashboard or contact our concierge desks for immediate modification assistance.";
      options = ['Talk to Human', 'Main Menu'];
    }





    // --- 6. BECOME AN OWNER FLOW ---
    else if (lowerMsg === "become an owner") {
      reply = "Elevate your property's potential. Join our exclusive circle of luxury hosts and start welcoming guests from around the world!";
      options = ['Go to Dashboard', 'Main Menu'];
    }

    // --- 7. BACK NAVIGATION ---
    else if (lowerMsg.includes("back")) {
      reply = "How can I assist you today?";
      options = ['Hotels', 'My Bookings', 'Search by City', 'Offers', 'Become an Owner', 'Support'];
    }

    // --- 8. SPECIFIC ACTIONS ---
    else if (lowerMsg.includes("view details")) {
      reply = "To view full details and photos of our curated properties, simply click on any hotel card on our main discovery page.";
      options = ['Main Menu', 'Back'];
    }

    else if (lowerMsg.includes("filter")) {
      reply = "Refine your luxury search to find your perfect match. What criteria are most important for your stay?";
      options = ['Luxury Only', 'Budget-Friendly', 'Pet-Friendly', 'Spa & Wellness', 'Main Menu'];
    }

    else if (lowerMsg === "go to dashboard" || lowerMsg === "login now") {
      reply = "Redirecting you to the portal... You can easily access this from the top right of your screen.";
      options = ['Main Menu'];
    }

    else if (lowerMsg.includes("cancel booking")) {
      reply = "To ensure security, all cancellations must be performed directly through your User Dashboard under the 'My Bookings' section.";
      options = ['Go to Dashboard', 'Main Menu'];
    }

    else if (lowerMsg.includes("apply offer")) {
      reply = "Ready for your next escape? Just enter your discount code at the 'Payment' step during your next hotel booking.";
      options = ['Hotels', 'Main Menu'];
    }


    // --- 9. DYNAMIC CITY SELECTION & FALLBACK ---


    // --- 9. CITY SELECTION Result ---
    else {
      const citySearch = message.trim();
      const hotels = await Hotel.find({
        'address.city': { $regex: new RegExp(`^${citySearch}$`, 'i') },
        isActive: true
      }).limit(3);

      if (hotels.length > 0) {
        reply = `Fetching premium hotels in ${citySearch}... 🏨\n\nHere are our top recommendations:\n`;
        hotels.forEach((h, i) => {
          reply += `${i + 1}. ${h.name} ⭐${h.rating || 'N/A'}\n`;
        });
        options = ['View Details', '⬅ Back', '🏠 Main Menu'];
      } else {
        reply = "I'm here to help you with your Staylix experience. Would you like to explore our hotels or view your bookings?";
        options = ['🏨 Hotels', '📖 My Bookings', '🏠 Main Menu'];
      }
    }




    res.status(200).json({
      success: true,
      reply,
      options
    });
  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Our concierge desk is currently busy. Please try again soon."
    });
  }
};

