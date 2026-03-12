import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, ScrollView, FlatList, TouchableOpacity,
    Animated, TextInput, Dimensions, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
    ClipboardText, MagnifyingGlass, Bell,
    Waves, Mountains, RoadHorizon, Fire, Trash,
    Clock, ArrowRight, CaretRight, CheckCircle,
    HourglassMedium, WarningDiamond, FilePlus,
    TrendUp, MapPin, ChartBar, ArrowClockwise,
    SortAscending, XCircle, Megaphone,
    Warning, CheckSquare, CaretDown,
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
    filterKey: SummaryFilterKey;
};

/** Compact KPI pill card */
function KpiPill({
    item,
    active,
    onPress,
}: {
    item: StatItem;
    active: boolean;
    onPress: () => void;
}) {
    const IconComp = item.icon;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{
                flex: 1,
                backgroundColor: active ? item.color : '#fff',
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: active ? item.color : '#edf2f9',
            }}
        >
            <View
                style={{
                    width: 32, height: 32, borderRadius: 10,
                    backgroundColor: active ? 'rgba(255,255,255,0.2)' : item.bg,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                }}
            >
                <IconComp size={17} color={active ? '#fff' : item.color} weight="duotone" />
            </View>
            <Text
                style={{
                    fontSize: 18, fontWeight: '800', lineHeight: 22,
                    color: active ? '#fff' : SiagaColors.primary,
                }}
            >
                {item.value}
            </Text>
            <Text
                style={{
                    fontSize: 10, fontWeight: '600', marginTop: 2,
                    color: active ? 'rgba(255,255,255,0.8)' : SiagaColors.secondary,
                }}
                numberOfLines={1}
            >
                {item.label}
            </Text>
        </TouchableOpacity>
    );
}

/** Single category row */
function CategoryRow({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary, flex: 1 }}>{label}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary }}>{count}</Text>
            <View style={{ width: 52, height: 5, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 3, backgroundColor: color, width: `${Math.min(pct, 100)}%` }} />
            </View>
            <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, width: 30, textAlign: 'right' }}>{pct}%</Text>
        </View>
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
            ? 'Selesaikan'
            : 'Lihat';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isCritical ? 'rgba(231,76,60,0.15)' : '#edf2f9',
                overflow: 'hidden',
            }}
        >
            {isCritical && <View style={{ height: 3, backgroundColor: SiagaColors.danger }} />}

            <View style={{ padding: 14 }}>
                {/* Top row: icon + title + severity */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <View
                        style={{
                            width: 40, height: 40, borderRadius: 12,
                            backgroundColor: report.bgColor,
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <IconComp size={22} color={report.iconColor} weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, letterSpacing: 0.5 }}>
                                {report.id.slice(0, 8).toUpperCase()}
                            </Text>
                            {isNew && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: SiagaColors.danger }} />}
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }} numberOfLines={1}>
                            {report.title}
                        </Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: sev.bg }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: sev.text }}>{report.severity}</Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={{ fontSize: 12, color: SiagaColors.secondary, lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>
                    {report.desc}
                </Text>

                {/* Meta row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <MapPin size={12} color={SiagaColors.secondary} weight="duotone" />
                        <Text style={{ fontSize: 11, color: SiagaColors.secondary }} numberOfLines={1}>{report.area}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} color={SiagaColors.secondary} />
                        <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{report.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <TrendUp size={12} color={SiagaColors.secondary} weight="duotone" />
                        <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{report.cluster}</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#f4f7fb', marginBottom: 10 }} />

                {/* Bottom row: status + action */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: st.bg }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: st.text }}>{report.status}</Text>
                    </View>

                    <TouchableOpacity
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 4,
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                            backgroundColor: isStatusAction
                                ? (report.status === 'Baru' ? SiagaColors.info : SiagaColors.success)
                                : SiagaColors.primary,
                        }}
                        activeOpacity={0.7}
                        onPress={isStatusAction ? onStatusAction : onPress}
                        disabled={isStatusUpdating}
                    >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                            {isStatusUpdating ? 'Memproses...' : actionLabel}
                        </Text>
                        <ArrowRight size={11} color="#fff" weight="bold" />
                    </TouchableOpacity>
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
    const [showCategories, setShowCategories] = useState(false);
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

    useFocusEffect(
        useCallback(() => {
            loadReports();
        }, [loadReports])
    );

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

    // Build KPI items from server stats
    const kpiItems = useMemo(() => {
        const pending = stats?.pending ?? 0;
        const inProgress = stats?.inProgress ?? 0;
        const resolved = stats?.resolved ?? 0;
        return [
            { value: String(pending), label: 'Menunggu', icon: FilePlus, color: SiagaColors.danger, bg: '#fef2f2', filterKey: 'Baru' as SummaryFilterKey },
            { value: String(inProgress), label: 'Diproses', icon: HourglassMedium, color: '#d97706', bg: '#fffbeb', filterKey: 'Diproses' as SummaryFilterKey },
            { value: String(resolved), label: 'Selesai', icon: CheckCircle, color: SiagaColors.success, bg: '#ecfdf5', filterKey: 'Selesai' as SummaryFilterKey },
            { value: String(kritisCount), label: 'Kritis', icon: WarningDiamond, color: SiagaColors.info, bg: '#eff6ff', filterKey: 'Darurat' as SummaryFilterKey },
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

    const CATEGORY_DIST = useMemo(() => {
        const cats = [
            { label: 'Banjir', color: '#3b82f6' },
            { label: 'Jalan Rusak', color: '#f59e0b' },
            { label: 'Sampah', color: '#10b981' },
            { label: 'Longsor', color: '#f97316' },
            { label: 'Kebakaran', color: '#ef4444' },
        ];
        return cats.map(c => {
            const count = REPORTS_LIVE.filter(r => r.category === c.label).length;
            return { ...c, count, pct: REPORTS_LIVE.length > 0 ? Math.round(count / REPORTS_LIVE.length * 100) : 0 };
        }).sort((a, b) => b.count - a.count);
    }, [REPORTS_LIVE]);

    // Resolution rate
    const resolutionPct = useMemo(() => {
        const total = stats?.total ?? 0;
        const resolved = stats?.resolved ?? 0;
        return total > 0 ? Math.round(resolved / total * 100) : 0;
    }, [stats]);

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

    const remainingCount = Math.max(filteredReports.length - visibleReports.length, 0);

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
        if (remainingCount > 0) {
            setVisibleCount(prev => prev + 10);
            return;
        }

        onRefresh();
    }, [onRefresh, remainingCount]);

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ───────────────────────────────────────────── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
                <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: SiagaColors.info, alignItems: 'center', justifyContent: 'center' }}>
                                <ClipboardText size={19} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>
                                    Manajemen Laporan
                                </Text>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5 }}>
                                    {apiReports.length} LAPORAN AKTIF
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                                onPress={toggleAnalytics}
                                style={{
                                    width: 36, height: 36, borderRadius: 11,
                                    backgroundColor: showAnalytics ? SiagaColors.info : 'rgba(255,255,255,0.1)',
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                                activeOpacity={0.7}
                            >
                                <ChartBar size={18} color="#fff" weight="duotone" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={openNotifications}
                                style={{
                                    width: 36, height: 36, borderRadius: 11,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                                activeOpacity={0.7}
                            >
                                <Bell size={18} color="rgba(255,255,255,0.75)" weight="duotone" />
                                <View style={{
                                    position: 'absolute', top: 6, right: 6,
                                    width: 7, height: 7, borderRadius: 4,
                                    backgroundColor: SiagaColors.danger,
                                    borderWidth: 1.5, borderColor: SiagaColors.primary,
                                }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Critical alert strip */}
                    {kritisCount > 0 && (
                        <TouchableOpacity
                            onPress={handleCriticalAlertPress}
                            style={{
                                flexDirection: 'row', alignItems: 'center', gap: 8,
                                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
                                backgroundColor: 'rgba(231,76,60,0.15)',
                                borderWidth: 1, borderColor: 'rgba(231,76,60,0.25)',
                            }}
                            activeOpacity={0.8}
                        >
                            <WarningDiamond size={16} color={SiagaColors.danger} weight="fill" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fca5a5', flex: 1 }}>
                                {kritisCount} laporan kritis butuh respons segera
                            </Text>
                            <CaretRight size={14} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── ANALYTICS PANEL (collapsible) ────────────────────── */}
            <Animated.View
                style={{
                    overflow: 'hidden',
                    maxHeight: analyticsHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }),
                    opacity: analyticsHeight,
                }}
            >
                <View style={{ padding: 16, gap: 12 }}>
                    {/* KPI row — 4 compact cards */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {kpiItems.map(item => (
                            <KpiPill
                                key={item.label}
                                item={item}
                                active={activeFilter === item.filterKey}
                                onPress={() => applyFilterAndSort(item.filterKey, item.filterKey === 'Darurat' ? 'Prioritas' : 'Terbaru')}
                            />
                        ))}
                    </View>

                    {/* Resolution rate + category distribution */}
                    <View style={{
                        backgroundColor: '#fff', borderRadius: 16, padding: 14,
                        borderWidth: 1, borderColor: '#edf2f9',
                    }}>
                        {/* Resolution rate */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <View>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>
                                    Tingkat Penyelesaian
                                </Text>
                                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>
                                    {stats?.resolved ?? 0} dari {stats?.total ?? 0} laporan selesai
                                </Text>
                            </View>
                            <Text style={{ fontSize: 22, fontWeight: '800', color: resolutionPct >= 70 ? SiagaColors.success : resolutionPct >= 40 ? '#d97706' : SiagaColors.danger }}>
                                {resolutionPct}%
                            </Text>
                        </View>

                        {/* Progress bar */}
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', marginBottom: 14, overflow: 'hidden' }}>
                            <View style={{
                                height: '100%', borderRadius: 3,
                                backgroundColor: resolutionPct >= 70 ? SiagaColors.success : resolutionPct >= 40 ? '#d97706' : SiagaColors.danger,
                                width: `${Math.min(resolutionPct, 100)}%`,
                            }} />
                        </View>

                        {/* Category distribution — collapsible */}
                        <TouchableOpacity
                            onPress={() => setShowCategories(!showCategories)}
                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                            activeOpacity={0.7}
                        >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>
                                Distribusi Kategori
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: SiagaColors.info }}>
                                    {showCategories ? 'Tutup' : 'Lihat'}
                                </Text>
                                <CaretDown
                                    size={12}
                                    color={SiagaColors.info}
                                    weight="bold"
                                    style={{ transform: [{ rotate: showCategories ? '180deg' : '0deg' }] }}
                                />
                            </View>
                        </TouchableOpacity>

                        {showCategories && (
                            <View style={{ gap: 8, marginTop: 10 }}>
                                {CATEGORY_DIST.map(cat => (
                                    <CategoryRow key={cat.label} label={cat.label} count={cat.count} pct={cat.pct} color={cat.color} />
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </Animated.View>

            {/* ── SEARCH + FILTERS ─────────────────────────────────── */}
            <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 8 }}>
                {/* Search bar */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    paddingHorizontal: 12, height: 38, borderRadius: 12,
                    backgroundColor: '#f4f7fb', borderWidth: 1, borderColor: '#edf2f9',
                }}>
                    <MagnifyingGlass size={16} color={SiagaColors.secondary} weight="duotone" />
                    <TextInput
                        placeholder="Cari ID, judul, atau lokasi..."
                        placeholderTextColor={SiagaColors.secondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ flex: 1, fontSize: 13, color: SiagaColors.primary, paddingVertical: 0 }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                            <XCircle size={16} color={SiagaColors.secondary} weight="fill" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter tabs + sort */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {FILTER_TABS_LIVE.map(tab => {
                        const isActive = activeFilter === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveFilter(tab.key)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                                    backgroundColor: isActive ? SiagaColors.primary : '#f4f7fb',
                                    borderWidth: 1, borderColor: isActive ? SiagaColors.primary : '#edf2f9',
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={{ fontSize: 12, fontWeight: isActive ? '700' : '600', color: isActive ? '#fff' : SiagaColors.secondary }}>
                                    {tab.key}
                                </Text>
                                <View style={{
                                    minWidth: 16, height: 16, borderRadius: 8,
                                    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#edf2f9',
                                }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: isActive ? '#fff' : SiagaColors.secondary }}>
                                        {tab.count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    <View style={{ width: 1, height: 24, backgroundColor: '#edf2f9', alignSelf: 'center', marginHorizontal: 2 }} />

                    <TouchableOpacity
                        onPress={() => setShowSort(!showSort)}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 5,
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                            backgroundColor: showSort ? '#eff6ff' : '#f4f7fb',
                            borderWidth: 1, borderColor: showSort ? SiagaColors.info : '#edf2f9',
                        }}
                        activeOpacity={0.7}
                    >
                        <SortAscending size={14} color={showSort ? SiagaColors.info : SiagaColors.secondary} weight="duotone" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: showSort ? SiagaColors.info : SiagaColors.secondary }}>
                            {activeSort}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Sort dropdown */}
                {showSort && (
                    <View style={{
                        flexDirection: 'row', borderRadius: 12, overflow: 'hidden',
                        borderWidth: 1, borderColor: '#edf2f9', backgroundColor: '#fff',
                    }}>
                        {SORT_OPTIONS.map((opt, i) => {
                            const isActive = activeSort === opt;
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    onPress={() => { setActiveSort(opt); setShowSort(false); }}
                                    style={{
                                        flex: 1, paddingVertical: 8, alignItems: 'center',
                                        backgroundColor: isActive ? '#eff6ff' : '#fff',
                                        borderRightWidth: i < SORT_OPTIONS.length - 1 ? 1 : 0,
                                        borderRightColor: '#f1f5f9',
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? SiagaColors.info : SiagaColors.secondary }}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* ── REPORT LIST ──────────────────────────────────────── */}
            <FlatList
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 10 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={SiagaColors.info}
                        colors={[SiagaColors.info]}
                    />
                }
                data={visibleReports}
                keyExtractor={item => item.id}
                initialNumToRender={5}
                maxToRenderPerBatch={8}
                windowSize={7}
                ListHeaderComponent={
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 8, marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: SiagaColors.info }} />
                                <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>
                                    {filteredReports.length} Laporan
                                    {activeFilter !== 'Semua' && (
                                        <Text style={{ color: SiagaColors.secondary }}> · {activeFilter}</Text>
                                    )}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.info }}>
                                {visibleReports.length}/{filteredReports.length}
                            </Text>
                        </View>

                        {/* Quick actions */}
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={openNotifications}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                                    backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9',
                                }}
                                activeOpacity={0.7}
                            >
                                <Megaphone size={13} color={SiagaColors.info} weight="duotone" />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.info }}>Broadcast</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleBulkComplete}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                                    backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9',
                                }}
                                activeOpacity={0.7}
                            >
                                <CheckSquare size={13} color={SiagaColors.success} weight="duotone" />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.success }}>Selesaikan Aktif</Text>
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
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#f4f7fb', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <ClipboardText size={28} color={SiagaColors.secondary} weight="duotone" />
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary, marginBottom: 4 }}>
                            Tidak ditemukan
                        </Text>
                        <Text style={{ fontSize: 12, color: SiagaColors.secondary, textAlign: 'center', maxWidth: 200 }}>
                            Tidak ada laporan yang cocok dengan filter saat ini.
                        </Text>
                        <TouchableOpacity
                            onPress={() => { setActiveFilter('Semua'); setSearchQuery(''); }}
                            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: SiagaColors.primary }}
                            activeOpacity={0.8}
                        >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Reset Filter</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListFooterComponent={
                    filteredReports.length > 0 ? (
                        <View style={{ gap: 4 }}>
                            <TouchableOpacity
                                onPress={handleLoadMore}
                                style={{
                                    paddingVertical: 10, borderRadius: 14,
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9',
                                }}
                                activeOpacity={0.7}
                            >
                                <ArrowClockwise size={14} color={SiagaColors.info} weight="duotone" />
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.info }}>
                                    {remainingCount > 0 ? `Muat ${Math.min(10, remainingCount)} Lagi` : 'Segarkan Data'}
                                </Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 10, color: SiagaColors.secondary, textAlign: 'center' }}>
                                Data diperbarui otomatis setiap kunjungan halaman
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}
