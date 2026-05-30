const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const SupportChat = require('./models/supportChat');

let io;

/**
 * Initialize Socket.io server
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL]
      : [/localhost:\d+$/, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // ─── Auth Middleware ────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // ─── Connection Handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] Connected: ${user.name} (${user.role}) [${socket.id}]`);

    // Join user's personal room so we can target notifications to them
    socket.join(`user:${user._id}`);

    // ─── Join a specific chat room ──────────────────────────────────────────
    socket.on('join_chat', async ({ chatId }) => {
      try {
        const chat = await SupportChat.findById(chatId);
        if (!chat) return socket.emit('error', { message: 'Chat not found' });

        const userId = user._id.toString();
        const isParticipant =
          chat.userId.toString() === userId ||
          chat.ownerId.toString() === userId;

        if (!isParticipant) return socket.emit('error', { message: 'Access denied' });

        socket.join(`chat:${chatId}`);
        socket.emit('chat_joined', { chatId });

        // Mark messages as read on join
        const isUser = chat.userId.toString() === userId;
        if (isUser && chat.userUnreadCount > 0) {
          await SupportChat.findByIdAndUpdate(chatId, { userUnreadCount: 0 });
        } else if (!isUser && chat.ownerUnreadCount > 0) {
          await SupportChat.findByIdAndUpdate(chatId, { ownerUnreadCount: 0 });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // ─── Send a message ─────────────────────────────────────────────────────
    socket.on('send_message', async ({ chatId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const chat = await SupportChat.findById(chatId);
        if (!chat) return socket.emit('error', { message: 'Chat not found' });

        const userId = user._id.toString();
        const isUser = chat.userId.toString() === userId;
        const isOwner = chat.ownerId.toString() === userId;

        if (!isUser && !isOwner) return socket.emit('error', { message: 'Access denied' });

        const newMessage = {
          senderId: user._id,
          senderRole: isUser ? 'user' : 'owner',
          text: text.trim(),
          createdAt: new Date()
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

        const savedMsg = chat.messages[chat.messages.length - 1];

        // Broadcast to everyone in the chat room
        io.to(`chat:${chatId}`).emit('new_message', {
          chatId,
          message: {
            ...savedMsg.toObject(),
            senderName: user.name
          }
        });

        // Send notification to the OTHER participant's personal room
        const recipientId = isUser ? chat.ownerId.toString() : chat.userId.toString();
        io.to(`user:${recipientId}`).emit('chat_notification', {
          chatId,
          senderName: user.name,
          senderRole: isUser ? 'user' : 'owner',
          text: text.trim(),
          hotelId: chat.hotelId
        });

      } catch (err) {
        console.error('[Socket] send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Leave chat room ────────────────────────────────────────────────────
    socket.on('leave_chat', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
    });

    // ─── Typing indicator ───────────────────────────────────────────────────
    socket.on('typing', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: user._id,
        name: user.name
      });
    });

    socket.on('stop_typing', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('user_stop_typing', { userId: user._id });
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${user.name} [${socket.id}]`);
    });
  });

  console.log('[Socket.io] Server initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
