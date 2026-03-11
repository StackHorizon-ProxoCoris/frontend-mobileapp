import React, { useState, useMemo, useCallback, useRef } from 'react';
import { ScrollView, FlatList, View, Text, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Warning, X, Sun, Moon, SunHorizon, Cloud, Bell, MagnifyingGlass, MapPin,
  Clock, Megaphone, MapTrifold, Siren,
  Waves, RoadHorizon, Trash,
  CaretRight,
  CheckCircle, ShieldCheck as ShieldCheckIcon, ArrowDown, Globe, Crosshair,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { getReports, toggleReportVote, type ReportData, type Report } from '@/services/report.service';
import { getActions, type ActionData } from '@/services/action.service';
import { getAreaStatus, type AreaStatusData } from '@/services/area-status.service';
import { getInfoList, type InfoFeedData } from '@/services/info.service';
import { getNotifications } from '@/services/notification.service';
import { getGempaTerkini, type GempaData } from '@/services/bmkg.service';
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
  const [, setActions] = useState<ActionData[]>([]);
  const [areaStatus, setAreaStatus] = useState<AreaStatusData | null>(null);
  const [, setInfoFeed] = useState<InfoFeedData[]>([]);
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
    gradient: r.status === 'Selesai' ? SiagaColors.success : SiagaColors.info,
    badge: r.status === 'Selesai' ? 'Rendah' : r.urgency >= 80 ? 'Kritis' : r.urgency >= 40 ? 'Sedang' : 'Rendah',
    badgeBg: r.status === 'Selesai' ? SiagaColors.successSoft : r.urgency >= 80 ? SiagaColors.dangerSoft : r.urgency >= 40 ? SiagaColors.warningSoft : SiagaColors.successSoft,
    badgeColor: r.status === 'Selesai' ? SiagaColors.success : r.urgency >= 80 ? SiagaColors.danger : r.urgency >= 40 ? SiagaColors.warning : SiagaColors.success,
    title: r.title,
    desc: r.description?.slice(0, 60) + (r.description?.length > 60 ? '...' : '') || '',
    distance: `${r.district || '-'}`,
    votes: r.votesCount,
    photos: r.photosCount,
    time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    urgency: r.urgency,
    urgencyColor: r.status === 'Selesai' ? SiagaColors.success : r.urgency >= 80 ? SiagaColors.danger : r.urgency >= 40 ? SiagaColors.warning : SiagaColors.success,
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

  useFocusEffect(
    useCallback(() => {
      void loadData();
      if (refreshUser) {
        void refreshUser();
      }
    }, [loadData, refreshUser])
  );

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
          const urgColor = urg >= 80 ? SiagaColors.danger : urg >= 40 ? SiagaColors.warning : SiagaColors.success;
          return {
            ...r,
            supported: serverVoted ?? !r.supported,
            votes: serverCount ?? (r.supported ? r.votes - 1 : r.votes + 1),
            urgency: urg,
            urgencyColor: urgColor,
            badge: urg >= 80 ? 'Kritis' : urg >= 40 ? 'Sedang' : 'Rendah',
            badgeBg: urg >= 80 ? SiagaColors.dangerSoft : urg >= 40 ? SiagaColors.warningSoft : SiagaColors.successSoft,
            badgeColor: urgColor,
          };
        })
      );
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: SiagaColors.background, paddingTop: insets.top }}>
      {/* Warning Banner */}
      {showWarning && areaStatus?.hasWarning && (
        <View className="flex-row items-center gap-3 px-4 py-4" style={{ backgroundColor: areaStatus.levelColor || SiagaColors.warning }}>
          <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center">
            <Warning size={18} color="#fff" weight="duotone" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Peringatan — {areaStatus.warningType}</Text>
            <Text className="text-xs text-white/90">{areaStatus.warningMessage}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowWarning(false)} className="h-11 w-11 items-center justify-center -mr-2" activeOpacity={0.7} hitSlop={4}>
            <X size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View className="px-5 pt-4 pb-4">
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
              className="relative h-11 w-11 rounded-full bg-white border items-center justify-center"
              style={{ elevation: 1, borderColor: SiagaColors.border }}
              onPress={() => { setUnreadCount(0); router.push('/notifikasi'); }}
              activeOpacity={0.8}
              hitSlop={4}
            >
              <Bell size={22} color={SiagaColors.primary} weight="duotone" />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute', top: -2, right: -2,
                  minWidth: 20, height: 20, borderRadius: 10,
                  backgroundColor: SiagaColors.danger, borderWidth: 2, borderColor: '#fff',
                  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="h-11 w-11 rounded-full bg-white border items-center justify-center"
              style={{ elevation: 1, borderColor: SiagaColors.border }}
              onPress={() => showToast({ type: 'info', title: 'Pencarian', message: 'Fitur pencarian akan segera hadir.' })}
              activeOpacity={0.8}
              hitSlop={4}
            >
              <MagnifyingGlass size={22} color={SiagaColors.primary} weight="duotone" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        className="flex-1 px-5 pb-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 112 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={SiagaColors.primary} colors={[SiagaColors.primary]} />}
        data={reports.slice(0, 2)}
        keyExtractor={(item) => item.id}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        ListHeaderComponent={
          <>
            {showGempa && gempaData && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setGempaModalVisible(true)}
                style={{
                  backgroundColor: gempaColors.bg,
                  borderRadius: 24,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: gempaColors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: gempaColors.subtle, alignItems: 'center', justifyContent: 'center' }}>
                      <Warning size={18} color={gempaColors.accent} weight="fill" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: gempaColors.text, letterSpacing: 0.8, textTransform: 'uppercase' }}>Gempa Terkini</Text>
                        <View style={{ backgroundColor: gempaColors.labelBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: gempaColors.accent }}>{gempaColors.label}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: gempaColors.muted, marginTop: 2 }}>Sumber resmi BMKG</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); setShowGempa(false); }}
                    style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -6, marginTop: -6 }}
                  >
                    <X size={16} color={gempaColors.muted} />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 14, alignItems: 'stretch' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <View style={{
                        width: 56, height: 56, borderRadius: 16,
                        backgroundColor: gempaColors.subtle,
                        borderWidth: 1, borderColor: gempaColors.border,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 22, fontWeight: '900', color: gempaColors.accent }}>{gempaData.magnitude}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: gempaColors.muted, marginTop: -2 }}>MAG</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: gempaColors.text, lineHeight: 21 }} numberOfLines={2}>{gempaData.wilayah}</Text>
                        <Text style={{ fontSize: 12, color: gempaColors.muted, marginTop: 4 }}>{gempaData.tanggal} • {gempaData.jam}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        { label: 'Kedalaman', value: gempaData.kedalaman },
                        { label: 'Dirasakan', value: gempaData.dirasakan || 'Belum dilaporkan' },
                      ].map((item, i) => (
                        <View key={i} style={{
                          flexDirection: 'row', alignItems: 'center', gap: 6,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10,
                        }}>
                          <Text style={{ fontSize: 12, color: gempaColors.muted, fontWeight: '600' }}>{item.label}:</Text>
                          <Text style={{ fontSize: 12, color: gempaColors.text, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>{item.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  {gempaData.shakemapUrl && (
                    <View style={{
                      width: 96, height: 112, borderRadius: 14,
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
                        paddingVertical: 4, alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: gempaColors.muted, letterSpacing: 0.5 }}>SHAKEMAP</Text>
                      </View>
                    </View>
                  )}
                </View>

                <Text style={{ fontSize: 12, color: gempaColors.muted, textAlign: 'center', marginTop: 14 }}>Ketuk kartu ini untuk membuka detail dan panduan keselamatan</Text>
              </TouchableOpacity>
            )}

            <View className="rounded-3xl border border-slate-200 bg-white p-4" style={{ elevation: 1 }}>
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-secondary">Aksi Utama</Text>
                  <Text className="mt-1 text-lg font-bold text-primary">Laporkan atau pantau kondisi sekitar</Text>
                </View>
                {areaStatus?.level && (
                  <View className="rounded-full px-3 py-2" style={{ backgroundColor: areaStatus.levelBg || SiagaColors.successSoft, borderWidth: 1, borderColor: (areaStatus.levelColor || SiagaColors.success) + '33' }}>
                    <Text className="text-xs font-bold uppercase" style={{ color: areaStatus.levelColor || SiagaColors.success }}>{areaStatus.level}</Text>
                  </View>
                )}
              </View>

              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 min-h-[56px] flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3"
                  style={{ backgroundColor: SiagaColors.primary }}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(tabs)/lapor')}
                >
                  <Megaphone size={20} color="#fff" weight="duotone" />
                  <Text className="text-sm font-bold text-white">Buat Laporan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 min-h-[56px] flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3"
                  style={{ backgroundColor: '#f8fbff', borderColor: '#dbeafe' }}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(tabs)/pantau')}
                >
                  <MapTrifold size={20} color={SiagaColors.info} weight="duotone" />
                  <Text className="text-sm font-bold text-info">Pantau Area</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-white px-4 py-4" style={{ borderWidth: 1, borderColor: SiagaColors.dangerSoft }}>
                <Siren size={18} color={SiagaColors.danger} weight="duotone" />
                <Text className="flex-1 text-xs leading-5" style={{ color: '#9f1239' }}>
                  Kondisi darurat? Gunakan tombol SOS merah di kanan bawah untuk akses tercepat.
                </Text>
              </View>
            </View>

            <View className="flex-row items-end justify-between gap-3">
              <View className="flex-1">
                <Text className="text-lg font-bold text-primary">Laporan Teratas</Text>
                <Text className="mt-1 text-xs text-secondary">
                  {user?.district ? `Ringkasan 2 laporan terdekat di ${user.district}` : 'Ringkasan laporan terbaru di sekitar Anda'}
                </Text>
              </View>
              <TouchableOpacity
                className="min-h-[44px] flex-row items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-4"
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/pantau')}
              >
                <Text className="text-xs font-semibold text-info">Lihat Semua</Text>
                <CaretRight size={14} color={SiagaColors.info} />
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item: r }) => {
          const reportIcon = r.type === 'Waves'
            ? <Waves size={26} color="#fff" weight="duotone" />
            : r.type === 'RoadHorizon'
              ? <RoadHorizon size={26} color="#fff" weight="duotone" />
              : <Trash size={26} color="#fff" weight="duotone" />;
          return (
            <TouchableOpacity
              className="bg-white border border-slate-100 rounded-3xl p-4"
              style={{ elevation: 1 }}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/report-detail', params: { id: r.id } })}
            >
              <View className="flex-row gap-3">
                <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: r.gradient }}>
                  {reportIcon}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2 flex-wrap">
                        <View className="px-3 py-1 rounded-full flex-row items-center gap-1" style={{ backgroundColor: r.badgeBg }}>
                          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r.badgeColor }} />
                          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: r.badgeColor }}>{r.badge}</Text>
                        </View>
                        <View className="px-3 py-1 rounded-full bg-slate-100">
                          <Text className="text-xs font-semibold text-secondary">{r.time}</Text>
                        </View>
                      </View>
                      <Text className="text-base font-bold text-primary" numberOfLines={2}>{r.title}</Text>
                      <Text className="mt-1 text-sm leading-5 text-secondary" numberOfLines={2}>{r.desc || 'Lihat detail laporan untuk informasi lengkap.'}</Text>
                    </View>
                    <CaretRight size={18} color={SiagaColors.secondary} />
                  </View>
                  <View className="mt-3 flex-row flex-wrap items-center gap-2">
                    <View className="flex-row items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2">
                      <MapPin size={14} color={SiagaColors.secondary} weight="duotone" />
                      <Text className="text-xs font-medium text-secondary">{r.distance}</Text>
                    </View>
                    {(r as any).status !== 'Selesai' ? (
                      <View className="flex-row items-center gap-1.5 rounded-full px-3 py-2" style={{ backgroundColor: r.badgeBg }}>
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r.urgencyColor }} />
                        <Text className="text-xs font-semibold" style={{ color: r.urgencyColor }}>Urgensi {r.urgency}</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center gap-1.5 rounded-full px-3 py-2" style={{ backgroundColor: SiagaColors.successSoft }}>
                        <CheckCircle size={14} color={SiagaColors.success} weight="fill" />
                        <Text className="text-xs font-semibold" style={{ color: SiagaColors.success }}>Masalah Teratasi</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-6" style={{ elevation: 1 }}>
            <Text className="text-sm font-semibold text-primary">Belum ada laporan untuk ditampilkan.</Text>
            <Text className="mt-1 text-xs leading-5 text-secondary">Tarik layar ke bawah untuk memuat ulang atau buka halaman Pantau untuk melihat area lain.</Text>
          </View>
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
                  <MagnifyingGlass size={12} color="#fff" weight="bold" />
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>Tap untuk perbesar</Text>
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
                  <Text style={{ fontSize: 12, color: gempaColors.muted }}>Data resmi BMKG Indonesia</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setGempaModalVisible(false)}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center', justifyContent: 'center',
                }}
                activeOpacity={0.8}
                hitSlop={4}
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
                      <Text style={{ fontSize: 12, color: gempaColors.muted, fontWeight: '600' }}>{item.label}</Text>
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
                      <Text style={{ fontSize: 12, fontWeight: '800', color: gempaColors.accent }}>{step.num}</Text>
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
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 12 }}>Shakemap BMKG • Tap di mana saja untuk tutup</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
