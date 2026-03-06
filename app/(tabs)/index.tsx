import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ScrollView, FlatList, View, Text, TouchableOpacity, Linking, Alert, RefreshControl, Modal } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Warning, X, Sun, Moon, SunHorizon, Cloud, Bell, MagnifyingGlass, MapPin, ShieldWarning,
  FileText, ChartLineUp, Clock, Megaphone, MapTrifold, Siren, Robot,
  FireTruck, Ambulance, PoliceCar, Binoculars, PhoneCall,
  Waves, RoadHorizon, Trash, Users, Camera, ThumbsUp,
  Leaf, Star, Medal, Trophy, CaretRight, HandsClapping,
  Plant, Tree, Newspaper, CloudRain, BookOpenText, MegaphoneSimple,
  CheckCircle, ShieldCheck as ShieldCheckIcon, ArrowDown, Globe, Crosshair,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';
import SectionHeader from '@/components/ui/SectionHeader';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { getReports, toggleReportVote, type ReportData } from '@/services/report.service';
import { getActions, type ActionData } from '@/services/action.service';
import { getAreaStatus, type AreaStatusData } from '@/services/area-status.service';
import { getInfoList, type InfoFeedData } from '@/services/info.service';
import { getNotifications } from '@/services/notification.service';
import { getGempaTerkini, type GempaData } from '@/services/bmkg.service';
import {
  type Report,
} from '@/services/report.service';

function getGreeting(): { text: string; Icon: React.ComponentType<any> } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return { text: 'Selamat Pagi', Icon: Sun };
  if (hour >= 11 && hour < 15) return { text: 'Selamat Siang', Icon: SunHorizon };
  if (hour >= 15 && hour < 18) return { text: 'Selamat Sore', Icon: Cloud };
  return { text: 'Selamat Malam', Icon: Moon };
}

// Color scheme berdasarkan magnitudo gempa
function getGempaColors(mag: number) {
  if (mag >= 6.0) return {
    bg: '#7f1d1d', accent: '#ef4444', text: '#fecaca', muted: 'rgba(254,202,202,0.5)',
    subtle: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', overlay: 'rgba(127,29,29,0.85)',
    label: 'DAHSYAT', labelBg: 'rgba(239,68,68,0.2)',
  };
  if (mag >= 5.0) return {
    bg: '#7c2d12', accent: '#f97316', text: '#fed7aa', muted: 'rgba(253,186,116,0.5)',
    subtle: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', overlay: 'rgba(124,45,18,0.85)',
    label: 'KUAT', labelBg: 'rgba(249,115,22,0.2)',
  };
  if (mag >= 3.0) return {
    bg: '#78350f', accent: '#f59e0b', text: '#fde68a', muted: 'rgba(253,230,138,0.5)',
    subtle: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', overlay: 'rgba(120,53,15,0.85)',
    label: 'SEDANG', labelBg: 'rgba(245,158,11,0.2)',
  };
  return {
    bg: '#064e3b', accent: '#10b981', text: '#a7f3d0', muted: 'rgba(167,243,208,0.5)',
    subtle: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', overlay: 'rgba(6,78,59,0.85)',
    label: 'RINGAN', labelBg: 'rgba(16,185,129,0.2)',
  };
}

export default function HomeScreen() {
  const [showWarning, setShowWarning] = useState(true);
  const [sosVisible, setSosVisible] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [actions, setActions] = useState<ActionData[]>([]);
  const [areaStatus, setAreaStatus] = useState<AreaStatusData | null>(null);
  const [infoFeed, setInfoFeed] = useState<InfoFeedData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [gempaData, setGempaData] = useState<GempaData | null>(null);
  const [showGempa, setShowGempa] = useState(true);
  const [gempaModalVisible, setGempaModalVisible] = useState(false);
  const [showFullShakemap, setShowFullShakemap] = useState(false);
  const gempaColors = useMemo(() => getGempaColors(gempaData?.magnitude ?? 0), [gempaData]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const greeting = useMemo(() => getGreeting(), []);

  // Helper: konversi data API ke format UI Report
  const mapReportToUI = useCallback((r: ReportData): Report & { status: string } => ({
    id: r.id,
    type: r.category === 'Banjir' ? 'Waves' : r.category === 'Jalan Rusak' ? 'RoadHorizon' : 'Trash',
    gradient: r.status === 'Selesai' ? '#10b981' : '#3b82f6',
    badge: r.status === 'Selesai' ? 'Rendah' : r.urgency >= 80 ? 'Kritis' : r.urgency >= 40 ? 'Sedang' : 'Rendah',
    badgeBg: r.status === 'Selesai' ? '#ecfdf5' : r.urgency >= 80 ? '#fee2e2' : r.urgency >= 40 ? '#fef3c7' : '#dcfce7',
    badgeColor: r.status === 'Selesai' ? '#10b981' : r.urgency >= 80 ? '#dc2626' : r.urgency >= 40 ? '#f59e0b' : '#10b981',
    title: r.title,
    desc: r.description?.slice(0, 60) + (r.description?.length > 60 ? '...' : '') || '',
    distance: `${r.district || '-'}`,
    votes: r.votesCount,
    photos: r.photosCount,
    time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    urgency: r.urgency,
    urgencyColor: r.status === 'Selesai' ? '#10b981' : r.urgency >= 80 ? '#dc2626' : r.urgency >= 40 ? '#f59e0b' : '#10b981',
    supported: r.hasVoted || false,
    status: r.status,
  }), []);

  // Ref untuk district agar loadData selalu baca nilai terbaru tanpa jadi dependency
  const userDistrictRef = useRef(user?.district || '');
  userDistrictRef.current = user?.district || '';

  // Fungsi load data (reusable untuk refresh)
  const loadData = useCallback(async () => {
    const [reportsResult, actionsResult, areaStatusResult, infoResult, gempaResult] = await Promise.all([
      getReports({ limit: 5 }),
      getActions({ limit: 5 }),
      getAreaStatus(userDistrictRef.current),
      getInfoList({ limit: 3 }),
      getGempaTerkini(),
    ]);
    if (reportsResult.success && reportsResult.data) {
      const mapped = reportsResult.data.map(mapReportToUI);
      // Laporan aktif di atas, Selesai di bawah
      mapped.sort((a, b) => {
        const aDone = (a as any).status === 'Selesai' ? 1 : 0;
        const bDone = (b as any).status === 'Selesai' ? 1 : 0;
        return aDone - bDone;
      });
      setReports(mapped);
    }
    if (actionsResult.success && actionsResult.data) {
      setActions(actionsResult.data);
    }
    if (areaStatusResult.success && areaStatusResult.data) {
      setAreaStatus(areaStatusResult.data);
    }
    if (infoResult.success && infoResult.data) {
      setInfoFeed(infoResult.data);
    }
    // Fetch unread notification count
    const notifResult = await getNotifications();
    if (notifResult.success && notifResult.data) {
      setUnreadCount(notifResult.data.unreadCount || 0);
    }
    // BMKG gempa — graceful: jika gagal, tetap null (card tersembunyi)
    if (gempaResult.success && gempaResult.data) {
      setGempaData(gempaResult.data);
    }
  }, [mapReportToUI]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load awal
  useEffect(() => {
    loadData();
    // Refresh user profile sekali saat mount (terpisah dari loadData agar tidak loop)
    if (refreshUser) refreshUser();
  }, [loadData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setShowGempa(true);
    await loadData();
    if (refreshUser) await refreshUser();
    setIsRefreshing(false);
    showToast({ type: 'success', title: 'Data diperbarui', message: 'Data terbaru berhasil dimuat.', duration: 2000 });
  }, [loadData, showToast, refreshUser]);

  const handleSupport = async (reportId: string) => {
    const result = await toggleReportVote(reportId);
    if (result.success) {
      const serverVoted = result.data?.voted;
      const serverCount = result.data?.votesCount;
      const newUrgency = result.data?.urgency;
      setReports(prev =>
        prev.map(r => {
          if (r.id !== reportId) return r;
          const urg = newUrgency ?? r.urgency;
          const urgColor = urg >= 80 ? '#dc2626' : urg >= 40 ? '#f59e0b' : '#10b981';
          return {
            ...r,
            supported: serverVoted ?? !r.supported,
            votes: serverCount ?? (r.supported ? r.votes - 1 : r.votes + 1),
            urgency: urg,
            urgencyColor: urgColor,
            badge: urg >= 80 ? 'Kritis' : urg >= 40 ? 'Sedang' : 'Rendah',
            badgeBg: urg >= 80 ? '#fee2e2' : urg >= 40 ? '#fef3c7' : '#dcfce7',
            badgeColor: urgColor,
          };
        })
      );
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
      {/* Warning Banner */}
      {showWarning && areaStatus?.hasWarning && (
        <View className="flex-row items-center gap-3 px-4 py-3" style={{ backgroundColor: areaStatus.levelColor || '#f59e0b' }}>
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
            <Warning size={18} color="#fff" weight="duotone" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Peringatan — {areaStatus.warningType}</Text>
            <Text className="text-[11px] text-white/90">{areaStatus.warningMessage}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowWarning(false)} className="p-1.5">
            <X size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
              <Text className="text-white font-bold text-base">{user?.initials || 'U'}</Text>
            </View>
            <View>
              <View className="flex-row items-center gap-1">
                <Text className="text-[14px] text-secondary">{greeting.text} </Text>
                <greeting.Icon size={18} color="#fbbf24" weight="duotone" />
              </View>
              <Text className="text-base font-bold text-primary">{user?.fullName || 'User'}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="relative w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center"
              style={{ elevation: 1 }}
              onPress={() => { setUnreadCount(0); router.push('/notifikasi'); }}
            >
              <Bell size={22} color={SiagaColors.primary} weight="duotone" />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute', top: -2, right: -2,
                  minWidth: 18, height: 18, borderRadius: 9,
                  backgroundColor: '#dc2626', borderWidth: 2, borderColor: '#fff',
                  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
                }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center"
              style={{ elevation: 1 }}
              onPress={() => router.push('/cari')}
            >
              <MagnifyingGlass size={22} color={SiagaColors.primary} weight="duotone" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        className="flex-1 px-5 pb-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={SiagaColors.primary} colors={[SiagaColors.primary]} />}
        data={reports}
        keyExtractor={(item) => item.id}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        ListHeaderComponent={
          <>
            {/* BMKG Gempa Terkini Card */}
            {showGempa && gempaData && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setGempaModalVisible(true)}
                style={{
                  backgroundColor: gempaColors.bg,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: gempaColors.border,
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: gempaColors.subtle, alignItems: 'center', justifyContent: 'center' }}>
                      <Warning size={18} color={gempaColors.accent} weight="fill" />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: gempaColors.text, letterSpacing: 1, textTransform: 'uppercase' }}>Gempa Terkini</Text>
                        <View style={{ backgroundColor: gempaColors.labelBg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 8, fontWeight: '800', color: gempaColors.accent }}>{gempaColors.label}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 10, color: gempaColors.muted }}>Sumber: BMKG</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); setShowGempa(false); }} style={{ padding: 4 }}>
                    <X size={16} color={gempaColors.muted} />
                  </TouchableOpacity>
                </View>

                {/* Two-column: Info Left + Shakemap Right */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
                  {/* Left: Text info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <View style={{
                        width: 50, height: 50, borderRadius: 12,
                        backgroundColor: gempaColors.subtle,
                        borderWidth: 1, borderColor: gempaColors.border,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: gempaColors.accent }}>{gempaData.magnitude}</Text>
                        <Text style={{ fontSize: 7, fontWeight: '700', color: gempaColors.muted, marginTop: -2 }}>MAG</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: gempaColors.text }} numberOfLines={2}>{gempaData.wilayah}</Text>
                        <Text style={{ fontSize: 10, color: gempaColors.muted, marginTop: 2 }}>{gempaData.tanggal} • {gempaData.jam}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 4 }}>
                      {[
                        { label: 'Kedalaman', value: gempaData.kedalaman },
                        { label: 'Koordinat', value: `${gempaData.lintang}, ${gempaData.bujur}` },
                      ].map((item, i) => (
                        <View key={i} style={{
                          flexDirection: 'row', alignItems: 'center', gap: 6,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8,
                        }}>
                          <Text style={{ fontSize: 10, color: gempaColors.muted, fontWeight: '600' }}>{item.label}:</Text>
                          <Text style={{ fontSize: 11, color: gempaColors.text, fontWeight: '700', flex: 1 }} numberOfLines={1}>{item.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  {/* Right: Shakemap image */}
                  {gempaData.shakemapUrl && (
                    <View style={{
                      width: 110, height: 130, borderRadius: 10,
                      overflow: 'hidden',
                      borderWidth: 1.5, borderColor: gempaColors.border,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}>
                      <ExpoImage
                        source={{ uri: gempaData.shakemapUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                      />
                      <View style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        backgroundColor: gempaColors.overlay,
                        paddingVertical: 3, alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 8, fontWeight: '700', color: gempaColors.muted, letterSpacing: 0.5 }}>SHAKEMAP</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Hint */}
                <Text style={{ fontSize: 10, color: gempaColors.muted, textAlign: 'center', marginTop: 8 }}>Ketuk untuk melihat detail ›</Text>
              </TouchableOpacity>
            )}

            {/* Status Card */}
            <View className="rounded-2xl p-4 overflow-hidden" style={{ backgroundColor: SiagaColors.primary }}>
              <View className="flex-row items-center gap-1.5 mb-3">
                <View className="w-2.5 h-2.5 rounded-full bg-success" />
                <Text className="text-[13px] font-medium text-white/70 uppercase tracking-wider">Status Area Anda</Text>
              </View>
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <View className="flex-row items-center gap-1.5">
                    <MapPin size={20} color="rgba(255,255,255,0.8)" weight="duotone" />
                    <Text className="text-xl font-bold text-white">{user?.district || 'Lokasi Belum Diatur'}</Text>
                  </View>
                  <Text className="text-[14px] text-white/60 ml-7">
                    {user?.district ? `${user?.city || '-'}, ${user?.province || '-'}` : ''}
                  </Text>
                  {!user?.district && (
                    <TouchableOpacity
                      className="flex-row items-center gap-1.5 ml-7 mt-1 px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                      activeOpacity={0.7}
                      onPress={() => router.push('/edit-profil')}
                    >
                      <MapPin size={13} color="#fff" weight="bold" />
                      <Text className="text-[12px] font-semibold text-white">Atur Lokasi</Text>
                      <CaretRight size={12} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                  )}
                </View>
                <View>
                  <View className="rounded-lg px-3 py-2 flex-row items-center gap-1.5" style={{ backgroundColor: areaStatus?.levelBg || 'rgba(5,150,105,0.2)', borderWidth: 1, borderColor: (areaStatus?.levelColor || '#059669') + '4D' }}>
                    <ShieldWarning size={16} color={areaStatus?.levelColor || '#059669'} weight="duotone" />
                    <Text className="text-[11px] font-bold" style={{ color: areaStatus?.levelColor || '#059669' }}>{areaStatus?.level || 'AMAN'}</Text>
                  </View>
                  {areaStatus?.isGlobal && (
                    <Text className="text-[9px] text-white/40 text-center mt-1">Data Global</Text>
                  )}
                </View>
              </View>
              <View className="flex-row gap-2">
                {[
                  { icon: <FileText size={22} color="rgba(255,255,255,0.6)" weight="duotone" />, value: String(areaStatus?.activeReports ?? '-'), label: 'Laporan Aktif' },
                  { icon: <ChartLineUp size={22} color="rgba(255,255,255,0.6)" weight="duotone" />, value: areaStatus ? `${areaStatus.responseRate}%` : '-%', label: 'Respon Rate' },
                  { icon: <Clock size={22} color="rgba(255,255,255,0.6)" weight="duotone" />, value: areaStatus ? `${areaStatus.avgResponseHours}j` : '-j', label: 'Avg. Respons' },
                ].map((stat, i) => (
                  <View key={i} className="flex-1 rounded-xl p-3 items-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    {stat.icon}
                    <Text className="text-xl font-bold text-white mt-1">{stat.value}</Text>
                    <Text className="text-[12px] text-white/60 font-medium">{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View>
              <Text className="text-base font-bold text-primary mb-3">Menu Utama</Text>
              <View className="flex-row justify-between">
                {[
                  { icon: <Megaphone size={30} color="#2563eb" weight="duotone" />, label: 'Lapor', bg: '#dbeafe', border: '#bfdbfe', onPress: () => router.push('/(tabs)/lapor') },
                  { icon: <MapTrifold size={30} color="#059669" weight="duotone" />, label: 'Pantau', bg: '#d1fae5', border: '#a7f3d0', onPress: () => router.push('/(tabs)/pantau') },
                  { icon: <Siren size={30} color={SiagaColors.danger} weight="duotone" />, label: 'SOS', bg: '#fee2e2', border: '#fecaca', sos: true, onPress: () => setSosVisible(true) },
                  { icon: <Robot size={30} color="#7c3aed" weight="duotone" />, label: 'AI Chat', bg: '#ede9fe', border: '#ddd6fe', onPress: () => router.push('/(tabs)/aichat') },
                ].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    className="items-center gap-2"
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View className="w-16 h-16 rounded-2xl items-center justify-center" style={{ backgroundColor: item.bg, borderWidth: 1, borderColor: item.border }}>
                      {item.icon}
                    </View>
                    <Text className="text-[13px] font-semibold" style={{ color: item.sos ? SiagaColors.danger : 'rgba(8,42,76,0.8)' }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Emergency Contacts */}
            <View>
              <SectionHeader title="Panggilan Darurat" onAction={() => setSosVisible(true)} actionLabel="SOS" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {[
                  { icon: <PhoneCall size={24} color="#dc2626" weight="duotone" />, name: 'Darurat Nasional', num: '112', color: '#dc2626', bg: '#fef2f2' },
                  { icon: <FireTruck size={24} color={SiagaColors.danger} weight="duotone" />, name: 'Pemadam', num: '113', color: SiagaColors.danger, bg: '#fef2f2' },
                  { icon: <Ambulance size={24} color={SiagaColors.info} weight="duotone" />, name: 'Ambulans', num: '118/119', color: SiagaColors.info, bg: '#eff6ff' },
                  { icon: <PoliceCar size={24} color={SiagaColors.primary} weight="duotone" />, name: 'Polisi', num: '110', color: SiagaColors.primary, bg: '#f8fafc' },
                  { icon: <Binoculars size={24} color="#d97706" weight="duotone" />, name: 'SAR', num: '115', color: '#d97706', bg: '#fffbeb' },
                  { icon: <PhoneCall size={24} color="#059669" weight="duotone" />, name: 'PLN', num: '123', color: '#059669', bg: '#ecfdf5' },
                ].map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    className="flex-row items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3.5"
                    style={{ elevation: 1 }}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(`tel:${c.num}`)}
                  >
                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: c.bg }}>{c.icon}</View>
                    <View>
                      <Text className="text-[13px] font-bold text-primary">{c.name}</Text>
                      <Text className="text-[16px] font-extrabold tracking-wider" style={{ color: c.color }}>{c.num}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Nearby Reports Header */}
            <SectionHeader title="Laporan di Sekitar" subtitle="Dalam radius lokasi Anda" onAction={() => router.push('/(tabs)/pantau')} actionLabel="Lihat Semua" />
          </>
        }
        renderItem={({ item: r }) => {
          const reportIcon = r.type === 'Waves'
            ? <Waves size={30} color="#fff" weight="duotone" />
            : r.type === 'RoadHorizon'
              ? <RoadHorizon size={30} color="#fff" weight="duotone" />
              : <Trash size={30} color="#fff" weight="duotone" />;
          return (
            <TouchableOpacity
              className="bg-white border border-slate-100 rounded-2xl p-3.5"
              style={{ elevation: 1 }}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/report-detail', params: { id: r.id } })}
            >
              <View className="flex-row gap-3">
                <View className="w-16 h-16 rounded-xl items-center justify-center" style={{ backgroundColor: r.gradient }}>
                  {reportIcon}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1 flex-wrap">
                    <View className="px-3 py-1 rounded flex-row items-center gap-1" style={{ backgroundColor: r.badgeBg }}>
                      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r.badgeColor }} />
                      <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: r.badgeColor }}>{r.badge}</Text>
                    </View>
                    {(r as any).status === 'Selesai' && (
                      <View className="px-2 py-1 rounded flex-row items-center gap-1" style={{ backgroundColor: '#ecfdf5' }}>
                        <CheckCircle size={10} color="#059669" weight="fill" />
                        <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#059669' }}>Selesai</Text>
                      </View>
                    )}
                    <View className="flex-row items-center gap-1">
                      <Clock size={14} color={SiagaColors.secondary} />
                      <Text className="text-[12px] text-secondary">{r.time}</Text>
                    </View>
                  </View>
                  <Text className="text-[16px] font-bold text-primary">{r.title}</Text>
                  <Text className="text-[13px] text-secondary mt-0.5" numberOfLines={1}>{r.desc}</Text>
                  <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                    <View className="flex-row items-center gap-1">
                      <MapPin size={15} color={SiagaColors.secondary} weight="duotone" />
                      <Text className="text-[11px] text-secondary">{r.distance}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Users size={15} color={SiagaColors.primary} weight="duotone" />
                      <Text className="text-[11px] font-semibold text-primary">{r.votes}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Camera size={15} color={SiagaColors.secondary} weight="duotone" />
                      <Text className="text-[11px] text-secondary">{r.photos} foto</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                {(r as any).status !== 'Selesai' ? (
                  <View className="flex-row items-center gap-2">
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r.urgencyColor }} />
                    <Text className="text-[12px] font-semibold" style={{ color: r.urgencyColor }}>Urgensi: {r.urgency} poin</Text>
                    <View className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <View className="h-full rounded-full" style={{ width: `${Math.min(r.urgency, 100)}%`, backgroundColor: r.urgencyColor }} />
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5">
                    <CheckCircle size={16} color="#059669" weight="fill" />
                    <Text className="text-[12px] font-semibold" style={{ color: '#059669' }}>Masalah Teratasi</Text>
                  </View>
                )}
                {(r as any).status !== 'Selesai' ? (
                  <TouchableOpacity
                    className="flex-row items-center gap-1.5 rounded-lg px-3.5 py-2"
                    style={{ backgroundColor: r.supported ? '#dcfce7' : SiagaColors.primary }}
                    onPress={(e) => { e.stopPropagation?.(); handleSupport(r.id); }}
                    activeOpacity={0.7}
                  >
                    <ThumbsUp size={14} color={r.supported ? '#15803d' : '#fff'} weight={r.supported ? 'fill' : 'bold'} />
                    <Text className="text-[13px] font-semibold" style={{ color: r.supported ? '#15803d' : '#fff' }}>
                      {r.supported ? 'Didukung' : 'Dukung'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row items-center gap-1.5 rounded-lg px-3.5 py-2 bg-slate-100">
                    <ThumbsUp size={14} color="#94a3b8" weight="bold" />
                    <Text className="text-[13px] font-semibold text-secondary">{r.votes}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <>
            {/* Eco Points */}
            <TouchableOpacity
              className="rounded-2xl p-4 border border-accent/20"
              style={{ backgroundColor: SiagaColors.surface }}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profil')}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <View className="flex-row items-center gap-1.5">
                    <Leaf size={20} color={SiagaColors.success} weight="duotone" />
                    <Text className="text-base font-bold text-primary">Eco-Points Saya</Text>
                  </View>
                  <Text className="text-[13px] text-secondary mt-0.5">Terus berkontribusi untuk komunitasmu!</Text>
                </View>
                <View className="bg-white rounded-xl px-3 py-2 flex-row items-center gap-1.5" style={{ elevation: 1 }}>
                  <Star size={18} color="#fbbf24" weight="duotone" />
                  <Text className="text-[16px] font-bold text-primary">{user?.ecoPoints || 0} pts</Text>
                </View>
              </View>
              <View className="flex-row gap-2 mb-3">
                <View className="flex-row items-center gap-1.5 bg-white/80 rounded-lg px-3 py-1.5.5" style={{ elevation: 1 }}>
                  <Medal size={18} color="#f59e0b" weight="duotone" />
                  <Text className="text-[12px] font-semibold text-primary">{user?.currentBadge || 'Warga Baru'}</Text>
                </View>
                <View className="flex-row items-center gap-1.5 bg-white/50 rounded-lg px-3 py-1.5.5 border border-dashed border-accent">
                  <Trophy size={18} color="rgba(152,172,195,0.4)" weight="duotone" />
                  <Text className="text-[12px] font-medium text-secondary">Terus berkontribusi!</Text>
                </View>
              </View>
              <View className="bg-white/60 rounded-lg p-2.5">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-[12px] font-medium text-secondary">Level berikutnya</Text>
                  <Text className="text-[12px] font-bold text-primary">{user?.ecoPoints || 0} pts</Text>
                </View>
                <View className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(((user?.ecoPoints || 0) / 300) * 100, 100)}%`,
                      backgroundColor: SiagaColors.info,
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Positive Actions */}
            <View>
              <SectionHeader title="Aksi Positif" icon={<HandsClapping size={18} color="#f59e0b" weight="duotone" />} onAction={() => router.push('/(tabs)/lapor')} actionLabel="Ikut Aksi" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {actions.map((a) => {
                  return (
                    <TouchableOpacity
                      key={a.id}
                      className="w-[220px] bg-white border border-slate-100 rounded-2xl overflow-hidden"
                      style={{ elevation: 1 }}
                      activeOpacity={0.85}
                      onPress={() => router.push({ pathname: '/action-detail', params: { id: a.id } })}
                    >
                      <View className="h-28 items-center justify-center" style={{ backgroundColor: '#ecfdf5' }}>
                        <Plant size={48} color="rgba(5,150,105,0.6)" weight="duotone" />
                      </View>
                      <View className="p-3.5">
                        <View className="flex-row items-center gap-1 mb-1">
                          <View className="flex-row items-center gap-1 px-3 py-1 rounded" style={{ backgroundColor: 'rgba(39,174,96,0.1)' }}>
                            <CheckCircle size={13} color={SiagaColors.success} weight="fill" />
                            <Text className="text-[12px] font-semibold text-success">{a.status}</Text>
                          </View>
                        </View>
                        <Text className="text-[14px] font-bold text-primary leading-tight">{a.title}</Text>
                        <View className="flex-row items-center gap-2 mt-2">
                          <View className="flex-row items-center gap-1">
                            <Clock size={13} color={SiagaColors.secondary} />
                            <Text className="text-[12px] text-secondary">{new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text>
                          </View>
                          <Text className="text-[12px] text-success font-semibold">+{a.points} pts</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Info Feed */}
            <View>
              <SectionHeader title="Info & Edukasi" icon={<Newspaper size={16} color={SiagaColors.info} weight="duotone" />} onAction={() => showToast({ type: 'info', title: 'Info & Edukasi', message: 'Halaman lengkap akan segera hadir.' })} actionLabel="Semua" />
              <View className="gap-2.5">
                {infoFeed.map((info) => {
                  const infoIcon = info.type === 'CloudRain'
                    ? <CloudRain size={26} color={info.color} weight="duotone" />
                    : info.type === 'BookOpenText'
                      ? <BookOpenText size={26} color={info.color} weight="duotone" />
                      : <MegaphoneSimple size={26} color={info.color} weight="duotone" />;
                  return (
                    <TouchableOpacity
                      key={info.id}
                      className="flex-row items-center gap-3 bg-white border border-slate-100 rounded-xl p-3.5"
                      style={{ elevation: 1 }}
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: '/info-detail', params: { id: info.id } })}
                    >
                      <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: info.bg }}>{infoIcon}</View>
                      <View className="flex-1">
                        <Text className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: info.color }}>{info.source}</Text>
                        <Text className="text-[14px] font-bold text-primary leading-tight mt-0.5">{info.title}</Text>
                      </View>
                      <CaretRight size={18} color={SiagaColors.secondary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        }
      />

      {/* Floating SOS */}
      <SOSButton onPress={() => setSosVisible(true)} />
      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />

      {/* Gempa Detail Modal */}
      <Modal
        visible={gempaModalVisible}
        animationType="slide"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => setGempaModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#1c1917' }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Shakemap full-width */}
            {gempaData?.shakemapUrl && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowFullShakemap(true)}
                style={{ backgroundColor: '#0c0a09' }}
              >
                <ExpoImage
                  source={{ uri: gempaData.shakemapUrl }}
                  style={{ width: '100%', height: 260 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={200}
                />
                <View style={{
                  position: 'absolute', bottom: 8, right: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6,
                  paddingVertical: 3, paddingHorizontal: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                }}>
                  <MagnifyingGlass size={10} color="#fff" weight="bold" />
                  <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>Tap untuk perbesar</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Header bar */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 20, paddingTop: gempaData?.shakemapUrl ? 16 : (insets.top + 16), paddingBottom: 12,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: gempaColors.subtle, alignItems: 'center', justifyContent: 'center' }}>
                  <Warning size={20} color={gempaColors.accent} weight="fill" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: gempaColors.text }}>Detail Gempa Bumi</Text>
                  <Text style={{ fontSize: 11, color: gempaColors.muted }}>Data resmi BMKG Indonesia</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setGempaModalVisible(false)}
                style={{
                  width: 34, height: 34, borderRadius: 17,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} color={gempaColors.muted} />
              </TouchableOpacity>
            </View>

            {/* Magnitude highlight */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                backgroundColor: gempaColors.bg, borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: gempaColors.border,
              }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 16,
                  backgroundColor: gempaColors.subtle,
                  borderWidth: 1.5, borderColor: gempaColors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 26, fontWeight: '900', color: gempaColors.accent }}>{gempaData?.magnitude}</Text>
                  <Text style={{ fontSize: 8, fontWeight: '700', color: gempaColors.muted, marginTop: -2 }}>MAG</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: gempaColors.text, lineHeight: 20 }}>{gempaData?.wilayah}</Text>
                  <Text style={{ fontSize: 12, color: gempaColors.muted, marginTop: 4 }}>{gempaData?.tanggal} • {gempaData?.jam}</Text>
                </View>
              </View>
            </View>

            {/* Detail Grid */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: gempaColors.muted, marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>Informasi Detail</Text>
              <View style={{ gap: 8 }}>
                {[
                  { icon: <ArrowDown size={16} color={gempaColors.accent} weight="bold" />, label: 'Kedalaman', value: gempaData?.kedalaman || '-' },
                  { icon: <Crosshair size={16} color={gempaColors.accent} weight="bold" />, label: 'Koordinat', value: `${gempaData?.lintang || '-'}, ${gempaData?.bujur || '-'}` },
                  { icon: <Clock size={16} color={gempaColors.accent} weight="bold" />, label: 'Waktu', value: `${gempaData?.tanggal || '-'}, ${gempaData?.jam || '-'}` },
                  { icon: <Globe size={16} color={gempaColors.accent} weight="bold" />, label: 'Dirasakan', value: gempaData?.dirasakan || 'Tidak dilaporkan' },
                ].map((item, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
                    paddingVertical: 12, paddingHorizontal: 14,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                  }}>
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: gempaColors.subtle, alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: gempaColors.muted, fontWeight: '600' }}>{item.label}</Text>
                      <Text style={{ fontSize: 13, color: gempaColors.text, fontWeight: '700', marginTop: 1 }}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Safety Guidelines */}
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{
                backgroundColor: gempaColors.subtle, borderRadius: 16,
                padding: 16, borderWidth: 1, borderColor: gempaColors.border,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <ShieldCheckIcon size={20} color={gempaColors.accent} weight="fill" />
                  <Text style={{ fontSize: 14, fontWeight: '800', color: gempaColors.text }}>🛡️ Panduan Keselamatan Darurat</Text>
                </View>
                {[
                  { num: '1', text: 'Jangan panik dan lindungi kepala Anda.' },
                  { num: '2', text: 'Berlindung di bawah meja yang kokoh.' },
                  { num: '3', text: 'Jauhi jendela kaca dan benda yang mudah jatuh.' },
                  { num: '4', text: 'Jika guncangan mereda, keluar ruangan dengan teratur.' },
                ].map((step, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
                    marginBottom: i < 3 ? 10 : 0,
                  }}>
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: gempaColors.labelBg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: gempaColors.accent }}>{step.num}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: gempaColors.text, fontWeight: '500', flex: 1, lineHeight: 19 }}>{step.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Bottom close button */}
          <View style={{
            paddingHorizontal: 20, paddingBottom: insets.bottom + 12, paddingTop: 12,
            borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
            backgroundColor: '#1c1917',
          }}>
            <TouchableOpacity
              onPress={() => setGempaModalVisible(false)}
              style={{
                backgroundColor: gempaColors.bg, borderRadius: 14,
                paddingVertical: 14, alignItems: 'center',
                borderWidth: 1, borderColor: gempaColors.border,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: gempaColors.text }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Shakemap Viewer */}
      <Modal
        visible={showFullShakemap}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowFullShakemap(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFullShakemap(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setShowFullShakemap(false)}
            style={{
              position: 'absolute',
              top: insets.top + 12,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>

          {/* Full shakemap */}
          <ExpoImage
            source={{ uri: gempaData?.shakemapUrl || '' }}
            style={{ width: '100%', height: '80%' }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />

          {/* Label */}
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 12 }}>Shakemap BMKG • Tap di mana saja untuk tutup</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
