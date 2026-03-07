import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Modal, ActivityIndicator,
  Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Share, TextInput, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, ShareNetwork, Bookmark, MapPin, Clock, Users, Camera,
  ThumbsUp, ChatCircle, ShieldCheck,
  CheckCircle, DotsThree, Heart, Warning, Flag,
  CalendarBlank, Buildings, Medal, PaperPlaneTilt,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { type ReportDetail, type BackendReportStatus } from '@/services/report.service';
import { useAuth } from '@/context/auth';
import { getReportById, toggleReportVote, verifyReport, toggleBookmark, resolveReportByUser, updateReportStatus } from '@/services/report.service';
import { getComments, addComment } from '@/services/comment.service';
import { useToast } from '@/contexts/toast.context';
import EmbeddedMap from '@/components/ui/MapView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 40;

const STATUS_COLOR_MAP: Record<ReportDetail['status'], { color: string; bg: string }> = {
  Menunggu: { color: SiagaColors.warning, bg: SiagaColors.warningSoft },
  Diverifikasi: { color: SiagaColors.info, bg: SiagaColors.infoSoft },
  Ditangani: { color: '#7c3aed', bg: '#f5f3ff' },
  Selesai: { color: SiagaColors.success, bg: SiagaColors.successSoft },
};

const GOV_STATUS_ACTION_TARGET: Partial<Record<ReportDetail['status'], BackendReportStatus>> = {
  Menunggu: 'Ditangani',
  Diverifikasi: 'Ditangani',
  Ditangani: 'Selesai',
};

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const reportId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePhoto, setActivePhoto] = useState(0);
  const [supported, setSupported] = useState(false);
  const [votes, setVotes] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<{ id: string; userId: string; user: string; initials: string; text: string; time: string; createdAt: string; likes: number }[]>([]);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [reporterId, setReporterId] = useState<string | null>(null);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isGovStatusUpdating, setIsGovStatusUpdating] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<number | null>(null);
  const { user, role } = useAuth();
  const { showToast } = useToast();

  // Fetch report + comments dari API
  const loadAll = useCallback(async () => {
    if (!reportId) {
      setReport(null);
      setLoadError('ID laporan tidak valid.');
      setIsLoading(false);
      return;
    }

    const result = await getReportById(reportId);
    if (result.success && result.data) {
      const r = result.data;
      const urgencyColor = r.urgency >= 80 ? '#dc2626' : r.urgency >= 50 ? '#f59e0b' : '#15803d';
      const badge: 'Kritis' | 'Sedang' | 'Rendah' = r.urgency >= 80 ? 'Kritis' : r.urgency >= 50 ? 'Sedang' : 'Rendah';
      const sc = STATUS_COLOR_MAP[r.status] || STATUS_COLOR_MAP.Menunggu;
      const mapped: ReportDetail = {
        id: r.id,
        type: r.category === 'Banjir' ? 'Waves' : r.category === 'Jalan Rusak' ? 'RoadHorizon' : 'Trash',
        gradient: '#3b82f6',
        badge,
        badgeBg: badge === 'Kritis' ? '#fee2e2' : badge === 'Sedang' ? '#fef9c3' : '#ecfdf5',
        badgeColor: urgencyColor,
        title: r.title,
        desc: r.description || '',
        distance: '-',
        votes: r.votesCount,
        photos: r.photosCount || r.photoUrls?.length || 0,
        time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        urgency: r.urgency,
        urgencyColor,
        supported: r.hasVoted || false,
        reporter: {
          name: r.reporter?.fullName || 'Anonim',
          initials: r.reporter?.initials || '??',
          badge: r.reporter?.currentBadge || 'Warga',
          reportsCount: r.reporter?.totalReports || 0,
        },
        location: {
          address: r.address,
          district: r.district,
          city: r.city,
          lat: r.lat,
          lng: r.lng,
        },
        description: r.description || '',
        category: r.category,
        status: r.status,
        statusColor: sc.color,
        statusBg: sc.bg,
        createdAt: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date(r.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        photoUrls: r.photoUrls || [],
        comments: [],
        timeline: [
          { id: 't1', title: 'Laporan Diterima', desc: 'Laporan masuk ke sistem', time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), status: 'done' as const },
          ...(r.status !== 'Menunggu' ? [{ id: 't2', title: 'Diverifikasi', desc: 'Laporan telah diverifikasi', time: new Date(r.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), status: 'done' as const }] : []),
          ...(r.status === 'Ditangani' || r.status === 'Selesai' ? [{ id: 't3', title: 'Sedang Ditangani', desc: r.respondedBy ? `Ditangani oleh ${r.respondedBy}` : 'Sedang dalam penanganan', time: '-', status: (r.status === 'Ditangani' ? 'active' : 'done') as 'active' | 'done' }] : []),
          ...(r.status === 'Selesai' ? [{ id: 't4', title: 'Selesai', desc: 'Masalah telah diselesaikan', time: new Date(r.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), status: 'done' as const }] : []),
          ...(r.status === 'Menunggu' ? [{ id: 't2p', title: 'Menunggu Verifikasi', desc: 'Laporan sedang diperiksa', time: '-', status: 'active' as const }] : []),
        ],
        respondedBy: r.respondedBy,
        estimatedCompletion: r.estimatedCompletion,
        verifiedCount: r.verifiedCount || 0,
      };
      setReport(mapped);
      setVotes(mapped.votes);
      setSupported(mapped.supported);
      setVerifiedCount(mapped.verifiedCount);
      setReporterId(r.userId || null);
    } else {
      setReport(null);
      setLoadError(result.message || 'Laporan tidak ditemukan.');
    }
    setIsLoading(false);

    // Load comments
    const commentsResult = await getComments('report', reportId);
    if (commentsResult.success && commentsResult.data) {
      const mapped = commentsResult.data.map(c => ({
        id: c.id,
        userId: c.userId || '',
        user: c.user?.fullName || 'User',
        initials: c.user?.initials || '??',
        text: c.text,
        time: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        createdAt: c.createdAt,
        likes: c.likes || 0,
      }));
      setLocalComments(mapped);
    }
  }, [reportId]);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#f8fafd] items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-[16px] text-secondary">Memuat laporan...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 bg-[#f8fafd] items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-[16px] text-secondary">{loadError || 'Laporan tidak ditemukan'}</Text>
        <TouchableOpacity className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: SiagaColors.primary }} onPress={() => router.back()}>
          <Text className="text-white text-[14px] font-semibold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSupport = async () => {
    const result = await toggleReportVote(report.id);
    if (result.success) {
      const serverVoted = result.data?.voted;
      const serverCount = result.data?.votesCount;
      const newUrgency = result.data?.urgency ?? report.urgency;

      const newUrgencyColor = newUrgency >= 80 ? '#dc2626' : newUrgency >= 50 ? '#f59e0b' : '#15803d';
      const newBadge: 'Kritis' | 'Sedang' | 'Rendah' = newUrgency >= 80 ? 'Kritis' : newUrgency >= 50 ? 'Sedang' : 'Rendah';
      const newBadgeBg = newUrgency >= 80 ? '#fee2e2' : newUrgency >= 50 ? '#fef9c3' : '#ecfdf5';

      setSupported(serverVoted ?? !supported);
      setVotes(serverCount ?? (supported ? votes - 1 : votes + 1));

      setReport(prev => prev ? {
        ...prev,
        urgency: newUrgency,
        urgencyColor: newUrgencyColor,
        badge: newBadge,
        badgeBg: newBadgeBg,
        badgeColor: newUrgencyColor,
      } : null);

      showToast({ type: 'success', title: serverVoted ? 'Laporan didukung!' : 'Dukungan dibatalkan', message: serverVoted ? 'Terima kasih atas dukungan Anda.' : 'Dukungan Anda telah dibatalkan.' });
    } else {
      showToast({ type: 'error', title: 'Gagal', message: 'Tidak dapat memproses dukungan. Coba lagi.' });
    }
  };

  const handleVerify = async () => {
    const result = await verifyReport(report.id);
    if (result.success) {
      const newCount = (result.data?.verifiedCount ?? verifiedCount + 1);
      setVerifiedCount(newCount);

      // Recalculate urgency locally: +5 per verify
      const currentUrgency = report.urgency || 0;
      const newUrgency = Math.min(150, currentUrgency + 5);
      const newUrgencyColor = newUrgency >= 80 ? '#dc2626' : newUrgency >= 50 ? '#f59e0b' : '#15803d';
      const newBadge: 'Kritis' | 'Sedang' | 'Rendah' = newUrgency >= 80 ? 'Kritis' : newUrgency >= 50 ? 'Sedang' : 'Rendah';
      const newBadgeBg = newUrgency >= 80 ? '#fee2e2' : newUrgency >= 50 ? '#fef9c3' : '#ecfdf5';

      setReport(prev => prev ? {
        ...prev,
        urgency: newUrgency,
        urgencyColor: newUrgencyColor,
        badge: newBadge,
        badgeBg: newBadgeBg,
        badgeColor: newUrgencyColor,
      } : null);

      showToast({ type: 'success', title: 'Terverifikasi!', message: 'Laporan berhasil diverifikasi. Terima kasih!' });
    } else {
      showToast({ type: 'error', title: 'Gagal', message: result.message || 'Tidak dapat memverifikasi laporan.' });
    }
  };

  const handleBookmark = async () => {
    const result = await toggleBookmark('report', report.id);
    if (result.success) {
      setBookmarked(!bookmarked);
      showToast({ type: 'success', title: bookmarked ? 'Bookmark dihapus' : 'Tersimpan!', message: bookmarked ? 'Laporan dihapus dari bookmark.' : 'Laporan disimpan ke bookmark.', duration: 2000 });
    }
  };

  const handleShare = async () => {
    await Share.share({
      title: report.title,
      message: `${report.title}\n${report.description}\n\nLokasi: ${report.location.address}`,
    });
  };

  const isOwner = !!user?.id && !!reporterId && String(user.id) === String(reporterId);
  const isGovRole = role === 'pemerintah' || role === 'admin';
  const canResolve = isOwner && report.status !== 'Selesai';
  const govActionTarget = GOV_STATUS_ACTION_TARGET[report.status];
  const govActionLabel = report.status === 'Ditangani' ? 'Tandai Selesai' : 'Proses';
  const GovActionIcon = report.status === 'Ditangani' ? CheckCircle : Buildings;

  const handleResolve = () => {
    setResolveModalVisible(true);
  };

  const handleGovStatusAction = async () => {
    if (!govActionTarget) return;

    setIsGovStatusUpdating(true);
    try {
      const result = await updateReportStatus(report.id, govActionTarget);
      if (result.success) {
        showToast({
          type: 'success',
          title: 'Status Diperbarui',
          message: `Laporan berhasil diubah ke "${govActionTarget}".`,
        });
        await loadAll();
        return;
      }

      if (result.statusCode === 403) {
        return;
      }

      showToast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: result.message || 'Tidak dapat memperbarui status laporan.',
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: 'Terjadi gangguan jaringan saat memperbarui status laporan.',
      });
    } finally {
      setIsGovStatusUpdating(false);
    }
  };

  const confirmResolve = async () => {
    setIsResolving(true);
    const result = await resolveReportByUser(report.id);
    setIsResolving(false);
    setResolveModalVisible(false);
    if (result.success) {
      setReport(prev => prev ? {
        ...prev,
        status: 'Selesai',
        statusColor: '#059669',
        statusBg: '#ecfdf5',
        urgency: 0,
        urgencyColor: '#15803d',
        badge: 'Rendah' as const,
        badgeBg: '#ecfdf5',
        badgeColor: '#15803d',
        respondedBy: 'Diselesaikan oleh pelapor',
        timeline: [
          ...prev.timeline.filter(t => t.status === 'done'),
          { id: 't_resolved', title: 'Selesai', desc: 'Ditandai selesai oleh pelapor', time: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), status: 'done' as const },
        ],
      } : null);
      showToast({ type: 'success', title: 'Laporan Ditutup ✅', message: 'Masalah telah ditandai selesai. Terima kasih!' });
    } else {
      showToast({ type: 'error', title: 'Gagal', message: result.message || 'Tidak dapat menutup laporan.' });
    }
  };

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_WIDTH);
    setActivePhoto(index);
  };

  const getTimelineIcon = (status: string) => {
    if (status === 'done') return <CheckCircle size={20} color={SiagaColors.success} weight="fill" />;
    if (status === 'active') return <DotsThree size={20} color={SiagaColors.info} weight="bold" />;
    return (
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#cbd5e1', backgroundColor: '#f1f5f9' }} />
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafd]">
      {/* Header */}
      <View
        className="px-5 pb-3 flex-row items-center justify-between border-b border-slate-100"
        style={{ paddingTop: insets.top + 8, backgroundColor: '#fff' }}
      >
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={SiagaColors.primary} weight="bold" />
        </TouchableOpacity>
        <Text className="text-[16px] font-bold text-primary">Detail Laporan</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Bookmark size={20} color={bookmarked ? SiagaColors.warning : SiagaColors.secondary} weight={bookmarked ? 'fill' : 'regular'} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <ShareNetwork size={20} color={SiagaColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[SiagaColors.primary]} tintColor={SiagaColors.primary} />}>
        {/* Photo Carousel */}
        <View className="px-5 pt-4">
          <View className="rounded-2xl overflow-hidden" style={{ elevation: 2 }}>
            <FlatList
              data={report.photoUrls}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onPhotoScroll}
              keyExtractor={(_, i) => `photo-${i}`}
              snapToInterval={PHOTO_WIDTH}
              decelerationRate="fast"
              renderItem={({ item, index }) => (
                <TouchableOpacity activeOpacity={0.9} onPress={() => setFullscreenPhoto(index)}>
                  <Image
                    source={{ uri: item }}
                    style={{ width: PHOTO_WIDTH, height: 200, backgroundColor: '#e2e8f0' }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                </TouchableOpacity>
              )}
            />
            {/* Photo Indicator */}
            <View className="absolute bottom-3 self-center flex-row gap-1.5">
              {report.photoUrls.map((_, i) => (
                <View
                  key={i}
                  className="h-1.5 rounded-full"
                  style={{
                    width: i === activePhoto ? 20 : 6,
                    backgroundColor: i === activePhoto ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </View>
            {/* Photo Count */}
            <View className="absolute top-3 right-3 flex-row items-center gap-1 bg-black/50 rounded-lg px-2 py-1">
              <Camera size={14} color="#fff" weight="bold" />
              <Text className="text-[12px] font-bold text-white">{activePhoto + 1}/{report.photoUrls.length}</Text>
            </View>
          </View>
        </View>

        {/* Title & Badge Section */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="px-2 py-1 rounded-md flex-row items-center gap-1" style={{ backgroundColor: report.badgeBg }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: report.badgeColor }} />
              <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: report.badgeColor }}>{report.badge}</Text>
            </View>
            <View className="px-2 py-1 rounded-md flex-row items-center gap-1" style={{ backgroundColor: report.statusBg }}>
              <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: report.statusColor }}>{report.status}</Text>
            </View>
            <View className="px-2 py-1 rounded-md bg-slate-100 flex-row items-center gap-1">
              <Text className="text-[10px] font-semibold text-secondary">{report.category}</Text>
            </View>
          </View>
          <Text className="text-lg font-bold text-primary leading-tight">{report.title}</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <View className="flex-row items-center gap-1">
              <Clock size={14} color={SiagaColors.secondary} />
              <Text className="text-[12px] text-secondary">{report.time}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MapPin size={14} color={SiagaColors.secondary} weight="duotone" />
              <Text className="text-[12px] text-secondary">{report.distance}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <ShieldCheck size={14} color={SiagaColors.success} weight="duotone" />
              <Text className="text-[12px] text-success font-semibold">{report.verifiedCount} verifikasi</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-5 pt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Users size={22} color={SiagaColors.primary} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{votes}</Text>
              <Text className="text-[10px] text-secondary font-medium">Dukungan</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <ChatCircle size={22} color={SiagaColors.info} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{report.comments.length}</Text>
              <Text className="text-[10px] text-secondary font-medium">Komentar</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Camera size={22} color={SiagaColors.warning} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{report.photos}</Text>
              <Text className="text-[10px] text-secondary font-medium">Foto</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Warning size={22} color={report.urgencyColor} weight="duotone" />
              <Text className="text-lg font-bold" style={{ color: report.urgencyColor, marginTop: 4 }}>{report.urgency}</Text>
              <Text className="text-[10px] text-secondary font-medium">Urgensi</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Deskripsi</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            <Text className="text-[14px] text-primary/80 leading-5">{report.description}</Text>
          </View>
        </View>

        {/* Location */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Lokasi</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            {/* Embedded Map */}
            <View className="rounded-xl overflow-hidden mb-3">
              <EmbeddedMap
                latitude={report.location.lat}
                longitude={report.location.lng}
                zoom={16}
                height={160}
                markers={[{
                  lat: report.location.lat,
                  lng: report.location.lng,
                  title: report.title,
                  color: report.urgencyColor,
                  popup: `<b>${report.title}</b><br/>${report.location.address}`,
                }]}
                borderRadius={12}
                showOpenButton={true}
                interactive={true}
              />
            </View>
            <View className="gap-2">
              <View className="flex-row items-start gap-2.5">
                <MapPin size={16} color={SiagaColors.primary} weight="duotone" />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-primary">{report.location.address}</Text>
                  <Text className="text-[12px] text-secondary mt-0.5">{report.location.district}, {report.location.city}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Reporter */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Pelapor</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4 flex-row items-center gap-3" style={{ elevation: 1 }}>
            <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
              <Text className="text-white font-bold text-[16px]">{report.reporter.initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-primary">{report.reporter.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View className="flex-row items-center gap-1 bg-amber-50 rounded px-1.5 py-0.5">
                  <Medal size={12} color="#f59e0b" weight="duotone" />
                  <Text className="text-[10px] font-semibold" style={{ color: '#a16207' }}>{report.reporter.badge}</Text>
                </View>
                <Text className="text-[10px] text-secondary">{report.reporter.reportsCount} laporan</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[10px] text-secondary">{report.createdAt.split(', ')[1]}</Text>
              <Text className="text-[9px] text-secondary mt-0.5">{report.createdAt.split(', ')[0]}</Text>
            </View>
          </View>
        </View>

        {/* Response Info */}
        {report.respondedBy && (
          <View className="px-5 pt-5">
            <Text className="text-[15px] font-bold text-primary mb-2">Penanganan</Text>
            <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: SiagaColors.surface }}>
                  <Buildings size={22} color={SiagaColors.primary} weight="duotone" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-primary">{report.respondedBy}</Text>
                  <Text className="text-[10px] text-secondary mt-0.5">Instansi Penanggung Jawab</Text>
                </View>
              </View>
              {report.estimatedCompletion && (
                <View className="flex-row items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <CalendarBlank size={16} color={SiagaColors.info} weight="duotone" />
                  <View>
                    <Text className="text-[10px] text-secondary">Estimasi Selesai</Text>
                    <Text className="text-[13px] font-semibold text-primary">{report.estimatedCompletion}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Timeline Progress</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            {report.timeline.map((item, i) => (
              <View key={item.id} className="flex-row gap-3">
                {/* Line + Icon */}
                <View className="items-center" style={{ width: 24 }}>
                  {getTimelineIcon(item.status)}
                  {i < report.timeline.length - 1 && (
                    <View
                      className="flex-1"
                      style={{
                        width: 2,
                        backgroundColor: item.status === 'done' ? SiagaColors.success : '#e2e8f0',
                        marginVertical: 2,
                      }}
                    />
                  )}
                </View>
                {/* Content */}
                <View className="flex-1 pb-4">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-[13px] font-bold"
                      style={{ color: item.status === 'pending' ? SiagaColors.secondary : SiagaColors.primary }}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-[10px] text-secondary">{item.time}</Text>
                  </View>
                  <Text
                    className="text-[12px] mt-0.5"
                    style={{ color: item.status === 'pending' ? SiagaColors.secondary : 'rgba(8,42,76,0.6)' }}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Urgency Meter */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Tingkat Urgensi</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: report.urgencyColor }} />
                <Text className="text-[13px] font-bold" style={{ color: report.urgencyColor }}>
                  {report.urgency} poin
                </Text>
              </View>
              <Text className="text-[12px] font-semibold" style={{ color: report.urgencyColor }}>
                {report.badge === 'Kritis' ? 'Sangat Tinggi' : report.badge === 'Sedang' ? 'Sedang' : 'Rendah'}
              </Text>
            </View>
            <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${Math.min(report.urgency, 150) / 1.5}%`, backgroundColor: report.urgencyColor }}
              />
            </View>
            <View className="flex-row justify-between mt-1.5">
              <Text className="text-[9px] text-secondary">0</Text>
              <Text className="text-[9px] text-secondary">50</Text>
              <Text className="text-[9px] text-secondary">100</Text>
              <Text className="text-[9px] text-secondary">150</Text>
            </View>
          </View>
        </View>

        {/* Comments */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[15px] font-bold text-primary">Komentar ({localComments.length})</Text>
          </View>
          <View className="gap-2.5">
            {localComments.map((comment) => {
              const isOwn = !!user?.id && !!comment.userId && String(comment.userId) === String(user.id);
              return (
                <View key={comment.id} className="bg-white border border-slate-100 rounded-xl p-3.5" style={{ elevation: 1 }}>
                  <View className="flex-row items-start gap-2.5">
                    <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.surface }}>
                      <Text className="text-[12px] font-bold text-primary">{comment.initials}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-[13px] font-bold text-primary">{comment.user}</Text>
                          {isOwn && (
                            <View className="bg-blue-100 rounded px-1.5 py-0.5">
                              <Text className="text-[9px] font-bold text-info">Anda</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-[10px] text-secondary">{comment.time}</Text>
                      </View>
                      <Text className="text-[13px] text-primary/70 mt-1 leading-4">{comment.text}</Text>
                      {comment.likes > 0 && (
                        <View className="flex-row items-center gap-1 mt-2">
                          <Heart size={14} color={SiagaColors.secondary} weight="regular" />
                          <Text className="text-[10px] text-secondary">{comment.likes}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

          </View>
          {/* Comment Input */}
          <View className="mt-3 bg-white border border-slate-100 rounded-xl p-3" style={{ elevation: 1 }}>
            <View className="flex-row items-start gap-2.5">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
                <Text className="text-[12px] font-bold text-white">{user?.initials || 'U'}</Text>
              </View>
              <View className="flex-1">
                <TextInput
                  className="text-[13px] text-primary bg-slate-50 rounded-lg px-3 py-2.5 min-h-[40px]"
                  placeholder="Tulis komentar..."
                  placeholderTextColor={SiagaColors.secondary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                  style={{ textAlignVertical: 'top' }}
                />
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-[10px] text-secondary">{commentText.length}/500</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1.5 rounded-lg px-3.5 py-2"
                    style={{ backgroundColor: commentText.trim() ? SiagaColors.primary : '#e2e8f0' }}
                    disabled={!commentText.trim()}
                    activeOpacity={0.7}
                    onPress={async () => {
                      if (!commentText.trim()) return;
                      const result = await addComment(report.id, 'report', commentText.trim());
                      if (result.success && result.data) {
                        const now = new Date().toISOString();
                        const newComment = {
                          id: result.data.id,
                          userId: user?.id || '',
                          user: user?.fullName || 'User',
                          initials: user?.initials || 'U',
                          text: commentText.trim(),
                          time: 'Baru saja',
                          createdAt: now,
                          likes: 0,
                        };
                        setLocalComments(prev => [newComment, ...prev]);
                        setCommentText('');
                        showToast({ type: 'success', title: 'Komentar terkirim', message: 'Komentar Anda berhasil ditambahkan.' });
                      } else {
                        // Fallback: tetap simpan lokal
                        const now = new Date().toISOString();
                        const newComment = {
                          id: `c_new_${Date.now()}`,
                          userId: user?.id || '',
                          user: user?.fullName || 'User',
                          initials: user?.initials || 'U',
                          text: commentText.trim(),
                          time: 'Baru saja',
                          createdAt: now,
                          likes: 0,
                        };
                        setLocalComments(prev => [newComment, ...prev]);
                        setCommentText('');
                        showToast({ type: 'warning', title: 'Tersimpan lokal', message: 'Komentar disimpan, akan disinkron nanti.' });
                      }
                    }}
                  >
                    <PaperPlaneTilt size={14} color={commentText.trim() ? '#fff' : '#94a3b8'} weight="fill" />
                    <Text className="text-[12px] font-semibold" style={{ color: commentText.trim() ? '#fff' : '#94a3b8' }}>Kirim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5"
        style={{ paddingBottom: insets.bottom + 8, paddingTop: 12, elevation: 8 }}
      >
        {isGovRole ? (
          report.status === 'Selesai' ? (
            <View className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-xl px-4 py-3.5" style={{ backgroundColor: '#f1f5f9' }}>
              <CheckCircle size={18} color="#94a3b8" weight="fill" />
              <Text className="text-[14px] font-semibold" style={{ color: '#94a3b8' }}>Laporan Telah Selesai</Text>
            </View>
          ) : govActionTarget ? (
            <TouchableOpacity
              className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-xl px-4 py-3.5"
              style={{ backgroundColor: report.status === 'Ditangani' ? SiagaColors.success : SiagaColors.primary, opacity: isGovStatusUpdating ? 0.7 : 1 }}
              onPress={handleGovStatusAction}
              activeOpacity={0.8}
              disabled={isGovStatusUpdating}
            >
              {isGovStatusUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <GovActionIcon size={18} color="#fff" weight="duotone" />
              )}
              <Text className="text-[14px] font-bold text-white">
                {isGovStatusUpdating ? 'Memproses...' : govActionLabel}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-xl px-4 py-3.5" style={{ backgroundColor: '#f1f5f9' }}>
              <Buildings size={18} color="#94a3b8" weight="duotone" />
              <Text className="text-[14px] font-semibold" style={{ color: '#94a3b8' }}>Status Tidak Dapat Diproses</Text>
            </View>
          )
        ) : (
          <>
            {/* Tombol Selesai — hanya tampil untuk pelapor sendiri */}
            {canResolve && (
              <TouchableOpacity
                className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-xl py-3 mb-2 border"
                style={{ backgroundColor: SiagaColors.successSoft, borderColor: '#a7f3d0' }}
                onPress={handleResolve}
                activeOpacity={0.8}
              >
                <CheckCircle size={18} color={SiagaColors.success} weight="fill" />
                <Text className="text-[14px] font-bold" style={{ color: SiagaColors.success }}>Tandai Masalah Selesai</Text>
              </TouchableOpacity>
            )}
            {report.status === 'Selesai' ? (
              <View className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-xl py-3.5" style={{ backgroundColor: '#f1f5f9' }}>
                <CheckCircle size={18} color="#94a3b8" weight="fill" />
                <Text className="text-[14px] font-semibold" style={{ color: '#94a3b8' }}>Laporan Telah Selesai</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                  style={{ backgroundColor: supported ? '#dcfce7' : SiagaColors.primary }}
                  onPress={handleSupport}
                  activeOpacity={0.8}
                >
                  <ThumbsUp size={18} color={supported ? '#15803d' : '#fff'} weight={supported ? 'fill' : 'bold'} />
                  <Text className="text-[14px] font-bold" style={{ color: supported ? '#15803d' : '#fff' }}>
                    {supported ? 'Didukung' : 'Dukung'} ({votes})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 border"
                  style={{ borderColor: SiagaColors.info, backgroundColor: SiagaColors.infoSoft }}
                  activeOpacity={0.8}
                  onPress={handleVerify}
                >
                  <Flag size={18} color={SiagaColors.info} weight="duotone" />
                  <Text className="text-[14px] font-bold" style={{ color: SiagaColors.info }}>Verifikasi</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Resolve Confirmation Modal */}
      <Modal
        visible={resolveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isResolving && setResolveModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', elevation: 10 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle size={32} color="#059669" weight="fill" />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#082a4c', textAlign: 'center', marginBottom: 8 }}>Tandai Masalah Selesai</Text>
            <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Apakah masalah ini sudah benar-benar teratasi di lokasi?{'\n\n'}Tindakan ini tidak dapat dibatalkan.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' }}
                onPress={() => setResolveModalVisible(false)}
                disabled={isResolving}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, opacity: isResolving ? 0.7 : 1 }}
                onPress={confirmResolve}
                disabled={isResolving}
                activeOpacity={0.8}
              >
                {isResolving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <CheckCircle size={16} color="#fff" weight="fill" />
                )}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>{isResolving ? 'Memproses...' : 'Ya, Selesai'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Photo Viewer */}
      <Modal
        visible={fullscreenPhoto !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFullscreenPhoto(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFullscreenPhoto(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setFullscreenPhoto(null)}
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

          {/* Photo */}
          <FlatList
            data={report?.photoUrls || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={fullscreenPhoto ?? 0}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            keyExtractor={(_, i) => `fullscreen-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <Image
                  source={{ uri: item }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            )}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setFullscreenPhoto(index);
            }}
          />

          {/* Photo counter */}
          <View style={{
            position: 'absolute',
            bottom: insets.bottom + 24,
            alignSelf: 'center',
            flexDirection: 'row',
            gap: 6,
          }}>
            {(report?.photoUrls || []).map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === fullscreenPhoto ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === fullscreenPhoto ? '#fff' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
