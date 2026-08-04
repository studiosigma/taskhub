import { useEffect, useState, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { STORAGE_KEYS } from '../constants';
import { safeStorage } from '../utils/storage';
import { Message } from '../types';

interface UseChatSocketOptions {
  conversationId: string;
  userId: string;
}

export function useChatSocket({ conversationId, userId }: UseChatSocketOptions) {
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [helperLocation, setHelperLocation] = useState<{ userId: string; latitude: number; longitude: number } | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Load token once
  useEffect(() => {
    safeStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN).then((t) => {
      tokenRef.current = t;
    });
  }, []);

  // Join conversation & listen for events
  useEffect(() => {
    if (!conversationId || !tokenRef.current) return;

    const socket = getSocket(tokenRef.current);
    socket.emit('joinConversation', conversationId);

    const handleNewMessage = (msg: Message) => {
      setLiveMessages((prev) => [...prev, msg]);
    };

    const handleTyping = ({ userId: uid }: { userId: string }) => {
      if (uid !== userId) setTypingUserId(uid);
    };

    const handleStopTyping = () => {
      setTypingUserId(null);
    };

    const handleMessagesRead = () => {
      setLiveMessages((prev) =>
        prev.map((msg) => ({ ...msg, isRead: true }))
      );
    };

    const handleLocationUpdate = (payload: { userId: string; latitude: number; longitude: number }) => {
      setHelperLocation(payload);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('locationUpdated', handleLocationUpdate);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('locationUpdated', handleLocationUpdate);
    };
  }, [conversationId, userId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!tokenRef.current) return;
      const socket = getSocket(tokenRef.current);
      socket.emit('sendMessage', { conversationId, content, senderId: userId });
    },
    [conversationId, userId],
  );

  const emitTyping = useCallback(() => {
    if (!tokenRef.current) return;
    const socket = getSocket(tokenRef.current);
    socket.emit('typing', { conversationId, userId });
  }, [conversationId, userId]);

  const emitStopTyping = useCallback(() => {
    if (!tokenRef.current) return;
    const socket = getSocket(tokenRef.current);
    socket.emit('stopTyping', { conversationId, userId });
  }, [conversationId, userId]);

  const emitMarkAsRead = useCallback(() => {
    if (!tokenRef.current || !conversationId) return;
    const socket = getSocket(tokenRef.current);
    socket.emit('markAsRead', { conversationId, userId });
  }, [conversationId, userId]);

  const emitLocation = useCallback(
    (payload: { conversationId: string; userId: string; latitude: number; longitude: number }) => {
      if (!tokenRef.current) return;
      const socket = getSocket(tokenRef.current);
      socket.emit('locationUpdated', payload);
    },
    [],
  );

  const resetMessages = useCallback(() => {
    setLiveMessages([]);
  }, []);

  return {
    liveMessages,
    setLiveMessages,
    typingUserId,
    helperLocation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    emitMarkAsRead,
    emitLocation,
    resetMessages,
  };
}
