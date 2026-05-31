import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, ChevronLeft, Send, Loader2, User, Inbox } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../../services/api';
import { useSocket } from '../../../hooks/useSocket';
import '../../../components/common/ChatBot/SupportChat.css';

/**
 * OwnerChatTab – shows owner's chat inbox inside the Owner Dashboard
 * Owners can see all guest conversations and reply in real-time
 */
const OwnerChatTab = () => {
  const { joinChat, leaveChat, sendMessage: socketSend, emitTyping, emitStopTyping, onEvent } = useSocket();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch owner's inbox
  const fetchInbox = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.supportChat.getOwnerInbox();
      if (res.success) setChats(res.chats);
    } catch (e) {
      console.error('fetchInbox error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Socket listeners
  useEffect(() => {
    if (!activeChat) return;

    const cleanupMsg = onEvent('new_message', ({ chatId, message }) => {
      if (chatId === activeChat._id) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      // Update last message in inbox list
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId
            ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt }
            : c
        )
      );
    });

    const cleanupTyping = onEvent('user_typing', ({ userId }) => {
      setIsTyping(true);
    });

    const cleanupStopTyping = onEvent('user_stop_typing', () => {
      setIsTyping(false);
    });

    // Listen for notifications even if not in active chat
    const cleanupNotif = onEvent('chat_notification', () => {
      fetchInbox(); // Refresh unread counts
    });

    return () => {
      cleanupMsg?.();
      cleanupTyping?.();
      cleanupStopTyping?.();
      cleanupNotif?.();
    };
  }, [activeChat, onEvent, fetchInbox]);

  const handleOpenChat = async (chat) => {
    if (activeChat) leaveChat(activeChat._id);

    setLoading(true);
    try {
      const res = await api.supportChat.getChatById(chat._id);
      if (res.success) {
        setActiveChat(res.chat);
        setMessages(res.chat.messages || []);
        joinChat(res.chat._id);
        // Clear unread in UI
        setChats((prev) =>
          prev.map((c) => (c._id === chat._id ? { ...c, ownerUnreadCount: 0 } : c))
        );
        window.dispatchEvent(new Event('update_unread_count'));
        setTimeout(() => inputRef.current?.focus(), 200);
      }
    } catch (e) {
      console.error('openChat error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (activeChat) leaveChat(activeChat._id);
    setActiveChat(null);
    setMessages([]);
    setIsTyping(false);
    fetchInbox();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || sending || !activeChat) return;

    setInputValue('');
    setSending(true);

    socketSend(activeChat._id, text);
    setSending(false);
    emitStopTyping(activeChat._id);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    emitTyping(activeChat?._id);
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => emitStopTyping(activeChat?._id), 1500);
    setTypingTimeout(t);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const totalUnread = chats.reduce((sum, c) => sum + (c.ownerUnreadCount || 0), 0);

  // ─── Inbox List View ─────────────────────────────────────────────────────

  if (!activeChat) {
    return (
      <div className="owner-inbox-tab">
        <div className="owner-inbox-header">
          <h2 className="owner-inbox-title">
            <MessageSquare size={20} />
            Guest Messages
            {totalUnread > 0 && (
              <span className="unread-badge">{totalUnread}</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="owner-chat-empty">
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} /> 
            <p>Loading conversations...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="owner-inbox-empty">
            <Inbox size={48} />
            <p>No messages yet</p>
            <span>When guests contact you, their messages will appear here.</span>
          </div>
        ) : (
          <div className="owner-inbox-list">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`owner-chat-card ${chat.ownerUnreadCount > 0 ? 'has-unread' : ''}`}
                id={`owner-chat-${chat._id}`}
                onClick={() => handleOpenChat(chat)}
              >
                <div className="owner-chat-card-top">
                  <div className="owner-chat-user">
                    <div className="owner-chat-avatar">
                      {chat.userId?.name?.[0]?.toUpperCase() || 'G'}
                    </div>
                    <div>
                      <div className="owner-chat-name">{chat.userId?.name || 'Guest'}</div>
                      <div className="owner-chat-hotel">{chat.hotelId?.name}</div>
                    </div>
                  </div>
                  <div className="owner-chat-meta">
                    <span className="owner-chat-time">{formatTime(chat.lastMessageAt)}</span>
                    {chat.ownerUnreadCount > 0 && (
                      <span className="owner-chat-unread-count">{chat.ownerUnreadCount}</span>
                    )}
                  </div>
                </div>
                {chat.lastMessage && (
                  <p className="owner-chat-preview">{chat.lastMessage}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Active Chat Panel ───────────────────────────────────────────────────

  const userName = activeChat.userId?.name || 'Guest';
  const hotelName = activeChat.hotelId?.name || '';

  return (
    <div className="owner-chat-panel">
      <button className="owner-chat-back" onClick={handleBack} id="owner-chat-back-btn">
        <ChevronLeft size={16} /> Back to Inbox
      </button>

      <div className="owner-chat-panel-header">
        <div className="owner-panel-avatar">{userName[0]?.toUpperCase()}</div>
        <div>
          <p className="owner-panel-name">{userName}</p>
          <p className="owner-panel-hotel">{hotelName}</p>
        </div>
      </div>

      <div className="owner-messages-area" id="owner-messages-area">
        {messages.length === 0 && (
          <div className="owner-chat-empty">
            <p>No messages yet. Reply to start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          // Use senderId comparison for accurate real-time alignment.
          // Relying only on senderRole can cause left-side display on fresh sends
          const senderId = msg.senderId?._id || msg.senderId;
          const isMe = senderId?.toString() === currentUser?._id?.toString() ||
                       msg.senderRole === 'owner'; // fallback for DB-loaded messages
          return (
            <div key={msg._id} className={`owner-message-row ${isMe ? 'me' : 'them'}`}>
              {!isMe && (
                <div className="owner-msg-avatar" title={userName}>
                  <User size={12} />
                </div>
              )}
              <div className={`owner-bubble ${isMe ? 'me' : 'them'}`}>
                <span>{msg.text}</span>
                <span className="owner-msg-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="owner-message-row them">
            <div className="owner-msg-avatar"><User size={12} /></div>
            <div className="owner-bubble them typing-bubble">
              <span className="sc-dots"><span /><span /><span /></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="owner-msg-input-row" onSubmit={handleSend} id="owner-msg-form">
        <input
          ref={inputRef}
          id="owner-msg-input"
          type="text"
          className="owner-msg-input"
          placeholder={`Reply to ${userName}...`}
          value={inputValue}
          onChange={handleInputChange}
          disabled={sending}
          maxLength={1000}
          autoComplete="off"
        />
        <button
          id="owner-msg-send-btn"
          type="submit"
          className={`owner-msg-send-btn ${inputValue.trim() ? 'active' : ''}`}
          disabled={!inputValue.trim() || sending}
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};

export default OwnerChatTab;
