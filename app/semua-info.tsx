import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, RefreshControl,
  Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, CloudRain, BookOpenText, MegaphoneSimple,
  CaretRight, Clock, Eye, ShareNetwork, Bookmark,
  ShieldCheck, CalendarBlank, Funnel,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getInfoList, type InfoFeedData } from '@/services/info.service';

type FilterKey = 'semua' | 'cuaca' | 'edukasi' | 'pengumuman';

const FILTERS: { key: FilterKey; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { key: 'semua', label: 'Semua', icon: BookOpenText, color: SiagaColors.primary },
  { key: 'cuaca', label: 'Cuaca', icon: CloudRain, color: '#3b82f6' },
  { key: 'edukasi', label: 'Edukasi', icon: BookOpenText, color: '#10b981' },
  { key: 'pengumuman', label: 'Pengumuman', icon: MegaphoneSimple, color: '#f59e0b' },
];

export default function SemuaInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [infoList, setInfoList] = useState<InfoFeedData[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const loadInfo = useCallback(async (filter?: FilterKey) => {
    const params: { category?: string; limit: number } = { limit: 50 };
    const f = filter || activeFilter;
    if (f !== 'semua') params.category = f;

    const result = await getInfoList(params);
    if (result.success && result.data) {
      setInfoList(result.data);
    }
  }, [activeFilter]);

  useEffect(() => {
    setIsLoading(true);
    loadInfo().finally(() => setIsLoading(false));
  }, [loadInfo]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInfo();
    setIsRefreshing(false);
  }, [loadInfo]);

  const handleFilterChange = (filter: FilterKey) => {
    setActiveFilter(filter);
    setIsLoading(true);
    loadInfo(filter).finally(() => setIsLoading(false));
  };

  const getInfoIcon = (type: string, color: string) => {
    const props = { size: 24, color, weight: 'duotone' as const };
    if (type === 'CloudRain') return <CloudRain {...props} />;
    if (type === 'BookOpenText') return <BookOpenText {...props} />;
    return <MegaphoneSimple {...props} />;
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'cuaca': return { label: 'Prakiraan Cuaca', color: '#3b82f6', bg: '#eff6ff', icon: CloudRain };
      case 'edukasi': return { label: 'Edukasi & Panduan', color: '#10b981', bg: '#ecfdf5', icon: BookOpenText };
      case 'pengumuman': return { label: 'Pengumuman Resmi', color: '#f59e0b', bg: '#fffbeb', icon: MegaphoneSimple };
      default: return { label: 'Informasi', color: SiagaColors.info, bg: '#eff6ff', icon: BookOpenText };
    }
  };

  const renderItem = ({ item, index }: { item: InfoFeedData; index: number }) => {
    const catInfo = getCategoryInfo(item.category);

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
            marginBottom: 12,
          }}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/info-detail', params: { id: item.id } })}
        >
          {/* Color Header Strip */}
          <View style={{ height: 4, backgroundColor: item.color || catInfo.color }} />

          <View style={{ padding: 16 }}>
            {/* Top Row: Category + Source */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ backgroundColor: catInfo.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <catInfo.icon size={12} color={catInfo.color} weight="duotone" />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: catInfo.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{catInfo.label}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>{item.source}</Text>
            </View>

            {/* Content Row */}
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{
                width: 52, height: 52, borderRadius: 14,
                backgroundColor: item.bg || catInfo.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {getInfoIcon(item.type, item.color || catInfo.color)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: SiagaColors.primary, lineHeight: 20 }} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 3, lineHeight: 16 }} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
              <CaretRight size={18} color={SiagaColors.secondary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={{ marginBottom: 8 }}>
      {/* Stats Bar */}
      <View style={{
        flexDirection: 'row', gap: 8, marginBottom: 16,
      }}>
        {[
          { label: 'Total Artikel', value: String(infoList.length), color: SiagaColors.primary, bg: SiagaColors.surface },
          { label: 'Cuaca', value: String(infoList.filter(i => i.category === 'cuaca').length), color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Edukasi', value: String(infoList.filter(i => i.category === 'edukasi').length), color: '#10b981', bg: '#ecfdf5' },
          { label: 'Pengumuman', value: String(infoList.filter(i => i.category === 'pengumuman').length), color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => (
          <View key={i} style={{
            flex: 1, backgroundColor: s.bg, borderRadius: 12, padding: 10, alignItems: 'center',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.value}</Text>
            <Text style={{ fontSize: 9, fontWeight: '600', color: s.color, opacity: 0.7, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#edf2f9',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={SiagaColors.primary} weight="bold" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '700', color: SiagaColors.primary }}>Info & Edukasi</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Filter Tabs */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
          {FILTERS.map(filter => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
                  paddingVertical: 8, borderRadius: 10,
                  backgroundColor: isActive ? SiagaColors.primary : '#f1f5f9',
                }}
                onPress={() => handleFilterChange(filter.key)}
                activeOpacity={0.7}
              >
                <filter.icon size={14} color={isActive ? '#fff' : SiagaColors.secondary} weight="duotone" />
                <Text style={{
                  fontSize: 11, fontWeight: '600',
                  color: isActive ? '#fff' : SiagaColors.secondary,
                }}>{filter.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={SiagaColors.primary} />
          <Text style={{ fontSize: 13, color: SiagaColors.secondary, marginTop: 12 }}>Memuat artikel...</Text>
        </View>
      ) : infoList.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <BookOpenText size={28} color={SiagaColors.secondary} weight="duotone" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: SiagaColors.primary, marginBottom: 4 }}>Belum ada artikel</Text>
          <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center', lineHeight: 18 }}>
            Artikel info & edukasi akan segera tersedia.
          </Text>
        </View>
      ) : (
        <FlatList
          data={infoList}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={SiagaColors.primary}
              colors={[SiagaColors.primary]}
            />
          }
        />
      )}
    </View>
  );
}
