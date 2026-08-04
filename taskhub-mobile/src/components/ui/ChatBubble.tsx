import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface ChatBubbleProps {
  content: string;
  isMine: boolean;
  timestamp: string;
  showAvatar?: boolean;
  senderName?: string;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isOptimistic?: boolean;
}

const ChatBubble_C: React.FC<ChatBubbleProps> = ({
  content,
  isMine,
  timestamp,
  showAvatar,
  senderName,
  isRead,
  isOptimistic,
}) => {
  const opacity = isOptimistic ? 0.7 : 1;
  const statusColor = isOptimistic ? COLORS.textSecondary : (isRead ? COLORS.blue600 : COLORS.slate500);

  return (
    <View style={[styles.wrapper, isMine ? styles.mine : styles.theirs, { opacity }]}>
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
        {!isMine && senderName && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>
          {content}
        </Text>
        <View style={styles.timeRow}>
          <Text style={[styles.time, isMine ? styles.myTime : styles.theirTime]}>
            {timestamp}
          </Text>
          {isMine && (
            <Ionicons
              name={isOptimistic ? 'time-outline' : (isRead ? 'checkmark-done' : 'checkmark')}
              size={12}
              color={statusColor}
              style={{ marginLeft: 3 }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export const ChatBubble = React.memo(ChatBubble_C);

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md, maxWidth: '85%' },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.green50, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.slate200 },
  senderName: { fontSize: 10, fontWeight: '800', color: COLORS.blue600, marginBottom: 2 },
  messageText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  myText: { color: COLORS.textPrimary },
  theirText: { color: COLORS.textPrimary },
  timeRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  time: { fontSize: 10 },
  myTime: { color: COLORS.slate500 },
  theirTime: { color: COLORS.slate400 },
});