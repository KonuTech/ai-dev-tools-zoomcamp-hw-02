import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

/**
 * Custom hook to manage Socket.IO connection and real-time collaboration
 */
export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('room-state', (state) => {
      setRoomState({
        code: state.code,
        language: state.language
      });
      setUsers(state.users || []);
    });

    socket.on('code-update', ({ code }) => {
      setRoomState(prev => prev ? { ...prev, code } : { code, language: 'javascript' });
    });

    socket.on('language-update', ({ language }) => {
      setRoomState(prev => prev ? { ...prev, language } : { code: '', language });
    });

    socket.on('user-joined', ({ userId, username }) => {
      setUsers(prev => [...prev, { userId, username }]);
    });

    socket.on('user-left', ({ userId }) => {
      setUsers(prev => prev.filter(u => u.userId !== userId));
    });

    socket.on('cursor-update', ({ userId, position }) => {
      // Will be used in Phase 3 with Monaco Editor
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join a room
  const joinRoom = useCallback((roomId, userId, username) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomId, userId, username });
    }
  }, []);

  // Send code changes
  const sendCodeChange = useCallback((roomId, code) => {
    if (socketRef.current) {
      socketRef.current.emit('code-change', { roomId, code });
    }
  }, []);

  // Send language change
  const changeLanguage = useCallback((roomId, language) => {
    if (socketRef.current) {
      socketRef.current.emit('language-change', { roomId, language });
    }
  }, []);

  // Send cursor position
  const sendCursorPosition = useCallback((roomId, position) => {
    if (socketRef.current) {
      socketRef.current.emit('cursor-position', { roomId, position });
    }
  }, []);

  return {
    connected,
    roomState,
    users,
    joinRoom,
    sendCodeChange,
    changeLanguage,
    sendCursorPosition
  };
}
