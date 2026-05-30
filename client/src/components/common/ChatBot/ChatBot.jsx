import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, X, Send, Loader2, Home, ChevronLeft,
  Sparkles, Mic, RefreshCw, UserCheck
} from 'lucide-react';

import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../../../services/api';
import SupportChatWindow from './SupportChatWindow';
import './ChatBot.css';

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: "Hi! I'm your Staylix AI Concierge ✨\n\nI can help you with:\n• Finding hotels in any city\n• Your active bookings\n• Current offers & deals\n• Booking support\n\nAsk me anything!",
    sender: 'bot',
    timestamp: new Date()
  }
];

const QUICK_PROMPTS = [
  'Show me hotels in Mumbai',
  'What offers are available?',
  'View my bookings',
  'Talk to human support',
];

// Simple markdown-like renderer for bot messages
const BotMessage = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="bot-message-content">
      {lines.map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <div key={i} className="bot-list-item">{line.replace(/^[•\-]\s/, '')}</div>;
        }
        if (line.match(/^\d+\./)) {
          return <div key={i} className="bot-numbered-item">{line}</div>;
        }
        if (line === '') return <div key={i} className="bot-spacer" />;
        return <p key={i} className="bot-text-line">{line}</p>;
      })}
    </div>
  );
};

const ChatBot = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Reset chat when user logs in or out
  useEffect(() => {
    setMessages(INITIAL_MESSAGES);
    setShowQuickPrompts(true);
    setIsOpen(false);
    setShowSupportChat(false);
  }, [user?._id, isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    sendMessage(text);
  };

  const handleQuickPrompt = (prompt) => {
    if (isLoading) return;
    setShowQuickPrompts(false);
    sendMessage(prompt);
  };

  // Check if user wants to talk to owner/human
  const isTalkToOwnerIntent = (text) => {
    const lower = text.toLowerCase();
    return (
      lower.includes('talk to owner') ||
      lower.includes('talk to human') ||
      lower.includes('human support') ||
      lower.includes('speak to owner') ||
      lower.includes('contact owner') ||
      lower.includes('owner se baat') ||
      lower.includes('owner ko contact') ||
      lower.includes('real person')
    );
  };

  const sendMessage = async (text) => {
    if (isLoading) return;

    setShowQuickPrompts(false);

    // Add user message
    const userMsg = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Navigation shortcuts
    const lower = text.toLowerCase();
    if (lower.includes('dashboard') || lower.includes('my account')) {
      setTimeout(() => {
        setIsLoading(false);
        navigate('/user-dashboard');
        setIsOpen(false);
      }, 300);
      return;
    }

    // ── Talk to Owner shortcut ──────────────────────────────────────────────
    if (isTalkToOwnerIntent(text)) {
      if (!isAuthenticated) {
        const botResponse = {
          id: Date.now() + 1,
          text: "To chat with a property owner, you need to be logged in first.\n\nPlease log in and then use the 'Talk to Owner' option.",
          options: [],
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        return;
      }

      const botResponse = {
        id: Date.now() + 1,
        text: "Sure! I'll connect you with the property owner. You can select the hotel below and start chatting directly. 🏨",
        options: [],
        sender: 'bot',
        timestamp: new Date(),
        showOwnerChatBtn: true
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: text
      }, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      const botResponse = {
        id: Date.now() + 1,
        text: response.data.reply,
        options: response.data.options || [],
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const isApiError = error.response?.status === 500;
      const errorMessage = {
        id: Date.now() + 1,
        text: isApiError
          ? "I'm having trouble connecting to the AI right now. Please try again in a moment, or contact support at help@staylix.com."
          : "Something went wrong. Please try again!",
        options: [],
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setShowQuickPrompts(true);
  };

  // Hide for Owners and Admins
  if (isAuthenticated && user && (user.role === 'owner' || user.role === 'admin')) {
    return null;
  }

  return (
    <>
      <div className="staylix-chatbot-container">
        {/* FAB Button */}
        <button
          id="chatbot-fab-btn"
          className={`chatbot-fab ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Concierge"
        >
          {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
          {!isOpen && <span className="pulse-dot" />}
        </button>

        {/* Chat Window */}
        <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>

          {/* Header */}
          <div className="chatbot-header">
            <div className="header-info">
              <div className="header-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <h3>Staylix AI Concierge</h3>
                <span className="online-status">
                  <span className="online-dot" />
                  Powered by Grok AI
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn-prem" onClick={handleReset} title="New Chat">
                <RefreshCw size={16} />
              </button>
              <button className="icon-btn-prem" onClick={() => setIsOpen(false)} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" id="chatbot-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="bot-avatar-sm">
                    <Sparkles size={12} />
                  </div>
                )}
                <div className="message-bubble-wrap">
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.sender === 'bot' ? (
                      <BotMessage text={msg.text} />
                    ) : (
                      <span>{msg.text}</span>
                    )}
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* "Open Owner Chat" button embedded in bot message */}
                  {msg.showOwnerChatBtn && (
                    <button
                      id="open-owner-chat-btn"
                      className="owner-chat-trigger-btn"
                      onClick={() => {
                        setShowSupportChat(true);
                        setIsOpen(false);
                      }}
                    >
                      <UserCheck size={15} />
                      Chat with Property Owner
                    </button>
                  )}

                  {/* Quick action options from AI response */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="options-container">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          className="option-chip"
                          onClick={() => {
                            if (opt.toLowerCase().includes('owner') || opt.toLowerCase().includes('human')) {
                              if (isAuthenticated) {
                                setShowSupportChat(true);
                                setIsOpen(false);
                              } else {
                                handleQuickPrompt(opt);
                              }
                            } else {
                              handleQuickPrompt(opt);
                            }
                          }}
                          disabled={isLoading}
                          id={`option-btn-${idx}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="message-row bot">
                <div className="bot-avatar-sm">
                  <Sparkles size={12} />
                </div>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* Quick Prompts (only on fresh chat) */}
            {showQuickPrompts && !isLoading && messages.length === 1 && (
              <div className="quick-prompts-section">
                <p className="quick-prompts-label">Quick questions</p>
                <div className="quick-prompts-grid">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      className="quick-prompt-card"
                      onClick={() => handleQuickPrompt(prompt)}
                      id={`quick-prompt-${i}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <form onSubmit={handleSendMessage} className="input-form">
              <input
                ref={inputRef}
                id="chatbot-text-input"
                type="text"
                className="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything about Staylix..."
                disabled={isLoading}
                maxLength={500}
                autoComplete="off"
              />
              <button
                id="chatbot-send-btn"
                type="submit"
                className={`send-btn ${inputValue.trim() && !isLoading ? 'active' : ''}`}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
            <p className="input-disclaimer">AI responses are based on Staylix data only</p>
          </div>
        </div>
      </div>

      {/* Support Chat Window (User ↔ Owner) */}
      {showSupportChat && (
        <SupportChatWindow onClose={() => setShowSupportChat(false)} />
      )}
    </>
  );
};

export default ChatBot;


