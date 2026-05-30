import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../services/api';

let globalSocket = null;

/**
 * Singleton socket hook – connects once per session, reuses the connection.
 * Returns the socket instance and helper methods.
 */
export const useSocket = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Reuse existing connection
    if (globalSocket && globalSocket.connected) {
      socketRef.current = globalSocket;
      return;
    }

    globalSocket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    globalSocket.on('connect', () => {
      console.log('[Socket] Connected:', globalSocket.id);
    });

    globalSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socketRef.current = globalSocket;

    return () => {
      // Don't disconnect on unmount – keep singleton alive
    };
  }, [isAuthenticated, user]);

  const joinChat = useCallback((chatId) => {
    socketRef.current?.emit('join_chat', { chatId });
  }, []);

  const leaveChat = useCallback((chatId) => {
    socketRef.current?.emit('leave_chat', { chatId });
  }, []);

  const sendMessage = useCallback((chatId, text) => {
    socketRef.current?.emit('send_message', { chatId, text });
  }, []);

  const emitTyping = useCallback((chatId) => {
    socketRef.current?.emit('typing', { chatId });
  }, []);

  const emitStopTyping = useCallback((chatId) => {
    socketRef.current?.emit('stop_typing', { chatId });
  }, []);

  const onEvent = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return {
    socket: socketRef.current,
    joinChat,
    leaveChat,
    sendMessage,
    emitTyping,
    emitStopTyping,
    onEvent,
  };
};
