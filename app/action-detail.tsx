import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Share, Alert, TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, ShareNetwork, Bookmark, MapPin, Clock, Users, Camera,
  CheckCircle, DotsThree, Heart, Star, Leaf,
  CalendarBlank, UserCircle, Medal, CaretRight,
  Plant, RoadHorizon, Tree, Trash, HandsClapping,
  ShieldCheck, Trophy, ChartBar, PaperPlaneTilt,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { type ActionDetail } from '@/services/action.service';
import { useAuth } from '@/context/auth';
import { getActionById, joinAction, leaveAction, type ActionData } from '@/services/action.service';
import { toggleBookmark } from '@/services/report.service';
import { getComments, addComment } from '@/services/comment.service';
import { useToast } from '@/contexts/toast.context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 40;

export default function ActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePhoto, setActivePhoto] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<{ id: string; user: string; initials: string; text: string; time: string; likes: number }[]>([]);
  const [action, setAction] = useState<ActionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Fetch action dari API, fallback ke dummy
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const result = await getActionById(id ?? '');
      if (result.success && result.data) {
        const a = result.data;
        const statusColorMap: Record<string, { color: string; bg: string }> = {
          'Terjadwal': { color: '#2563eb', bg: '#eff6ff' },
          'Berlangsung': { color: '#d97706', bg: '#fffbeb' },
          'Selesai': { color: '#059669', bg: '#ecfdf5' },
        };
        const sc = statusColorMap[a.status] || statusColorMap['Terjadwal'];
        const mapped: ActionDetail = {
          id: a.id,
          type: a.category === 'Kebersihan' ? 'Trash' : a.category === 'Penghijauan' ? 'Plant' : 'Tree',
          bg: '#ecfdf5',
          title: a.title,
          time: new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          points: a.points,
          gradient: '#10b981',
          description: a.description || '',
          category: a.category,
          status: (a.status as 'Terjadwal' | 'Berlangsung' | 'Selesai') || 'Terjadwal',
          statusColor: sc.color,
          statusBg: sc.bg,
          date: a.date || new Date(a.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          duration: a.duration || '-',
          location: {
            address: a.address,
            district: a.district,
            city: a.city,
          },
          organizer: {
            name: a.organizer?.fullName || 'Organizer',
            initials: a.organizer?.initials || '??',
            badge: a.organizer?.currentBadge || 'Warga',
            actionsCount: a.organizer?.totalActions || 0,
          },
          participants: [],
          totalParticipants: a.totalParticipants,
          maxParticipants: a.maxParticipants,          photoUrls: a.photoUrls || [],
          impact: [
            { label: 'Peserta', value: `${a.totalParticipants}/${a.maxParticipants}`, type: 'Users' },
            { label: 'Durasi', value: a.duration || '-', type: 'Clock' },
            { label: 'Eco Points', value: `+${a.points}`, type: 'Tree' },
          ],
          milestones: [
            { id: 'm1', title: 'Aksi Dibuat', desc: 'Aksi positif terdaftar', time: new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), status: 'done' as const },
            ...(a.status === 'Berlangsung' || a.status === 'Selesai' ? [{ id: 'm2', title: 'Berlangsung', desc: 'Aksi sedang dilaksanakan', time: '-', status: (a.status === 'Berlangsung' ? 'active' : 'done') as 'active' | 'done' }] : []),
            ...(a.status === 'Selesai' ? [{ id: 'm3', title: 'Selesai', desc: 'Aksi telah selesai dilaksanakan', time: new Date(a.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), status: 'done' as const }] : []),
            ...(a.status === 'Terjadwal' ? [{ id: 'm2p', title: 'Menunggu Pelaksanaan', desc: 'Aksi terjadwal', time: '-', status: 'active' as const }] : []),
          ],
          ecoPointsBreakdown: [
            { label: 'Partisipasi', points: Math.round(a.points * 0.6) },
            { label: 'Kontribusi', points: Math.round(a.points * 0.3) },
            { label: 'Bonus', points: Math.round(a.points * 0.1) },
          ],
          comments: (a.comments || []).map((c: any) => ({
            id: c.id,
            user: c.user?.fullName || c.fullName || 'User',
            initials: c.user?.initials || c.initials || '??',
            text: c.text || c.content || '',
            time: new Date(c.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            likes: c.likes || 0,
          })),
          verified: a.verified,
          verifiedBy: a.verifiedBy || '',
        };
        setAction(mapped);
      }
      setIsLoading(false);
    }
    load();
  }, [id]);

  // Load comments dari API
  useEffect(() => {
    async function loadComments() {
      if (!id) return;
      const result = await getComments('action', id);
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
        <Text className="text-[16px] text-secondary">Memuat aksi...</Text>
      </View>
    );
  }

  if (!action) {
    return (
      <View className="flex-1 bg-[#f8fafd] items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-[16px] text-secondary">Aksi tidak ditemukan</Text>
        <TouchableOpacity className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: SiagaColors.primary }} onPress={() => router.back()}>
          <Text className="text-white text-[14px] font-semibold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const actionIcon = action.type === 'Plant'
    ? <Plant size={30} color="#fff" weight="duotone" />
    : action.type === 'RoadHorizon'
      ? <RoadHorizon size={30} color="#fff" weight="duotone" />
      : <Tree size={30} color="#fff" weight="duotone" />;

  const getImpactIcon = (type: string) => {
    switch (type) {
      case 'Trash': return <Trash size={22} color={SiagaColors.success} weight="duotone" />;
      case 'MapPin': return <MapPin size={22} color={SiagaColors.info} weight="duotone" />;
      case 'Users': return <Users size={22} color={SiagaColors.primary} weight="duotone" />;
      case 'Clock': return <Clock size={22} color={SiagaColors.warning} weight="duotone" />;
      case 'RoadHorizon': return <RoadHorizon size={22} color={SiagaColors.info} weight="duotone" />;
      case 'Tree': return <Tree size={22} color={SiagaColors.success} weight="duotone" />;
      default: return <Star size={22} color={SiagaColors.primary} weight="duotone" />;
    }
  };

  const handleJoin = async () => {
    if (joined) {
      const result = await leaveAction(action.id);
      if (result.success) {
        setJoined(false);
        showToast({ type: 'info', title: 'Keluar dari aksi', message: 'Anda telah keluar dari aksi ini.', duration: 2000 });
      } else {
        showToast({ type: 'error', title: 'Gagal', message: result.message || 'Tidak dapat keluar dari aksi.' });
      }
    } else {
      const result = await joinAction(action.id);
      if (result.success) {
        setJoined(true);
        showToast({ type: 'success', title: 'Berhasil bergabung!', message: 'Terima kasih telah ikut aksi positif ini.' });
      } else {
        showToast({ type: 'error', title: 'Gagal', message: result.message || 'Tidak dapat bergabung ke aksi.' });
      }
    }
  };

  const handleBookmark = async () => {
    const result = await toggleBookmark('action', action.id);
    if (result.success) {
      setBookmarked(!bookmarked);
      showToast({ type: 'success', title: bookmarked ? 'Bookmark dihapus' : 'Tersimpan!', message: bookmarked ? 'Aksi dihapus dari bookmark.' : 'Aksi disimpan ke bookmark.', duration: 2000 });
    }
  };

  const handleShare = async () => {
    await Share.share({
      title: action.title,
      message: `${action.title}\n${action.description}\n\nLokasi: ${action.location.address}`,
    });
  };

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_WIDTH);
    setActivePhoto(index);
  };

  const getMilestoneIcon = (status: string) => {
    if (status === 'done') return <CheckCircle size={20} color={SiagaColors.success} weight="fill" />;
    if (status === 'active') return <DotsThree size={20} color={SiagaColors.info} weight="bold" />;
    return (
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#cbd5e1', backgroundColor: '#f1f5f9' }} />
    );
  };

  const totalEcoPoints = action.ecoPointsBreakdown.reduce((sum, item) => sum + item.points, 0);
  const participantPercentage = Math.round((action.totalParticipants / action.maxParticipants) * 100);

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
        <Text className="text-[16px] font-bold text-primary">Detail Aksi Positif</Text>
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Photo Carousel */}
        <View className="px-5 pt-4">
          <View className="rounded-2xl overflow-hidden" style={{ elevation: 2 }}>
            <FlatList
              data={action.photoUrls}
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
                  style={{ width: PHOTO_WIDTH, height: 200, backgroundColor: '#e2e8f0' }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                />
              )}
            />
            {/* Photo Indicator */}
            <View className="absolute bottom-3 self-center flex-row gap-1.5">
              {action.photoUrls.map((_, i) => (
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
              <Text className="text-[12px] font-bold text-white">{activePhoto + 1}/{action.photoUrls.length}</Text>
            </View>
          </View>
        </View>

        {/* Title & Badge Section */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="px-2 py-1 rounded-md flex-row items-center gap-1" style={{ backgroundColor: action.statusBg }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: action.statusColor }} />
              <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: action.statusColor }}>{action.status}</Text>
            </View>
            <View className="px-2 py-1 rounded-md bg-slate-100 flex-row items-center gap-1">
              <Text className="text-[10px] font-semibold text-secondary">{action.category}</Text>
            </View>
            {action.verified && (
              <View className="px-2 py-1 rounded-md flex-row items-center gap-1" style={{ backgroundColor: '#dcfce7' }}>
                <ShieldCheck size={12} color={SiagaColors.success} weight="fill" />
                <Text className="text-[10px] font-bold text-success">Terverifikasi</Text>
              </View>
            )}
          </View>
          <Text className="text-lg font-bold text-primary leading-tight">{action.title}</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <View className="flex-row items-center gap-1">
              <CalendarBlank size={14} color={SiagaColors.secondary} weight="duotone" />
              <Text className="text-[12px] text-secondary">{action.date}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={14} color={SiagaColors.secondary} />
              <Text className="text-[12px] text-secondary">{action.duration}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Leaf size={14} color={SiagaColors.success} weight="duotone" />
              <Text className="text-[12px] text-success font-semibold">+{action.points} pts</Text>
            </View>
          </View>
        </View>

        {/* Impact Stats */}
        <View className="px-5 pt-4">
          <View className="flex-row gap-2">
            {action.impact.map((item, i) => (
              <View key={i} className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
                {getImpactIcon(item.type)}
                <Text className="text-lg font-bold text-primary mt-1">{item.value}</Text>
                <Text className="text-[10px] text-secondary font-medium">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Deskripsi</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            <Text className="text-[14px] text-primary/80 leading-5">{action.description}</Text>
          </View>
        </View>

        {/* Eco-Points Breakdown */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Rincian Eco-Points</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <View className="flex-row items-center gap-2">
                <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <Star size={20} color="#fbbf24" weight="duotone" />
                </View>
                <View>
                  <Text className="text-[12px] text-secondary">Total Poin Didapat</Text>
                  <Text className="text-lg font-bold text-primary">+{totalEcoPoints} pts</Text>
                </View>
              </View>
              <View className="rounded-lg px-3 py-1.5 flex-row items-center gap-1" style={{ backgroundColor: '#fef3c7' }}>
                <Trophy size={14} color="#d97706" weight="duotone" />
                <Text className="text-[10px] font-bold" style={{ color: '#a16207' }}>Completed</Text>
              </View>
            </View>
            <View className="gap-2.5">
              {action.ecoPointsBreakdown.map((item, i) => (
                <View key={i} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: SiagaColors.success }} />
                    <Text className="text-[13px] text-primary/80">{item.label}</Text>
                  </View>
                  <Text className="text-[13px] font-bold text-success">+{item.points}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Location */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Lokasi</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            <View className="h-32 rounded-lg bg-slate-100 items-center justify-center mb-3">
              <MapPin size={30} color={SiagaColors.secondary} weight="duotone" />
              <Text className="text-[12px] text-secondary mt-1">Peta akan tersedia segera</Text>
            </View>
            <View className="gap-2">
              <View className="flex-row items-start gap-2.5">
                <MapPin size={16} color={SiagaColors.primary} weight="duotone" />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-primary">{action.location.address}</Text>
                  <Text className="text-[12px] text-secondary mt-0.5">{action.location.district}, {action.location.city}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Organizer */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Penyelenggara</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4 flex-row items-center gap-3" style={{ elevation: 1 }}>
            <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: action.gradient }}>
              <Text className="text-white font-bold text-[16px]">{action.organizer.initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-primary">{action.organizer.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View className="flex-row items-center gap-1 bg-amber-50 rounded px-1.5 py-0.5">
                  <Medal size={12} color="#f59e0b" weight="duotone" />
                  <Text className="text-[10px] font-semibold" style={{ color: '#a16207' }}>{action.organizer.badge}</Text>
                </View>
                <Text className="text-[10px] text-secondary">{action.organizer.actionsCount} aksi digelar</Text>
              </View>
            </View>
            <View className="items-end">
              <View className="flex-row items-center gap-1">
                <HandsClapping size={14} color="#f59e0b" weight="duotone" />
                <Text className="text-[10px] font-bold text-primary">{action.organizer.actionsCount}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Partisipan ({action.totalParticipants}/{action.maxParticipants})</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            {/* Progress bar */}
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[12px] text-secondary">Kapasitas terisi</Text>
                <Text className="text-[12px] font-bold text-primary">{participantPercentage}%</Text>
              </View>
              <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${participantPercentage}%`,
                    backgroundColor: participantPercentage >= 90 ? SiagaColors.danger : SiagaColors.success,
                  }}
                />
              </View>
            </View>
            {/* Participant avatars */}
            <View className="flex-row flex-wrap gap-2">
              {action.participants.map((p) => (
                <View key={p.id} className="items-center gap-1">
                  <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.surface }}>
                    <Text className="text-[12px] font-bold text-primary">{p.initials}</Text>
                  </View>
                  <Text className="text-[10px] text-secondary" numberOfLines={1} style={{ maxWidth: 56 }}>{p.name.split(' ')[0]}</Text>
                </View>
              ))}
              {action.totalParticipants > action.participants.length && (
                <View className="items-center gap-1">
                  <View className="w-10 h-10 rounded-full items-center justify-center bg-slate-100">
                    <Text className="text-[12px] font-bold text-secondary">+{action.totalParticipants - action.participants.length}</Text>
                  </View>
                  <Text className="text-[10px] text-secondary">lainnya</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Milestones Timeline */}
        <View className="px-5 pt-5">
          <Text className="text-[15px] font-bold text-primary mb-2">Milestone Progress</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            {action.milestones.map((item, i) => (
              <View key={item.id} className="flex-row gap-3">
                {/* Line + Icon */}
                <View className="items-center" style={{ width: 24 }}>
                  {getMilestoneIcon(item.status)}
                  {i < action.milestones.length - 1 && (
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

        {/* Verified By */}
        {action.verified && (
          <View className="px-5 pt-5">
            <Text className="text-[15px] font-bold text-primary mb-2">Verifikasi</Text>
            <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <ShieldCheck size={22} color={SiagaColors.success} weight="fill" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-primary">{action.verifiedBy}</Text>
                  <Text className="text-[10px] text-secondary mt-0.5">Instansi Pemverifikasi</Text>
                </View>
                <View className="px-2 py-1 rounded-md" style={{ backgroundColor: '#dcfce7' }}>
                  <Text className="text-[10px] font-bold text-success">Verified ✓</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Comments */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[15px] font-bold text-primary">Komentar ({action.comments.length + localComments.length})</Text>
          </View>
          <View className="gap-2.5">
            {localComments.map((comment) => (
              <View key={comment.id} className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5" style={{ elevation: 1 }}>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
                    <Text className="text-[12px] font-bold text-white">{comment.initials}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[13px] font-bold text-primary">{comment.user}</Text>
                        <View className="bg-blue-100 rounded px-1.5 py-0.5">
                          <Text className="text-[9px] font-bold text-info">Anda</Text>
                        </View>
                      </View>
                      <Text className="text-[10px] text-secondary">{comment.time}</Text>
                    </View>
                    <Text className="text-[13px] text-primary/70 mt-1 leading-4">{comment.text}</Text>
                  </View>
                </View>
              </View>
            ))}
            {action.comments.map((comment) => (
              <View key={comment.id} className="bg-white border border-slate-100 rounded-xl p-3.5" style={{ elevation: 1 }}>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.surface }}>
                    <Text className="text-[12px] font-bold text-primary">{comment.initials}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[13px] font-bold text-primary">{comment.user}</Text>
                      <Text className="text-[10px] text-secondary">{comment.time}</Text>
                    </View>
                    <Text className="text-[13px] text-primary/70 mt-1 leading-4">{comment.text}</Text>
                    <View className="flex-row items-center gap-1 mt-2">
                      <Heart size={14} color={SiagaColors.secondary} weight="regular" />
                      <Text className="text-[10px] text-secondary">{comment.likes}</Text>
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
                      const result = await addComment(action.id, 'action', commentText.trim());
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
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 flex-row items-center gap-3"
        style={{ paddingBottom: insets.bottom + 8, paddingTop: 12, elevation: 8 }}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ backgroundColor: joined ? '#dcfce7' : SiagaColors.success }}
          onPress={handleJoin}
          activeOpacity={0.8}
        >
          <HandsClapping size={18} color={joined ? '#15803d' : '#fff'} weight={joined ? 'fill' : 'bold'} />
          <Text className="text-[14px] font-bold" style={{ color: joined ? '#15803d' : '#fff' }}>
            {joined ? 'Sudah Bergabung' : 'Ikut Aksi'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 border"
          style={{ borderColor: SiagaColors.info, backgroundColor: '#eff6ff' }}
          activeOpacity={0.8}
          onPress={handleShare}
        >
          <ShareNetwork size={18} color={SiagaColors.info} weight="duotone" />
          <Text className="text-[14px] font-bold" style={{ color: SiagaColors.info }}>Bagikan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
