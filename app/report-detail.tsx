import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Image,
  Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Share, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, ShareNetwork, Bookmark, MapPin, Clock, Users, Camera,
  ThumbsUp, ChatCircle, ShieldCheck, Waves, RoadHorizon, Trash,
  CheckCircle, DotsThree, Heart, Warning, Flag,
  CalendarBlank, Buildings, UserCircle, Medal, CaretRight, PaperPlaneTilt,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { dummyReportDetails, type ReportDetail } from '@/data/dummy';
import { useAuth } from '@/context/auth';
import { getReportById, type ReportData } from '@/services/report.service';
import { getComments, addComment } from '@/services/comment.service';
import { useToast } from '@/contexts/toast.context';
import EmbeddedMap from '@/components/ui/MapView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 40;

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePhoto, setActivePhoto] = useState(0);
  const [supported, setSupported] = useState(false);
  const [votes, setVotes] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<{ id: string; user: string; initials: string; text: string; time: string; likes: number }[]>([]);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Fetch report dari API, fallback ke dummy
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const result = await getReportById(id ?? '');
      if (result.success && result.data) {
        const r = result.data;
        const urgencyColor = r.urgency >= 80 ? '#dc2626' : r.urgency >= 50 ? '#f59e0b' : '#15803d';
        const badge: 'Kritis' | 'Sedang' | 'Rendah' = r.urgency >= 80 ? 'Kritis' : r.urgency >= 50 ? 'Sedang' : 'Rendah';
        const statusColorMap: Record<string, { color: string; bg: string }> = {
          'Menunggu': { color: '#d97706', bg: '#fffbeb' },
          'Diverifikasi': { color: '#2563eb', bg: '#eff6ff' },
          'Ditangani': { color: '#7c3aed', bg: '#f5f3ff' },
          'Selesai': { color: '#059669', bg: '#ecfdf5' },
        };
        const sc = statusColorMap[r.status] || statusColorMap['Menunggu'];
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
          comments: (r.comments || []).map((c: any) => ({
            id: c.id,
            user: c.user?.fullName || c.fullName || 'User',
            initials: c.user?.initials || c.initials || '??',
            text: c.text || c.content || '',
            time: new Date(c.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            likes: c.likes || 0,
          })),
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
      } else {
        // Fallback ke dummy data
        const dummy = dummyReportDetails[id ?? ''];
        if (dummy) {
          setReport(dummy);
          setVotes(dummy.votes);
          setSupported(dummy.supported);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [id]);

  // Load comments dari API
  useEffect(() => {
    async function loadComments() {
      if (!id) return;
      const result = await getComments('report', id);
      if (result.success && result.data) {
        const mapped = result.data.map(c => ({
          id: c.id,
          user: c.user?.fullName || 'User',
          initials: c.user?.initials || '??',
          text: c.text,
          time: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          likes: c.likes || 0,
        }));
        setLocalComments(mapped);
      }
    }
    loadComments();
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#f8fafd] items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-sm text-secondary">Memuat laporan...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 bg-[#f8fafd] items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-sm text-secondary">Laporan tidak ditemukan</Text>
        <TouchableOpacity className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: SiagaColors.primary }} onPress={() => router.back()}>
          <Text className="text-white text-xs font-semibold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const reportIcon = report.type === 'Waves'
    ? <Waves size={28} color="#fff" weight="duotone" />
    : report.type === 'RoadHorizon'
      ? <RoadHorizon size={28} color="#fff" weight="duotone" />
      : <Trash size={28} color="#fff" weight="duotone" />;

  const handleSupport = () => {
    setSupported(!supported);
    setVotes(prev => supported ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    await Share.share({
      title: report.title,
      message: `${report.title}\n${report.description}\n\nLokasi: ${report.location.address}`,
    });
  };

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_WIDTH);
    setActivePhoto(index);
  };

  const getTimelineIcon = (status: string) => {
    if (status === 'done') return <CheckCircle size={18} color={SiagaColors.success} weight="fill" />;
    if (status === 'active') return <DotsThree size={18} color={SiagaColors.info} weight="bold" />;
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
          <ArrowLeft size={18} color={SiagaColors.primary} weight="bold" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-primary">Detail Laporan</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
            onPress={() => setBookmarked(!bookmarked)}
            activeOpacity={0.7}
          >
            <Bookmark size={18} color={bookmarked ? SiagaColors.warning : SiagaColors.secondary} weight={bookmarked ? 'fill' : 'regular'} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <ShareNetwork size={18} color={SiagaColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: PHOTO_WIDTH, height: 200 }}
                  className="bg-slate-200"
                  resizeMode="cover"
                />
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
              <Camera size={12} color="#fff" weight="bold" />
              <Text className="text-[10px] font-bold text-white">{activePhoto + 1}/{report.photoUrls.length}</Text>
            </View>
          </View>
        </View>

        {/* Title & Badge Section */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="px-2 py-1 rounded-md flex-row items-center gap-1" style={{ backgroundColor: report.badgeBg }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: report.badgeColor }} />
              <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: report.badgeColor }}>{report.badge}</Text>
            </View>
            <View className="px-2 py-1 rounded-md flex-row items-center gap-1" style={{ backgroundColor: report.statusBg }}>
              <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: report.statusColor }}>{report.status}</Text>
            </View>
            <View className="px-2 py-1 rounded-md bg-slate-100 flex-row items-center gap-1">
              <Text className="text-[9px] font-semibold text-secondary">{report.category}</Text>
            </View>
          </View>
          <Text className="text-lg font-bold text-primary leading-tight">{report.title}</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <View className="flex-row items-center gap-1">
              <Clock size={12} color={SiagaColors.secondary} />
              <Text className="text-[10px] text-secondary">{report.time}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color={SiagaColors.secondary} weight="duotone" />
              <Text className="text-[10px] text-secondary">{report.distance}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <ShieldCheck size={12} color={SiagaColors.success} weight="duotone" />
              <Text className="text-[10px] text-success font-semibold">{report.verifiedCount} verifikasi</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-5 pt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Users size={20} color={SiagaColors.primary} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{votes}</Text>
              <Text className="text-[9px] text-secondary font-medium">Dukungan</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <ChatCircle size={20} color={SiagaColors.info} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{report.comments.length}</Text>
              <Text className="text-[9px] text-secondary font-medium">Komentar</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Camera size={20} color={SiagaColors.warning} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{report.photos}</Text>
              <Text className="text-[9px] text-secondary font-medium">Foto</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Warning size={20} color={report.urgencyColor} weight="duotone" />
              <Text className="text-lg font-bold" style={{ color: report.urgencyColor, marginTop: 4 }}>{report.urgency}</Text>
              <Text className="text-[9px] text-secondary font-medium">Urgensi</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Deskripsi</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            <Text className="text-[12px] text-primary/80 leading-5">{report.description}</Text>
          </View>
        </View>

        {/* Location */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Lokasi</Text>
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
                <MapPin size={14} color={SiagaColors.primary} weight="duotone" />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-primary">{report.location.address}</Text>
                  <Text className="text-[10px] text-secondary mt-0.5">{report.location.district}, {report.location.city}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Reporter */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Pelapor</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4 flex-row items-center gap-3" style={{ elevation: 1 }}>
            <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
              <Text className="text-white font-bold text-sm">{report.reporter.initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[12px] font-bold text-primary">{report.reporter.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View className="flex-row items-center gap-1 bg-amber-50 rounded px-1.5 py-0.5">
                  <Medal size={10} color="#f59e0b" weight="duotone" />
                  <Text className="text-[9px] font-semibold" style={{ color: '#a16207' }}>{report.reporter.badge}</Text>
                </View>
                <Text className="text-[9px] text-secondary">{report.reporter.reportsCount} laporan</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[9px] text-secondary">{report.createdAt.split(', ')[1]}</Text>
              <Text className="text-[8px] text-secondary mt-0.5">{report.createdAt.split(', ')[0]}</Text>
            </View>
          </View>
        </View>

        {/* Response Info */}
        {report.respondedBy && (
          <View className="px-5 pt-5">
            <Text className="text-[13px] font-bold text-primary mb-2">Penanganan</Text>
            <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: SiagaColors.surface }}>
                  <Buildings size={20} color={SiagaColors.primary} weight="duotone" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-primary">{report.respondedBy}</Text>
                  <Text className="text-[9px] text-secondary mt-0.5">Instansi Penanggung Jawab</Text>
                </View>
              </View>
              {report.estimatedCompletion && (
                <View className="flex-row items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <CalendarBlank size={14} color={SiagaColors.info} weight="duotone" />
                  <View>
                    <Text className="text-[9px] text-secondary">Estimasi Selesai</Text>
                    <Text className="text-[11px] font-semibold text-primary">{report.estimatedCompletion}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Timeline Progress</Text>
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
                      className="text-[11px] font-bold"
                      style={{ color: item.status === 'pending' ? SiagaColors.secondary : SiagaColors.primary }}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-[9px] text-secondary">{item.time}</Text>
                  </View>
                  <Text
                    className="text-[10px] mt-0.5"
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
          <Text className="text-[13px] font-bold text-primary mb-2">Tingkat Urgensi</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: report.urgencyColor }} />
                <Text className="text-[11px] font-bold" style={{ color: report.urgencyColor }}>
                  {report.urgency} poin
                </Text>
              </View>
              <Text className="text-[10px] font-semibold" style={{ color: report.urgencyColor }}>
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
              <Text className="text-[8px] text-secondary">0</Text>
              <Text className="text-[8px] text-secondary">50</Text>
              <Text className="text-[8px] text-secondary">100</Text>
              <Text className="text-[8px] text-secondary">150</Text>
            </View>
          </View>
        </View>

        {/* Comments */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[13px] font-bold text-primary">Komentar ({report.comments.length + localComments.length})</Text>
          </View>
          <View className="gap-2.5">
            {localComments.map((comment) => (
              <View key={comment.id} className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5" style={{ elevation: 1 }}>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
                    <Text className="text-[10px] font-bold text-white">{comment.initials}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[11px] font-bold text-primary">{comment.user}</Text>
                        <View className="bg-blue-100 rounded px-1.5 py-0.5">
                          <Text className="text-[8px] font-bold text-info">Anda</Text>
                        </View>
                      </View>
                      <Text className="text-[9px] text-secondary">{comment.time}</Text>
                    </View>
                    <Text className="text-[11px] text-primary/70 mt-1 leading-4">{comment.text}</Text>
                  </View>
                </View>
              </View>
            ))}
            {report.comments.map((comment) => (
              <View key={comment.id} className="bg-white border border-slate-100 rounded-xl p-3.5" style={{ elevation: 1 }}>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.surface }}>
                    <Text className="text-[10px] font-bold text-primary">{comment.initials}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[11px] font-bold text-primary">{comment.user}</Text>
                      <Text className="text-[9px] text-secondary">{comment.time}</Text>
                    </View>
                    <Text className="text-[11px] text-primary/70 mt-1 leading-4">{comment.text}</Text>
                    <View className="flex-row items-center gap-1 mt-2">
                      <Heart size={12} color={SiagaColors.secondary} weight="regular" />
                      <Text className="text-[9px] text-secondary">{comment.likes}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
          {/* Comment Input */}
          <View className="mt-3 bg-white border border-slate-100 rounded-xl p-3" style={{ elevation: 1 }}>
            <View className="flex-row items-start gap-2.5">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
                <Text className="text-[10px] font-bold text-white">{user?.initials || 'U'}</Text>
              </View>
              <View className="flex-1">
                <TextInput
                  className="text-[11px] text-primary bg-slate-50 rounded-lg px-3 py-2.5 min-h-[40px]"
                  placeholder="Tulis komentar..."
                  placeholderTextColor={SiagaColors.secondary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                  style={{ textAlignVertical: 'top' }}
                />
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-[9px] text-secondary">{commentText.length}/500</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1.5 rounded-lg px-3.5 py-2"
                    style={{ backgroundColor: commentText.trim() ? SiagaColors.primary : '#e2e8f0' }}
                    disabled={!commentText.trim()}
                    activeOpacity={0.7}
                    onPress={async () => {
                      if (!commentText.trim()) return;
                      const result = await addComment(report.id, 'report', commentText.trim());
                      if (result.success && result.data) {
                        const newComment = {
                          id: result.data.id,
                          user: user?.fullName || 'User',
                          initials: user?.initials || 'U',
                          text: commentText.trim(),
                          time: 'Baru saja',
                          likes: 0,
                        };
                        setLocalComments(prev => [newComment, ...prev]);
                        setCommentText('');
                        showToast({ type: 'success', title: 'Komentar terkirim', message: 'Komentar Anda berhasil ditambahkan.' });
                      } else {
                        // Fallback: tetap simpan lokal
                        const newComment = {
                          id: `c_new_${Date.now()}`,
                          user: user?.fullName || 'User',
                          initials: user?.initials || 'U',
                          text: commentText.trim(),
                          time: 'Baru saja',
                          likes: 0,
                        };
                        setLocalComments(prev => [newComment, ...prev]);
                        setCommentText('');
                        showToast({ type: 'warning', title: 'Tersimpan lokal', message: 'Komentar disimpan, akan disinkron nanti.' });
                      }
                    }}
                  >
                    <PaperPlaneTilt size={12} color={commentText.trim() ? '#fff' : '#94a3b8'} weight="fill" />
                    <Text className="text-[10px] font-semibold" style={{ color: commentText.trim() ? '#fff' : '#94a3b8' }}>Kirim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 flex-row items-center gap-3"
        style={{ paddingBottom: insets.bottom + 8, paddingTop: 12, elevation: 8 }}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ backgroundColor: supported ? '#dcfce7' : SiagaColors.primary }}
          onPress={handleSupport}
          activeOpacity={0.8}
        >
          <ThumbsUp size={16} color={supported ? '#15803d' : '#fff'} weight={supported ? 'fill' : 'bold'} />
          <Text className="text-[12px] font-bold" style={{ color: supported ? '#15803d' : '#fff' }}>
            {supported ? 'Didukung' : 'Dukung'} ({votes})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 border"
          style={{ borderColor: SiagaColors.info, backgroundColor: '#eff6ff' }}
          activeOpacity={0.8}
        >
          <Flag size={16} color={SiagaColors.info} weight="duotone" />
          <Text className="text-[12px] font-bold" style={{ color: SiagaColors.info }}>Verifikasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
