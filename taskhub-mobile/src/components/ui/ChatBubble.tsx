import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface ChatBubbleProps {
  content: string;
  isMine: boolean;
  timestamp: string;
  showAvatar?: boolean;
  senderName?: string;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

const ChatBubble_C: React.FC<ChatBubbleProps> = ({
  content,
  isMine,
  timestamp,
  showAvatar,
  senderName,
  isRead,
}) => {
  return (
    <View style={[styles.wrapper, isMine ? styles.mine : styles.theirs]}>
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
            <Text style={[styles.checkmark, isRead ? styles.readCheck : styles.sentCheck]}>
              {isRead ? ' ✓✓' : ' ✓'}
            </Text>
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
  myText: { color: COLORS.slate900 },
  theirText: { color: COLORS.slate900 },
  timeRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  time: { fontSize: 10 },
  myTime: { color: COLORS.slate500 },
  theirTime: { color: COLORS.slate400 },
  checkmark: { fontSize: 11, fontWeight: '700' },
  sentCheck: { color: COLORS.slate400 },
  readCheck: { color: COLORS.blue600 },
});
