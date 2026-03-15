import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, RefreshControl, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
    ShieldCheck, MagnifyingGlass, Bell, Waves, Mountains,
    RoadHorizon, Fire, Trash, CaretRight, Clock,
    ArrowRight, FilePlus, HourglassMedium, CheckCircle,
    Timer, WarningDiamond, TrendUp, Megaphone, MapTrifold,
    ChartLineUp, ChartDonut, ChartBar,
    ClockCounterClockwise, ChatText, ArrowClockwise,
    MapPin, ClipboardText,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { getReports, getReportStats, type ReportData, type ReportStats } from '@/services/report.service';

const { width } = Dimensions.get('window');

// ───── Data ─────

const QUICK_ACTIONS = [
    { label: 'Broadcast', icon: Megaphone, color: SiagaColors.info, route: '/action-detail' },
    { label: 'Peta', icon: MapTrifold, color: SiagaColors.success, route: '/(gov-tabs)/peta' },
    { label: 'Statistik', icon: ChartLineUp, color: '#7c3aed', route: '/(gov-tabs)/laporan' },
];

const FILTER_CHIPS = ['Semua', 'Darurat', 'Baru', 'Proses', 'Selesai'];

type SeverityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';



const SEVERITY_STYLES: Record<SeverityLevel, { textColor: string; bgColor: string }> = {
    'Kritis': { textColor: '#fff', bgColor: SiagaColors.danger },
    'Tinggi': { textColor: '#9a3412', bgColor: '#fed7aa' },
    'Sedang': { textColor: '#92400e', bgColor: SiagaColors.warningSoft },
    'Rendah': { textColor: '#065f46', bgColor: SiagaColors.successSoft },
};


// ───── Component ─────
export default function GovDashboardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [reports, setReports] = useState<ReportData[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    // Fungsi utama load semua data dashboard
    const loadDashboardData = useCallback(async () => {
        const [statsResult, reportsResult] = await Promise.all([
            getReportStats(),
            getReports({ limit: 10 }),
        ]);
        if (statsResult.success && statsResult.data) setStats(statsResult.data);
        if (reportsResult.success && reportsResult.data) setReports(reportsResult.data);
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadDashboardData();
        }, [loadDashboardData])
    );

    // Pull-to-refresh handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    }, [loadDashboardData]);

    // Build stat cards dari data API
    const STATS = useMemo(() => {
        const total = stats?.total ?? 0;
        const pending = stats?.pending ?? 0;
        const inProgress = stats?.inProgress ?? 0;
        const resolved = stats?.resolved ?? 0;
        const pct = total > 0 ? `${Math.round(resolved / total * 100)}%` : '0%';
        return [
            { value: String(pending), label: 'Laporan Baru', icon: FilePlus, iconColor: SiagaColors.danger, bgColor: SiagaColors.dangerSoft, badge: `+${pending}`, badgeColor: SiagaColors.danger, badgeBg: SiagaColors.dangerSoft },
            { value: String(inProgress), label: 'Sedang Diproses', icon: HourglassMedium, iconColor: SiagaColors.warning, bgColor: SiagaColors.warningSoft, badge: 'Aktif', badgeColor: SiagaColors.warning, badgeBg: SiagaColors.warningSoft },
            { value: String(resolved), label: 'Selesai', icon: CheckCircle, iconColor: SiagaColors.success, bgColor: SiagaColors.successSoft, badge: pct, badgeColor: SiagaColors.success, badgeBg: SiagaColors.successSoft },
            { value: String(total), label: 'Total Laporan', icon: Timer, iconColor: SiagaColors.info, bgColor: SiagaColors.infoSoft, badge: total > 0 ? 'Data' : '-', badgeColor: SiagaColors.info, badgeBg: SiagaColors.infoSoft },
        ];
    }, [stats]);

    // Konversi reports ke UI format
    const REPORT_CARDS = useMemo(() => {
        const iconMap: Record<string, { icon: any; iconColor: string; bgColor: string }> = {
            'Banjir': { icon: Waves, iconColor: SiagaColors.info, bgColor: SiagaColors.infoSoft },
            'Longsor': { icon: Mountains, iconColor: '#ea580c', bgColor: '#fff7ed' },
            'Jalan Rusak': { icon: RoadHorizon, iconColor: SiagaColors.warning, bgColor: SiagaColors.warningSoft },
            'Kebakaran': { icon: Fire, iconColor: SiagaColors.danger, bgColor: SiagaColors.dangerSoft },
            'Sampah': { icon: Trash, iconColor: SiagaColors.success, bgColor: SiagaColors.successSoft },
        };
        return reports.slice(0, 5).map(r => {
            const cat = iconMap[r.category] || iconMap['Sampah'];
            const severity: SeverityLevel = r.urgency >= 80 ? 'Kritis' : r.urgency >= 60 ? 'Tinggi' : r.urgency >= 40 ? 'Sedang' : 'Rendah';
            return {
                id: r.id,
                title: r.title,
                area: `${r.district || '-'} · ${r.votesCount} dukungan`,
                time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                severity,
                icon: cat.icon,
                iconColor: cat.iconColor,
                bgColor: cat.bgColor,
            };
        });
    }, [reports]);

    const emergencyReports = useMemo(
        () => reports.filter(report => report.urgency >= 80),
        [reports]
    );

    const emergencyFocusReport = useMemo(() => {
        if (reports.length === 0) return null;

        return [...reports].sort((left, right) => {
            if (right.urgency !== left.urgency) return right.urgency - left.urgency;
            return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        })[0];
    }, [reports]);

    const emergencyTargetFilter = emergencyFocusReport?.urgency && emergencyFocusReport.urgency >= 80
        ? 'Darurat'
        : 'Semua';

    const emergencyCountLabel = emergencyReports.length > 0
        ? `${emergencyReports.length} laporan`
        : emergencyFocusReport
            ? '1 laporan prioritas'
            : 'Pantau peta';

    const emergencyAreaLabel = emergencyFocusReport
        ? [emergencyFocusReport.district, emergencyFocusReport.city].filter(Boolean).join(', ') || 'Lokasi laporan belum lengkap'
        : 'Belum ada titik darurat yang aktif saat ini.';

    const emergencyDescription = emergencyFocusReport?.description?.trim()
        ? emergencyFocusReport.description.trim()
        : emergencyFocusReport
            ? 'Buka peta untuk melihat titik laporan prioritas yang perlu ditindak.'
            : 'Buka peta untuk memantau seluruh titik laporan terbaru.';

    const handleEmergencyPress = useCallback(() => {
        if (!emergencyFocusReport?.id) {
            router.push({ pathname: '/(gov-tabs)/peta', params: { filter: 'Darurat' } });
            return;
        }

        router.push({
            pathname: '/(gov-tabs)/peta',
            params: {
                filter: emergencyTargetFilter,
                reportId: emergencyFocusReport.id,
            },
        });
    }, [emergencyFocusReport?.id, emergencyTargetFilter, router]);

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

    return (
        <View className="flex-1" style={{ backgroundColor: SiagaColors.background }}>
            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
                {/* Decorative circles */}
                <View style={{ position: 'absolute', right: -24, top: -24, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <View style={{ position: 'absolute', right: 40, bottom: -32, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                <View className="px-5 pb-5 pt-4">
                    {/* Top row */}
                    <View className="flex-row items-center justify-between mb-5">
                        <View className="flex-row items-center gap-2.5">
                            <Image source={require('@/assets/images/logo.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
                            <View>
                                <Text className="text-base font-extrabold text-white tracking-tight">SIAGA</Text>
                                <Text className="text-xs font-semibold text-white/45 uppercase tracking-[2px]">Gov Dashboard</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} activeOpacity={0.7} hitSlop={4}>
                                <MagnifyingGlass size={22} color="rgba(255,255,255,0.7)" weight="duotone" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} activeOpacity={0.7} hitSlop={4}>
                                <Bell size={22} color="rgba(255,255,255,0.7)" weight="duotone" />
                                <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SiagaColors.danger, borderWidth: 2, borderColor: SiagaColors.primary }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Profile row */}
                    <TouchableOpacity className="flex-row items-center gap-3" activeOpacity={0.7} onPress={() => router.push('/(gov-tabs)/profil-gov')}>
                        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.info, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' }}>
                            <Text className="text-white font-bold text-base">{user?.initials || 'GV'}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-[14px] font-medium text-white/55">Selamat Pagi 👋</Text>
                            <Text className="text-base font-extrabold text-white" numberOfLines={1}>{user?.fullName || 'Gov User'}</Text>
                            <Text className="text-[13px] font-medium text-white/40">{user?.district || 'Dinas PU'} — {user?.city || 'Kota Bandung'}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-[12px] font-medium text-white/40">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                            <View className="flex-row items-center gap-1 mt-0.5">
                                <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SiagaColors.success }} />
                                <Text className="text-[12px] font-bold" style={{ color: SiagaColors.success }}>Online</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── SCROLLABLE CONTENT ── */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={SiagaColors.info}
                        colors={[SiagaColors.info]}
                    />
                }
            >
                {/* ── ALERT DARURAT ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <TouchableOpacity
                        className="rounded-3xl p-4"
                        style={{ backgroundColor: SiagaColors.danger, borderWidth: 1, borderColor: SiagaColors.danger, elevation: 2, shadowColor: SiagaColors.danger, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 6 }}
                        activeOpacity={0.85}
                        onPress={handleEmergencyPress}
                    >
                        <View className="flex-row items-start gap-3">
                            <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                                <WarningDiamond size={24} color="#fff" weight="fill" />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Text className="text-xs font-bold uppercase tracking-wider text-white">Peringatan Darurat</Text>
                                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                                        <Text className="text-xs font-bold text-white">{emergencyCountLabel}</Text>
                                    </View>
                                </View>
                                <Text className="text-[17px] font-bold text-white">
                                    {emergencyFocusReport?.title || 'Belum Ada Laporan Darurat'}
                                </Text>
                                <Text className="text-[13px] mt-1 leading-5 text-white/85">
                                    {emergencyAreaLabel} {'\u2014'} {emergencyDescription}
                                </Text>
                            </View>
                            <CaretRight size={18} color="rgba(255,255,255,0.9)" style={{ marginTop: 10 }} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── STAT CARDS 2x2 ── */}
                <View className="flex-row flex-wrap gap-4">
                    {STATS.map((stat, i) => {
                        const IconComp = stat.icon;
                        return (
                            <Animated.View
                                key={i}
                                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: (width - 48) / 2 }}
                            >
                                <TouchableOpacity
                                    className="rounded-2xl p-4"
                                    style={{ backgroundColor: '#fcfdff', borderWidth: 1, borderColor: SiagaColors.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2 }}
                                    activeOpacity={0.85}
                                    onPress={() => router.push('/(gov-tabs)/laporan')}
                                >
                                    <View className="flex-row items-center justify-between mb-2.5">
                                        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
                                            <IconComp size={22} color={stat.iconColor} weight="duotone" />
                                        </View>
                                        <View className="px-3 py-2 rounded-full flex-row items-center gap-1" style={{ backgroundColor: stat.badgeBg }}>
                                            {stat.badge.startsWith('+') && <TrendUp size={12} color={stat.badgeColor} weight="fill" />}
                                            {stat.badge === '92%' && <TrendUp size={12} color={stat.badgeColor} weight="fill" />}
                                            <Text className="text-xs font-bold" style={{ color: stat.badgeColor }}>{stat.badge}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-baseline">
                                        <Text className="text-[24px] font-extrabold" style={{ color: SiagaColors.primary, lineHeight: 28 }}>{stat.value}</Text>
                                    </View>
                                    <Text className="text-[13px] mt-1 leading-5" style={{ color: SiagaColors.secondary }}>{stat.label}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* ── TRIAGE LIST ── */}
                <View>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <ClipboardText size={20} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Triage List</Text>
                        </View>
                        <TouchableOpacity className="flex-row items-center gap-0.5" activeOpacity={0.7} onPress={() => router.push('/(gov-tabs)/laporan')}>
                            <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>Semua</Text>
                            <CaretRight size={14} color={SiagaColors.info} weight="bold" />
                        </TouchableOpacity>
                    </View>

                    {/* Report cards */}
                    <View className="gap-3">
                        {REPORT_CARDS.map((report, i) => {
                            const IconComp = report.icon;
                            const severity = SEVERITY_STYLES[report.severity];
                            const isCritical = report.severity === 'Kritis';
                            return (
                                <TouchableOpacity
                                    key={i}
                                    className="rounded-2xl p-4"
                                    style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: isCritical ? 'rgba(220,38,38,0.18)' : '#e2e8f0', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}
                                    activeOpacity={0.85}
                                    onPress={() => openReportDetail(report.id)}
                                >
                                    <View className="flex-row items-start gap-3">
                                        <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: report.bgColor }}>
                                            <IconComp size={24} color={report.iconColor} weight="duotone" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-start justify-between gap-2 mb-1">
                                                <Text className="text-[15px] font-bold flex-1" style={{ color: SiagaColors.primary }} numberOfLines={2}>{report.title}</Text>
                                                <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: severity.bgColor }}>
                                                    <Text className="text-xs font-bold" style={{ color: severity.textColor }}>{report.severity}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-[13px] leading-5" style={{ color: SiagaColors.secondary }}>{report.area}</Text>
                                            <View className="flex-row items-center justify-between mt-3">
                                                <View className="flex-row items-center gap-1">
                                                    <Clock size={14} color={SiagaColors.secondary} />
                                                    <Text className="text-[12px]" style={{ color: SiagaColors.secondary }}>{report.time}</Text>
                                                </View>
                                                <View className="px-3 py-2 rounded-full" style={{ backgroundColor: isCritical ? SiagaColors.dangerSoft : '#f8fafc' }}>
                                                    <Text className="text-xs font-bold" style={{ color: isCritical ? SiagaColors.danger : SiagaColors.info }}>Butuh Tindak</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Show more */}
                    <TouchableOpacity
                        className="mt-4 min-h-[44px] rounded-xl flex-row items-center justify-center gap-2 px-4 py-3"
                        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}
                        activeOpacity={0.7}
                        onPress={() => router.push('/(gov-tabs)/laporan')}
                    >
                        <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>Lihat {Math.max(0, reports.length - 5)} Laporan Lainnya</Text>
                        <CaretRight size={14} color={SiagaColors.info} weight="bold" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

