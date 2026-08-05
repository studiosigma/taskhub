import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { Button } from './Button';
import { ScalePress } from './ScalePress';
import { reportsApi } from '../../services';
import { useToast } from './Toast';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  targetTitle?: string;
}

const REASON_OPTIONS = [
  'Pengerjaan Tidak Sesuai',
  'Penipuan / Fraud',
  'Perilaku Tidak Sopan',
  'Spam / Iklan Terlarang',
  'Lainnya',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  reportedUserId,
  targetTitle,
}) => {
  const toast = useToast();
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await reportsApi.createReport(reportedUserId, selectedReason, description);
      toast.show({
        type: 'success',
        title: 'Laporan Dikirim',
        message: 'Laporan Anda telah berhasil dikirim ke Tim Keamanan TaskHub',
      });
      setDescription('');
      onClose();
    } catch (e: any) {
      toast.show({
        type: 'error',
        title: 'Gagal Mengirim',
        message: e?.response?.data?.message || 'Gagal mengirim laporan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalCard}
            >
              {/* Modal Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleWrap}>
                  <Ionicons
                    name="warning-outline"
                    size={22}
                    color={COLORS.coralRed}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.headerTitle}>Laporkan Pelanggaran</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={COLORS.slate500} />
                </TouchableOpacity>
              </View>

              {targetTitle && (
                <Text style={styles.targetSub} numberOfLines={1}>
                  Target: {targetTitle}
                </Text>
              )}

              {/* Reason Pills */}
              <Text style={styles.label}>Pilih Alasan Pelaporan</Text>
              <View style={styles.reasonsGrid}>
                {REASON_OPTIONS.map((reason) => {
                  const active = selectedReason === reason;
                  return (
                    <ScalePress key={reason} onPress={() => setSelectedReason(reason)}>
                      <View style={[styles.reasonPill, active && styles.activeReasonPill]}>
                        <Text style={[styles.reasonPillText, active && styles.activeReasonPillText]}>
                          {reason}
                        </Text>
                      </View>
                    </ScalePress>
                  );
                })}
              </View>

              {/* Description Input */}
              <Text style={styles.label}>Penjelasan Detail (Opsional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Jelaskan detail kendala atau sengketa yang Anda alami..."
                placeholderTextColor={COLORS.slate400}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <Button
                  title="Batal"
                  onPress={onClose}
                  variant="secondary"
                  style={styles.cancelBtn}
                />
                <Button
                  title="Kirim Laporan"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  targetSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  reasonPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeReasonPill: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  reasonPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeReasonPillText: {
    color: COLORS.coralRed,
  },
  textArea: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  submitBtn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.coralRed,
  },
});
