import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    MagnifyingGlass, SquaresFour, Funnel,
    Waves, RoadHorizon, Trash, Mountains, Fire,
    MapPin, Clock, CaretRight, Users,
    ListBullets, CaretDown, CaretUp,
    ShieldCheck, Warning, Eye, NavigationArrow, Crosshair,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { type Report } from '@/services/report.service';
import { getReports, type ReportData } from '@/services/report.service';
import EmbeddedMap from '@/components/ui/MapView';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';
import { useToast } from '@/contexts/toast.context';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

const { height: W_HEIGHT, width: W_WIDTH } = Dimensions.get('window');

const FILTER_CHIPS = [
    { icon: SquaresFour, label: 'Semua', color: SiagaColors.primary },
    { icon: Waves, label: 'Banjir', color: '#3b82f6' },
    { icon: RoadHorizon, label: 'Jalan', color: '#f59e0b' },
    { icon: Trash, label: 'Sampah', color: '#10b981' },
    { icon: Mountains, label: 'Longsor', color: '#ea580c' },
    { icon: Fire, label: 'Kebakaran', color: SiagaColors.danger },
];

const TYPE_MAP: Record<string, { icon: typeof Waves; color: string; bg: string; label: string }> = {
    Waves: { icon: Waves, color: '#2563eb', bg: '#dbeafe', label: 'Banjir' },
    RoadHorizon: { icon: RoadHorizon, color: '#d97706', bg: '#fef3c7', label: 'Jalan Rusak' },
    Trash: { icon: Trash, color: '#15803d', bg: '#dcfce7', label: 'Sampah' },
};

const FILTER_TYPE_MAP: Record<string, string> = {
    Banjir: 'Waves',
    Jalan: 'RoadHorizon',
    Sampah: 'Trash',
    Longsor: 'Mountains',
    Kebakaran: 'Fire',
};

export default function PantauScreen() {
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [sosVisible, setSosVisible] = useState(false);
    const [apiReports, setApiReports] = useState<ReportData[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['12%', '60%'], []);
    const location = useCurrentLocation();

    // GPS is ready when we have coordinates
    const gpsReady = location.lat !== null && location.lng !== null;

    // Fetch reports dari API
    const loadReports = useCallback(async () => {
        const result = await getReports({ limit: 20 });
        if (result.success && result.data) setApiReports(result.data);
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadReports();
        setIsRefreshing(false);
        showToast({ type: 'success', title: 'Data diperbarui', message: 'Data terbaru berhasil dimuat.', duration: 2000 });
    }, [loadReports, showToast]);

    // Konversi API data ke Report UI type
    const reportsUI = useMemo((): Report[] => {
        const typeMap: Record<string, string> = {
            'Banjir': 'Waves', 'Jalan Rusak': 'RoadHorizon', 'Sampah': 'Trash',
            'Longsor': 'Mountains', 'Kebakaran': 'Fire',
        };
        return apiReports.map(r => {
            const urgencyColor = r.urgency >= 80 ? '#dc2626' : r.urgency >= 50 ? '#f59e0b' : '#15803d';
            return {
                id: r.id,
                type: typeMap[r.category] || 'Waves',
                gradient: '#3b82f6',
                badge: r.urgency >= 80 ? 'Kritis' : r.urgency >= 50 ? 'Sedang' : 'Rendah',
                badgeBg: r.urgency >= 80 ? '#fee2e2' : r.urgency >= 50 ? '#fef9c3' : '#dcfce7',
                badgeColor: urgencyColor,
                title: r.title,
                desc: r.description?.slice(0, 60) || '',
                distance: r.district || '-',
                votes: r.votesCount,
                photos: r.photosCount || 0,
                time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                urgency: r.urgency,
                urgencyColor,
                supported: r.hasVoted || false,
            };
        });
    }, [apiReports]);

    const filteredReports = activeFilter === 'Semua'
        ? reportsUI
        : reportsUI.filter(r => r.type === FILTER_TYPE_MAP[activeFilter]);

    // Map markers dari API data (hanya yang punya lat/lng)
    const mapMarkers = useMemo(() => {
        return apiReports.filter(r => r.lat && r.lng).map(r => {
            const urgencyColor = r.urgency >= 80 ? '#dc2626' : r.urgency >= 50 ? '#f59e0b' : '#15803d';
            const badge = r.urgency >= 80 ? 'Kritis' : r.urgency >= 50 ? 'Sedang' : 'Rendah';
            return {
                id: r.id,
                lat: r.lat,
                lng: r.lng,
                title: r.title,
                color: urgencyColor,
                popup: `<b>${r.title}</b><br/><span style="color:${urgencyColor}">${badge}</span>`,
            };
        });
    }, [apiReports]);

    // Dynamic stats
    const stats = useMemo(() => {
        const aktif = apiReports.filter(r => r.status === 'Menunggu' || r.status === 'Diverifikasi').length;
        const proses = apiReports.filter(r => r.status === 'Ditangani').length;
        const selesai = apiReports.filter(r => r.status === 'Selesai').length;
        return [
            { label: 'Aktif', value: String(aktif), icon: Warning, color: SiagaColors.danger, bg: '#fee2e2' },
            { label: 'Diproses', value: String(proses), icon: NavigationArrow, color: SiagaColors.info, bg: '#dbeafe' },
            { label: 'Selesai', value: String(selesai), icon: ShieldCheck, color: SiagaColors.success, bg: '#dcfce7' },
            { label: 'Total', value: String(apiReports.length), icon: Eye, color: SiagaColors.primary, bg: SiagaColors.surface },
        ];
    }, [apiReports]);

    const handleReportPress = useCallback((report: Report) => {
        router.push({ pathname: '/report-detail', params: { id: report.id } });
    }, [router]);

    const handleMarkerPress = useCallback((id: string) => {
        router.push({ pathname: '/report-detail', params: { id } });
    }, [router]);

    const typeInfo = (type: string) => TYPE_MAP[type] || TYPE_MAP.Waves;

    const getUrgencyLabel = (urgency: number) => {
        if (urgency >= 100) return { label: 'Kritis', color: '#dc2626', bg: '#fee2e2' };
        if (urgency >= 50) return { label: 'Sedang', color: '#a16207', bg: '#fef9c3' };
        return { label: 'Rendah', color: '#15803d', bg: '#dcfce7' };
    };

    return (
        <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
            {/* Full-height Map Section */}
            <View className="flex-1">
                {/* Embedded Map — full screen (only when GPS ready) */}
                <View className="absolute inset-0">
                    {gpsReady ? (
                        <EmbeddedMap
                            latitude={location.lat!}
                            longitude={location.lng!}
                            zoom={14}
                            height={W_HEIGHT}
                            markers={mapMarkers}
                            borderRadius={0}
                            showOpenButton={false}
                            interactive={true}
                            onMarkerPress={handleMarkerPress}
                        />
                    ) : (
                        /* GPS Overlay — Loading or Error */
                        <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#e8eef6', height: W_HEIGHT }}>
                            {location.loading ? (
                                /* Loading state */
                                <View className="items-center gap-4">
                                    <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(8,42,76,0.08)' }}>
                                        <ActivityIndicator size="large" color={SiagaColors.primary} />
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-[16px] font-bold text-primary">Mencari lokasi...</Text>
                                        <Text className="text-[13px] text-secondary mt-1">Menggunakan GPS perangkat Anda</Text>
                                    </View>
                                </View>
                            ) : (
                                /* Error / Permission denied state */
                                <View className="items-center gap-5 px-8">
                                    <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(8,42,76,0.06)' }}>
                                        <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(8,42,76,0.08)' }}>
                                            <Crosshair size={32} color={SiagaColors.secondary} weight="duotone" />
                                        </View>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-[17px] font-bold text-primary">Lokasi Tidak Tersedia</Text>
                                        <Text className="text-[13px] text-secondary mt-2 text-center leading-5">
                                            {location.error || 'Aktifkan GPS untuk melihat peta dan laporan di sekitar Anda.'}
                                        </Text>
                                    </View>
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            className="flex-row items-center gap-2 px-6 py-3.5 rounded-2xl"
                                            style={{ backgroundColor: SiagaColors.primary, elevation: 4, shadowColor: SiagaColors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 }}
                                            onPress={() => location.refresh()}
                                            activeOpacity={0.8}
                                        >
                                            <Crosshair size={18} color="#fff" weight="bold" />
                                            <Text className="text-[14px] font-bold text-white">Aktifkan Lokasi</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Overlay Header */}
                <View className="absolute top-0 left-0 right-0 z-20 px-4 pt-3">
                    <View className="bg-white/95 rounded-2xl border border-slate-100/50 p-3" style={{ elevation: 4, shadowColor: '#082a4c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 }}>
                        <View className="flex-row items-center gap-2.5">
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
                                    <Eye size={16} color="#fff" weight="bold" />
                                </View>
                                <Text className="text-[16px] font-bold text-primary">Pantau</Text>
                            </View>
                            <View className="flex-1 flex-row items-center gap-2 bg-[#f1f6fc] rounded-xl px-3 py-2">
                                <MagnifyingGlass size={15} color={SiagaColors.secondary} weight="duotone" />
                                <Text className="flex-1 text-[13px] text-secondary/50">Cari lokasi atau laporan...</Text>
                            </View>
                            <TouchableOpacity className="w-8 h-8 rounded-xl bg-surface items-center justify-center" activeOpacity={0.7}>
                                <Funnel size={15} color={SiagaColors.primary} weight="duotone" />
                            </TouchableOpacity>
                        </View>
                        {/* Filter chips */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5" contentContainerStyle={{ gap: 6 }}>
                            {FILTER_CHIPS.map((fc, i) => {
                                const isActive = activeFilter === fc.label;
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl"
                                        style={{
                                            backgroundColor: isActive ? SiagaColors.primary : '#fff',
                                            borderWidth: 1,
                                            borderColor: isActive ? SiagaColors.primary : '#e2e8f0',
                                        }}
                                        onPress={() => setActiveFilter(fc.label)}
                                        activeOpacity={0.7}
                                    >
                                        <fc.icon size={13} color={isActive ? '#fff' : fc.color} weight="duotone" />
                                        <Text className="text-[12px] font-semibold" style={{ color: isActive ? '#fff' : SiagaColors.primary }}>{fc.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>

                {/* Stats Overlay */}
                <View className="absolute bottom-3 left-3 right-3 flex-row" style={{ gap: 6, bottom: W_HEIGHT * 0.12 + 12 }}>
                    {stats.map((s, i) => (
                        <View key={i} className="flex-1 bg-white/95 rounded-xl px-2 py-2 items-center" style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                            <View className="w-6 h-6 rounded-lg items-center justify-center mb-1" style={{ backgroundColor: s.bg }}>
                                <s.icon size={14} color={s.color} weight="duotone" />
                            </View>
                            <Text className="text-[16px] font-bold" style={{ color: s.color }}>{s.value}</Text>
                            <Text className="text-[12px] font-semibold text-secondary mt-0.5">{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Bottom Sheet */}
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                handleIndicatorStyle={{ backgroundColor: '#cbd5e1', width: 40, height: 4, borderRadius: 2 }}
                backgroundStyle={{ borderRadius: 24, backgroundColor: '#fff', elevation: 10, shadowColor: '#082a4c', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16 }}
            >
                <View className="px-4 pb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View className="w-7 h-7 rounded-lg items-center justify-center" style={{ backgroundColor: SiagaColors.surface }}>
                            <ListBullets size={16} color={SiagaColors.primary} weight="bold" />
                        </View>
                        <Text className="text-[16px] font-bold text-primary">Daftar Laporan</Text>
                        <View className="px-3 py-1 rounded-md" style={{ backgroundColor: SiagaColors.primary }}>
                            <Text className="text-[13px] font-bold text-white">{filteredReports.length}</Text>
                        </View>
                    </View>
                </View>

                <BottomSheetFlatList
                    data={filteredReports}
                    keyExtractor={(item: Report) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 10 }}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={SiagaColors.primary} colors={[SiagaColors.primary]} />}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-12">
                            <Text className="text-[16px] font-semibold text-secondary">Belum ada laporan</Text>
                            <Text className="text-[13px] text-secondary/60 mt-1">Tarik ke bawah untuk memuat ulang</Text>
                        </View>
                    }
                    renderItem={({ item: r }: { item: Report }) => {
                        const info = typeInfo(r.type);
                        const urgency = getUrgencyLabel(r.urgency);
                        const IconComp = info.icon;
                        return (
                            <TouchableOpacity
                                className="bg-white border border-slate-100 rounded-2xl overflow-hidden"
                                style={{ elevation: 2, shadowColor: '#082a4c', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }}
                                onPress={() => handleReportPress(r)}
                                activeOpacity={0.7}
                            >
                                {/* Top accent line */}
                                <View style={{ height: 3, backgroundColor: info.color }} />
                                <View className="p-3.5">
                                    <View className="flex-row items-start gap-3">
                                        {/* Icon */}
                                        <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: info.bg }}>
                                            <IconComp size={24} color={info.color} weight="duotone" />
                                        </View>

                                        {/* Content */}
                                        <View className="flex-1">
                                            {/* Badges row */}
                                            <View className="flex-row items-center gap-1.5 mb-1">
                                                <View className="px-3 py-1 rounded-md flex-row items-center gap-1" style={{ backgroundColor: urgency.bg }}>
                                                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: urgency.color }} />
                                                    <Text className="text-[12px] font-bold uppercase" style={{ color: urgency.color }}>{urgency.label}</Text>
                                                </View>
                                                <View className="px-3 py-1 rounded-md" style={{ backgroundColor: info.bg }}>
                                                    <Text className="text-[12px] font-semibold" style={{ color: info.color }}>{info.label}</Text>
                                                </View>
                                            </View>

                                            {/* Title */}
                                            <Text className="text-[16px] font-bold text-primary" numberOfLines={1}>{r.title}</Text>
                                            <Text className="text-[12px] text-secondary mt-0.5" numberOfLines={1}>{r.desc}</Text>

                                            {/* Meta row */}
                                            <View className="flex-row items-center gap-3 mt-2">
                                                <View className="flex-row items-center gap-1" style={{ flexShrink: 0 }}>
                                                    <Clock size={12} color={SiagaColors.secondary} />
                                                    <Text className="text-[13px] text-secondary font-medium">{r.time}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-1" style={{ flexShrink: 1, minWidth: 0 }}>
                                                    <MapPin size={12} color={SiagaColors.secondary} weight="duotone" style={{ flexShrink: 0 }} />
                                                    <Text className="text-[13px] text-secondary font-medium" numberOfLines={1}>{r.distance}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-1" style={{ flexShrink: 0 }}>
                                                    <Users size={12} color={SiagaColors.primary} weight="duotone" />
                                                    <Text className="text-[13px] font-bold text-primary" numberOfLines={1}>{r.votes} dukungan</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Arrow */}
                                        <View className="w-7 h-7 rounded-lg bg-slate-50 items-center justify-center self-center">
                                            <CaretRight size={14} color={SiagaColors.secondary} weight="bold" />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </BottomSheet>

            <SOSButton onPress={() => setSosVisible(true)} bottom={16} />
            <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
        </View>
    );
}
