import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, ScrollView, FlatList, TouchableOpacity,
    Animated, TextInput, Dimensions, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ClipboardText, MagnifyingGlass, Bell,
    Waves, Mountains, RoadHorizon, Fire, Trash,
    Clock, ArrowRight, CaretRight, CheckCircle,
    HourglassMedium, WarningDiamond, FilePlus,
    TrendUp, MapPin, ChartBar, ArrowClockwise,
    SortAscending, XCircle, Megaphone,
    Warning, CheckSquare,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import {
    getReports,
    getReportStats,
    updateReportStatus,
    type BackendReportStatus,
    type ReportData,
    type ReportStats,
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
    // Sortable raw values
    createdAt: string;
    urgency: number;
    category: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

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



// ─── Sub-components ───────────────────────────────────────────────────────────
type SummaryFilterKey = 'Semua' | 'Baru' | 'Diproses' | 'Selesai' | 'Darurat';
type StatItem = {
    value: string;
    label: string;
    icon: any;
    color: string;
    bg: string;
    trend: string;
    filterKey: SummaryFilterKey;
};
function StatCard({ item, onPress }: { item: StatItem; onPress: () => void }) {
    const IconComp = item.icon;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            className="rounded-2xl p-3"
            style={{
                width: (width - 44) / 2,
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
        </TouchableOpacity>
    );
}

const ReportCard = React.memo(function ReportCard({
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
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function GovLaporanScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { showToast } = useToast();
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [activeSort, setActiveSort] = useState('Terbaru');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSort, setShowSort] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [apiReports, setApiReports] = useState<ReportData[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatusIds, setUpdatingStatusIds] = useState<Record<string, boolean>>({});
    const [visibleCount, setVisibleCount] = useState(10);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;
    const analyticsHeight = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const loadReports = useCallback(async () => {
        const [reportsResult, statsResult] = await Promise.all([
            getReports({ limit: 100 }),
            getReportStats(),
        ]);
        if (reportsResult.success && reportsResult.data) setApiReports(reportsResult.data);
        if (statsResult.success && statsResult.data) setStats(statsResult.data);
    }, []);

    // Initial load
    useEffect(() => {
        loadReports();
    }, [loadReports]);

    // Pull-to-refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadReports();
        setRefreshing(false);
    }, [loadReports]);

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
                createdAt: r.createdAt,
                urgency: r.urgency ?? 0,
                category: r.category,
            };
        });
    }, [apiReports]);

    const kritisCount = useMemo(
        () => REPORTS_LIVE.filter(r => r.severity === 'Kritis').length,
        [REPORTS_LIVE],
    );

    const applyFilterAndSort = useCallback((nextFilter: SummaryFilterKey, nextSort?: string) => {
        setActiveFilter(nextFilter);
        if (nextSort) setActiveSort(nextSort);
        setShowSort(false);
    }, []);

    const openNotifications = useCallback(() => {
        router.push('/notifikasi');
    }, [router]);

    const handleCriticalAlertPress = useCallback(() => {
        if (kritisCount === 0) {
            showToast({
                type: 'info',
                title: 'Tidak Ada Laporan Kritis',
                message: 'Semua laporan saat ini berada di level aman atau sedang diproses.',
            });
            return;
        }

        applyFilterAndSort('Darurat', 'Prioritas');
    }, [applyFilterAndSort, kritisCount, showToast]);

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

    // Build SUMMARY_STATS dari server stats
    const SUMMARY_STATS_LIVE = useMemo(() => {
        const pending = stats?.pending ?? 0;
        const inProgress = stats?.inProgress ?? 0;
        const resolved = stats?.resolved ?? 0;
        const total = stats?.total ?? 0;
        const pct = total > 0 ? `${Math.round(resolved / total * 100)}%` : '0%';
        return [
            {
                value: String(pending),
                label: 'Butuh Tinjau',
                icon: FilePlus,
                color: SiagaColors.danger,
                bg: '#fef2f2',
                trend: pending > 0 ? `${pending} antrian aktif` : 'Tidak ada antrian',
                filterKey: 'Baru' as const,
            },
            {
                value: String(inProgress),
                label: 'Sedang Ditindak',
                icon: HourglassMedium,
                color: '#d97706',
                bg: '#fffbeb',
                trend: inProgress > 0 ? 'Perlu pemantauan' : 'Belum ada proses aktif',
                filterKey: 'Diproses' as const,
            },
            {
                value: String(resolved),
                label: 'Selesai',
                icon: CheckCircle,
                color: SiagaColors.success,
                bg: '#ecfdf5',
                trend: `${pct} tingkat penyelesaian`,
                filterKey: 'Selesai' as const,
            },
            {
                value: String(kritisCount),
                label: 'Prioritas Kritis',
                icon: WarningDiamond,
                color: SiagaColors.info,
                bg: '#eff6ff',
                trend: kritisCount > 0 ? 'Respons segera' : 'Kondisi stabil',
                filterKey: 'Darurat' as const,
            },
        ];
    }, [kritisCount, stats]);

    // Hitung FILTER_TABS dari live data
    const FILTER_TABS_LIVE = useMemo(() => [
        { key: 'Semua', count: REPORTS_LIVE.length },
        { key: 'Darurat', count: kritisCount },
        { key: 'Baru', count: REPORTS_LIVE.filter(r => r.status === 'Baru').length },
        { key: 'Diproses', count: REPORTS_LIVE.filter(r => r.status === 'Diproses').length },
        { key: 'Selesai', count: REPORTS_LIVE.filter(r => r.status === 'Selesai').length },
        { key: 'Ditolak', count: REPORTS_LIVE.filter(r => r.status === 'Ditolak').length },
    ], [REPORTS_LIVE, kritisCount]);

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
            const count = REPORTS_LIVE.filter(r => r.category === c.label).length;
            return { ...c, count, pct: REPORTS_LIVE.length > 0 ? Math.round(count / REPORTS_LIVE.length * 100) : 0 };
        });
    }, [REPORTS_LIVE]);

    const dominantCategory = useMemo(() => {
        if (REPORTS_LIVE.length === 0) return null;

        return CATEGORY_DIST_LIVE.reduce<(typeof CATEGORY_DIST_LIVE)[number] | null>(
            (top, item) => {
                if (!top || item.count > top.count) return item;
                return top;
            },
            null,
        );
    }, [CATEGORY_DIST_LIVE, REPORTS_LIVE.length]);

    const summarySnapshotItems = useMemo(
        () => [
            {
                label: 'Total Masuk',
                value: String(REPORTS_LIVE.length),
                helper: REPORTS_LIVE.length > 0 ? 'laporan terpantau' : 'belum ada data',
            },
            {
                label: 'Filter Aktif',
                value: activeFilter,
                helper: activeFilter === 'Semua' ? 'seluruh status' : 'fokus monitoring',
            },
            {
                label: 'Urutan Data',
                value: activeSort,
                helper: 'mode tampilan',
            },
            {
                label: 'Respons Kritis',
                value: `${kritisCount}`,
                helper: kritisCount > 0 ? 'butuh tindak cepat' : 'kondisi stabil',
            },
        ],
        [REPORTS_LIVE.length, activeFilter, activeSort, kritisCount],
    );

    const filteredReports = useMemo(() => {
        const filtered = REPORTS_LIVE.filter((r) => {
            const matchFilter = activeFilter === 'Semua' || r.status === activeFilter || (activeFilter === 'Darurat' && r.severity === 'Kritis');
            const loweredQuery = searchQuery.toLowerCase();
            const matchSearch = searchQuery === ''
                || r.title.toLowerCase().includes(loweredQuery)
                || r.area.toLowerCase().includes(loweredQuery)
                || r.category.toLowerCase().includes(loweredQuery)
                || r.id.toLowerCase().includes(loweredQuery);
            return matchFilter && matchSearch;
        });

        // Apply sorting based on activeSort
        const SEVERITY_ORDER: Record<SeverityLevel, number> = { Kritis: 0, Tinggi: 1, Sedang: 2, Rendah: 3 };
        switch (activeSort) {
            case 'Terbaru':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'Prioritas':
                filtered.sort((a, b) => {
                    const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
                    return sevDiff !== 0 ? sevDiff : b.urgency - a.urgency;
                });
                break;
            case 'Lokasi':
                filtered.sort((a, b) => a.area.localeCompare(b.area));
                break;
            case 'Kategori':
                filtered.sort((a, b) => a.category.localeCompare(b.category));
                break;
        }
        return filtered;
    }, [REPORTS_LIVE, activeFilter, searchQuery, activeSort]);

    useEffect(() => {
        setVisibleCount(10);
    }, [activeFilter, activeSort, searchQuery]);

    const visibleReports = useMemo(
        () => filteredReports.slice(0, visibleCount),
        [filteredReports, visibleCount],
    );

    const remainingReportsCount = Math.max(filteredReports.length - visibleReports.length, 0);

    const actionableReport = useMemo(
        () => filteredReports.find(r => r.status === 'Diproses') || REPORTS_LIVE.find(r => r.status === 'Diproses') || null,
        [REPORTS_LIVE, filteredReports],
    );

    const handleBulkComplete = useCallback(() => {
        if (!actionableReport) {
            showToast({
                type: 'info',
                title: 'Tidak Ada Laporan Aktif',
                message: 'Tidak ada laporan berstatus Diproses yang bisa ditandai selesai saat ini.',
            });
            return;
        }

        handleStatusAction(actionableReport);
    }, [actionableReport, handleStatusAction, showToast]);

    const handleLoadMore = useCallback(() => {
        if (remainingReportsCount > 0) {
            setVisibleCount(prev => prev + 10);
            return;
        }

        onRefresh();
    }, [onRefresh, remainingReportsCount]);

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
                                onPress={openNotifications}
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
                        onPress={handleCriticalAlertPress}
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
                    maxHeight: analyticsHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 640] }),
                    opacity: analyticsHeight,
                    backgroundColor: '#f7fbff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#e4edf8',
                }}
            >
                <View className="px-4 pt-4 pb-4">
                    <View
                        className="rounded-[24px] p-4 mb-3"
                        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eef9' }}
                    >
                        <View className="flex-row items-start justify-between gap-3 mb-3">
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1.5">
                                    <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: SiagaColors.info }} />
                                    <Text className="text-[15px] font-extrabold" style={{ color: SiagaColors.primary }}>
                                        Ringkasan Laporan
                                    </Text>
                                </View>
                                <Text className="text-[12px] leading-5" style={{ color: SiagaColors.secondary }}>
                                    Ketuk kartu untuk memfilter antrian laporan yang paling perlu ditindak.
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleCriticalAlertPress}
                                activeOpacity={0.8}
                                className="px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: kritisCount > 0 ? '#fee2e2' : '#eff6ff' }}
                            >
                                <Text
                                    className="text-[11px] font-bold"
                                    style={{ color: kritisCount > 0 ? SiagaColors.danger : SiagaColors.info }}
                                >
                                    {kritisCount} kritis
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View
                            className="rounded-[20px] px-3.5 py-3 mb-3"
                            style={{ backgroundColor: '#f8fbff', borderWidth: 1, borderColor: '#e6eef9' }}
                        >
                            <View className="flex-row items-center justify-between mb-2.5">
                                <Text className="text-[12px] font-bold" style={{ color: SiagaColors.primary }}>
                                    Snapshot Operasional
                                </Text>
                                <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: '#ffffff' }}>
                                    <Text className="text-[10px] font-bold" style={{ color: SiagaColors.info }}>
                                        Ringkas & aktif
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row flex-wrap justify-between">
                                {summarySnapshotItems.map((item) => (
                                    <View
                                        key={item.label}
                                        className="rounded-[18px] px-3 py-3 mb-2.5"
                                        style={{
                                            width: '48.5%',
                                            backgroundColor: '#ffffff',
                                            borderWidth: 1,
                                            borderColor: '#edf2f9',
                                        }}
                                    >
                                        <Text className="text-[11px] font-semibold mb-1" style={{ color: SiagaColors.secondary }}>
                                            {item.label}
                                        </Text>
                                        <Text className="text-[17px] font-extrabold mb-0.5" style={{ color: SiagaColors.primary }}>
                                            {item.value}
                                        </Text>
                                        <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>
                                            {item.helper}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View
                            className="flex-row items-center justify-between mb-3 px-0.5 pb-3"
                            style={{ borderBottomWidth: 1, borderBottomColor: '#edf2f9' }}
                        >
                            <View>
                                <Text className="text-[13px] font-bold" style={{ color: SiagaColors.primary }}>
                                    Status Penanganan
                                </Text>
                                <Text className="text-[11px] mt-0.5" style={{ color: SiagaColors.secondary }}>
                                    Tap kartu untuk filter cepat ke daftar laporan
                                </Text>
                            </View>
                            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: '#eff6ff' }}>
                                <Text className="text-[10px] font-bold" style={{ color: SiagaColors.info }}>
                                    4 indikator
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {SUMMARY_STATS_LIVE.map((item) => (
                                <StatCard
                                    key={item.label}
                                    item={item}
                                    onPress={() => applyFilterAndSort(item.filterKey, item.filterKey === 'Darurat' ? 'Prioritas' : 'Terbaru')}
                                />
                            ))}
                        </View>
                    </View>

                    <View
                        className="rounded-[24px] p-4"
                        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eef9' }}
                    >
                        <View className="flex-row items-start justify-between gap-3 mb-3">
                            <View className="flex-1">
                                <Text className="text-[14px] font-bold" style={{ color: SiagaColors.primary }}>
                                    Distribusi Kategori
                                </Text>
                                <Text className="text-[11px] mt-0.5" style={{ color: SiagaColors.secondary }}>
                                    Komposisi laporan terbaru per jenis kejadian
                                </Text>
                            </View>
                            <View className="items-end">
                                <View
                                    className="px-3 py-1 rounded-full"
                                    style={{ backgroundColor: dominantCategory?.bg ?? '#eff6ff' }}
                                >
                                    <Text
                                        className="text-[11px] font-bold"
                                        style={{ color: dominantCategory?.color ?? SiagaColors.info }}
                                    >
                                        {dominantCategory?.label ?? 'Belum ada'}
                                    </Text>
                                </View>
                                <Text className="text-[10px] mt-1" style={{ color: SiagaColors.secondary }}>
                                    {REPORTS_LIVE.length} total laporan
                                </Text>
                            </View>
                        </View>

                        <View
                            className="rounded-[18px] px-3.5 py-3 mb-3"
                            style={{ backgroundColor: '#f8fbff', borderWidth: 1, borderColor: '#e6eef9' }}
                        >
                            <View className="flex-row items-center justify-between gap-3">
                                <View className="flex-1">
                                    <Text className="text-[12px] font-bold mb-0.5" style={{ color: SiagaColors.primary }}>
                                        Kategori Dominan
                                    </Text>
                                    <Text className="text-[11px]" style={{ color: SiagaColors.secondary }}>
                                        {dominantCategory
                                            ? `${dominantCategory.count} laporan mendominasi antrian saat ini`
                                            : 'Belum ada distribusi yang bisa ditampilkan'}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text
                                        className="text-[18px] font-extrabold"
                                        style={{ color: dominantCategory?.color ?? SiagaColors.info }}
                                    >
                                        {dominantCategory ? `${dominantCategory.pct}%` : '0%'}
                                    </Text>
                                    <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>
                                        dari total data
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="gap-2.5">
                            {CATEGORY_DIST_LIVE.map((cat, i) => (
                                <View
                                    key={i}
                                    className="rounded-[18px] px-3.5 py-3"
                                    style={{ backgroundColor: '#fbfdff', borderWidth: 1, borderColor: '#edf2f9' }}
                                >
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center gap-1.5">
                                            <View
                                                className="rounded-full"
                                                style={{ width: 10, height: 10, backgroundColor: cat.color }}
                                            />
                                            <Text className="text-[12px] font-semibold" style={{ color: SiagaColors.primary }}>
                                                {cat.label}
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[12px] font-bold" style={{ color: SiagaColors.primary }}>
                                                {cat.count} laporan
                                            </Text>
                                            <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>
                                                {cat.pct}% dari total
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: cat.bg }}>
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
            <FlatList
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={SiagaColors.info}
                        colors={[SiagaColors.info]}
                    />
                }
                data={visibleReports}
                keyExtractor={(item) => item.id}
                initialNumToRender={5}
                maxToRenderPerBatch={8}
                windowSize={7}
                ListHeaderComponent={
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                        className="gap-3"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-1 h-4 rounded-full" style={{ backgroundColor: SiagaColors.info }} />
                                <Text className="text-[14px] font-bold" style={{ color: SiagaColors.primary }}>
                                    {filteredReports.length} Laporan
                                    {activeFilter !== 'Semua' && (
                                        <Text style={{ color: SiagaColors.secondary }}> · {activeFilter}</Text>
                                    )}
                                </Text>
                            </View>

                            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: '#eff6ff' }}>
                                <Text className="text-[11px] font-bold" style={{ color: SiagaColors.info }}>
                                    {visibleReports.length}/{filteredReports.length} ditampilkan
                                </Text>
                            </View>
                        </View>

                        {/* Quick action buttons */}
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                onPress={openNotifications}
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
                                onPress={handleBulkComplete}
                                className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                                style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9' }}
                                activeOpacity={0.7}
                            >
                                <CheckSquare size={14} color={SiagaColors.success} weight="duotone" />
                                <Text className="text-[12px] font-bold" style={{ color: SiagaColors.success }}>
                                    Selesaikan Aktif
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                }
                renderItem={({ item: report }) => (
                    <ReportCard
                        report={report}
                        onPress={() => openReportDetail(report.id)}
                        onStatusAction={() => handleStatusAction(report)}
                        isStatusUpdating={!!updatingStatusIds[report.id]}
                    />
                )}
                ListEmptyComponent={
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
                }
                ListFooterComponent={
                    filteredReports.length > 0 ? (
                        <>
                            <TouchableOpacity
                                onPress={handleLoadMore}
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
                                    {remainingReportsCount > 0 ? `Muat ${Math.min(10, remainingReportsCount)} Laporan Lagi` : 'Segarkan Data'}
                                </Text>
                            </TouchableOpacity>
                            <View className="items-center pt-1">
                                <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>
                                    Data diperbarui otomatis setiap 30 detik
                                </Text>
                            </View>
                        </>
                    ) : null
                }
            />
        </View>
    );
}
