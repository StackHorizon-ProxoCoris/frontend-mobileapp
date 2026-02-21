import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Camera, Trash, ThumbsUp, ShieldCheck, ChatCircle,
  Medal, Tree, Clock, CaretRight, Leaf, Funnel,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { dummyActivities, type ActivityItem } from '@/data/dummy';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Camera, Trash, ThumbsUp, ShieldCheck, ChatCircle, Medal, Tree,
};

const FILTER_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'report', label: 'Laporan' },
  { key: 'action', label: 'Aksi' },
  { key: 'support', label: 'Dukungan' },
  { key: 'verify', label: 'Verifikasi' },
];

export default function RiwayatAktivitasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? dummyActivities
    : dummyActivities.filter(a => a.type === activeFilter);

  // Group by date
  const grouped = filtered.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
  const sections = Object.entries(grouped);

  const totalPoints = dummyActivities.reduce((sum, a) => sum + a.points, 0);

  const handlePress = (item: ActivityItem) => {
    if (item.refId) {
      if (item.type === 'report' || item.type === 'support' || item.type === 'verify') {
        router.push({ pathname: '/report-detail', params: { id: item.refId } });
      } else if (item.type === 'action') {
        router.push({ pathname: '/action-detail', params: { id: item.refId } });
      }
    }
  };

  const renderItem = ({ item }: { item: ActivityItem }) => {
    const IconComp = ICON_MAP[item.icon] || Camera;
    return (
      <TouchableOpacity
        className="bg-white border border-slate-100 rounded-xl p-3.5 flex-row items-center gap-3"
        style={{ elevation: 1, marginBottom: 8 }}
        onPress={() => handlePress(item)}
        activeOpacity={item.refId ? 0.7 : 1}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: item.bgColor }}>
          <IconComp size={20} color={item.color} weight="duotone" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-primary" numberOfLines={1}>{item.title}</Text>
          <Text className="text-xs text-secondary mt-0.5" numberOfLines={1}>{item.desc}</Text>
          <View className="flex-row items-center gap-2.5 mt-1.5">
            <View className="flex-row items-center gap-0.5">
              <Clock size={10} color={SiagaColors.secondary} />
              <Text className="text-[11px] text-secondary">{item.time}</Text>
            </View>
            <View className="flex-row items-center gap-0.5">
              <Leaf size={10} color="#059669" weight="duotone" />
              <Text className="text-[11px] font-bold text-success">+{item.points} pts</Text>
            </View>
            {item.status && (
              <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${item.statusColor}15` }}>
                <Text className="text-[10px] font-bold" style={{ color: item.statusColor }}>{item.status}</Text>
              </View>
            )}
          </View>
        </View>
        {item.refId && (
          <View className="w-7 h-7 rounded-lg bg-slate-50 items-center justify-center">
            <CaretRight size={12} color={SiagaColors.secondary} weight="bold" />
          </View>
        )}
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
            <ArrowLeft size={18} color={SiagaColors.primary} weight="bold" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-primary">Riwayat Aktivitas</Text>
          <View className="w-9" />
        </View>

        {/* Stats summary */}
        <View className="flex-row gap-2 mt-3">
          <View className="flex-1 bg-green-50 border border-green-100 rounded-xl p-2.5 items-center">
            <Text className="text-base font-bold text-success">{totalPoints}</Text>
            <Text className="text-[10px] font-medium text-secondary">Total Poin</Text>
          </View>
          <View className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-2.5 items-center">
            <Text className="text-base font-bold text-info">{dummyActivities.filter(a => a.type === 'report').length}</Text>
            <Text className="text-[10px] font-medium text-secondary">Laporan</Text>
          </View>
          <View className="flex-1 bg-purple-50 border border-purple-100 rounded-xl p-2.5 items-center">
            <Text className="text-base font-bold" style={{ color: '#7c3aed' }}>{dummyActivities.filter(a => a.type === 'action').length}</Text>
            <Text className="text-[10px] font-medium text-secondary">Aksi</Text>
          </View>
          <View className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-2.5 items-center">
            <Text className="text-base font-bold" style={{ color: '#d97706' }}>{dummyActivities.filter(a => a.type === 'support' || a.type === 'verify').length}</Text>
            <Text className="text-[10px] font-medium text-secondary">Kontribusi</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row gap-1.5 mt-3">
          {FILTER_TABS.map(tab => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                className="px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: isActive ? SiagaColors.primary : '#f1f5f9',
                }}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.7}
              >
                <Text className="text-[11px] font-semibold" style={{ color: isActive ? '#fff' : SiagaColors.secondary }}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Activity List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Funnel size={40} color={SiagaColors.secondary} weight="duotone" />
            <Text className="text-sm font-semibold text-secondary mt-3">Belum ada aktivitas</Text>
            <Text className="text-[11px] text-secondary/60 mt-1">Coba pilih filter lain</Text>
          </View>
        }
      />
    </View>
  );
}
