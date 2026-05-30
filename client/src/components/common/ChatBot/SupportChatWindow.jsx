import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader2, MessageCircle, ChevronLeft, Hotel, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../../services/api';
import { useSocket } from '../../../hooks/useSocket';
import { getImageUrl } from '../../../utils/imageUrl';
import './SupportChat.css';

/**
 * SupportChatWindow – floating chat panel for users to talk to hotel owner
 * Triggered from ChatBot when user clicks "Talk to Owner"
 */
const SupportChatWindow = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const { joinChat, leaveChat, sendMessage: socketSend, emitTyping, emitStopTyping, onEvent } = useSocket();

  const [step, setStep] = useState('select'); // 'select' | 'chat'
  const [hotels, setHotels] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch booked hotels on mount
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await api.supportChat.getBookedHotels();
        if (res.success) setHotels(res.hotels);
      } catch (e) {
        console.error('fetchHotels error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Socket event listeners for the active chat
  useEffect(() => {
    if (!currentChat) return;

    const cleanupMsg = onEvent('new_message', ({ chatId, message }) => {
      if (chatId === currentChat._id) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    const cleanupTyping = onEvent('user_typing', ({ userId }) => {
      if (userId !== user._id) setIsTyping(true);
    });

    const cleanupStopTyping = onEvent('user_stop_typing', ({ userId }) => {
      if (userId !== user._id) setIsTyping(false);
    });

    return () => {
      cleanupMsg?.();
      cleanupTyping?.();
      cleanupStopTyping?.();
    };
  }, [currentChat, onEvent, user._id]);

  const handleSelectHotel = async (hotelId) => {
    setLoading(true);
    try {
      const res = await api.supportChat.startChat(hotelId);
      if (res.success) {
        const chat = res.chat;
        setCurrentChat(chat);
        setMessages(chat.messages || []);
        setStep('chat');
        joinChat(chat._id);
        setTimeout(() => inputRef.current?.focus(), 200);
      }
    } catch (e) {
      console.error('startChat error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentChat) {
      leaveChat(currentChat._id);
    }
    setCurrentChat(null);
    setMessages([]);
    setStep('select');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || sending || !currentChat) return;

    setInputValue('');
    setSending(true);

    // Emit via socket
    socketSend(currentChat._id, text);

    setSending(false);
    emitStopTyping(currentChat._id);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    emitTyping(currentChat?._id);
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => emitStopTyping(currentChat?._id), 1500);
    setTypingTimeout(t);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const ownerName = currentChat?.ownerId?.name || 'Property Owner';
  const hotelName = currentChat?.hotelId?.name || '';

  return (
    <div className="support-chat-window" id="support-chat-window">
      {/* Header */}
      <div className="sc-header">
        <div className="sc-header-left">
          {step === 'chat' && (
            <button className="sc-back-btn" onClick={handleBack} id="sc-back-btn">
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="sc-header-avatar">
            <MessageCircle size={16} />
          </div>
          <div>
            <h3>{step === 'chat' ? ownerName : 'Talk to Owner'}</h3>
            {step === 'chat' && <span className="sc-hotel-label">{hotelName}</span>}
            {step === 'select' && <span className="sc-hotel-label">Select a property</span>}
          </div>
        </div>
        <button className="sc-close-btn" onClick={onClose} id="sc-close-btn">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      {step === 'select' && (
        <div className="sc-select-body">
          {loading ? (
            <div className="sc-loading"><Loader2 size={24} className="animate-spin" /> Loading your hotels...</div>
          ) : hotels.length === 0 ? (
            <div className="sc-empty">
              <Hotel size={40} />
              <p>No bookings found.</p>
              <span>You can chat with an owner after booking a hotel.</span>
            </div>
          ) : (
            <>
              <p className="sc-select-hint">Choose a hotel to contact the owner:</p>
              <div className="sc-hotel-list">
                {hotels.map((hotel) => (
                  <button
                    key={hotel._id}
                    className="sc-hotel-item"
                    id={`sc-hotel-${hotel._id}`}
                    onClick={() => handleSelectHotel(hotel._id)}
                  >
                    <div className="sc-hotel-thumb">
                      {hotel.photos?.[0] ? (
                        <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} />
                      ) : (
                        <Hotel size={20} />
                      )}
                    </div>
                    <div className="sc-hotel-info">
                      <span className="sc-hotel-name">{hotel.name}</span>
                      <span className="sc-hotel-city">{hotel.address?.city}, {hotel.address?.country}</span>
                    </div>
                    <span className="sc-hotel-owner">by {hotel.ownerId?.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === 'chat' && (
        <>
          <div className="sc-messages" id="sc-messages-area">
            {messages.length === 0 && (
              <div className="sc-chat-empty">
                <p>Start the conversation with <strong>{ownerName}</strong>!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderRole === 'user';
              return (
                <div key={msg._id} className={`sc-message-row ${isMe ? 'me' : 'them'}`}>
                  {!isMe && (
                    <div className="sc-msg-avatar">
                      <User size={12} />
                    </div>
                  )}
                  <div className={`sc-bubble ${isMe ? 'me' : 'them'} ${msg.optimistic ? 'optimistic' : ''}`}>
                    <span>{msg.text}</span>
                    <span className="sc-msg-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="sc-message-row them">
                <div className="sc-msg-avatar"><User size={12} /></div>
                <div className="sc-bubble them typing-bubble">
                  <span className="sc-dots"><span /><span /><span /></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="sc-input-area" onSubmit={handleSend} id="sc-input-form">
            <input
              ref={inputRef}
              id="sc-message-input"
              type="text"
              className="sc-input"
              placeholder={`Message ${ownerName}...`}
              value={inputValue}
              onChange={handleInputChange}
              disabled={sending}
              maxLength={1000}
              autoComplete="off"
            />
            <button
              id="sc-send-btn"
              type="submit"
              className={`sc-send-btn ${inputValue.trim() ? 'active' : ''}`}
              disabled={!inputValue.trim() || sending}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default SupportChatWindow;
