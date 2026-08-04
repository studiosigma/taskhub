import { Platform } from 'react-native';

// Constants & Config
declare const process: any;
export const API_URL =
  process.env?.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://localhost:3000');
export const SOCKET_URL = API_URL;

// Pagination
export const PAGE_DEFAULT = 1;
export const LIMIT_DEFAULT = 10;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  ACTIVE_ROLE: 'active_role',
} as const;

// Typography — Inter is loaded via expo-font in App.tsx
export const FONT_FAMILY = 'Inter';

// Font size scale (Inter renders slightly smaller than system sans-serif)
export const FONT_SIZES = {
  xs: 13,
  sm: 15,
  base: 17,
  lg: 19,
  xl: 21,
  '2xl': 25,
  '3xl': 29,
} as const;

// Colors — Presisi Funni Warm Yellow UI Kit Reference
// Primary: #FFCA27 (Warm Golden Yellow), Dark: #0B0B0B (Charcoal)
export const COLORS = {
  primary: '#FFCA27',       // Warm Golden Yellow (Primary Brand)
  primaryDark: '#E5B214',   // Darker Golden Yellow
  primaryLight: '#FFE185',  // Light Golden Tint
  secondary: '#0B0B0B',     // Dark Charcoal Accent
  skyBlue: '#2D9CDB',       // Semantic Sky Blue
  coralRed: '#EB5757',      // Semantic Coral Red
  mintGreen: '#27AE60',     // Semantic Mint Green
  success: '#27AE60',       // Mint Green Success
  danger: '#EB5757',        // Coral Red Danger
  bg: '#F8F8FA',            // Clean Light Background
  surface: '#FFFFFF',       // Pure White Card Surface
  textPrimary: '#0B0B0B',   // Dark Charcoal Text
  textSecondary: '#71717A', // Soft Muted Gray Text
  border: '#F4F4F5',        // Soft Border Divider
  white: '#FFFFFF',
  black: '#000000',

  // Extended palette — commonly used semantic colors
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate900: '#0F172A',
  green50: '#DCFCE7',
  green700: '#15803D',
  primaryBg: '#FFFDF5',    // Warm yellow background tint
  amber50: '#FEF3C7',
  amber800: '#92400E',
  blue50: '#DBEAFE',
  blue600: '#2563EB',
  red50: '#FEE2E2',
  red800: '#991B1B',
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

// Border Radius scale — use these constants everywhere for visual consistency
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Shadow scale — 3-tier system: sm (subtle), md (card), lg (elevated/FAB)
const shadowSm = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
  android: { elevation: 1 },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
});

const shadowMd = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
  android: { elevation: 3 },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
});

const shadowLg = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
  android: { elevation: 5 },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
});

export const SHADOWS = {
  sm: shadowSm,
  md: shadowMd,
  lg: shadowLg,
};

// Opacity constants for overlays and states
export const OPACITY = {
  overlay: 0.6,     // Modal backdrop
  disabled: 0.5,    // Disabled button/input
  subtle: 0.1,      // Very subtle tint
  medium: 0.7,      // Image overlay text
} as const;

// Old alias map — keep for runtime reference (used in TaskCard price pill etc.)
// Deprecated aliases were removed: warmYellow → primary, warmYellowLight → primaryLight,
// warmYellowBg → use COLORS.primaryLight with opacity, starYellow → primary,
// ownerBlue → blue600, helperYellow → primary, accent → primary
