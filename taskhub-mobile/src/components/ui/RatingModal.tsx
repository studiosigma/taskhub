import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { Button } from './Button';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const starAnim = useRef(new Animated.Value(1)).current;

  const handleStarPress = (star: number) => {
    setRating(star);
    // Bounce animation
    Animated.sequence([
      Animated.timing(starAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(starAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 200,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit(rating, comment);
      onClose();
    } catch (e) {
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Beri Ulasan Task</Text>
          <Text style={styles.modalSub}>
            Bagaimana pengalaman Anda bekerja sama dalam task ini?
          </Text>

          {/* 5 Interactive Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleStarPress(star)} activeOpacity={0.7}>
                <Animated.View style={star === rating ? { transform: [{ scale: starAnim }] } : undefined}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= rating ? COLORS.primary : COLORS.slate400}
                    style={{ marginHorizontal: 4 }}
                  />
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Label */}
          <Text style={styles.ratingTextLabel}>
            {rating === 5
              ? 'Sangat Memuaskan'
              : rating === 4
              ? 'Bagus'
              : rating === 3
              ? 'Cukup'
              : 'Kurang'}
          </Text>

          {/* Comment Input */}
          <TextInput
            style={styles.commentInput}
            placeholder="Tuliskan ulasan atau masukan singkat..."
            placeholderTextColor="#94A3B8"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          <Button
            title="Kirim Ulasan"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 11, 11, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 4 },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  modalSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  starsRow: { flexDirection: 'row', marginBottom: 8 },
  ratingTextLabel: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  commentInput: {
    width: '100%',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  submitBtn: { width: '100%', backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, height: 50 },
});
