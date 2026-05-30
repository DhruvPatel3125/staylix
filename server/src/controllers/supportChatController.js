const SupportChat = require('../models/supportChat');
const Hotel = require('../models/hotel');
const Booking = require('../models/booking');
const User = require('../models/user');

/**
 * @desc    User initiates a chat with the owner of a hotel they've booked
 * @route   POST /api/support-chat/start
 * @access  Private (User only)
 */
exports.startChat = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const userId = req.user._id;

    if (!hotelId) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required.' });
    }

    // Find the hotel to get the owner
    const hotel = await Hotel.findById(hotelId).populate('ownerId', 'name email');
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const ownerId = hotel.ownerId._id;

    // Check if chat already exists
    let chat = await SupportChat.findOne({ userId, ownerId, hotelId })
      .populate('userId', 'name profileImage')
      .populate('ownerId', 'name profileImage')
      .populate('hotelId', 'name');

    if (!chat) {
      // Create new chat
      chat = await SupportChat.create({
        userId,
        ownerId,
        hotelId,
        messages: []
      });
      chat = await SupportChat.findById(chat._id)
        .populate('userId', 'name profileImage')
        .populate('ownerId', 'name profileImage')
        .populate('hotelId', 'name');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('startChat error:', error);
    res.status(500).json({ success: false, message: 'Failed to start support chat.' });
  }
};

/**
 * @desc    Get chat by ID (with messages)
 * @route   GET /api/support-chat/:chatId
 * @access  Private (User or Owner involved in that chat)
 */
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id.toString();

    const chat = await SupportChat.findById(chatId)
      .populate('userId', 'name profileImage')
      .populate('ownerId', 'name profileImage')
      .populate('hotelId', 'name');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found.' });
    }

    // Authorization check
    const isParticipant =
      chat.userId._id.toString() === userId ||
      chat.ownerId._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Mark messages as read for the current user
    const isUser = chat.userId._id.toString() === userId;
    if (isUser && chat.userUnreadCount > 0) {
      await SupportChat.findByIdAndUpdate(chatId, {
        userUnreadCount: 0,
        $set: { 'messages.$[msg].isRead': true }
      }, {
        arrayFilters: [{ 'msg.senderRole': 'owner', 'msg.isRead': false }]
      });
      chat.userUnreadCount = 0;
    } else if (!isUser && chat.ownerUnreadCount > 0) {
      await SupportChat.findByIdAndUpdate(chatId, {
        ownerUnreadCount: 0,
        $set: { 'messages.$[msg].isRead': true }
      }, {
        arrayFilters: [{ 'msg.senderRole': 'user', 'msg.isRead': false }]
      });
      chat.ownerUnreadCount = 0;
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('getChatById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat.' });
  }
};

/**
 * @desc    Get all chats for the logged-in user (guest side)
 * @route   GET /api/support-chat/user/my-chats
 * @access  Private (User)
 */
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await SupportChat.find({ userId })
      .populate('ownerId', 'name profileImage')
      .populate('hotelId', 'name')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('getUserChats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chats.' });
  }
};

/**
 * @desc    Get all chats for the logged-in owner (owner side inbox)
 * @route   GET /api/support-chat/owner/inbox
 * @access  Private (Owner)
 */
exports.getOwnerInbox = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const chats = await SupportChat.find({ ownerId })
      .populate('userId', 'name profileImage email')
      .populate('hotelId', 'name')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('getOwnerInbox error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inbox.' });
  }
};

/**
 * @desc    Send a message via REST (fallback if socket not connected)
 * @route   POST /api/support-chat/:chatId/message
 * @access  Private (User or Owner in that chat)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user._id.toString();

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const chat = await SupportChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found.' });
    }

    const isUser = chat.userId.toString() === userId;
    const isOwner = chat.ownerId.toString() === userId;

    if (!isUser && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const newMessage = {
      senderId: req.user._id,
      senderRole: isUser ? 'user' : 'owner',
      text: text.trim()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = text.trim();
    chat.lastMessageAt = new Date();

    if (isUser) {
      chat.ownerUnreadCount += 1;
    } else {
      chat.userUnreadCount += 1;
    }

    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

/**
 * @desc    Get hotels the user has booked (to start a support chat)
 * @route   GET /api/support-chat/user/bookable-hotels
 * @access  Private (User)
 */
exports.getBookedHotels = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .populate({
        path: 'hotelId',
        select: 'name ownerId photos address',
        populate: { path: 'ownerId', select: 'name' }
      })
      .select('hotelId');

    // Unique hotels only
    const seen = new Set();
    const hotels = [];
    for (const b of bookings) {
      if (b.hotelId && !seen.has(b.hotelId._id.toString())) {
        seen.add(b.hotelId._id.toString());
        hotels.push(b.hotelId);
      }
    }

    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error('getBookedHotels error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotels.' });
  }
};

/**
 * @desc    Get total unread count for a user (for notification badge)
 * @route   GET /api/support-chat/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    let totalUnread = 0;

    if (userRole === 'owner') {
      const result = await SupportChat.aggregate([
        { $match: { ownerId: req.user._id } },
        { $group: { _id: null, total: { $sum: '$ownerUnreadCount' } } }
      ]);
      totalUnread = result[0]?.total || 0;
    } else {
      const result = await SupportChat.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: null, total: { $sum: '$userUnreadCount' } } }
      ]);
      totalUnread = result[0]?.total || 0;
    }

    res.status(200).json({ success: true, unreadCount: totalUnread });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ success: false, message: 'Failed to get unread count.' });
  }
};
