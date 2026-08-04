import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { setRole } = useAuth();

  const handleSelectRole = (role: 'OWNER' | 'HELPER') => {
    setRole(role);
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Logo Header */}
        <View style={styles.brandHeader}>
          <Ionicons name="briefcase" size={28} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.brandLogoText}>TaskHub</Text>
        </View>

        {/* Hero Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.avatarCircleLeft}>
            <Ionicons name="person" size={40} color={COLORS.white} />
          </View>
          <View style={styles.avatarCircleRight}>
            <Ionicons name="construct" size={40} color={COLORS.textPrimary} />
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.welcomeTitle}>Selamat Datang di TaskHub</Text>
        <Text style={styles.welcomeSubtitle}>
          Platform yang mempertemukan Anda dengan helper terpercaya di sekitar Anda.
        </Text>

        {/* Role Selection */}
        <Text style={styles.rolePromptLabel}>Hari ini Anda ingin...</Text>

        {/* Role Option 1: Task Owner */}
        <TouchableOpacity
          style={[styles.roleCard, styles.roleCardBlue]}
          onPress={() => handleSelectRole('OWNER')}
          activeOpacity={0.85}
        >
          <View style={styles.roleIconBadge}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitleLight}>Mencari Bantuan (Task Owner)</Text>
            <Text style={styles.roleSubtitleLight}>Saya butuh seseorang untuk membantu task saya</Text>
          </View>
          <View style={styles.roleArrowCircleLight}>
            <Ionicons name="arrow-forward" size={18} color={COLORS.blue600} />
          </View>
        </TouchableOpacity>

        {/* Role Option 2: Helper */}
        <TouchableOpacity
          style={[styles.roleCard, styles.roleCardYellow]}
          onPress={() => handleSelectRole('HELPER')}
          activeOpacity={0.85}
        >
          <View style={styles.roleIconBadgeDark}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitleDark}>Mencari Penghasilan (Helper)</Text>
            <Text style={styles.roleSubtitleDark}>Saya ingin mendapatkan penghasilan tambahan</Text>
          </View>
          <View style={styles.roleArrowCircleDark}>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* Footnote */}
        <Text style={styles.footnoteText}>
          Bisa diubah kapan saja di menu Profil atau Switcher
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  brandHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  brandLogoText: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  illustrationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: SPACING.lg, gap: 20 },
  avatarCircleLeft: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.blue600, justifyContent: 'center', alignItems: 'center' },
  avatarCircleRight: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  welcomeTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  welcomeSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING['2xl'] },
  rolePromptLabel: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.textPrimary, alignSelf: 'flex-start', marginBottom: SPACING.md },
  roleCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: SPACING.lg, width: '100%', marginBottom: SPACING.md, ...SHADOWS.md },
  roleCardBlue: { backgroundColor: COLORS.blue600 },
  roleCardYellow: { backgroundColor: COLORS.primary },
  roleIconBadge: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, backgroundColor: 'rgba(255, 255, 255, 0.25)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  roleIconBadgeDark: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, backgroundColor: 'rgba(11, 11, 11, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  roleTextContainer: { flex: 1 },
  roleTitleDark: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2 },
  roleSubtitleDark: { fontSize: FONT_SIZES.xs, color: COLORS.textPrimary, opacity: 0.85, lineHeight: 16, fontWeight: '600' },
  roleTitleLight: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.white, marginBottom: 2 },
  roleSubtitleLight: { fontSize: FONT_SIZES.xs, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 16 },
  roleArrowCircleDark: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  roleArrowCircleLight: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  footnoteText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.lg },
});
