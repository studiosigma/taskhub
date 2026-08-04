import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TaskStatus = 'DRAFT' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
type VerificationStatus = 'IDLE' | 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';

type BadgeStatus = TaskStatus | ApplicationStatus | VerificationStatus;

interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
  icon: string;
}

const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  // Task Statuses
  OPEN: { label: 'Open', bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle' },
  DRAFT: { label: 'Draft', bg: '#F1F5F9', text: '#64748B', icon: 'document-text-outline' },
  ASSIGNED: { label: 'Terambil', bg: '#DBEAFE', text: '#1E40AF', icon: 'person-outline' },
  IN_PROGRESS: { label: 'Berjalan', bg: '#FEF3C7', text: '#92400E', icon: 'time-outline' },
  COMPLETED: { label: 'Selesai', bg: '#F1F5F9', text: '#475569', icon: 'checkmark-circle' },
  CANCELLED: { label: 'Dibatalkan', bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' },

  // Application Statuses
  PENDING: { label: 'Pending', bg: '#FEF3C7', text: '#92400E', icon: 'time-outline' },
  ACCEPTED: { label: 'Diterima', bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle' },
  REJECTED: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' },
  WITHDRAWN: { label: 'Dibatalkan', bg: '#F1F5F9', text: '#64748B', icon: 'return-up-back-outline' },

  // Verification Statuses
  IDLE: { label: 'Belum Verifikasi', bg: '#F1F5F9', text: '#64748B', icon: 'square-outline' },
  APPROVED: { label: 'Terverifikasi', bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle' },
  VERIFIED: { label: 'Terverifikasi', bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle' },
  VERIFICATION_REJECTED: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' },
};

interface BadgeProps {
  status: BadgeStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  style?: ViewStyle;
}

const BadgeComponent: React.FC<BadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
  style,
}) => {
  const config = BADGE_CONFIGS[status] || {
    label: status,
    bg: '#F1F5F9',
    text: '#64748B',
    icon: 'ellipse-outline',
  };

  const sizeStyles = {
    sm: { paddingH: 8, paddingV: 3, fontSize: 10, iconSize: 10 },
    md: { paddingH: 10, paddingV: 4, fontSize: 11, iconSize: 12 },
    lg: { paddingH: 14, paddingV: 6, fontSize: 12, iconSize: 14 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingHorizontal: sizeStyles.paddingH,
          paddingVertical: sizeStyles.paddingV,
        },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={sizeStyles.iconSize}
          color={config.text}
          style={{ marginRight: 3 }}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: config.text,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

export const Badge = React.memo(BadgeComponent);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '800',
  },
});
