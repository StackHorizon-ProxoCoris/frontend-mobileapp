import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Bell, BellRinging, CheckCircle, ChatCircle,
  Camera, ShieldCheck, Warning, Checks, Funnel,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from '@/services/notification.service';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  report: Camera,
  comment: ChatCircle,
  status: CheckCircle,
  warning: Warning,
  verify: ShieldCheck,
  info: Bell,
};

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  report:  { color: '#3b82f6', bg: '#eff6ff' },
  comment: { color: '#7c3aed', bg: '#f5f3ff' },
  status:  { color: '#059669', bg: '#ecfdf5' },
  warning: { color: '#f59e0b', bg: '#fffbeb' },
  verify:  { color: '#16a34a', bg: '#f0fdf4' },
  info:    { color: '#64748b', bg: '#f8fafc' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export default function NotifikasiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    const result = await getNotifications();
    if (result.success && result.data) {
      setNotifications(result.data.notifications);
      setUnreadCount(result.data.unreadCount);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  }, [loadNotifications]);

  const handlePress = async (notif: NotificationItem) => {
    // Mark as read
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to related item
    if (notif.ref_type === 'report' && notif.ref_id) {
      router.push({ pathname: '/report-detail', params: { id: notif.ref_id } });
    } else if (notif.ref_type === 'action' && notif.ref_id) {
      router.push({ pathname: '/action-detail', params: { id: notif.ref_id } });
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const style = COLOR_MAP[item.type] || COLOR_MAP.info;
    const IconComp = ICON_MAP[item.type] || Bell;

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-3.5 flex-row items-start gap-3"
        style={{
          elevation: item.is_read ? 0 : 1,
          borderWidth: 1,
          borderColor: item.is_read ? '#f1f5f9' : style.color + '25',
          marginBottom: 8,
          opacity: item.is_read ? 0.7 : 1,
        }}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: style.bg }}
        >
          <IconComp size={22} color={style.color} weight="duotone" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[15px] font-bold text-primary flex-1" numberOfLines={1}>{item.title}</Text>
            {!item.is_read && (
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: SiagaColors.info }} />
            )}
          </View>
          <Text className="text-[14px] text-secondary mt-0.5" numberOfLines={2}>{item.message}</Text>
          <Text className="text-[12px] text-secondary/50 mt-1.5">{timeAgo(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafd]">
      {/* Header */}
      <View
        className="px-5 pb-3 border-b border-slate-100"
        style={{ paddingTop: insets.top + 8, backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={SiagaColors.primary} weight="bold" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <Text className="text-[16px] font-bold text-primary">Notifikasi</Text>
            {unreadCount > 0 && (
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: SiagaColors.danger }}>
                <Text className="text-[12px] font-bold text-white">{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center"
              onPress={handleMarkAllRead}
              activeOpacity={0.7}
            >
              <Checks size={20} color={SiagaColors.info} weight="bold" />
            </TouchableOpacity>
          ) : (
            <View className="w-9" />
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={SiagaColors.primary}
            colors={[SiagaColors.primary]}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4">
              <BellRinging size={32} color={SiagaColors.secondary} weight="duotone" />
            </View>
            <Text className="text-[16px] font-semibold text-secondary">Belum ada notifikasi</Text>
            <Text className="text-[13px] text-secondary/60 mt-1">Notifikasi akan muncul saat ada update</Text>
          </View>
        }
      />
    </View>
  );
}
