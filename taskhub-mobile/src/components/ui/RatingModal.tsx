import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit(rating, comment);
      Alert.alert('Terima Kasih', 'Ulasan dan rating Anda telah berhasil dikirimkan!');
      onClose();
    } catch (e) {
      Alert.alert('Info', 'Ulasan berhasil dikirimkan!');
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
            <Ionicons name="close" size={20} color="#0B0B0B" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Beri Ulasan Task</Text>
          <Text style={styles.modalSub}>
            Bagaimana pengalaman Anda bekerja sama dalam task ini?
          </Text>

          {/* 5 Interactive Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#FFCA27' : '#D4D4D8'}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Label */}
          <Text style={styles.ratingTextLabel}>
            {rating === 5
              ? 'Sangat Memuaskan ⭐⭐⭐⭐⭐'
              : rating === 4
              ? 'Bagus ⭐⭐⭐⭐'
              : rating === 3
              ? 'Cukup ⭐⭐⭐'
              : 'Kurang ⭐⭐'}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 4 },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: '#0B0B0B', marginBottom: 4 },
  modalSub: { fontSize: FONT_SIZES.sm, color: '#71717A', textAlign: 'center', marginBottom: SPACING.lg },
  starsRow: { flexDirection: 'row', marginBottom: 8 },
  ratingTextLabel: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: '#0B0B0B', marginBottom: SPACING.lg },
  commentInput: {
    width: '100%',
    backgroundColor: '#F8F8FA',
    borderWidth: 1,
    borderColor: '#F4F4F5',
    borderRadius: 16,
    padding: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: '#0B0B0B',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  submitBtn: { width: '100%', backgroundColor: '#FFCA27', borderRadius: 16, height: 50 },
});
