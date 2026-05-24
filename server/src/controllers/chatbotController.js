const Hotel = require('../models/hotel');
const Booking = require('../models/booking');
const Discount = require('../models/discount');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const axios = require('axios');

/**
 * @desc    Handle AI-based chatbot flows via Grok
 * @route   POST /api/chat
 * @access  Public (Optional Auth)
 */
exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

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

    // 1. Gather Context Data from Database
    // Fetching active hotels, offers, and user-specific bookings to provide context to the AI
    const hotels = await Hotel.find({ isActive: true }).select('name address.city rating category amenities description').limit(15);
    const offers = await Discount.find({ isActive: true, requestStatus: 'approved' }).select('code discountType discountValue description').limit(5);
    
    let userBookings = [];
    if (user) {
      const now = new Date();
      userBookings = await Booking.find({ 
        userId: user._id, 
        checkOut: { $gt: now }, 
        bookingStatus: { $nin: ['cancelled', 'completed'] }
      }).populate('hotelId', 'name address.city').sort({ checkIn: -1 }).limit(3);
    }

    // Prepare Context String
    const contextData = {
      hotels: hotels,
      offers: offers,
      userBookings: userBookings,
      userInfo: user ? { name: user.name, email: user.email } : "Guest"
    };

    const systemPrompt = `
You are the official Staylix AI Concierge, an expert assistant for the Staylix hotel booking platform.

Your ONLY purpose is to assist users with finding hotels, booking information, and offers available on Staylix.

STRICT RULES:
1. You MUST ONLY use the context data provided below to answer user questions.
2. If a user asks a general knowledge question, coding question, or anything unrelated to Staylix hotels, bookings, or offers, politely refuse and redirect them back to Staylix-related queries.
3. Match the user's tone professionally:
   - If the user is polite, respond politely.
   - If the user is frustrated or angry, respond calmly, confidently, and slightly firm.
   - If the user uses abusive language, do NOT use abusive language back. Instead, warn them respectfully and continue helping if possible.
4. Keep responses concise and readable using line breaks.
5. If the user asks about hotels, list matching hotels from the context.
6. If the user asks about bookings, refer to the userBookings context.
7. Never invent hotels, amenities, pricing, or offers not present in the context.
8. Never generate hate speech, threats, harassment, or explicit abusive content.

EXAMPLE BEHAVIOR:
User: "Your app is useless!"
Assistant: "I understand you're frustrated. Please share the issue you're facing with your booking or hotel search, and I'll help resolve it."

User: "This booking system is trash"
Assistant: "I'm sorry the experience has been frustrating. Let me help you fix the issue quickly."

CONTEXT DATA:
${JSON.stringify(contextData)}
`;

    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is not set in environment variables.");
      return res.status(500).json({ 
        success: false, 
        message: "AI integration is not configured. Please contact admin to set GROQ_API_KEY." 
      });
    }

    // Call Groq API via Axios (Free tier - groq.com)
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile", // Fast & free LLaMA model on Groq
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3, // Low temperature for more factual responses
      max_tokens: 512
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      reply: reply,
      // You can return some quick option buttons if desired, keeping a few generic ones for UI continuity
      options: ['Main Menu', 'Talk to Human']
    });

  } catch (error) {
    console.error("Chatbot Controller Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Our AI concierge is currently busy. Please try again soon."
    });
  }
};
