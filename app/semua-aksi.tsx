import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, RefreshControl,
  Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Plant, RoadHorizon, Tree, Trash,
  CaretRight, Clock, Users, MapPin,
  CheckCircle, ShieldCheck, CalendarBlank, Leaf, Star,
  HandsClapping, Trophy, Funnel,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getActions, type ActionData } from '@/services/action.service';

const { width } = Dimensions.get('window');

type FilterKey = 'semua' | 'Terjadwal' | 'Berlangsung' | 'Selesai';

const FILTERS: { key: FilterKey; label: string; color: string }[] = [
  { key: 'semua', label: 'Semua', color: SiagaColors.primary },
  { key: 'Terjadwal', label: 'Terjadwal', color: '#2563eb' },
  { key: 'Berlangsung', label: 'Berlangsung', color: '#d97706' },
  { key: 'Selesai', label: 'Selesai', color: '#059669' },
];

export default function SemuaAksiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [actions, setActions] = useState<ActionData[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const loadActions = useCallback(async (filter?: FilterKey) => {
    const params: { status?: string; limit: number } = { limit: 50 };
    const f = filter || activeFilter;
    if (f !== 'semua') params.status = f;

    const result = await getActions(params);
    if (result.success && result.data) {
      setActions(result.data);
    }
  }, [activeFilter]);

  useEffect(() => {
    setIsLoading(true);
    loadActions().finally(() => setIsLoading(false));
  }, [loadActions]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadActions();
    setIsRefreshing(false);
  }, [loadActions]);

  const handleFilterChange = (filter: FilterKey) => {
    setActiveFilter(filter);
    setIsLoading(true);
    loadActions(filter).finally(() => setIsLoading(false));
  };

  const getActionIcon = (category: string, size: number = 26) => {
    const props = { size, color: '#fff', weight: 'duotone' as const };
    if (category === 'Kebersihan' || category === 'Lingkungan') return <Plant {...props} />;
    if (category === 'Penghijauan') return <Tree {...props} />;
    if (category === 'Infrastruktur') return <RoadHorizon {...props} />;
    return <HandsClapping {...props} />;
  };

  const getActionGradient = (category: string) => {
    if (category === 'Kebersihan' || category === 'Lingkungan') return '#059669';
    if (category === 'Penghijauan') return '#d97706';
    if (category === 'Infrastruktur') return '#2563eb';
    return '#7c3aed';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Terjadwal': return { color: '#2563eb', bg: '#eff6ff', text: 'Terjadwal' };
      case 'Berlangsung': return { color: '#d97706', bg: '#fffbeb', text: 'Berlangsung' };
      case 'Selesai': return { color: '#059669', bg: '#ecfdf5', text: 'Selesai' };
      default: return { color: '#64748b', bg: '#f1f5f9', text: status };
    }
  };

  const renderItem = ({ item, index }: { item: ActionData; index: number }) => {
    const gradient = getActionGradient(item.category);
    const statusStyle = getStatusStyle(item.status);
    const participantPct = item.maxParticipants > 0
      ? Math.round((item.totalParticipants / item.maxParticipants) * 100)
      : 0;

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
            marginBottom: 12,
          }}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/action-detail', params: { id: item.id } })}
        >
          {/* Hero Section */}
          <View style={{
            flexDirection: 'row', padding: 16, gap: 12,
          }}>
            {/* Icon */}
            <View style={{
              width: 56, height: 56, borderRadius: 16,
              backgroundColor: gradient,
              alignItems: 'center', justifyContent: 'center',
            }}>
              {getActionIcon(item.category)}
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              {/* Badges Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <View style={{
                  backgroundColor: statusStyle.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusStyle.color }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: statusStyle.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{statusStyle.text}</Text>
                </View>
                <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary }}>{item.category}</Text>
                </View>
                {item.verified && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <ShieldCheck size={12} color={SiagaColors.success} weight="fill" />
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={{ fontSize: 15, fontWeight: '700', color: SiagaColors.primary, lineHeight: 20 }} numberOfLines={2}>
                {item.title}
              </Text>

              {/* Meta Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                {item.date && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <CalendarBlank size={12} color={SiagaColors.secondary} weight="duotone" />
                    <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{item.date}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Leaf size={12} color={SiagaColors.success} weight="duotone" />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: SiagaColors.success }}>+{item.points} pts</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Stats Bar */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 16, paddingVertical: 10,
            backgroundColor: '#f8fafd', borderTopWidth: 1, borderTopColor: '#edf2f9',
          }}>
            {/* Participants Progress */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Users size={16} color={SiagaColors.primary} weight="duotone" />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>
                    {item.totalParticipants}/{item.maxParticipants} peserta
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: participantPct >= 90 ? SiagaColors.danger : SiagaColors.primary }}>
                    {participantPct}%
                  </Text>
                </View>
                <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{
                    height: '100%', borderRadius: 2,
                    width: `${Math.min(participantPct, 100)}%`,
                    backgroundColor: participantPct >= 90 ? SiagaColors.danger : SiagaColors.success,
                  }} />
                </View>
              </View>
            </View>

            {/* Location */}
            {item.district && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 12 }}>
                <MapPin size={12} color={SiagaColors.secondary} weight="duotone" />
                <Text style={{ fontSize: 10, color: SiagaColors.secondary }} numberOfLines={1}>{item.district}</Text>
              </View>
            )}

            <CaretRight size={16} color={SiagaColors.secondary} style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => {
    const totalParticipants = actions.reduce((sum, a) => sum + a.totalParticipants, 0);
    const totalPoints = actions.reduce((sum, a) => sum + a.points, 0);
    const verifiedCount = actions.filter(a => a.verified).length;

    return (
      <View style={{ marginBottom: 8 }}>
        {/* Summary Stats */}
        <View style={{
          backgroundColor: SiagaColors.primary, borderRadius: 18, padding: 16, marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <HandsClapping size={18} color="#fbbf24" weight="duotone" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Ringkasan Aksi Positif</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { label: 'Total Aksi', value: String(actions.length), icon: <HandsClapping size={18} color="rgba(255,255,255,0.6)" weight="duotone" /> },
              { label: 'Peserta', value: String(totalParticipants), icon: <Users size={18} color="rgba(255,255,255,0.6)" weight="duotone" /> },
              { label: 'Eco-Points', value: String(totalPoints), icon: <Star size={18} color="rgba(255,255,255,0.6)" weight="duotone" /> },
              { label: 'Terverifikasi', value: String(verifiedCount), icon: <ShieldCheck size={18} color="rgba(255,255,255,0.6)" weight="duotone" /> },
            ].map((s, i) => (
              <View key={i} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, alignItems: 'center',
              }}>
                {s.icon}
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 4 }}>{s.value}</Text>
                <Text style={{ fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

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
          <Text style={{ fontSize: 16, fontWeight: '700', color: SiagaColors.primary }}>Aksi Positif</Text>
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
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 8, borderRadius: 10,
                  backgroundColor: isActive ? SiagaColors.primary : '#f1f5f9',
                }}
                onPress={() => handleFilterChange(filter.key)}
                activeOpacity={0.7}
              >
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
          <Text style={{ fontSize: 13, color: SiagaColors.secondary, marginTop: 12 }}>Memuat aksi positif...</Text>
        </View>
      ) : actions.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <HandsClapping size={28} color={SiagaColors.success} weight="duotone" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: SiagaColors.primary, marginBottom: 4 }}>Belum ada aksi</Text>
          <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center', lineHeight: 18 }}>
            Aksi positif komunitas akan segera tersedia. Pantau terus!
          </Text>
        </View>
      ) : (
        <FlatList
          data={actions}
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
