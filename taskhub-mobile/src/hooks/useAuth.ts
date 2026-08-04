import { create } from 'zustand';
import { User } from '../types';
import { authApi, usersApi, storage } from '../services';
import { STORAGE_KEYS } from '../constants';
import { safeStorage } from '../utils/storage';
import { notificationService } from '../services/notifications';

export type UserRole = 'HELPER' | 'OWNER';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  activeRole: 'HELPER',

  setRole: async (role: UserRole) => {
    await safeStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    set({ activeRole: role });
  },

  toggleRole: () => {
    const next = get().activeRole === 'HELPER' ? 'OWNER' : 'HELPER';
    safeStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, next);
    set({ activeRole: next });
  },

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    await storage.setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, isAuthenticated: true });
    // Register push token in background
    notificationService.registerForPushNotifications().then((token) => {
      if (token) usersApi.updateProfile({ fcmToken: token } as any).catch(() => {});
    });
  },

  register: async (data) => {
    const res = await authApi.register(data);
    await storage.setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, isAuthenticated: true });
    // Register push token in background
    notificationService.registerForPushNotifications().then((token) => {
      if (token) usersApi.updateProfile({ fcmToken: token } as any).catch(() => {});
    });
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    await storage.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await safeStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        const [user, savedRole] = await Promise.all([
          usersApi.getProfile(),
          safeStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE),
        ]);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          activeRole: (savedRole as UserRole) || 'HELPER',
        });

        // Always register push token on app start/hydrate if authenticated
        notificationService.registerForPushNotifications().then((token) => {
          if (token) usersApi.updateProfile({ fcmToken: token } as any).catch(() => {});
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await storage.clearTokens();
      set({ isLoading: false });
    }
  },
}));
