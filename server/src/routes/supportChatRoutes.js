const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middlewares/authMiddleWare');
const {
  startChat,
  getChatById,
  getUserChats,
  getOwnerInbox,
  sendMessage,
  getBookedHotels,
  getUnreadCount
} = require('../controllers/supportChatController');

// User-specific routes
router.post('/start', protect, checkRole('user'), startChat);
router.get('/user/my-chats', protect, checkRole('user'), getUserChats);
router.get('/user/bookable-hotels', protect, checkRole('user'), getBookedHotels);

// Owner-specific routes
router.get('/owner/inbox', protect, checkRole('owner'), getOwnerInbox);

// Shared routes (user + owner)
router.get('/unread-count', protect, getUnreadCount);
router.get('/:chatId', protect, getChatById);
router.post('/:chatId/message', protect, sendMessage);

module.exports = router;
