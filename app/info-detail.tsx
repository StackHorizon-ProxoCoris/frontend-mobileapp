import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Share, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, ShareNetwork, Bookmark, Camera, Clock, Eye,
  CloudRain, BookOpenText, MegaphoneSimple,
  Heart, ShieldCheck, CaretRight, Tag,
  Umbrella, Warning, Lightning, House,
  Drop, MapTrifold, Phone, Backpack,
  NavigationArrow, CalendarBlank, WarningCircle,
  LinkSimple, ArrowSquareOut,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getInfoById, type InfoDetailData } from '@/services/info.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 40;

export default function InfoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePhoto, setActivePhoto] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [info, setInfo] = useState<InfoDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!id) { setIsLoading(false); return; }
      setIsLoading(true);
      const result = await getInfoById(id);
      if (result.success && result.data) {
        setInfo(result.data);
      }
      setIsLoading(false);
    };
    fetchInfo();
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#f8fafd] items-center justify-center" style={{ paddingTop: insets.top }}>
        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary + '20' }}>
          <BookOpenText size={20} color={SiagaColors.primary} weight="duotone" />
        </View>
        <Text className="text-sm text-secondary mt-3">Memuat artikel...</Text>
      </View>
    );
  }

  if (!info) {
    return (
      <View className="flex-1 bg-[#f8fafd] items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-sm text-secondary">Info tidak ditemukan</Text>
        <TouchableOpacity className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: SiagaColors.primary }} onPress={() => router.back()}>
          <Text className="text-white text-xs font-semibold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getHeaderIcon = () => {
    if (info.type === 'CloudRain') return <CloudRain size={28} color="#fff" weight="duotone" />;
    if (info.type === 'BookOpenText') return <BookOpenText size={28} color="#fff" weight="duotone" />;
    return <MegaphoneSimple size={28} color="#fff" weight="duotone" />;
  };

  const getTipIcon = (iconName: string) => {
    const size = 20;
    const color = info.color;
    switch (iconName) {
      case 'Umbrella': return <Umbrella size={size} color={color} weight="duotone" />;
      case 'Warning': return <Warning size={size} color={color} weight="duotone" />;
      case 'Lightning': return <Lightning size={size} color={color} weight="duotone" />;
      case 'House': return <House size={size} color={color} weight="duotone" />;
      case 'Backpack': return <Backpack size={size} color={color} weight="duotone" />;
      case 'Drop': return <Drop size={size} color={color} weight="duotone" />;
      case 'MapTrifold': return <MapTrifold size={size} color={color} weight="duotone" />;
      case 'Phone': return <Phone size={size} color={color} weight="duotone" />;
      case 'NavigationArrow': return <NavigationArrow size={size} color={color} weight="duotone" />;
      case 'Clock': return <Clock size={size} color={color} weight="duotone" />;
      case 'CalendarBlank': return <CalendarBlank size={size} color={color} weight="duotone" />;
      case 'WarningCircle': return <WarningCircle size={size} color={color} weight="duotone" />;
      default: return <BookOpenText size={size} color={color} weight="duotone" />;
    }
  };

  const getCategoryLabel = () => {
    switch (info.category) {
      case 'cuaca': return 'Prakiraan Cuaca';
      case 'edukasi': return 'Edukasi & Panduan';
      case 'pengumuman': return 'Pengumuman Resmi';
      default: return 'Informasi';
    }
  };

  const handleShare = async () => {
    await Share.share({
      title: info.title,
      message: `${info.title}\n\n${info.content[0]}\n\nBaca selengkapnya di ProxoCoris`,
    });
  };

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_WIDTH);
    setActivePhoto(index);
  };

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

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
        <Text className="text-sm font-bold text-primary">Detail Informasi</Text>
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
        {/* Hero Banner */}
        <View className="px-5 pt-4">
          <View className="rounded-2xl overflow-hidden" style={{ elevation: 2 }}>
            <View className="p-5" style={{ backgroundColor: info.gradient }}>
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  {getHeaderIcon()}
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{getCategoryLabel()}</Text>
                  <Text className="text-[10px] text-white/60">{info.source}</Text>
                </View>
                {info.verified && (
                  <View className="flex-row items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
                    <ShieldCheck size={12} color="#fff" weight="fill" />
                    <Text className="text-[9px] font-bold text-white">Resmi</Text>
                  </View>
                )}
              </View>
              <Text className="text-lg font-bold text-white leading-tight">{info.title}</Text>
              <Text className="text-[11px] text-white/80 mt-1.5 leading-4">{info.subtitle}</Text>
            </View>
          </View>
        </View>

        {/* Meta info */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <CalendarBlank size={12} color={SiagaColors.secondary} weight="duotone" />
              <Text className="text-[10px] text-secondary">{info.publishedAt}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={12} color={SiagaColors.secondary} />
              <Text className="text-[10px] text-secondary">{info.readTime} baca</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Eye size={12} color={SiagaColors.secondary} weight="duotone" />
              <Text className="text-[10px] text-secondary">{formatNumber(info.stats.views)} dilihat</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-5 pt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Eye size={20} color={info.color} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{formatNumber(info.stats.views)}</Text>
              <Text className="text-[9px] text-secondary font-medium">Dilihat</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <ShareNetwork size={20} color={SiagaColors.info} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{info.stats.shares}</Text>
              <Text className="text-[9px] text-secondary font-medium">Dibagikan</Text>
            </View>
            <View className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
              <Bookmark size={20} color={SiagaColors.warning} weight="duotone" />
              <Text className="text-lg font-bold text-primary mt-1">{info.stats.bookmarks}</Text>
              <Text className="text-[9px] text-secondary font-medium">Disimpan</Text>
            </View>
          </View>
        </View>

        {/* Photo Carousel */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Dokumentasi</Text>
          <View className="rounded-2xl overflow-hidden" style={{ elevation: 2 }}>
            <FlatList
              data={info.photoUrls}
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
            <View className="absolute bottom-3 self-center flex-row gap-1.5">
              {info.photoUrls.map((_, i) => (
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
            <View className="absolute top-3 right-3 flex-row items-center gap-1 bg-black/50 rounded-lg px-2 py-1">
              <Camera size={12} color="#fff" weight="bold" />
              <Text className="text-[10px] font-bold text-white">{activePhoto + 1}/{info.photoUrls.length}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Isi Artikel</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
            {info.content.map((paragraph, i) => (
              <Text key={i} className="text-[12px] text-primary/80 leading-5 mb-3" style={i === info.content.length - 1 ? { marginBottom: 0 } : undefined}>
                {paragraph}
              </Text>
            ))}
          </View>
        </View>

        {/* Tips / Key Points */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">
            {info.category === 'edukasi' ? 'Tips Penting' : info.category === 'cuaca' ? 'Hal yang Perlu Diperhatikan' : 'Informasi Penting'}
          </Text>
          <View className="gap-2.5">
            {info.tips.map((tip, i) => (
              <View key={i} className="flex-row items-start gap-3 bg-white border border-slate-100 rounded-xl p-3.5" style={{ elevation: 1 }}>
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: info.bg }}>
                  {getTipIcon(tip.icon)}
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-primary">{tip.title}</Text>
                  <Text className="text-[10px] text-secondary mt-0.5 leading-4">{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Topik Terkait</Text>
          <View className="flex-row flex-wrap gap-2">
            {info.tags.map((tag, i) => (
              <View key={i} className="flex-row items-center gap-1 bg-white border border-slate-100 rounded-lg px-3 py-2" style={{ elevation: 1 }}>
                <Tag size={12} color={info.color} weight="duotone" />
                <Text className="text-[10px] font-semibold" style={{ color: info.color }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Author */}
        <View className="px-5 pt-5">
          <Text className="text-[13px] font-bold text-primary mb-2">Penulis</Text>
          <View className="bg-white border border-slate-100 rounded-xl p-4 flex-row items-center gap-3" style={{ elevation: 1 }}>
            <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: info.gradient }}>
              <Text className="text-white font-bold text-sm">{info.author.initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[12px] font-bold text-primary">{info.author.name}</Text>
              <Text className="text-[10px] text-secondary mt-0.5">{info.author.role}</Text>
              <Text className="text-[9px] text-secondary">{info.author.organization}</Text>
            </View>
            {info.verified && (
              <View className="items-end gap-1">
                <View className="flex-row items-center gap-1 px-2 py-1 rounded-md" style={{ backgroundColor: '#dcfce7' }}>
                  <ShieldCheck size={10} color={SiagaColors.success} weight="fill" />
                  <Text className="text-[9px] font-bold text-success">Verified</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Verified By */}
        {info.verified && info.verifiedBy && (
          <View className="px-5 pt-5">
            <Text className="text-[13px] font-bold text-primary mb-2">Verifikasi</Text>
            <View className="bg-white border border-slate-100 rounded-xl p-4" style={{ elevation: 1 }}>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <ShieldCheck size={20} color={SiagaColors.success} weight="fill" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-primary">{info.verifiedBy}</Text>
                  <Text className="text-[9px] text-secondary mt-0.5">Sumber Terverifikasi</Text>
                </View>
                <View className="px-2 py-1 rounded-md" style={{ backgroundColor: '#dcfce7' }}>
                  <Text className="text-[9px] font-bold text-success">Verified ✓</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Related Links */}
        {info.relatedLinks.length > 0 && (
          <View className="px-5 pt-5">
            <Text className="text-[13px] font-bold text-primary mb-2">Tautan Terkait</Text>
            <View className="gap-2">
              {info.relatedLinks.map((link, i) => (
                <TouchableOpacity
                  key={i}
                  className="flex-row items-center gap-3 bg-white border border-slate-100 rounded-xl p-3.5"
                  style={{ elevation: 1 }}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (link.url.startsWith('http')) Linking.openURL(link.url);
                  }}
                >
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: info.bg }}>
                    <LinkSimple size={18} color={info.color} weight="duotone" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-primary">{link.title}</Text>
                    <Text className="text-[9px] text-secondary mt-0.5" numberOfLines={1}>{link.url}</Text>
                  </View>
                  <ArrowSquareOut size={16} color={info.color} weight="duotone" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Updated info */}
        {info.updatedAt !== info.publishedAt && (
          <View className="px-5 pt-5">
            <View className="flex-row items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <Clock size={14} color="#d97706" weight="duotone" />
              <Text className="text-[10px] text-amber-700">Terakhir diperbarui: {info.updatedAt}</Text>
            </View>
          </View>
        )}

        {/* Comments */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[13px] font-bold text-primary">Komentar ({info.comments?.length ?? 0})</Text>
          </View>
          <View className="gap-2.5">
            {(info.comments ?? []).map((comment) => (
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
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 flex-row items-center gap-3"
        style={{ paddingBottom: insets.bottom + 8, paddingTop: 12, elevation: 8 }}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ backgroundColor: bookmarked ? '#fef3c7' : SiagaColors.primary }}
          onPress={() => setBookmarked(!bookmarked)}
          activeOpacity={0.8}
        >
          <Bookmark size={16} color={bookmarked ? '#d97706' : '#fff'} weight={bookmarked ? 'fill' : 'bold'} />
          <Text className="text-[12px] font-bold" style={{ color: bookmarked ? '#d97706' : '#fff' }}>
            {bookmarked ? 'Tersimpan' : 'Simpan'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 border"
          style={{ borderColor: SiagaColors.info, backgroundColor: '#eff6ff' }}
          activeOpacity={0.8}
          onPress={handleShare}
        >
          <ShareNetwork size={16} color={SiagaColors.info} weight="duotone" />
          <Text className="text-[12px] font-bold" style={{ color: SiagaColors.info }}>Bagikan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
