import { useAuth } from './useAuth';

export type ThemeRole = 'helper' | 'owner';

export interface ThemePalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  text: string;
  textMuted: string;
  accent: string;
}

const THEMES: Record<ThemeRole, ThemePalette> = {
  helper: {
    primary: '#FFCA27',
    primaryLight: '#FFE185',
    primaryDark: '#E5B214',
    text: '#0B0B0B',
    textMuted: 'rgba(11, 11, 11, 0.6)',
    accent: '#0B0B0B',
  },
  owner: {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    accent: '#FFFFFF',
  },
};

export function useThemeColor() {
  const { activeRole } = useAuth();
  const role: ThemeRole = activeRole === 'HELPER' ? 'helper' : 'owner';
  return THEMES[role];
}

// For cases where you need the raw role string
export function useRole() {
  const { activeRole } = useAuth();
  return {
    isHelper: activeRole === 'HELPER',
    isOwner: activeRole === 'OWNER',
    role: activeRole,
  };
}
