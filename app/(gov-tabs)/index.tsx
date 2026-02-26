import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ShieldCheck, MagnifyingGlass, Bell, Waves, Mountains,
    RoadHorizon, Fire, Trash, CaretRight, Clock,
    ArrowRight, FilePlus, HourglassMedium, CheckCircle,
    Timer, WarningDiamond, TrendUp, Megaphone, MapTrifold,
    ChartLineUp, ChartDonut, ChartBar, ChartPieSlice,
    ClockCounterClockwise, ChatText, ArrowClockwise,
    Warning, MapPin, Tree, ClipboardText, Wallet,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ───── Data ─────
const STATS = [
    { value: '12', label: 'Laporan Baru', icon: FilePlus, iconColor: SiagaColors.danger, bgColor: '#fef2f2', badge: '+5', badgeColor: SiagaColors.danger, badgeBg: '#fef2f2' },
    { value: '8', label: 'Sedang Diproses', icon: HourglassMedium, iconColor: SiagaColors.warning, bgColor: '#fffbeb', badge: 'Aktif', badgeColor: '#d97706', badgeBg: '#fffbeb' },
    { value: '34', label: 'Selesai Bulan Ini', icon: CheckCircle, iconColor: SiagaColors.success, bgColor: '#ecfdf5', badge: '92%', badgeColor: SiagaColors.success, badgeBg: '#ecfdf5' },
    { value: '4.2', label: 'Rata-rata Respons', icon: Timer, iconColor: SiagaColors.info, bgColor: '#eff6ff', badge: 'Baik', badgeColor: SiagaColors.info, badgeBg: '#eff6ff', suffix: 'jam' },
];

const QUICK_ACTIONS = [
    { label: 'Broadcast', icon: Megaphone, color: SiagaColors.info, route: '/action-detail' },
    { label: 'Peta', icon: MapTrifold, color: SiagaColors.success, route: '/(gov-tabs)/peta' },
    { label: 'Statistik', icon: ChartLineUp, color: '#7c3aed', route: '/(gov-tabs)/laporan' },
    { label: 'Budget', icon: Wallet, color: '#d97706', route: '/(gov-tabs)/budget' },
];

const FILTER_CHIPS = ['Semua', 'Darurat', 'Baru', 'Proses', 'Selesai'];

type SeverityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';

const REPORTS = [
    { title: 'Banjir Jl. Merdeka', area: 'Kec. Dayeuhkolot · 15 laporan serupa', time: '10 menit lalu', severity: 'Kritis' as SeverityLevel, icon: Waves, iconColor: '#2563eb', bgColor: '#eff6ff' },
    { title: 'Longsor Tebing Jl. Dago', area: 'Kec. Cibeunying · 5 laporan serupa', time: '30 menit lalu', severity: 'Kritis' as SeverityLevel, icon: Mountains, iconColor: '#ea580c', bgColor: '#fff7ed' },
    { title: 'Jalan Berlubang Jl. Sudirman', area: 'Kec. Coblong · 3 laporan serupa', time: '2 jam lalu', severity: 'Sedang' as SeverityLevel, icon: RoadHorizon, iconColor: '#d97706', bgColor: '#fffbeb' },
    { title: 'Kebakaran Warung Jl. ABC', area: 'Kec. Regol · 2 laporan serupa', time: '1 jam lalu', severity: 'Tinggi' as SeverityLevel, icon: Fire, iconColor: '#dc2626', bgColor: '#fef2f2' },
    { title: 'Tumpukan Sampah Gg. Melati', area: 'Kec. Coblong · 8 laporan serupa', time: '3 jam lalu', severity: 'Rendah' as SeverityLevel, icon: Trash, iconColor: '#059669', bgColor: '#ecfdf5' },
];

const SEVERITY_STYLES: Record<SeverityLevel, { textColor: string; bgColor: string }> = {
    'Kritis': { textColor: '#fff', bgColor: SiagaColors.danger },
    'Tinggi': { textColor: '#9a3412', bgColor: '#fed7aa' },
    'Sedang': { textColor: '#92400e', bgColor: '#fef3c7' },
    'Rendah': { textColor: '#065f46', bgColor: '#d1fae5' },
};

const CATEGORIES = [
    { label: 'Banjir', count: 18, icon: Waves, color: '#3b82f6', bgColor: '#eff6ff', pct: 33 },
    { label: 'Jalan Rusak', count: 14, icon: RoadHorizon, color: '#f59e0b', bgColor: '#fffbeb', pct: 26 },
    { label: 'Sampah', count: 11, icon: Trash, color: '#10b981', bgColor: '#ecfdf5', pct: 20 },
    { label: 'Longsor', count: 7, icon: Mountains, color: '#f97316', bgColor: '#fff7ed', pct: 13 },
    { label: 'Kebakaran', count: 4, icon: Fire, color: '#ef4444', bgColor: '#fef2f2', pct: 8 },
];

const BUDGET_PROJECTS = [
    {
        title: 'Perbaikan Jl. Merdeka', org: 'Dinas PU · Kec. Coblong',
        icon: RoadHorizon, iconColor: SiagaColors.info, bgColor: '#eff6ff',
        status: 'Anomali', statusColor: '#92400e', statusBg: '#fef3c7',
        budget: 'Rp 850Jt', realisasi: '95%', realisasiColor: SiagaColors.warning,
        fisik: '80%', fisikColor: SiagaColors.danger, progress: 80,
        gradientFrom: SiagaColors.info, gradientTo: '#2563eb',
    },
    {
        title: 'Penataan Taman Kota', org: 'Dinas LH · Kec. Bandung Wetan',
        icon: Tree, iconColor: '#059669', bgColor: '#ecfdf5',
        status: 'Normal', statusColor: SiagaColors.success, statusBg: '#d1fae5',
        budget: 'Rp 1.2M', realisasi: '58%', realisasiColor: SiagaColors.success,
        fisik: '55%', fisikColor: SiagaColors.success, progress: 55,
        gradientFrom: SiagaColors.success, gradientTo: '#059669',
    },
];

const ACTIVITIES = [
    { text: 'Laporan #1042 ditandai', highlight: 'Selesai', highlightColor: SiagaColors.success, sub: 'Jalan Rusak Jl. Braga · 15 menit lalu', icon: CheckCircle, iconColor: SiagaColors.success, bgColor: '#ecfdf5', showLine: true },
    { text: 'Respons dikirim ke Laporan', highlight: '#1038', highlightColor: SiagaColors.info, sub: 'Banjir Kec. Dayeuhkolot · 1 jam lalu', icon: ChatText, iconColor: SiagaColors.info, bgColor: '#eff6ff', showLine: true },
    { text: 'Status diubah ke', highlight: 'Diproses', highlightColor: SiagaColors.warning, sub: 'Sampah Gg. Melati · 2 jam lalu', icon: ArrowClockwise, iconColor: SiagaColors.warning, bgColor: '#fffbeb', showLine: true },
    { text: 'Broadcast ke', highlight: 'Kec. Coblong', highlightColor: '#7c3aed', sub: 'Peringatan Cuaca · 3 jam lalu', icon: Megaphone, iconColor: '#7c3aed', bgColor: '#f5f3ff', showLine: false },
];

// ───── Component ─────
export default function GovDashboardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('Semua');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View className="flex-1" style={{ backgroundColor: '#f4f7fb' }}>
            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
                {/* Decorative circles */}
                <View style={{ position: 'absolute', right: -24, top: -24, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <View style={{ position: 'absolute', right: 40, bottom: -32, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                <View className="px-5 pb-5 pt-3">
                    {/* Top row */}
                    <View className="flex-row items-center justify-between mb-5">
                        <View className="flex-row items-center gap-2.5">
                            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: SiagaColors.info }}>
                                <ShieldCheck size={22} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text className="text-base font-extrabold text-white tracking-tight">SIAGA</Text>
                                <Text className="text-[10px] font-semibold text-white/35 uppercase tracking-[3px]">Gov Dashboard</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2.5">
                            <TouchableOpacity className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} activeOpacity={0.7}>
                                <MagnifyingGlass size={22} color="rgba(255,255,255,0.7)" weight="duotone" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} activeOpacity={0.7}>
                                <Bell size={22} color="rgba(255,255,255,0.7)" weight="duotone" />
                                <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SiagaColors.danger, borderWidth: 2, borderColor: SiagaColors.primary }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Profile row */}
                    <TouchableOpacity className="flex-row items-center gap-3" activeOpacity={0.7} onPress={() => router.push('/(gov-tabs)/profil-gov')}>
                        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.info, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' }}>
                            <Text className="text-white font-bold text-base">BS</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-[14px] font-medium text-white/55">Selamat Pagi 👋</Text>
                            <Text className="text-base font-extrabold text-white" numberOfLines={1}>Budi Santoso, S.T.</Text>
                            <Text className="text-[13px] font-medium text-white/40">Dinas PU — Kota Bandung</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-[12px] font-medium text-white/40">23 Feb 2026</Text>
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
            >
                {/* ── ALERT DARURAT ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <TouchableOpacity
                        className="rounded-2xl p-3.5"
                        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(231,76,60,0.2)', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}
                        activeOpacity={0.85}
                        onPress={() => router.push('/(gov-tabs)/peta?filter=Darurat')}
                    >
                        <View className="flex-row items-start gap-3">
                            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: '#fef2f2' }}>
                                <WarningDiamond size={24} color={SiagaColors.danger} weight="duotone" />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-0.5">
                                    <Text className="text-[12px] font-bold uppercase tracking-wider" style={{ color: SiagaColors.danger }}>Peringatan Darurat</Text>
                                    <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: SiagaColors.danger }}>
                                        <Text className="text-[10px] font-bold text-white">3</Text>
                                    </View>
                                </View>
                                <Text className="text-[15px] font-bold" style={{ color: SiagaColors.primary }}>Laporan Banjir Kritis</Text>
                                <Text className="text-[13px] mt-0.5 leading-relaxed" style={{ color: SiagaColors.secondary }}>Kec. Dayeuhkolot, Coblong — ketinggian air naik 2 jam terakhir.</Text>
                            </View>
                            <CaretRight size={16} color={SiagaColors.secondary} style={{ marginTop: 10 }} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── STAT CARDS 2x2 ── */}
                <View className="flex-row flex-wrap gap-3">
                    {STATS.map((stat, i) => {
                        const IconComp = stat.icon;
                        return (
                            <Animated.View
                                key={i}
                                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: (width - 48) / 2 }}
                            >
                                <TouchableOpacity
                                    className="rounded-2xl p-3.5"
                                    style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}
                                    activeOpacity={0.85}
                                    onPress={() => router.push('/(gov-tabs)/laporan')}
                                >
                                    <View className="flex-row items-center justify-between mb-2.5">
                                        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: stat.bgColor }}>
                                            <IconComp size={22} color={stat.iconColor} weight="duotone" />
                                        </View>
                                        <View className="px-3 py-1 rounded-md flex-row items-center gap-0.5" style={{ backgroundColor: stat.badgeBg }}>
                                            {stat.badge.startsWith('+') && <TrendUp size={12} color={stat.badgeColor} weight="fill" />}
                                            {stat.badge === '92%' && <TrendUp size={12} color={stat.badgeColor} weight="fill" />}
                                            <Text className="text-[10px] font-bold" style={{ color: stat.badgeColor }}>{stat.badge}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-baseline">
                                        <Text className="text-[24px] font-extrabold" style={{ color: SiagaColors.primary, lineHeight: 28 }}>{stat.value}</Text>
                                        {stat.suffix && <Text className="text-[14px] ml-0.5" style={{ color: SiagaColors.secondary }}>{stat.suffix}</Text>}
                                    </View>
                                    <Text className="text-[13px] mt-1" style={{ color: SiagaColors.secondary }}>{stat.label}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* ── AKSI CEPAT ── */}
                <View>
                    <Text className="text-[16px] font-bold mb-3" style={{ color: SiagaColors.primary }}>Aksi Cepat</Text>
                    <View className="flex-row gap-2.5">
                        {QUICK_ACTIONS.map((action, i) => {
                            const IconComp = action.icon;
                            return (
                                <TouchableOpacity key={i} className="flex-1 items-center gap-1.5" activeOpacity={0.7} onPress={() => action.route && router.push(action.route as any)}>
                                    <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 }}>
                                        <IconComp size={26} color={action.color} weight="duotone" />
                                    </View>
                                    <Text className="text-[12px] font-semibold" style={{ color: SiagaColors.primary }}>{action.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── LAPORAN TERBARU ── */}
                <View>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <ClipboardText size={20} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Laporan Terbaru</Text>
                        </View>
                        <TouchableOpacity className="flex-row items-center gap-0.5" activeOpacity={0.7} onPress={() => router.push('/(gov-tabs)/laporan')}>
                            <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>Semua</Text>
                            <CaretRight size={14} color={SiagaColors.info} weight="bold" />
                        </TouchableOpacity>
                    </View>

                    {/* Filter chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 8 }}>
                        {FILTER_CHIPS.map((chip) => (
                            <TouchableOpacity
                                key={chip}
                                className="px-4 py-2 rounded-xl"
                                style={{
                                    backgroundColor: activeFilter === chip ? SiagaColors.primary : '#fff',
                                    borderWidth: activeFilter === chip ? 0 : 1,
                                    borderColor: '#f1f5f9',
                                }}
                                onPress={() => setActiveFilter(chip)}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[13px]" style={{
                                    fontWeight: activeFilter === chip ? '700' : '600',
                                    color: activeFilter === chip ? '#fff' : SiagaColors.secondary,
                                }}>{chip}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Report cards */}
                    <View className="gap-2.5">
                        {REPORTS.map((report, i) => {
                            const IconComp = report.icon;
                            const severity = SEVERITY_STYLES[report.severity];
                            const isCritical = report.severity === 'Kritis';
                            return (
                                <TouchableOpacity
                                    key={i}
                                    className="rounded-2xl p-3.5"
                                    style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}
                                    activeOpacity={0.85}
                                    onPress={() => router.push('/report-detail')}
                                >
                                    <View className="flex-row items-start gap-3">
                                        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: report.bgColor }}>
                                            <IconComp size={24} color={report.iconColor} weight="duotone" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center justify-between mb-0.5">
                                                <Text className="text-[15px] font-bold flex-1 mr-2" style={{ color: SiagaColors.primary }} numberOfLines={1}>{report.title}</Text>
                                                <View className="px-3 py-1 rounded-md" style={{ backgroundColor: severity.bgColor }}>
                                                    <Text className="text-[10px] font-bold" style={{ color: severity.textColor }}>{report.severity}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-[13px]" style={{ color: SiagaColors.secondary }}>{report.area}</Text>
                                            <View className="flex-row items-center justify-between mt-2.5">
                                                <View className="flex-row items-center gap-1">
                                                    <Clock size={14} color={SiagaColors.secondary} />
                                                    <Text className="text-[12px]" style={{ color: SiagaColors.secondary }}>{report.time}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                                                    style={{ backgroundColor: isCritical ? SiagaColors.info : '#eff6ff' }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text className="text-[12px] font-bold" style={{ color: isCritical ? '#fff' : SiagaColors.info }}>Tindak</Text>
                                                    <ArrowRight size={12} color={isCritical ? '#fff' : SiagaColors.info} weight="bold" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Show more */}
                    <TouchableOpacity
                        className="mt-3 py-2.5 rounded-xl flex-row items-center justify-center gap-1"
                        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}
                        activeOpacity={0.7}
                        onPress={() => router.push('/(gov-tabs)/laporan')}
                    >
                        <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>Lihat 49 Laporan Lainnya</Text>
                        <ArrowRight size={14} color={SiagaColors.info} weight="bold" />
                    </TouchableOpacity>
                </View>

                {/* ── SKOR RESPONSIVITAS ── */}
                <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}>
                    <View className="flex-row items-center gap-2 mb-4">
                        <ChartDonut size={20} color={SiagaColors.info} weight="duotone" />
                        <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Skor Responsivitas</Text>
                    </View>
                    <View className="flex-row items-center gap-5">
                        {/* Circular progress */}
                        <View className="w-24 h-24 items-center justify-center">
                            <Svg width={96} height={96} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
                                <Circle cx={50} cy={50} r={42} fill="none" stroke="#edf2f9" strokeWidth={9} />
                                <Circle cx={50} cy={50} r={42} fill="none" stroke={SiagaColors.info} strokeWidth={9} strokeDasharray="264" strokeDashoffset="34" strokeLinecap="round" />
                            </Svg>
                            <View className="absolute items-center justify-center">
                                <Text className="text-xl font-extrabold" style={{ color: SiagaColors.primary }}>87%</Text>
                                <Text className="text-[10px] font-medium" style={{ color: SiagaColors.secondary }}>Response</Text>
                            </View>
                        </View>
                        {/* Stats */}
                        <View className="flex-1 gap-2.5">
                            {[
                                { label: 'Ditanggapi', value: '47', color: SiagaColors.success },
                                { label: 'Menunggu', value: '7', color: SiagaColors.warning },
                                { label: 'Avg. waktu', value: '4.2 jam', color: SiagaColors.info },
                            ].map((item, i) => (
                                <View key={i} className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-2">
                                        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <Text className="text-[13px]" style={{ color: SiagaColors.secondary }}>{item.label}</Text>
                                    </View>
                                    <Text className="text-[13px] font-bold" style={{ color: SiagaColors.primary }}>{item.value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ── DISTRIBUSI KATEGORI ── */}
                <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}>
                    <View className="flex-row items-center gap-2 mb-4">
                        <ChartBar size={20} color={SiagaColors.info} weight="duotone" />
                        <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Distribusi Kategori</Text>
                    </View>
                    <View className="gap-3">
                        {CATEGORIES.map((cat, i) => {
                            const IconComp = cat.icon;
                            return (
                                <View key={i}>
                                    <View className="flex-row items-center justify-between mb-1">
                                        <View className="flex-row items-center gap-2">
                                            <IconComp size={16} color={cat.color} weight="duotone" />
                                            <Text className="text-[13px] font-semibold" style={{ color: SiagaColors.primary }}>{cat.label}</Text>
                                        </View>
                                        <Text className="text-[12px] font-bold" style={{ color: SiagaColors.secondary }}>{cat.count}</Text>
                                    </View>
                                    <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: cat.bgColor }}>
                                        <View className="h-full rounded-full" style={{ backgroundColor: cat.color, width: `${cat.pct}%` }} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* ── BUDGET WATCH ── */}
                <View>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <ChartPieSlice size={20} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Budget Watch</Text>
                        </View>
                        <TouchableOpacity className="flex-row items-center gap-0.5" activeOpacity={0.7} onPress={() => router.push('/(gov-tabs)/budget')}>
                            <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>Semua</Text>
                            <CaretRight size={14} color={SiagaColors.info} weight="bold" />
                        </TouchableOpacity>
                    </View>
                    <View className="gap-2.5">
                        {BUDGET_PROJECTS.map((proj, i) => {
                            const IconComp = proj.icon;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    className="rounded-2xl p-3.5"
                                    style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}
                                    activeOpacity={0.85}
                                    onPress={() => router.push('/(gov-tabs)/budget')}
                                >
                                    {/* Project header */}
                                    <View className="flex-row items-start gap-3 mb-3">
                                        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: proj.bgColor }}>
                                            <IconComp size={24} color={proj.iconColor} weight="duotone" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center justify-between mb-0.5">
                                                <Text className="text-[15px] font-bold flex-1 mr-2" style={{ color: SiagaColors.primary }} numberOfLines={1}>{proj.title}</Text>
                                                <View className="px-3 py-1 rounded-md flex-row items-center gap-0.5" style={{ backgroundColor: proj.statusBg }}>
                                                    {proj.status === 'Anomali' ? <Warning size={11} color={proj.statusColor} weight="fill" /> : <CheckCircle size={11} color={proj.statusColor} weight="fill" />}
                                                    <Text className="text-[10px] font-bold" style={{ color: proj.statusColor }}>{proj.status}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-[13px]" style={{ color: SiagaColors.secondary }}>{proj.org}</Text>
                                        </View>
                                    </View>
                                    {/* Budget grid */}
                                    <View className="flex-row gap-3 mb-3">
                                        {[
                                            { label: 'Anggaran', value: proj.budget, color: SiagaColors.primary },
                                            { label: 'Realisasi', value: proj.realisasi, color: proj.realisasiColor },
                                            { label: 'Fisik', value: proj.fisik, color: proj.fisikColor },
                                        ].map((cell, ci) => (
                                            <View key={ci} className="flex-1 rounded-lg p-2.5 items-center" style={{ backgroundColor: '#fafcfe' }}>
                                                <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SiagaColors.secondary }}>{cell.label}</Text>
                                                <Text className="text-[15px] font-extrabold mt-0.5" style={{ color: cell.color }}>{cell.value}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    {/* Progress bar */}
                                    <View>
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="text-[12px]" style={{ color: SiagaColors.secondary }}>Progress Fisik</Text>
                                            <Text className="text-[12px] font-bold" style={{ color: SiagaColors.primary }}>{proj.fisik}</Text>
                                        </View>
                                        <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <View className="h-full rounded-full" style={{ backgroundColor: proj.gradientFrom, width: `${proj.progress}%` }} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── AKTIVITAS TERKINI ── */}
                <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}>
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <ClockCounterClockwise size={20} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Aktivitas Terkini</Text>
                        </View>
                        <TouchableOpacity className="flex-row items-center gap-0.5" activeOpacity={0.7} onPress={() => router.push('/riwayat-aktivitas')}>
                            <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>Semua</Text>
                            <CaretRight size={14} color={SiagaColors.info} weight="bold" />
                        </TouchableOpacity>
                    </View>
                    <View className="gap-3">
                        {ACTIVITIES.map((act, i) => {
                            const IconComp = act.icon;
                            return (
                                <View key={i} className="flex-row items-start gap-3">
                                    <View className="items-center">
                                        <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: act.bgColor }}>
                                            <IconComp size={18} color={act.iconColor} weight="duotone" />
                                        </View>
                                        {act.showLine && <View className="w-px flex-1 mt-1.5" style={{ backgroundColor: '#f1f5f9' }} />}
                                    </View>
                                    <View className="flex-1 pb-3">
                                        <Text className="text-[14px] font-semibold" style={{ color: SiagaColors.primary }}>
                                            {act.text}{' '}
                                            <Text style={{ color: act.highlightColor, fontWeight: '700' }}>{act.highlight}</Text>
                                        </Text>
                                        <Text className="text-[12px] mt-0.5" style={{ color: SiagaColors.secondary }}>{act.sub}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* ── FOOTER ── */}
                <View className="pt-2 pb-2 items-center gap-1">
                    <View className="flex-row items-center gap-1.5">
                        <View className="w-6 h-6 rounded-md items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
                            <ShieldCheck size={14} color="#fff" weight="duotone" />
                        </View>
                        <Text className="text-[13px] font-bold" style={{ color: SiagaColors.primary }}>SIAGA Dashboard</Text>
                    </View>
                    <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>v1.0.0 · Smart Indonesia Adaptive Governance Application</Text>
                    <View className="flex-row items-center gap-3 mt-0.5">
                        <View className="flex-row items-center gap-1">
                            <MapPin size={12} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>Wilayah: <Text className="font-bold" style={{ color: SiagaColors.primary }}>Kota Bandung</Text></Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <ShieldCheck size={12} color={SiagaColors.success} weight="duotone" />
                            <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>NIP: <Text className="font-bold" style={{ color: SiagaColors.primary }}>198001012005011001</Text></Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

