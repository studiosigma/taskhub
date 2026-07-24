import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type TaskStatus = 'DRAFT' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
type VerificationStatus = 'IDLE' | 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';

type BadgeStatus = TaskStatus | ApplicationStatus | VerificationStatus;

interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
  icon?: string;
}

const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  // Task Statuses
  OPEN: { label: 'Open', bg: '#DCFCE7', text: '#15803D', icon: '🟢' },
  DRAFT: { label: 'Draft', bg: '#F1F5F9', text: '#64748B', icon: '📝' },
  ASSIGNED: { label: 'Terambil', bg: '#DBEAFE', text: '#1E40AF', icon: '👤' },
  IN_PROGRESS: { label: 'Berjalan', bg: '#FEF3C7', text: '#92400E', icon: '⏳' },
  COMPLETED: { label: 'Selesai', bg: '#F1F5F9', text: '#475569', icon: '✅' },
  CANCELLED: { label: 'Dibatalkan', bg: '#FEE2E2', text: '#991B1B', icon: '❌' },

  // Application Statuses
  PENDING: { label: 'Pending', bg: '#FEF3C7', text: '#92400E', icon: '⏳' },
  ACCEPTED: { label: 'Diterima', bg: '#DCFCE7', text: '#15803D', icon: '✅' },
  REJECTED: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B', icon: '❌' },
  WITHDRAWN: { label: 'Dibatalkan', bg: '#F1F5F9', text: '#64748B', icon: '↩️' },

  // Verification Statuses
  IDLE: { label: 'Belum Verifikasi', bg: '#F1F5F9', text: '#64748B', icon: '🔲' },
  APPROVED: { label: 'Terverifikasi', bg: '#DCFCE7', text: '#15803D', icon: '✅' },
  VERIFIED: { label: 'Terverifikasi', bg: '#DCFCE7', text: '#15803D', icon: '✅' },
  VERIFICATION_REJECTED: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B', icon: '❌' },
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
      {showIcon && config.icon && (
        <Text style={[styles.icon, { fontSize: sizeStyles.iconSize }]}>
          {config.icon}{' '}
        </Text>
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
  icon: {
    lineHeight: undefined,
  },
  label: {
    fontWeight: '800',
  },
});
