import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle, XCircle, Warning, Info, X,
} from 'phosphor-react-native';
import { useToast, type ToastItem, type ToastType } from '@/contexts/toast.context';

// ─── Toast Style Config ───────────────────────────────────────────────────────
const TOAST_STYLES: Record<ToastType, {
  bg: string;
  border: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  accent: string;
}> = {
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: CheckCircle,
    iconColor: '#16a34a',
    accent: '#16a34a',
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    icon: XCircle,
    iconColor: '#dc2626',
    accent: '#dc2626',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    icon: Warning,
    iconColor: '#d97706',
    accent: '#d97706',
  },
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: Info,
    iconColor: '#2563eb',
    accent: '#2563eb',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastItemView({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const style = TOAST_STYLES[toast.type];
  const IconComp = style.icon;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto slide out before removal
    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, duration - 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.accent, { backgroundColor: style.accent }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: style.accent + '15' }]}>
        <IconComp size={18} color={style.iconColor} weight="fill" />
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: style.accent }]} numberOfLines={1}>
          {toast.title}
        </Text>
        {toast.message && (
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
        )}
      </View>

      {/* Dismiss */}
      <TouchableOpacity
        onPress={onDismiss}
        style={styles.dismissBtn}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={14} color="#94a3b8" weight="bold" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Toast Container (renders in _layout.tsx) ─────────────────────────────────
export default function ToastContainer() {
  const { toasts, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { top: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      {toasts.map(toast => (
        <ToastItemView
          key={toast.id}
          toast={toast}
          onDismiss={() => hideToast(toast.id)}
        />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingLeft: 0,
    gap: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    marginRight: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  message: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  dismissBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
