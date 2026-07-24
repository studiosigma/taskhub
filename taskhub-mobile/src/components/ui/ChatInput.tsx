import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface ChatInputProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const ChatInput_C: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  sending = false,
  placeholder = 'Ketik pesan...',
  maxLength = 500,
}) => {
  const canSend = value.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.attachBtn}>
        <Ionicons name="add-circle-outline" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.slate400}
        value={value}
        onChangeText={onChange}
        multiline
        maxLength={maxLength}
        onSubmitEditing={canSend ? onSend : undefined}
      />
      <TouchableOpacity
        style={[styles.sendBtn, canSend && styles.sendBtnActive]}
        onPress={onSend}
        disabled={!canSend}
        activeOpacity={0.8}
      >
        <Ionicons
          name={canSend ? 'send' : 'mic-outline'}
          size={20}
          color={canSend ? COLORS.surface : COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

export const ChatInput = React.memo(ChatInput_C);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  attachBtn: {
    padding: 6,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    borderRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate900,
    maxHeight: 100,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendBtnActive: {
    backgroundColor: COLORS.blue600,
  },
});
