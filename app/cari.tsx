import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  Animated, Keyboard, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, MagnifyingGlass, X, Clock, Waves, RoadHorizon, Trash,
  Plant, Tree, CloudRain, BookOpenText, MegaphoneSimple,
  MapPin, Users, Camera, ThumbsUp, Leaf, Star,
  CheckCircle, ShieldCheck, Funnel, CaretRight,
  CalendarBlank, Newspaper, HandsClapping, Warning,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getReports, type ReportData } from '@/services/report.service';
import { getActions, type ActionData } from '@/services/action.service';
import { getInfoList, type InfoFeedData } from '@/services/info.service';

type TabKey = 'semua' | 'laporan' | 'aksi' | 'info';

interface SearchResult {
  id: string;
  type: 'report' | 'action' | 'info';
  title: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  meta: string;
  route: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'aksi', label: 'Aksi' },
  { key: 'info', label: 'Info' },
];

const POPULAR_SEARCHES = ['Banjir', 'Jalan rusak', 'Sampah', 'Gotong royong', 'Penghijauan', 'Cuaca'];

const CATEGORIES = [
  { label: 'Bencana Alam', icon: Waves, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Infrastruktur', icon: RoadHorizon, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Lingkungan', icon: Leaf, color: '#10b981', bg: '#ecfdf5' },
  { label: 'Penghijauan', icon: Tree, color: '#059669', bg: '#d1fae5' },
  { label: 'Edukasi', icon: BookOpenText, color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Pengumuman', icon: MegaphoneSimple, color: '#d97706', bg: '#fffbeb' },
];

export default function CariScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('semua');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const mapReportToResult = (r: ReportData): SearchResult => ({
    id: r.id,
    type: 'report',
    title: r.title,
    desc: r.description?.slice(0, 80) + (r.description?.length > 80 ? '...' : '') || '',
    icon: r.category === 'Banjir' || r.category === 'Bencana Alam' ? 'Waves' : r.category === 'Jalan Rusak' || r.category === 'Infrastruktur' ? 'RoadHorizon' : 'Trash',
    color: r.urgency >= 80 ? '#dc2626' : r.urgency >= 40 ? '#f59e0b' : '#10b981',
    bg: r.urgency >= 80 ? '#fef2f2' : r.urgency >= 40 ? '#fffbeb' : '#ecfdf5',
    badge: r.status,
    badgeColor: r.status === 'Selesai' ? '#059669' : r.status === 'Ditangani' ? '#7c3aed' : r.status === 'Diverifikasi' ? '#2563eb' : '#d97706',
    badgeBg: r.status === 'Selesai' ? '#ecfdf5' : r.status === 'Ditangani' ? '#f5f3ff' : r.status === 'Diverifikasi' ? '#eff6ff' : '#fffbeb',
    meta: `${r.district || '-'} · ${r.votesCount} dukungan`,
    route: '/report-detail',
  });

  const mapActionToResult = (a: ActionData): SearchResult => ({
    id: a.id,
    type: 'action',
    title: a.title,
    desc: a.description?.slice(0, 80) + (a.description?.length > 80 ? '...' : '') || '',
    icon: a.category === 'Kebersihan' || a.category === 'Lingkungan' ? 'Plant' : a.category === 'Penghijauan' ? 'Tree' : 'HandsClapping',
    color: '#059669',
    bg: '#ecfdf5',
    badge: a.status,
    badgeColor: a.status === 'Selesai' ? '#059669' : a.status === 'Berlangsung' ? '#d97706' : '#2563eb',
    badgeBg: a.status === 'Selesai' ? '#ecfdf5' : a.status === 'Berlangsung' ? '#fffbeb' : '#eff6ff',
    meta: `+${a.points} pts · ${a.totalParticipants} peserta`,
    route: '/action-detail',
  });

  const mapInfoToResult = (info: InfoFeedData): SearchResult => ({
    id: info.id,
    type: 'info',
    title: info.title,
    desc: info.subtitle || info.source || '',
    icon: info.type || 'BookOpenText',
    color: info.color || '#3498db',
    bg: info.bg || '#eff6ff',
    badge: info.category === 'cuaca' ? 'Cuaca' : info.category === 'edukasi' ? 'Edukasi' : 'Pengumuman',
    badgeColor: info.color || '#3498db',
    badgeBg: info.bg || '#eff6ff',
    meta: info.source,
    route: '/info-detail',
  });

  const performSearch = useCallback(async (searchQuery: string, tab: TabKey = activeTab) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const allResults: SearchResult[] = [];

    try {
      if (tab === 'semua' || tab === 'laporan') {
        const reportsResult = await getReports({ limit: 20 });
        if (reportsResult.success && reportsResult.data) {
          const filtered = reportsResult.data.filter(r =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.district?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          allResults.push(...filtered.map(mapReportToResult));
        }
      }

      if (tab === 'semua' || tab === 'aksi') {
        const actionsResult = await getActions({ limit: 20 });
        if (actionsResult.success && actionsResult.data) {
          const filtered = actionsResult.data.filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.category?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          allResults.push(...filtered.map(mapActionToResult));
        }
      }

      if (tab === 'semua' || tab === 'info') {
        const infoResult = await getInfoList({ limit: 20 });
        if (infoResult.success && infoResult.data) {
          const filtered = infoResult.data.filter(i =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.category?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          allResults.push(...filtered.map(mapInfoToResult));
        }
      }
    } catch (e) {
      // Silently fail
    }

    setResults(allResults);
    setIsSearching(false);
  }, [activeTab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (query.trim()) performSearch(query, tab);
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    performSearch(term);
  };

  const getResultIcon = (iconName: string, color: string) => {
    const props = { size: 24, color, weight: 'duotone' as const };
    switch (iconName) {
      case 'Waves': return <Waves {...props} />;
      case 'RoadHorizon': return <RoadHorizon {...props} />;
      case 'Trash': return <Trash {...props} />;
      case 'Plant': return <Plant {...props} />;
      case 'Tree': return <Tree {...props} />;
      case 'HandsClapping': return <HandsClapping {...props} />;
      case 'CloudRain': return <CloudRain {...props} />;
      case 'BookOpenText': return <BookOpenText {...props} />;
      case 'MegaphoneSimple': return <MegaphoneSimple {...props} />;
      default: return <MagnifyingGlass {...props} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'report': return { label: 'Laporan', color: '#3b82f6', bg: '#eff6ff' };
      case 'action': return { label: 'Aksi', color: '#059669', bg: '#ecfdf5' };
      case 'info': return { label: 'Info', color: '#f59e0b', bg: '#fffbeb' };
      default: return { label: '', color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
    const typeStyle = getTypeLabel(item.type);
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          backgroundColor: '#fff', borderRadius: 16, padding: 14,
          borderWidth: 1, borderColor: '#edf2f9',
          elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
          marginBottom: 10,
        }}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: item.route as any, params: { id: item.id } })}
      >
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
          {getResultIcon(item.icon, item.color)}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <View style={{ backgroundColor: typeStyle.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: typeStyle.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{typeStyle.label}</Text>
            </View>
            {item.badge && (
              <View style={{ backgroundColor: item.badgeBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: item.badgeColor }} />
                <Text style={{ fontSize: 9, fontWeight: '700', color: item.badgeColor }}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary, lineHeight: 18 }} numberOfLines={1}>{item.title}</Text>
          <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }} numberOfLines={1}>{item.meta}</Text>
        </View>
        <CaretRight size={16} color={SiagaColors.secondary} />
      </TouchableOpacity>
    );
  };

  const renderEmptySearch = () => (
    <Animated.View style={{ opacity: fadeAnim, paddingTop: 8 }}>
      {/* Popular Searches */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Clock size={16} color={SiagaColors.secondary} weight="duotone" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Pencarian Populer</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {POPULAR_SEARCHES.map((term, i) => (
            <TouchableOpacity
              key={i}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
                borderWidth: 1, borderColor: '#edf2f9',
                elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2,
              }}
              activeOpacity={0.7}
              onPress={() => handleQuickSearch(term)}
            >
              <MagnifyingGlass size={13} color={SiagaColors.secondary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Browse Categories */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Funnel size={16} color={SiagaColors.secondary} weight="duotone" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Telusuri Kategori</Text>
        </View>
        <View style={{ gap: 8 }}>
          {CATEGORIES.map((cat, i) => {
            const IconComp = cat.icon;
            return (
              <TouchableOpacity
                key={i}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: '#fff', borderRadius: 14, padding: 14,
                  borderWidth: 1, borderColor: '#edf2f9',
                  elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2,
                }}
                activeOpacity={0.7}
                onPress={() => handleQuickSearch(cat.label)}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={22} color={cat.color} weight="duotone" />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: SiagaColors.primary }}>{cat.label}</Text>
                <CaretRight size={16} color={SiagaColors.secondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );

  const renderNoResults = () => (
    <View style={{ alignItems: 'center', paddingTop: 60 }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <MagnifyingGlass size={28} color={SiagaColors.secondary} weight="duotone" />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: SiagaColors.primary, marginBottom: 4 }}>Tidak ditemukan</Text>
      <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center', lineHeight: 18 }}>
        Tidak ada hasil untuk "{query}".{'\n'}Coba kata kunci lain.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#edf2f9' }}>
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={SiagaColors.primary} weight="bold" />
          </TouchableOpacity>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, height: 42,
          }}>
            <MagnifyingGlass size={18} color={SiagaColors.secondary} />
            <TextInput
              ref={inputRef}
              style={{ flex: 1, fontSize: 14, color: SiagaColors.primary, marginLeft: 8, paddingVertical: 0 }}
              placeholder="Cari laporan, aksi, info..."
              placeholderTextColor={SiagaColors.secondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => performSearch(query)}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }} style={{ padding: 4 }}>
                <X size={16} color={SiagaColors.secondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={{ paddingHorizontal: 12, height: 42, borderRadius: 12, backgroundColor: SiagaColors.primary, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => { Keyboard.dismiss(); performSearch(query); }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Cari</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                backgroundColor: activeTab === tab.key ? SiagaColors.primary : '#f1f5f9',
              }}
              onPress={() => handleTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 12, fontWeight: '600',
                color: activeTab === tab.key ? '#fff' : SiagaColors.secondary,
              }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {isSearching ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={SiagaColors.primary} />
          <Text style={{ fontSize: 13, color: SiagaColors.secondary, marginTop: 12 }}>Mencari...</Text>
        </View>
      ) : hasSearched ? (
        results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={item => `${item.type}-${item.id}`}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={{ fontSize: 13, color: SiagaColors.secondary, marginBottom: 12 }}>
                {results.length} hasil ditemukan untuk "{query}"
              </Text>
            }
          />
        ) : renderNoResults()
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderEmptySearch()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
