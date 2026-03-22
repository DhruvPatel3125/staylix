import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Home, ChevronLeft,
  Hotel, Calendar, MapPin, Tag, Briefcase, HelpCircle, LogIn, LayoutDashboard, Trash2, Filter, Search
} from 'lucide-react';

import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../../../services/api';
import './ChatBot.css';


const INITIAL_MESSAGES = [
  {
    id: 1,
    text: "Welcome to Staylix. How can I assist you with your luxury stay today?",
    options: ['Hotels', 'My Bookings', 'Search by City', 'Offers', 'Become an Owner', 'Support'],
    sender: 'bot',
    timestamp: new Date()
  }
];

const ChatBot = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Reset chat when user logs in or out
  useEffect(() => {
    setMessages(INITIAL_MESSAGES);
    setIsOpen(false);
  }, [user?._id, isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue('');
    handleAction(text);
  };

  const handleOptionClick = (option) => {
    handleAction(option, true);
  };

  const getOptionIcon = (option) => {

    const opt = option.toLowerCase();
    if (opt.includes('hotel')) return <Hotel size={14} />;
    if (opt.includes('booking')) return <Calendar size={14} />;
    if (opt.includes('city')) return <MapPin size={14} />;
    if (opt.includes('offer')) return <Tag size={14} />;
    if (opt.includes('owner')) return <Briefcase size={14} />;
    if (opt.includes('support')) return <HelpCircle size={14} />;
    if (opt.includes('login')) return <LogIn size={14} />;
    if (opt.includes('dashboard')) return <LayoutDashboard size={14} />;
    if (opt.includes('cancel')) return <Trash2 size={14} />;
    if (opt.includes('filter')) return <Filter size={14} />;
    if (opt.includes('main menu')) return <Home size={14} />;
    if (opt.includes('back')) return <ChevronLeft size={14} />;
    return <Search size={14} />; // Default for cities
  };

  const handleAction = async (actionText, isButton = false) => {
    if (isLoading) return;

    // Add user message to UI
    const userMsg = {
      id: Date.now(),
      text: actionText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // --- Navigation Actions (Instant) ---
    if (isButton) {
      const lowerAction = actionText.toLowerCase();
      if (lowerAction.includes('go to dashboard')) {
        setIsLoading(false);
        navigate('/user-dashboard');
        setIsOpen(false);
        return;
      }
      if (lowerAction.includes('book now')) {
        setIsLoading(false);
        navigate('/');
        setIsOpen(false);
        return;
      }
    }


    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, { 
        message: actionText,
        isAction: isButton 
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having a bit of trouble reaching the concierge desk. Please try again or visit our Contact page.",
        options: ['Main Menu'],
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {

    handleOptionClick('Main Menu');
  };

  // Hide for Owners and Admins
  if (isAuthenticated && user && (user.role === 'owner' || user.role === 'admin')) {
    return null;
  }

  return (
    <div className="staylix-chatbot-container">
      <button 
        className={`chatbot-fab ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && <span className="pulse-dot"></span>}
      </button>

      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="header-info">
            <div>
              <h3>Staylix Concierge</h3>
              <span className="online-status">Online Assistant</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn-prem" onClick={() => handleOptionClick('Back')} title="Back"><ChevronLeft size={18} /></button>
            <button className="icon-btn-prem" onClick={handleReset} title="Main Menu"><Home size={18} /></button>
            <button className="icon-btn-prem" onClick={() => setIsOpen(false)} title="Close"><X size={18} /></button>
          </div>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-group ${msg.sender}`}>
              <div className={`message-wrapper ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.text}
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              {msg.options && msg.options.length > 0 && (
                <div className="options-container">
                  {msg.options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      className="menu-option-btn-prem"
                      onClick={() => handleOptionClick(opt)}
                      disabled={isLoading}
                    >
                      {getOptionIcon(opt)}
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="message-wrapper bot">
              <div className="message-bubble loading">
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-footer-minimal">
          <p>Select an option above to continue</p>
        </div>
      </div>
    </div>
  );
};


export default ChatBot;

