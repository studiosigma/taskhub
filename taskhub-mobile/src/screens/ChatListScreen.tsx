import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "../types";
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatsApi } from '../services';
import { Conversation, Message, User } from '../types';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { useThemeColor } from '../hooks/useThemeColor';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';

type ChatListProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Inbox'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ChatListScreen: React.FC<ChatListProps> = ({ navigation }) => {
  const theme = useThemeColor();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatsApi.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('fetchConversations error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchConversations(); }, [fetchConversations]));

  const getTimeLabel = (iso?: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Baru';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}j`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}h`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getOtherUser = (conv: Conversation): User | null => {
    if (!conv.participants || !user) return null;
    // Find the participant that is NOT the current user
    const otherParticipant = conv.participants.find(p => p.userId !== user.id);
    return otherParticipant?.user || conv.participants[0]?.user || null;
  };

  const filteredConversations = useMemo(() => {
    let result = conversations;
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(conv => {
        const otherUser = getOtherUser(conv);
        return otherUser?.fullName?.toLowerCase().includes(query) ||
               conv.lastMessage?.content?.toLowerCase().includes(query) ||
               conv.task?.title?.toLowerCase().includes(query);
      });
    }
    return result;
  }, [conversations, debouncedSearch, user]);

  const getLastMessage = (conv: Conversation): Message | null => {
    if (conv.lastMessage) return conv.lastMessage;
    if (conv.messages && conv.messages.length > 0) {
      return [...conv.messages].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
    }
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={{ padding: 4 }}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari chat"
          placeholderTextColor={COLORS.slate400}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState icon="chatbubbles-outline" title="Belum ada chat" message="Mulai dengan mengambil task atau membuat task baru!" />
          ) : null
        }
        renderItem={({ item }: { item: Conversation }) => {
          const otherUser = getOtherUser(item);
          const lastMsg = getLastMessage(item);
          const unreadCount = item.unreadCount || 0;
          return (
            <TouchableOpacity
              style={styles.chatRowItem}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  conversationId: item.id,
                  otherUser: { id: otherUser?.id, fullName: otherUser?.fullName, avatar: otherUser?.avatar },
                })
              }
              activeOpacity={0.7}
            >
              {otherUser?.avatar ? (
                <Image source={{ uri: otherUser.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.textPrimary }}>
                    {otherUser?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.middleContent}>
                <Text style={styles.nameText}>{otherUser?.fullName || 'Unknown'}</Text>
                <Text style={styles.lastMsgText} numberOfLines={1}>
                  {lastMsg?.content || 'Belum ada pesan'}
                </Text>
              </View>
              <View style={styles.rightMeta}>
                <Text style={styles.timeText}>{getTimeLabel(lastMsg?.createdAt)}</Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 8,
    paddingBottom: SPACING.xs,
    ...SHADOWS.sm,
    backgroundColor: COLORS.surface,
  },
  headerTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.textPrimary },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderRadius: 14,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  chatRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  avatarImage: { width: 52, height: 52, borderRadius: 26, marginRight: SPACING.md },
  middleContent: { flex: 1, marginRight: SPACING.sm },
  nameText: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  lastMsgText: { fontSize: FONT_SIZES.sm, color: COLORS.slate500 },
  rightMeta: { alignItems: 'flex-end' },
  timeText: { fontSize: 11, color: COLORS.slate400, fontWeight: '500', marginBottom: 4 },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '900' },
});