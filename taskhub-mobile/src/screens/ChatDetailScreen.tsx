import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { chatsApi } from '../services';
import { Message, User, Task } from '../types';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatBubble } from '../components/ui/ChatBubble';
import { ChatInput } from '../components/ui/ChatInput';
import { useChatSocket } from '../hooks/useChatSocket';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { TaskMapView } from '../components/ui/TaskMapView';

export const ChatDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { conversationId, otherUser, task: routeTask } = route.params || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Tracking hook
  useLocationTracking(conversationId, user?.id || '', true);

  const flatListRef = useRef<FlatList<Message>>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const data = await chatsApi.getMessages(conversationId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('fetchMessages error', e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      return () => { setLiveMessages([]); };
    }, [fetchMessages])
  );

  const {
    liveMessages,
    setLiveMessages,
    typingUserId,
    helperLocation,
    sendMessage: sendSocketMessage,
    emitTyping,
    emitStopTyping,
    emitMarkAsRead,
  } = useChatSocket({ conversationId: conversationId || '', userId: user?.id || '' });

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages.filter(m => !m.isRead && m.senderId !== user.id);
      if (unreadMessages.length > 0) {
        setMessages(prev => prev.map(m =>
          unreadMessages.some(um => um.id === m.id) ? { ...m, isRead: true } : m
        ));
        emitMarkAsRead();
        chatsApi.markAsRead(conversationId).catch(() => {});
      }
    }
    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, user, conversationId, emitMarkAsRead]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || sending || !conversationId) return;
    const content = newMessage.trim();

    // Optimistic message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: conversationId || '',
      senderId: user?.id || '',
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: user ?? undefined,
      isOptimistic: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);

    try {
      await chatsApi.sendMessage(conversationId || '', content);
      // Socket will receive the real message, replace optimistic
    } catch (e) {
      console.warn('sendMessage fallback error', e);
      // Remove optimistic on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.show({ type: 'error', title: 'Gagal', message: 'Pesan gagal terkirim, coba lagi' });
    } finally {
      setSending(false);
    }
  }, [conversationId, newMessage, user, sending, toast]);

  // Replace optimistic message with real one when received via socket
  useEffect(() => {
    if (liveMessages.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = liveMessages.filter((m) => !existingIds.has(m.id));

      // Replace optimistic messages with real ones
      const withoutOptimistic = prev.filter(m => !m.isOptimistic);
      return [...withoutOptimistic, ...newOnes];
    });
  }, [liveMessages]);

  const handleTyping = useCallback(() => {
    emitTyping();
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => emitStopTyping(), 1500);
    setTypingTimeout(t);
  }, [emitTyping, emitStopTyping, typingTimeout]);

  const formatTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (msg: Message) => msg.senderId === user?.id;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue600} />
        <Text style={styles.loadingText}>Memuat pesan...</Text>
      </View>
    );
  }

  const contactName = otherUser?.fullName || 'Andi';
  const conversationTask = routeTask || (messages.find(m => m.task)?.task);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Contact Header Bar */}
      <View style={[styles.chatHeaderBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerAvatarContainer}>
          <Image
            source={{ uri: otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }}
            style={styles.headerAvatar}
          />
          <View style={styles.onlineBadge} />
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerNameText}>{contactName}</Text>
          <Text style={styles.headerStatusText}>Online</Text>
        </View>

        <View style={styles.headerActionBtns}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="call-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Attached Task Card Banner (Dynamic) */}
      {conversationTask && (
        <View style={styles.attachedTaskCard}>
          <Image
            source={{ uri: conversationTask.photos?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&q=80' }}
            style={styles.attachedTaskThumb}
          />
          <View style={styles.attachedTaskInfo}>
            <Text style={styles.attachedTaskTitle} numberOfLines={1}>
              {conversationTask.title}
            </Text>
            <Text style={styles.attachedTaskPrice}>
              Rp{Number(conversationTask.budget).toLocaleString('id-ID')} / orang
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.attachedTaskLink}>Lihat Detail</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Tracking */}
      {helperLocation && (
        <View style={styles.mapContainer}>
          <TaskMapView
            helperLocation={{ latitude: helperLocation.latitude, longitude: helperLocation.longitude }}
          />
        </View>
      )}

      {/* Typing Indicator */}
      {typingUserId && typingUserId !== user?.id && (
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: 4 }}>
          <Text style={{ fontSize: 11, color: COLORS.slate500, fontStyle: 'italic' }}>
            {otherUser?.fullName || 'Seseorang'} sedang mengetik...
          </Text>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            content={item.content}
            isMine={isMyMessage(item)}
            timestamp={formatTime(item.createdAt)}
            isRead={item.isRead}
            isOptimistic={item.isOptimistic}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Input Bar */}
      <ChatInput
        value={newMessage}
        onChange={(text) => { setNewMessage(text); handleTyping(); }}
        onSend={handleSend}
        sending={sending}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.slate50 },
  loadingText: { color: COLORS.slate500, marginTop: SPACING.md, fontSize: FONT_SIZES.base },

  // Chat Header Bar
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  headerAvatarContainer: { position: 'relative', marginRight: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.mintGreen,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  headerTitleWrap: { flex: 1 },
  headerNameText: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.textPrimary },
  headerStatusText: { fontSize: 11, color: COLORS.mintGreen, fontWeight: '600' },
  headerActionBtns: { flexDirection: 'row', gap: 12 },
  headerActionBtn: { padding: 4 },

  // Attached Task Banner
  attachedTaskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    margin: SPACING.md, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: COLORS.slate200,
    ...SHADOWS.sm,
  },
  attachedTaskThumb: { width: 44, height: 44, borderRadius: BORDER_RADIUS.sm, marginRight: 10 },
  attachedTaskInfo: { flex: 1 },
  attachedTaskTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  attachedTaskPrice: { fontSize: 11, fontWeight: '800', color: '#FF6B00' },
  attachedTaskLink: { fontSize: 11, fontWeight: '700', color: COLORS.blue600 },

  mapContainer: {
    height: 200,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },

  // Messages list
  listContent: { padding: SPACING.md, paddingBottom: 20 },
  messageWrapper: { marginBottom: SPACING.md },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.green50, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.slate200 },
  messageText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  myText: { color: COLORS.textPrimary },
  theirText: { color: COLORS.textPrimary },
  timeAndCheckRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  time: { fontSize: 10 },
  myTime: { color: COLORS.slate500 },
  theirTime: { color: COLORS.slate400 },
  doubleCheckmark: { fontSize: 11, color: COLORS.blue600, fontWeight: '700' },

  // Input Container
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.slate100,
  },
  input: {
    flex: 1, backgroundColor: COLORS.slate50, borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: 8, fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary, marginHorizontal: 8, borderWidth: 1, borderColor: COLORS.slate200,
  },
  sendBtn: { width: 40, height: 40, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.blue600, justifyContent: 'center', alignItems: 'center' },
});

export default ChatDetailScreen;