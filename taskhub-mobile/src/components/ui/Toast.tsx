import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { Text } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, 'id'>) => void;
  hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_CONFIG: Record<ToastType, { icon: string; iconColor: string; bg: string; border: string }> = {
  success: { icon: 'checkmark-circle', iconColor: COLORS.mintGreen, bg: '#DCFCE7', border: '#86EFAC' },
  error: { icon: 'close-circle', iconColor: COLORS.coralRed, bg: '#FEE2E2', border: '#FCA5A5' },
  info: { icon: 'information-circle', iconColor: COLORS.skyBlue, bg: '#DBEAFE', border: '#93C5FD' },
  warning: { icon: 'warning', iconColor: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const animValues = useRef<Record<string, Animated.Value>>({});
  const counter = useRef(0);

  const removeToast = useCallback((id: string) => {
    Animated.timing(animValues.current[id], {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete animValues.current[id];
    });
  }, []);

  const show = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${++counter.current}`;
      const anim = new Animated.Value(0);
      animValues.current[id] = anim;

      setToasts((prev) => [...prev, { ...toast, id }]);

      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }).start();

      const dur = toast.duration ?? 3000;
      if (dur > 0) {
        setTimeout(() => removeToast(id), dur);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ show, hide: removeToast }}>
      {children}

      {/* Toast Container */}
      <View
        style={[
          styles.container,
          { top: insets.top + 8 },
        ]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type];
          const anim = animValues.current[toast.id];

          if (!anim) return null;

          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                {
                  backgroundColor: config.bg,
                  borderColor: config.border,
                  transform: [
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [Dimensions.get('window').width, 0],
                      }),
                    },
                  ],
                  opacity: anim,
                },
              ]}
            >
              <Ionicons name={config.icon as any} size={20} color={config.iconColor} style={{ marginRight: 10 }} />
              <View style={styles.content}>
                <Text style={[styles.title, { color: COLORS.textPrimary }]}>{toast.title}</Text>
                {toast.message && (
                  <Text style={styles.message}>{toast.message}</Text>
                )}
              </View>
              {toast.action ? (
                <TouchableOpacity
                  onPress={() => {
                    toast.action!.onPress();
                    removeToast(toast.id);
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>{toast.action.label}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => removeToast(toast.id)}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={16} color={COLORS.slate500} />
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
  },
  message: {
    fontSize: 12,
    color: COLORS.slate600,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  actionBtn: {
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: 8,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
});
