import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Warning, X, Sun, Moon, SunHorizon, Cloud, Bell, MagnifyingGlass, MapPin, ShieldWarning,
  FileText, ChartLineUp, Clock, Megaphone, MapTrifold, Siren, Robot,
  FireTruck, Ambulance, PoliceCar, Binoculars, PhoneCall,
  Waves, RoadHorizon, Trash, Users, Camera, ThumbsUp,
  Leaf, Star, Medal, Trophy, CaretRight, HandsClapping,
  Plant, Tree, Newspaper, CloudRain, BookOpenText, MegaphoneSimple,
  CheckCircle,
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

export default function HomeScreen() {
  const [showWarning, setShowWarning] = useState(true);
  const [sosVisible, setSosVisible] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [actions, setActions] = useState<ActionData[]>([]);
  const [areaStatus, setAreaStatus] = useState<AreaStatusData | null>(null);
  const [infoFeed, setInfoFeed] = useState<InfoFeedData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const greeting = useMemo(() => getGreeting(), []);

  // Helper: konversi data API ke format UI Report
  const mapReportToUI = useCallback((r: ReportData): Report => ({
    id: r.id,
    type: r.category === 'Banjir' ? 'Waves' : r.category === 'Jalan Rusak' ? 'RoadHorizon' : 'Trash',
    gradient: '#3b82f6',
    badge: r.urgency >= 80 ? 'Kritis' : r.urgency >= 40 ? 'Sedang' : 'Rendah',
    badgeBg: r.urgency >= 80 ? '#fee2e2' : r.urgency >= 40 ? '#fef3c7' : '#dcfce7',
    badgeColor: r.urgency >= 80 ? '#dc2626' : r.urgency >= 40 ? '#f59e0b' : '#10b981',
    title: r.title,
    desc: r.description?.slice(0, 60) + (r.description?.length > 60 ? '...' : '') || '',
    distance: `${r.district || '-'}`,
    votes: r.votesCount,
    photos: r.photosCount,
    time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    urgency: r.urgency,
    urgencyColor: r.urgency >= 80 ? '#dc2626' : r.urgency >= 40 ? '#f59e0b' : '#10b981',
    supported: r.hasVoted || false,
  }), []);

  // Fungsi load data (reusable untuk refresh)
  const loadData = useCallback(async () => {
    const [reportsResult, actionsResult, areaStatusResult, infoResult] = await Promise.all([
      getReports({ limit: 5 }),
      getActions({ limit: 5 }),
      getAreaStatus(),
      getInfoList({ limit: 3 }),
    ]);
    if (reportsResult.success && reportsResult.data) {
      setReports(reportsResult.data.map(mapReportToUI));
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
  }, [mapReportToUI]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load awal
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    showToast({ type: 'success', title: 'Data diperbarui', message: 'Data terbaru berhasil dimuat.', duration: 2000 });
  }, [loadData, showToast]);

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
              onPress={() => showToast({ type: 'info', title: 'Pencarian', message: 'Fitur pencarian akan segera hadir.' })}
            >
              <MagnifyingGlass size={22} color={SiagaColors.primary} weight="duotone" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pb-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 80 }} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={SiagaColors.primary} colors={[SiagaColors.primary]} />}>
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
                <Text className="text-xl font-bold text-white">{user?.district || 'Kecamatan'}</Text>
              </View>
              <Text className="text-[14px] text-white/60 ml-7">{user?.city || 'Kota'}, {user?.province || 'Provinsi'}</Text>
            </View>
            <View className="rounded-lg px-3 py-2 flex-row items-center gap-1.5" style={{ backgroundColor: areaStatus?.levelBg || 'rgba(5,150,105,0.2)', borderWidth: 1, borderColor: (areaStatus?.levelColor || '#059669') + '4D' }}>
              <ShieldWarning size={16} color={areaStatus?.levelColor || '#059669'} weight="duotone" />
              <Text className="text-[11px] font-bold" style={{ color: areaStatus?.levelColor || '#059669' }}>{areaStatus?.level || 'AMAN'}</Text>
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

        {/* Nearby Reports */}
        <View>
          <SectionHeader title="Laporan di Sekitar" subtitle="Dalam radius lokasi Anda" onAction={() => router.push('/(tabs)/pantau')} actionLabel="Lihat Semua" />
          <View className="gap-2.5">
            {reports.map((r) => {
              const reportIcon = r.type === 'Waves'
                ? <Waves size={30} color="#fff" weight="duotone" />
                : r.type === 'RoadHorizon'
                  ? <RoadHorizon size={30} color="#fff" weight="duotone" />
                  : <Trash size={30} color="#fff" weight="duotone" />;
              return (
                <TouchableOpacity
                  key={r.id}
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
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="px-3 py-1 rounded flex-row items-center gap-1" style={{ backgroundColor: r.badgeBg }}>
                          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r.badgeColor }} />
                          <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: r.badgeColor }}>{r.badge}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Clock size={14} color={SiagaColors.secondary} />
                          <Text className="text-[12px] text-secondary">{r.time}</Text>
                        </View>
                      </View>
                      <Text className="text-[16px] font-bold text-primary">{r.title}</Text>
                      <Text className="text-[13px] text-secondary mt-0.5" numberOfLines={1}>{r.desc}</Text>
                      <View className="flex-row items-center gap-3 mt-2">
                        <View className="flex-row items-center gap-1">
                          <MapPin size={15} color={SiagaColors.secondary} weight="duotone" />
                          <Text className="text-[12px] text-secondary">{r.distance}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Users size={15} color={SiagaColors.primary} weight="duotone" />
                          <Text className="text-[12px] font-semibold text-primary">{r.votes} dukungan</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Camera size={15} color={SiagaColors.secondary} weight="duotone" />
                          <Text className="text-[12px] text-secondary">{r.photos} foto</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                    <View className="flex-row items-center gap-2">
                      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r.urgencyColor }} />
                      <Text className="text-[12px] font-semibold" style={{ color: r.urgencyColor }}>Urgensi: {r.urgency} poin</Text>
                      <View className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <View className="h-full rounded-full" style={{ width: `${Math.min(r.urgency, 100)}%`, backgroundColor: r.urgencyColor }} />
                      </View>
                    </View>
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
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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


      </ScrollView>

      {/* Floating SOS */}
      <SOSButton onPress={() => setSosVisible(true)} />
      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}
