import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Animated, TextInput, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ClipboardText, MagnifyingGlass, Funnel, Bell,
    Waves, Mountains, RoadHorizon, Fire, Trash,
    Clock, ArrowRight, CaretRight, CheckCircle,
    HourglassMedium, WarningDiamond, FilePlus, Timer,
    TrendUp, MapPin, ChartBar, ArrowClockwise,
    SortAscending, XCircle, Megaphone, DotsThreeVertical,
    Warning, Eye, ChatText, CheckSquare,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import {
    getReports,
    updateReportStatus,
    type BackendReportStatus,
    type ReportData,
} from '@/services/report.service';
import { useToast } from '@/contexts/toast.context';

const { width } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────────────────
type SeverityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
type StatusType = 'Baru' | 'Diproses' | 'Selesai' | 'Ditolak';
type GovReportItem = {
    id: string;
    title: string;
    desc: string;
    area: string;
    cluster: string;
    time: string;
    severity: SeverityLevel;
    status: StatusType;
    backendStatus: BackendReportStatus;
    icon: any;
    iconColor: string;
    bgColor: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const FILTER_TABS = [
    { key: 'Semua', count: 54 },
    { key: 'Baru', count: 12 },
    { key: 'Diproses', count: 8 },
    { key: 'Selesai', count: 31 },
    { key: 'Ditolak', count: 3 },
];

const SORT_OPTIONS = ['Terbaru', 'Prioritas', 'Lokasi', 'Kategori'];

const SEVERITY_CONFIG: Record<SeverityLevel, { text: string; bg: string; dot: string }> = {
    Kritis: { text: '#fff', bg: SiagaColors.danger, dot: SiagaColors.danger },
    Tinggi: { text: '#9a3412', bg: '#fed7aa', dot: '#f97316' },
    Sedang: { text: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
    Rendah: { text: '#065f46', bg: '#d1fae5', dot: SiagaColors.success },
};

const STATUS_CONFIG: Record<StatusType, { text: string; bg: string }> = {
    Baru: { text: SiagaColors.info, bg: '#eff6ff' },
    Diproses: { text: '#d97706', bg: '#fffbeb' },
    Selesai: { text: SiagaColors.success, bg: '#ecfdf5' },
    Ditolak: { text: SiagaColors.danger, bg: '#fef2f2' },
};

// Mapping eksplisit FE status -> status backend yang valid
const UI_TO_BACKEND_STATUS: Record<StatusType, BackendReportStatus | null> = {
    Baru: 'Menunggu',
    Diproses: 'Ditangani',
    Selesai: 'Selesai',
    Ditolak: null, // Backend saat ini belum expose status "Ditolak"
};

const STATUS_ACTION_TARGET: Partial<Record<StatusType, BackendReportStatus>> = {
    Baru: 'Ditangani',
    Diproses: 'Selesai',
};

const SUMMARY_STATS = [
    { value: '12', label: 'Baru', icon: FilePlus, color: SiagaColors.danger, bg: '#fef2f2', trend: '+5 hari ini' },
    { value: '8', label: 'Diproses', icon: HourglassMedium, color: '#d97706', bg: '#fffbeb', trend: 'Aktif' },
    { value: '31', label: 'Selesai', icon: CheckCircle, color: SiagaColors.success, bg: '#ecfdf5', trend: '92%' },
    { value: '4.2j', label: 'Avg. Respons', icon: Timer, color: SiagaColors.info, bg: '#eff6ff', trend: 'Baik' },
];

const REPORTS = [
    {
        id: '#1045',
        title: 'Banjir Jl. Merdeka',
        desc: 'Ketinggian air mencapai 60cm, warga kesulitan beraktivitas.',
        area: 'Kec. Dayeuhkolot',
        cluster: '15 laporan serupa',
        time: '10 menit lalu',
        severity: 'Kritis' as SeverityLevel,
        status: 'Baru' as StatusType,
        icon: Waves, iconColor: '#2563eb', bgColor: '#eff6ff',
    },
    {
        id: '#1044',
        title: 'Longsor Tebing Jl. Dago',
        desc: 'Material longsor menutup sebagian badan jalan.',
        area: 'Kec. Cibeunying Kaler',
        cluster: '5 laporan serupa',
        time: '30 menit lalu',
        severity: 'Kritis' as SeverityLevel,
        status: 'Diproses' as StatusType,
        icon: Mountains, iconColor: '#ea580c', bgColor: '#fff7ed',
    },
    {
        id: '#1043',
        title: 'Kebakaran Warung Jl. ABC',
        desc: 'Api sudah terkendalikan, butuh pembersihan lokasi.',
        area: 'Kec. Regol',
        cluster: '2 laporan serupa',
        time: '1 jam lalu',
        severity: 'Tinggi' as SeverityLevel,
        status: 'Diproses' as StatusType,
        icon: Fire, iconColor: '#dc2626', bgColor: '#fef2f2',
    },
    {
        id: '#1042',
        title: 'Jalan Berlubang Jl. Sudirman',
        desc: 'Lubang besar berdiameter ±80cm, berbahaya untuk kendaraan.',
        area: 'Kec. Coblong',
        cluster: '3 laporan serupa',
        time: '2 jam lalu',
        severity: 'Sedang' as SeverityLevel,
        status: 'Baru' as StatusType,
        icon: RoadHorizon, iconColor: '#d97706', bgColor: '#fffbeb',
    },
    {
        id: '#1041',
        title: 'Tumpukan Sampah Gg. Melati',
        desc: 'Sampah menumpuk selama 4 hari, menimbulkan bau tidak sedap.',
        area: 'Kec. Coblong',
        cluster: '8 laporan serupa',
        time: '3 jam lalu',
        severity: 'Rendah' as SeverityLevel,
        status: 'Selesai' as StatusType,
        icon: Trash, iconColor: '#059669', bgColor: '#ecfdf5',
    },
    {
        id: '#1040',
        title: 'Lampu Jalan Padam Jl. Braga',
        desc: '12 titik lampu mati sepanjang 400m, rawan kriminalitas malam.',
        area: 'Kec. Sumur Bandung',
        cluster: '6 laporan serupa',
        time: '5 jam lalu',
        severity: 'Sedang' as SeverityLevel,
        status: 'Selesai' as StatusType,
        icon: Warning, iconColor: '#f59e0b', bgColor: '#fffbeb',
    },
];

const CATEGORY_DIST = [
    { label: 'Banjir', count: 18, color: '#3b82f6', bg: '#eff6ff', pct: 33 },
    { label: 'Jalan Rusak', count: 14, color: '#f59e0b', bg: '#fffbeb', pct: 26 },
    { label: 'Sampah', count: 11, color: '#10b981', bg: '#ecfdf5', pct: 20 },
    { label: 'Longsor', count: 7, color: '#f97316', bg: '#fff7ed', pct: 13 },
    { label: 'Kebakaran', count: 4, color: '#ef4444', bg: '#fef2f2', pct: 8 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ item }: { item: typeof SUMMARY_STATS[0] }) {
    const IconComp = item.icon;
    return (
        <View
            className="rounded-2xl p-3 flex-1"
            style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#edf2f9',
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
            }}
        >
            <View className="w-9 h-9 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: item.bg }}>
                <IconComp size={20} color={item.color} weight="duotone" />
            </View>
            <Text className="text-[20px] font-extrabold" style={{ color: SiagaColors.primary, lineHeight: 24 }}>
                {item.value}
            </Text>
            <Text className="text-[12px] font-medium mt-0.5" style={{ color: SiagaColors.secondary }}>
                {item.label}
            </Text>
            <View className="flex-row items-center gap-0.5 mt-1.5">
                <TrendUp size={11} color={item.color} weight="fill" />
                <Text className="text-[10px] font-bold" style={{ color: item.color }}>{item.trend}</Text>
            </View>
        </View>
    );
}

function ReportCard({
    report,
    onPress,
    onStatusAction,
    isStatusUpdating,
}: {
    report: GovReportItem;
    onPress: () => void;
    onStatusAction: () => void;
    isStatusUpdating: boolean;
}) {
    const IconComp = report.icon;
    const sev = SEVERITY_CONFIG[report.severity];
    const st = STATUS_CONFIG[report.status];
    const isCritical = report.severity === 'Kritis';
    const isNew = report.status === 'Baru';
    const isStatusAction = report.status === 'Baru' || report.status === 'Diproses';
    const actionLabel = report.status === 'Baru'
        ? 'Proses'
        : report.status === 'Diproses'
            ? 'Tandai Selesai'
            : 'Lihat';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="rounded-2xl"
            style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: isCritical ? 'rgba(231,76,60,0.18)' : '#edf2f9',
                elevation: isCritical ? 3 : 1,
                shadowColor: isCritical ? SiagaColors.danger : '#000',
                shadowOffset: { width: 0, height: isCritical ? 2 : 1 },
                shadowOpacity: isCritical ? 0.1 : 0.04,
                shadowRadius: isCritical ? 6 : 3,
                overflow: 'hidden',
            }}
        >
            {/* Critical top accent bar */}
            {isCritical && (
                <View style={{ height: 3, backgroundColor: SiagaColors.danger }} />
            )}

            <View className="p-3.5">
                {/* Row 1: icon + title + badge */}
                <View className="flex-row items-start gap-3 mb-2.5">
                    <View
                        className="w-11 h-11 rounded-xl items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: report.bgColor }}
                    >
                        <IconComp size={24} color={report.iconColor} weight="duotone" />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-0.5">
                            <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                                <Text
                                    className="text-[10px] font-bold uppercase tracking-wider"
                                    style={{ color: SiagaColors.secondary }}
                                >
                                    {report.id}
                                </Text>
                                {isNew && (
                                    <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SiagaColors.danger }} />
                                )}
                            </View>
                            {/* Severity badge */}
                            <View className="px-3 py-1 rounded-md" style={{ backgroundColor: sev.bg }}>
                                <Text className="text-[9px] font-bold" style={{ color: sev.text }}>
                                    {report.severity}
                                </Text>
                            </View>
                        </View>

                        <Text
                            className="text-[15px] font-bold leading-tight"
                            style={{ color: SiagaColors.primary }}
                            numberOfLines={1}
                        >
                            {report.title}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <Text
                    className="text-[13px] leading-relaxed mb-2.5"
                    style={{ color: SiagaColors.secondary }}
                    numberOfLines={2}
                >
                    {report.desc}
                </Text>

                {/* Row 3: meta info */}
                <View className="flex-row items-center gap-3 mb-3">
                    <View className="flex-row items-center gap-1.5 flex-1">
                        <MapPin size={13} color={SiagaColors.secondary} weight="duotone" />
                        <Text className="text-[12px]" style={{ color: SiagaColors.secondary }} numberOfLines={1}>
                            {report.area}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <ChartBar size={13} color={SiagaColors.secondary} weight="duotone" />
                        <Text className="text-[12px]" style={{ color: SiagaColors.secondary }}>
                            {report.cluster}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 10 }} />

                {/* Row 4: time + status + action */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                        <Clock size={13} color={SiagaColors.secondary} />
                        <Text className="text-[12px]" style={{ color: SiagaColors.secondary }}>
                            {report.time}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        {/* Status pill */}
                        <View className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: st.bg }}>
                            <Text className="text-[10px] font-bold" style={{ color: st.text }}>
                                {report.status}
                            </Text>
                        </View>

                        {/* Action button */}
                        <TouchableOpacity
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl"
                            style={{ backgroundColor: isCritical ? SiagaColors.info : SiagaColors.primary }}
                            activeOpacity={0.7}
                            onPress={isStatusAction ? onStatusAction : onPress}
                            disabled={isStatusUpdating}
                        >
                            <Text className="text-[12px] font-bold text-white">
                                {isStatusUpdating ? 'Memproses...' : actionLabel}
                            </Text>
                            <ArrowRight size={11} color="#fff" weight="bold" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function GovLaporanScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { showToast } = useToast();
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [activeSort, setActiveSort] = useState('Terbaru');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [apiReports, setApiReports] = useState<ReportData[]>([]);
    const [updatingStatusIds, setUpdatingStatusIds] = useState<Record<string, boolean>>({});

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;
    const searchWidth = useRef(new Animated.Value(0)).current;
    const analyticsHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const loadReports = useCallback(async () => {
        const result = await getReports({ limit: 20 });
        if (result.success && result.data) {
            setApiReports(result.data);
        }
    }, []);

    // Ambil laporan dari API
    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const toggleSearch = () => {
        const toValue = showSearch ? 0 : 1;
        setShowSearch(!showSearch);
        Animated.timing(searchWidth, { toValue, duration: 250, useNativeDriver: false }).start();
        if (showSearch) setSearchQuery('');
    };

    const toggleAnalytics = () => {
        Animated.timing(analyticsHeight, {
            toValue: showAnalytics ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setShowAnalytics(!showAnalytics);
    };

    // Konversi API data ke UI format
    const REPORTS_LIVE = useMemo<GovReportItem[]>(() => {
        const iconMap: Record<string, { icon: any; iconColor: string; bgColor: string }> = {
            'Banjir': { icon: Waves, iconColor: '#2563eb', bgColor: '#eff6ff' },
            'Longsor': { icon: Mountains, iconColor: '#ea580c', bgColor: '#fff7ed' },
            'Jalan Rusak': { icon: RoadHorizon, iconColor: '#d97706', bgColor: '#fffbeb' },
            'Kebakaran': { icon: Fire, iconColor: '#dc2626', bgColor: '#fef2f2' },
            'Sampah': { icon: Trash, iconColor: '#059669', bgColor: '#ecfdf5' },
        };
        const statusMap: Record<string, StatusType> = {
            'Menunggu': 'Baru',
            'Diverifikasi': 'Diproses',
            'Ditangani': 'Diproses',
            'Selesai': 'Selesai',
        };
        return apiReports.map(r => {
            const cat = iconMap[r.category] || { icon: Warning, iconColor: '#f59e0b', bgColor: '#fffbeb' };
            const severity: SeverityLevel = r.urgency >= 80 ? 'Kritis' : r.urgency >= 60 ? 'Tinggi' : r.urgency >= 40 ? 'Sedang' : 'Rendah';
            const status: StatusType = statusMap[r.status] || 'Baru';
            return {
                id: r.id || '',
                title: r.title,
                desc: r.description?.slice(0, 80) + (r.description?.length > 80 ? '...' : '') || '',
                area: r.district || r.city || '-',
                cluster: `${r.votesCount} dukungan`,
                time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                severity,
                status,
                backendStatus: r.status,
                icon: cat.icon,
                iconColor: cat.iconColor,
                bgColor: cat.bgColor,
            };
        });
    }, [apiReports]);

    const openReportDetail = useCallback((reportId?: string) => {
        if (!reportId) {
            showToast({
                type: 'error',
                title: 'Navigasi Gagal',
                message: 'ID laporan tidak valid',
            });
            return;
        }

        router.push({ pathname: '/report-detail', params: { id: reportId } });
    }, [router, showToast]);

    const handleStatusAction = useCallback(async (report: GovReportItem) => {
        if (!report.id) {
            showToast({
                type: 'error',
                title: 'Aksi Gagal',
                message: 'ID laporan tidak valid',
            });
            return;
        }

        const mappedCurrent = UI_TO_BACKEND_STATUS[report.status];
        if (!mappedCurrent) {
            showToast({
                type: 'warning',
                title: 'Status Tidak Didukung',
                message: 'Status ini belum bisa diperbarui dari aplikasi.',
            });
            return;
        }

        const nextBackendStatus = STATUS_ACTION_TARGET[report.status];
        if (!nextBackendStatus) {
            openReportDetail(report.id);
            return;
        }

        setUpdatingStatusIds(prev => ({ ...prev, [report.id]: true }));

        let previousReportsSnapshot: ReportData[] = [];
        try {
            // Optimistic update agar list/KPI langsung berubah
            setApiReports(prev => {
                previousReportsSnapshot = [...prev];
                return prev.map(item =>
                    item.id === report.id ? { ...item, status: nextBackendStatus } : item
                );
            });

            const result = await updateReportStatus(report.id, nextBackendStatus);
            if (result.success) {
                showToast({
                    type: 'success',
                    title: 'Status Diperbarui',
                    message: `Laporan berhasil diubah ke "${nextBackendStatus}".`,
                });

                // Sinkronkan ulang ke backend source of truth
                await loadReports();
                return;
            }

            // Biarkan global forbidden handler menangani 403 gov-only
            if (result.statusCode === 403) {
                setApiReports(previousReportsSnapshot);
                return;
            }

            // Rollback jika gagal
            setApiReports(previousReportsSnapshot);
            showToast({
                type: 'error',
                title: 'Gagal Memperbarui',
                message: result.message || 'Tidak dapat memperbarui status laporan.',
            });
        } catch {
            setApiReports(previousReportsSnapshot);
            showToast({
                type: 'error',
                title: 'Gagal Memperbarui',
                message: 'Terjadi gangguan jaringan saat memperbarui status laporan.',
            });
        } finally {
            setUpdatingStatusIds(prev => {
                const next = { ...prev };
                delete next[report.id];
                return next;
            });
        }
    }, [loadReports, openReportDetail, showToast]);

    // Hitung SUMMARY_STATS dari live data
    const SUMMARY_STATS_LIVE = useMemo(() => {
        const baru = REPORTS_LIVE.filter(r => r.status === 'Baru').length;
        const proses = REPORTS_LIVE.filter(r => r.status === 'Diproses').length;
        const selesai = REPORTS_LIVE.filter(r => r.status === 'Selesai').length;
        return [
            { value: String(baru), label: 'Baru', icon: FilePlus, color: SiagaColors.danger, bg: '#fef2f2', trend: `+${baru} hari ini` },
            { value: String(proses), label: 'Diproses', icon: HourglassMedium, color: '#d97706', bg: '#fffbeb', trend: 'Aktif' },
            { value: String(selesai), label: 'Selesai', icon: CheckCircle, color: SiagaColors.success, bg: '#ecfdf5', trend: REPORTS_LIVE.length > 0 ? `${Math.round(selesai / REPORTS_LIVE.length * 100)}%` : '0%' },
            { value: '4.2j', label: 'Avg. Respons', icon: Timer, color: SiagaColors.info, bg: '#eff6ff', trend: 'Baik' },
        ];
    }, [REPORTS_LIVE]);

    // Hitung FILTER_TABS dari live data
    const FILTER_TABS_LIVE = useMemo(() => [
        { key: 'Semua', count: REPORTS_LIVE.length },
        { key: 'Baru', count: REPORTS_LIVE.filter(r => r.status === 'Baru').length },
        { key: 'Diproses', count: REPORTS_LIVE.filter(r => r.status === 'Diproses').length },
        { key: 'Selesai', count: REPORTS_LIVE.filter(r => r.status === 'Selesai').length },
        { key: 'Ditolak', count: REPORTS_LIVE.filter(r => r.status === 'Ditolak').length },
    ], [REPORTS_LIVE]);

    // Hitung CATEGORY_DIST dari live data
    const CATEGORY_DIST_LIVE = useMemo(() => {
        const cats = [
            { label: 'Banjir', color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Jalan Rusak', color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Sampah', color: '#10b981', bg: '#ecfdf5' },
            { label: 'Longsor', color: '#f97316', bg: '#fff7ed' },
            { label: 'Kebakaran', color: '#ef4444', bg: '#fef2f2' },
        ];
        return cats.map(c => {
            const count = apiReports.filter(r => r.category === c.label).length;
            return { ...c, count, pct: apiReports.length > 0 ? Math.round(count / apiReports.length * 100) : 0 };
        });
    }, [apiReports]);

    // Kritis count from live data
    const kritisCount = REPORTS_LIVE.filter(r => r.severity === 'Kritis').length;

    const filteredReports = REPORTS_LIVE.filter((r) => {
        const matchFilter = activeFilter === 'Semua' || r.status === activeFilter || (activeFilter === 'Darurat' && r.severity === 'Kritis');
        const matchSearch = searchQuery === '' || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.area.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.includes(searchQuery);
        return matchFilter && matchSearch;
    });

    return (
        <View className="flex-1" style={{ backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ───────────────────────────────────────────────── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
                {/* Decorative circles */}
                <View style={{ position: 'absolute', right: -20, top: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <View style={{ position: 'absolute', left: -30, bottom: -30, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                <View className="px-5 pb-4 pt-3">
                    {/* Top row */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2.5">
                            <View
                                className="w-9 h-9 rounded-xl items-center justify-center"
                                style={{ backgroundColor: SiagaColors.info }}
                            >
                                <ClipboardText size={20} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text className="text-[17px] font-extrabold text-white tracking-tight">
                                    Manajemen Laporan
                                </Text>
                                <Text className="text-[10px] font-semibold text-white/40 uppercase tracking-[2px]">
                                    Kota Bandung · {apiReports.length} Laporan
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-2">
                            {/* Analytics toggle */}
                            <TouchableOpacity
                                onPress={toggleAnalytics}
                                className="w-9 h-9 rounded-xl items-center justify-center"
                                style={{ backgroundColor: showAnalytics ? SiagaColors.info : 'rgba(255,255,255,0.1)' }}
                                activeOpacity={0.7}
                            >
                                <ChartBar size={19} color="#fff" weight="duotone" />
                            </TouchableOpacity>
                            {/* Bell */}
                            <TouchableOpacity
                                className="w-9 h-9 rounded-xl items-center justify-center"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                activeOpacity={0.7}
                            >
                                <Bell size={19} color="rgba(255,255,255,0.75)" weight="duotone" />
                                <View
                                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                    style={{ backgroundColor: SiagaColors.danger, borderWidth: 1.5, borderColor: SiagaColors.primary }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Alert bar — critical reports */}
                    <TouchableOpacity
                        className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-xl"
                        style={{ backgroundColor: 'rgba(231,76,60,0.18)', borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' }}
                        activeOpacity={0.8}
                    >
                        <WarningDiamond size={18} color={SiagaColors.danger} weight="fill" />
                        <Text className="text-[13px] font-bold flex-1" style={{ color: '#fca5a5' }}>
                            {kritisCount} Laporan <Text className="text-white">Kritis</Text> butuh respons segera
                        </Text>
                        <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: SiagaColors.danger }}>
                            <Text className="text-[9px] font-bold text-white">DARURAT</Text>
                        </View>
                        <CaretRight size={15} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── ANALYTICS PANEL (collapsible) ─────────────────────── */}
            <Animated.View
                style={{
                    overflow: 'hidden',
                    maxHeight: analyticsHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 320] }),
                    opacity: analyticsHeight,
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#edf2f9',
                }}
            >
                <View className="px-4 pt-4 pb-3">
                    <Text className="text-[14px] font-bold mb-3" style={{ color: SiagaColors.primary }}>
                        Ringkasan Laporan
                    </Text>
                    {/* Stat grid 2x2 */}
                    <View className="flex-row gap-2.5 mb-3">
                        {SUMMARY_STATS_LIVE.map((item, i) => (
                            <StatCard key={i} item={item} />
                        ))}
                    </View>

                    {/* Category distribution */}
                    <View
                        className="rounded-2xl p-3"
                        style={{ backgroundColor: '#fafcfe', borderWidth: 1, borderColor: '#f1f5f9' }}
                    >
                        <Text className="text-[13px] font-bold mb-2" style={{ color: SiagaColors.primary }}>
                            Distribusi Kategori
                        </Text>
                        <View className="gap-2">
                            {CATEGORY_DIST_LIVE.map((cat, i) => (
                                <View key={i}>
                                    <View className="flex-row items-center justify-between mb-0.5">
                                        <View className="flex-row items-center gap-1.5">
                                            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <Text className="text-[12px] font-semibold" style={{ color: SiagaColors.primary }}>
                                                {cat.label}
                                            </Text>
                                        </View>
                                        <Text className="text-[12px] font-bold" style={{ color: SiagaColors.secondary }}>
                                            {cat.count}
                                        </Text>
                                    </View>
                                    <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: cat.bg }}>
                                        <View
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: cat.color, width: `${cat.pct}%` }}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Animated.View>

            {/* ── SEARCH BAR ────────────────────────────────────────── */}
            <View
                className="px-4 pt-3 pb-2"
                style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
            >
                <View
                    className="flex-row items-center gap-2 px-3.5 rounded-xl"
                    style={{
                        backgroundColor: '#f4f7fb',
                        borderWidth: 1,
                        borderColor: '#edf2f9',
                        height: 40,
                    }}
                >
                    <MagnifyingGlass size={18} color={SiagaColors.secondary} weight="duotone" />
                    <TextInput
                        placeholder="Cari ID, judul, atau lokasi laporan..."
                        placeholderTextColor={SiagaColors.secondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{
                            flex: 1,
                            fontSize: 14,
                            color: SiagaColors.primary,
                            paddingVertical: 0,
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                            <XCircle size={18} color={SiagaColors.secondary} weight="fill" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── FILTER TABS + SORT ─────────────────────────────────── */}
            <View
                className="pt-2 pb-2"
                style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                >
                    {FILTER_TABS_LIVE.map((tab) => {
                        const isActive = activeFilter === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveFilter(tab.key)}
                                className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-xl"
                                style={{
                                    backgroundColor: isActive ? SiagaColors.primary : '#f4f7fb',
                                    borderWidth: 1,
                                    borderColor: isActive ? SiagaColors.primary : '#edf2f9',
                                }}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className="text-[13px]"
                                    style={{
                                        fontWeight: isActive ? '700' : '600',
                                        color: isActive ? '#fff' : SiagaColors.secondary,
                                    }}
                                >
                                    {tab.key}
                                </Text>
                                <View
                                    className="min-w-[16px] h-4 rounded-full items-center justify-center px-1"
                                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#edf2f9' }}
                                >
                                    <Text
                                        className="text-[10px] font-bold"
                                        style={{ color: isActive ? '#fff' : SiagaColors.secondary }}
                                    >
                                        {tab.count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Divider */}
                    <View style={{ width: 1, height: 28, backgroundColor: '#edf2f9', alignSelf: 'center', marginHorizontal: 4 }} />

                    {/* Sort button */}
                    <TouchableOpacity
                        onPress={() => setShowSort(!showSort)}
                        className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-xl"
                        style={{
                            backgroundColor: showSort ? '#eff6ff' : '#f4f7fb',
                            borderWidth: 1,
                            borderColor: showSort ? SiagaColors.info : '#edf2f9',
                        }}
                        activeOpacity={0.7}
                    >
                        <SortAscending size={16} color={showSort ? SiagaColors.info : SiagaColors.secondary} weight="duotone" />
                        <Text
                            className="text-[13px] font-semibold"
                            style={{ color: showSort ? SiagaColors.info : SiagaColors.secondary }}
                        >
                            {activeSort}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Sort dropdown */}
                {showSort && (
                    <View
                        className="mx-4 mt-2 rounded-xl overflow-hidden"
                        style={{
                            backgroundColor: '#fff',
                            borderWidth: 1,
                            borderColor: '#edf2f9',
                            elevation: 4,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                        }}
                    >
                        <View className="flex-row">
                            {SORT_OPTIONS.map((opt, i) => {
                                const isActive = activeSort === opt;
                                return (
                                    <TouchableOpacity
                                        key={opt}
                                        onPress={() => { setActiveSort(opt); setShowSort(false); }}
                                        className="flex-1 py-2.5 items-center"
                                        style={{
                                            backgroundColor: isActive ? '#eff6ff' : '#fff',
                                            borderRightWidth: i < SORT_OPTIONS.length - 1 ? 1 : 0,
                                            borderRightColor: '#f1f5f9',
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            className="text-[12px] font-bold"
                                            style={{ color: isActive ? SiagaColors.info : SiagaColors.secondary }}
                                        >
                                            {opt}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </View>

            {/* ── REPORT LIST ───────────────────────────────────────── */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
            >
                {/* Results header */}
                <Animated.View
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    className="flex-row items-center justify-between"
                >
                    <View className="flex-row items-center gap-1.5">
                        <View className="w-1 h-4 rounded-full" style={{ backgroundColor: SiagaColors.info }} />
                        <Text className="text-[14px] font-bold" style={{ color: SiagaColors.primary }}>
                            {filteredReports.length} Laporan
                            {activeFilter !== 'Semua' && (
                                <Text style={{ color: SiagaColors.secondary }}> · {activeFilter}</Text>
                            )}
                        </Text>
                    </View>

                    {/* Quick action buttons */}
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9' }}
                            activeOpacity={0.7}
                        >
                            <Megaphone size={14} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[12px] font-bold" style={{ color: SiagaColors.info }}>
                                Broadcast
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9' }}
                            activeOpacity={0.7}
                        >
                            <CheckSquare size={14} color={SiagaColors.success} weight="duotone" />
                            <Text className="text-[12px] font-bold" style={{ color: SiagaColors.success }}>
                                Tandai Selesai
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Cards */}
                {filteredReports.length > 0 ? (
                    filteredReports.map((report, i) => (
                        <Animated.View
                            key={report.id}
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }}
                        >
                            <ReportCard
                                report={report}
                                onPress={() => openReportDetail(report.id)}
                                onStatusAction={() => handleStatusAction(report)}
                                isStatusUpdating={!!updatingStatusIds[report.id]}
                            />
                        </Animated.View>
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center py-16">
                        <View
                            className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
                            style={{ backgroundColor: '#f4f7fb' }}
                        >
                            <ClipboardText size={32} color={SiagaColors.secondary} weight="duotone" />
                        </View>
                        <Text className="text-[15px] font-bold mb-1" style={{ color: SiagaColors.primary }}>
                            Tidak ditemukan
                        </Text>
                        <Text className="text-[13px] text-center" style={{ color: SiagaColors.secondary, maxWidth: 220 }}>
                            Tidak ada laporan yang cocok dengan filter atau pencarian kamu.
                        </Text>
                        <TouchableOpacity
                            onPress={() => { setActiveFilter('Semua'); setSearchQuery(''); }}
                            className="mt-4 px-5 py-2.5 rounded-xl"
                            style={{ backgroundColor: SiagaColors.primary }}
                            activeOpacity={0.8}
                        >
                            <Text className="text-[13px] font-bold text-white">Reset Filter</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Load more */}
                {filteredReports.length > 0 && (
                    <TouchableOpacity
                        className="py-3 rounded-2xl flex-row items-center justify-center gap-1.5"
                        style={{
                            backgroundColor: '#fff',
                            borderWidth: 1,
                            borderColor: '#edf2f9',
                            elevation: 1,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.04,
                            shadowRadius: 3,
                        }}
                        activeOpacity={0.7}
                    >
                        <ArrowClockwise size={15} color={SiagaColors.info} weight="duotone" />
                        <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>
                            Muat Laporan Lainnya
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Info footer */}
                <View className="items-center pt-1">
                    <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>
                        Data diperbarui otomatis setiap 30 detik
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
