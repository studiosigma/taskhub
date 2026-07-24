import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { chatsApi } from '../services';
import { Message, User } from '../types';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatBubble } from '../components/ui/ChatBubble';
import { ChatInput } from '../components/ui/ChatInput';
import { useChatSocket } from '../hooks/useChatSocket';

export const ChatDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { conversationId, otherUser } = route.params || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const {
    liveMessages,
    setLiveMessages,
    typingUserId,
    sendMessage: socketSend,
    emitTyping,
    emitStopTyping,
  } = useChatSocket({ conversationId: conversationId || '', userId: user?.id || '' });

  const flatListRef = useRef<FlatList<Message>>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await chatsApi.getMessages(conversationId);
      setMessages(Array.isArray(data) ? data : []);
      // Merge with live socket messages
      if (liveMessages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOnes = liveMessages.filter((m) => !existingIds.has(m.id));
          return [...prev, ...newOnes];
        });
      }
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

  // Listen for new socket messages and merge
  useEffect(() => {
    if (liveMessages.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = liveMessages.filter((m) => !existingIds.has(m.id));
      return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
    });
  }, [liveMessages]);

  const handleSend = useCallback(() => {
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');
    // Send via WebSocket for real-time delivery
    socketSend(content);
    // Also persist via REST as fallback
    chatsApi.sendMessage(conversationId, content).catch((e) => console.warn('sendMessage fallback error', e));
  }, [conversationId, newMessage, socketSend]);

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
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat pesan...</Text>
      </View>
    );
  }

  const contactName = otherUser?.fullName || 'Andi';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Contact Header Bar */}
      <View style={[styles.chatHeaderBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerAvatarContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }}
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
            <Text style={{ fontSize: 18 }}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Text style={{ fontSize: 18 }}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Attached Task Card Banner (Screen 10 Reference) */}
      <View style={styles.attachedTaskCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&q=80' }}
          style={styles.attachedTaskThumb}
        />
        <View style={styles.attachedTaskInfo}>
          <Text style={styles.attachedTaskTitle} numberOfLines={1}>
            Butuh 3 orang bantu bersihkan rumah...
          </Text>
          <Text style={styles.attachedTaskPrice}>Rp250.000 / orang</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.attachedTaskLink}>Lihat Detail</Text>
        </TouchableOpacity>
      </View>

      {/* Typing Indicator */}
      {typingUserId && (
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
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Input Bar */}
      <ChatInput
        value={newMessage}
        onChange={(text) => { setNewMessage(text); handleTyping(); }}
        onSend={handleSend}
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
  headerNameText: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.slate900 },
  headerStatusText: { fontSize: 11, color: COLORS.mintGreen, fontWeight: '600' },
  headerActionBtns: { flexDirection: 'row', gap: 12 },
  headerActionBtn: { padding: 4 },

  // Attached Task Banner
  attachedTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  attachedTaskThumb: { width: 44, height: 44, borderRadius: 8, marginRight: 10 },
  attachedTaskInfo: { flex: 1 },
  attachedTaskTitle: { fontSize: 12, fontWeight: '700', color: COLORS.slate900 },
  attachedTaskPrice: { fontSize: 11, fontWeight: '800', color: '#FF6B00' },
  attachedTaskLink: { fontSize: 11, fontWeight: '700', color: COLORS.blue600 },

  // Messages list
  listContent: { padding: SPACING.md, paddingBottom: 20 },
  messageWrapper: { marginBottom: SPACING.md },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.green50, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.slate200 },
  messageText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  myText: { color: COLORS.slate900 },
  theirText: { color: COLORS.slate900 },
  timeAndCheckRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  time: { fontSize: 10, color: COLORS.slate400 },
  myTime: { color: COLORS.slate500 },
  theirTime: { color: COLORS.slate400 },
  doubleCheckmark: { fontSize: 11, color: COLORS.blue600, fontWeight: '700' },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    borderRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate900,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.blue600,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatDetailScreen;