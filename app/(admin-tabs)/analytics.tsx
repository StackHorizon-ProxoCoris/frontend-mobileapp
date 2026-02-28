import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChartBar,
    ChartLineUp,
    ChartDonut,
    ChartPieSlice,
    TrendUp,
    TrendDown,
    Users,
    FileText,
    CheckCircle,
    Waves,
    RoadHorizon,
    Mountains,
    Fire,
    Trash,
    Leaf,
    ArrowUp,
    AndroidLogo,
    AppleLogo,
    Globe,
    MapPin,
    Clock,
    CalendarBlank,
    DownloadSimple,
    FunnelSimple,
    CaretRight,
    ArrowClockwise,
    Lightning,
    Pulse,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import Svg, { Rect, Circle, Path, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;
const BAR_CHART_W = width - 64;
const BAR_CHART_H = 160;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type Period = '7H' | '30H' | '3B' | '1T';

// ────────────────────────────────────────────
// Data
// ────────────────────────────────────────────
const PERIOD_LABELS: Record<Period, string> = {
    '7H': '7 Hari',
    '30H': '30 Hari',
    '3B': '3 Bulan',
    '1T': '1 Tahun',
};

const REPORT_TREND: Record<Period, { label: string; value: number }[]> = {
    '7H': [
        { label: 'Sen', value: 12 },
        { label: 'Sel', value: 18 },
        { label: 'Rab', value: 9 },
        { label: 'Kam', value: 24 },
        { label: 'Jum', value: 31 },
        { label: 'Sab', value: 16 },
        { label: 'Min', value: 8 },
    ],
    '30H': [
        { label: 'M1', value: 65 },
        { label: 'M2', value: 88 },
        { label: 'M3', value: 72 },
        { label: 'M4', value: 105 },
    ],
    '3B': [
        { label: 'Nov', value: 210 },
        { label: 'Des', value: 285 },
        { label: 'Jan', value: 320 },
    ],
    '1T': [
        { label: 'Feb', value: 89 },
        { label: 'Mar', value: 134 },
        { label: 'Apr', value: 201 },
        { label: 'Mei', value: 178 },
        { label: 'Jun', value: 220 },
        { label: 'Jul', value: 310 },
        { label: 'Agu', value: 255 },
        { label: 'Sep', value: 290 },
        { label: 'Okt', value: 340 },
        { label: 'Nov', value: 285 },
        { label: 'Des', value: 410 },
        { label: 'Jan', value: 380 },
    ],
};

const USER_GROWTH: Record<Period, { label: string; new_users: number; active: number }[]> = {
    '7H': [
        { label: 'Sen', new_users: 8, active: 210 },
        { label: 'Sel', new_users: 14, active: 248 },
        { label: 'Rab', new_users: 6, active: 195 },
        { label: 'Kam', new_users: 19, active: 310 },
        { label: 'Jum', new_users: 22, active: 387 },
        { label: 'Sab', new_users: 11, active: 271 },
        { label: 'Min', new_users: 5, active: 152 },
    ],
    '30H': [
        { label: 'M1', new_users: 62, active: 1100 },
        { label: 'M2', new_users: 74, active: 1280 },
        { label: 'M3', new_users: 58, active: 1050 },
        { label: 'M4', new_users: 91, active: 1450 },
    ],
    '3B': [
        { label: 'Nov', new_users: 148, active: 3100 },
        { label: 'Des', new_users: 210, active: 3650 },
        { label: 'Jan', new_users: 124, active: 4000 },
    ],
    '1T': [
        { label: 'Feb', new_users: 45, active: 1200 },
        { label: 'Mar', new_users: 78, active: 1500 },
        { label: 'Apr', new_users: 102, active: 1900 },
        { label: 'Mei', new_users: 134, active: 2400 },
        { label: 'Jun', new_users: 89, active: 2200 },
        { label: 'Jul', new_users: 156, active: 3100 },
        { label: 'Agu', new_users: 112, active: 2900 },
        { label: 'Sep', new_users: 178, active: 3500 },
        { label: 'Okt', new_users: 190, active: 3900 },
        { label: 'Nov', new_users: 148, active: 3100 },
        { label: 'Des', new_users: 210, active: 3650 },
        { label: 'Jan', new_users: 124, active: 4046 },
    ],
};

const REPORT_CATEGORIES = [
    { label: 'Banjir', count: 142, pct: 35, color: '#3b82f6', icon: Waves },
    { label: 'Jalan Rusak', count: 98, pct: 24, color: '#d97706', icon: RoadHorizon },
    { label: 'Kebakaran', count: 71, pct: 17, color: SiagaColors.danger, icon: Fire },
    { label: 'Tanah Longsor', count: 46, pct: 11, color: '#7c3aed', icon: Mountains },
    { label: 'Sampah', count: 34, pct: 8, color: '#059669', icon: Trash },
    { label: 'Lainnya', count: 17, pct: 4, color: SiagaColors.secondary, icon: Leaf },
];

const TOP_REGIONS = [
    { rank: 1, name: 'Kec. Cibeunying Kaler', reports: 89, change: '+12%', up: true },
    { rank: 2, name: 'Kec. Coblong', reports: 74, change: '+8%', up: true },
    { rank: 3, name: 'Kec. Bandung Wetan', reports: 61, change: '-3%', up: false },
    { rank: 4, name: 'Kec. Sukasari', reports: 52, change: '+18%', up: true },
    { rank: 5, name: 'Kec. Bojongloa Kaler', reports: 47, change: '+5%', up: true },
];

const PLATFORM_STATS = [
    { label: 'Android', pct: 68, count: '3.431', icon: AndroidLogo, color: '#059669', bg: '#ecfdf5' },
    { label: 'iOS', pct: 24, count: '1.211', icon: AppleLogo, color: '#374151', bg: '#f3f4f6' },
    { label: 'Web', pct: 8, count: '404', icon: Globe, color: '#3b82f6', bg: '#eff6ff' },
];

// Peak hours data (0–23 mapped to 0–1 relative intensity)
const PEAK_HOURS = [
    0.08, 0.04, 0.02, 0.01, 0.02, 0.05,
    0.14, 0.32, 0.55, 0.72, 0.91, 0.87,
    0.96, 0.83, 0.71, 0.65, 0.78, 0.88,
    1.00, 0.92, 0.74, 0.53, 0.31, 0.15,
];

const RESOLUTION_STATS = [
    { label: 'Disetujui', count: 248, pct: 61, color: SiagaColors.success },
    { label: 'Ditolak', count: 73, pct: 18, color: SiagaColors.danger },
    { label: 'Menunggu', count: 53, pct: 13, color: SiagaColors.warning },
    { label: 'Diproses', count: 34, pct: 8, color: SiagaColors.info },
];

// ────────────────────────────────────────────
// Helper: Bar chart (SVG)
// ────────────────────────────────────────────
function BarChart({ data, barColor = '#7c3aed', height = BAR_CHART_H }: {
    data: { label: string; value: number }[];
    barColor?: string;
    height?: number;
}) {
    const max = Math.max(...data.map(d => d.value));
    const barW = Math.max((BAR_CHART_W / data.length) - (data.length > 8 ? 6 : 10), 8);
    const gap = BAR_CHART_W / data.length;
    const chartH = height - 28; // reserve space for labels

    return (
        <Svg width={BAR_CHART_W} height={height}>
            {data.map((d, i) => {
                const barH = max > 0 ? (d.value / max) * chartH : 0;
                const x = i * gap + (gap - barW) / 2;
                const y = chartH - barH;
                return (
                    <React.Fragment key={i}>
                        {/* Track */}
                        <Rect x={x} y={0} width={barW} height={chartH} rx={4} fill="#f1f5f9" />
                        {/* Bar */}
                        <Rect x={x} y={y} width={barW} height={barH} rx={4} fill={barColor} opacity={0.9} />
                        {/* Label */}
                        <SvgText
                            x={x + barW / 2}
                            y={height - 4}
                            textAnchor="middle"
                            fontSize={8}
                            fill={SiagaColors.secondary}
                            fontWeight="600"
                        >
                            {d.label}
                        </SvgText>
                    </React.Fragment>
                );
            })}
        </Svg>
    );
}

// ────────────────────────────────────────────
// Helper: Mini Donut
// ────────────────────────────────────────────
function MiniDonut({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
            <Circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={7}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
            />
        </Svg>
    );
}

// ────────────────────────────────────────────
// Section Header
// ────────────────────────────────────────────
function SectionHeader({
    icon: Icon,
    title,
    color = '#7c3aed',
    action,
    onAction,
}: {
    icon: any;
    title: string;
    color?: string;
    action?: string;
    onAction?: () => void;
}) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon size={20} color={color} weight="duotone" />
                <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>{title}</Text>
            </View>
            {action && (
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} activeOpacity={0.7} onPress={onAction}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color }}>{action}</Text>
                    <CaretRight size={13} color={color} weight="bold" />
                </TouchableOpacity>
            )}
        </View>
    );
}

// ────────────────────────────────────────────
// Card wrapper
// ────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
    return (
        <View style={[{
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: '#edf2f9',
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
        }, style]}>
            {children}
        </View>
    );
}

// ────────────────────────────────────────────
// Period Tab
// ────────────────────────────────────────────
function PeriodTabs({ active, onChange }: { active: Period; onChange: (p: Period) => void }) {
    return (
        <View style={{ flexDirection: 'row', backgroundColor: '#f4f7fb', borderRadius: 12, padding: 3, gap: 2 }}>
            {(['7H', '30H', '3B', '1T'] as Period[]).map(p => (
                <TouchableOpacity
                    key={p}
                    onPress={() => onChange(p)}
                    style={{
                        flex: 1, paddingVertical: 7, borderRadius: 10,
                        backgroundColor: active === p ? '#fff' : 'transparent',
                        alignItems: 'center',
                        elevation: active === p ? 1 : 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: active === p ? 0.06 : 0,
                        shadowRadius: 2,
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{
                        fontSize: 11, fontWeight: '700',
                        color: active === p ? '#7c3aed' : SiagaColors.secondary,
                    }}>
                        {p}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────
export default function AdminAnalyticsScreen() {
    const insets = useSafeAreaInsets();
    const [period, setPeriod] = useState<Period>('7H');
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
        ]).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 800));
        setRefreshing(false);
    };

    const reportData = REPORT_TREND[period];
    const userData = USER_GROWTH[period];
    const totalReports = reportData.reduce((s, d) => s + d.value, 0);

    // Summary KPI values (static placeholders matching admin dashboard context)
    const KPI = [
        {
            label: 'Total Laporan',
            value: totalReports.toString(),
            sub: PERIOD_LABELS[period],
            icon: FileText,
            iconColor: SiagaColors.danger,
            bg: '#fef2f2',
            trend: '+14%',
            up: true,
        },
        {
            label: 'Pengguna Aktif',
            value: '1.573',
            sub: 'Rata-rata harian',
            icon: Users,
            iconColor: '#3b82f6',
            bg: '#eff6ff',
            trend: '+9%',
            up: true,
        },
        {
            label: 'Aksi Komunitas',
            value: '408',
            sub: PERIOD_LABELS[period],
            icon: CheckCircle,
            iconColor: SiagaColors.success,
            bg: '#ecfdf5',
            trend: '+21%',
            up: true,
        },
        {
            label: 'Waktu Respons',
            value: '4,2h',
            sub: 'Rata-rata',
            icon: Clock,
            iconColor: '#d97706',
            bg: '#fffbeb',
            trend: '-12%',
            up: false,
        },
    ];

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                {/* Decorative */}
                <View style={{ position: 'absolute', right: -24, top: -24, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 50, bottom: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 }}>
                    {/* Title row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                                <ChartLineUp size={22} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3 }}>Analitik</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>SIAGA Admin Panel</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <CalendarBlank size={12} color="rgba(255,255,255,0.5)" />
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{today}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
                                <Text style={{ color: '#4ade80', fontWeight: '700', fontSize: 11 }}>Live</Text>
                            </View>
                        </View>
                    </View>

                    {/* Period selector in header */}
                    <PeriodTabs active={period} onChange={setPeriod} />
                </View>
            </View>

            {/* ── SCROLLABLE CONTENT ── */}
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
            >
                {/* ── KPI CARDS 2x2 ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {KPI.map((k, i) => {
                            const IconComp = k.icon;
                            const TrendIcon = k.up ? TrendUp : TrendDown;
                            const trendColor = k.up ? SiagaColors.success : SiagaColors.danger;
                            return (
                                <View key={i} style={{
                                    width: CARD_W,
                                    backgroundColor: '#fff', borderRadius: 18, padding: 14,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: k.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={20} color={k.iconColor} weight="duotone" />
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: k.up ? '#ecfdf5' : '#fef2f2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
                                            <TrendIcon size={10} color={trendColor} weight="bold" />
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: trendColor }}>{k.trend}</Text>
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 24, fontWeight: '900', color: SiagaColors.primary, lineHeight: 28 }}>{k.value}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary, marginTop: 2 }}>{k.label}</Text>
                                    <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{k.sub}</Text>
                                </View>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* ── LAPORAN TREND CHART ── */}
                <Card>
                    <SectionHeader icon={ChartBar} title="Tren Laporan Masuk" color="#7c3aed" />
                    <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
                        <Text style={{ fontSize: 28, fontWeight: '900', color: SiagaColors.primary }}>{totalReports}</Text>
                        <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>Total laporan · {PERIOD_LABELS[period]}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <BarChart data={reportData} barColor="#7c3aed" height={BAR_CHART_H} />
                    </View>
                    {/* Peak info */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                        <View style={{ flex: 1, backgroundColor: '#f5f3ff', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: '#7c3aed' }}>
                                {reportData.reduce((p, c) => c.value > p.value ? c : p, { label: '', value: 0 }).label}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#7c3aed', fontWeight: '600', marginTop: 2 }}>Puncak Laporan</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#ecfdf5', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: SiagaColors.success }}>
                                {Math.round(totalReports / reportData.length)}
                            </Text>
                            <Text style={{ fontSize: 10, color: SiagaColors.success, fontWeight: '600', marginTop: 2 }}>Rata-rata / Periode</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#eff6ff', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: '#3b82f6' }}>
                                {Math.max(...reportData.map(d => d.value))}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: '600', marginTop: 2 }}>Tertinggi</Text>
                        </View>
                    </View>
                </Card>

                {/* ── STATUS RESOLUSI ── */}
                <Card>
                    <SectionHeader icon={ChartDonut} title="Status Resolusi" color="#7c3aed" />
                    <View style={{ gap: 12 }}>
                        {RESOLUTION_STATS.map((s, i) => (
                            <View key={i}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }} />
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{s.label}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>{s.count}</Text>
                                        <View style={{ width: 42, alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>{s.pct}%</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ height: 8, borderRadius: 4, backgroundColor: '#f1f5f9' }}>
                                    <View style={{ height: 8, borderRadius: 4, backgroundColor: s.color, width: `${s.pct}%` }} />
                                </View>
                            </View>
                        ))}
                    </View>
                    {/* Total */}
                    <View style={{
                        marginTop: 14, paddingTop: 12,
                        borderTopWidth: 1, borderTopColor: '#f1f5f9',
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>Total laporan dievaluasi</Text>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: SiagaColors.primary }}>408</Text>
                    </View>
                </Card>

                {/* ── KATEGORI LAPORAN ── */}
                <Card>
                    <SectionHeader icon={ChartPieSlice} title="Kategori Laporan" color="#7c3aed" />
                    <View style={{ gap: 10 }}>
                        {REPORT_CATEGORIES.map((cat, i) => {
                            const IconComp = cat.icon;
                            return (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${cat.color}18`, alignItems: 'center', justifyContent: 'center' }}>
                                        <IconComp size={18} color={cat.color} weight="duotone" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{cat.label}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>{cat.count}</Text>
                                                <Text style={{ fontSize: 11, color: SiagaColors.secondary, width: 34, textAlign: 'right' }}>{cat.pct}%</Text>
                                            </View>
                                        </View>
                                        <View style={{ height: 6, borderRadius: 3, backgroundColor: '#f1f5f9' }}>
                                            <View style={{ height: 6, borderRadius: 3, backgroundColor: cat.color, width: `${cat.pct}%` }} />
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* ── PERTUMBUHAN PENGGUNA ── */}
                <Card>
                    <SectionHeader icon={ChartLineUp} title="Pertumbuhan Pengguna" color="#3b82f6" />

                    {/* Legend */}
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#3b82f6' }} />
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary, fontWeight: '600' }}>Pengguna Baru</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#7c3aed' }} />
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary, fontWeight: '600' }}>Sesi Aktif</Text>
                        </View>
                    </View>

                    {/* Dual bar chart */}
                    <View style={{ alignItems: 'center' }}>
                        <BarChart
                            data={userData.map(d => ({ label: d.label, value: d.new_users }))}
                            barColor="#3b82f6"
                            height={120}
                        />
                    </View>

                    {/* Summary row */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <View style={{ flex: 1, backgroundColor: '#eff6ff', borderRadius: 12, padding: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#3b82f6' }}>
                                {userData.reduce((s, d) => s + d.new_users, 0)}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: '600', marginTop: 1 }}>Pengguna Baru</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#f5f3ff', borderRadius: 12, padding: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#7c3aed' }}>
                                {Math.max(...userData.map(d => d.active)).toLocaleString('id-ID')}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#7c3aed', fontWeight: '600', marginTop: 1 }}>Puncak Sesi Aktif</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#ecfdf5', borderRadius: 12, padding: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: SiagaColors.success }}>5.046</Text>
                            <Text style={{ fontSize: 10, color: SiagaColors.success, fontWeight: '600', marginTop: 1 }}>Total Pengguna</Text>
                        </View>
                    </View>
                </Card>

                {/* ── PLATFORM USAGE ── */}
                <Card>
                    <SectionHeader icon={Pulse} title="Platform Pengguna" color="#059669" />
                    <View style={{ gap: 14 }}>
                        {PLATFORM_STATS.map((p, i) => {
                            const IconComp = p.icon;
                            return (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center' }}>
                                        <IconComp size={22} color={p.color} weight="duotone" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>{p.label}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                                <Text style={{ fontSize: 14, fontWeight: '900', color: SiagaColors.primary }}>{p.count}</Text>
                                                <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>({p.pct}%)</Text>
                                            </View>
                                        </View>
                                        <View style={{ height: 8, borderRadius: 4, backgroundColor: '#f1f5f9' }}>
                                            <View style={{ height: 8, borderRadius: 4, backgroundColor: p.color, width: `${p.pct}%` }} />
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* ── TOP WILAYAH LAPORAN ── */}
                <Card>
                    <SectionHeader icon={MapPin} title="Wilayah Paling Aktif" color={SiagaColors.danger} action="Lihat Peta" />
                    <View style={{ gap: 10 }}>
                        {TOP_REGIONS.map((r, i) => {
                            const TrendIcon = r.up ? ArrowUp : TrendDown;
                            const changeColor = r.up ? SiagaColors.success : SiagaColors.danger;
                            const rankColors = ['#f59e0b', '#94a3b8', '#b45309', '#7c3aed', '#3b82f6'];
                            return (
                                <View key={i} style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                    paddingVertical: 10, paddingHorizontal: 12,
                                    backgroundColor: i === 0 ? '#fffbeb' : '#f8fafc',
                                    borderRadius: 12,
                                    borderWidth: i === 0 ? 1 : 0,
                                    borderColor: i === 0 ? '#fde68a' : 'transparent',
                                }}>
                                    <View style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        backgroundColor: `${rankColors[i]}22`,
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontSize: 13, fontWeight: '900', color: rankColors[i] }}>#{r.rank}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }} numberOfLines={1}>{r.name}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '900', color: SiagaColors.primary }}>{r.reports}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                            <TrendIcon size={10} color={changeColor} weight="bold" />
                                            <Text style={{ fontSize: 10, fontWeight: '700', color: changeColor }}>{r.change}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* ── JAM PUNCAK AKTIVITAS ── */}
                <Card>
                    <SectionHeader icon={Lightning} title="Jam Puncak Aktivitas" color="#d97706" />
                    <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: -6, marginBottom: 14 }}>
                        Distribusi laporan berdasarkan jam (WIB)
                    </Text>
                    {/* Heatmap bars */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 60, marginBottom: 6 }}>
                        {PEAK_HOURS.map((intensity, h) => {
                            const barH = Math.max(4, intensity * 56);
                            const alpha = Math.round(intensity * 220 + 35).toString(16).padStart(2, '0');
                            const color = intensity > 0.7 ? `#d97706${alpha}` : intensity > 0.4 ? `#7c3aed${alpha}` : `#94a3b8${alpha}`;
                            return (
                                <View key={h} style={{ flex: 1, height: barH, borderRadius: 3, backgroundColor: color }} />
                            );
                        })}
                    </View>
                    {/* Hour labels */}
                    <View style={{ flexDirection: 'row', gap: 3 }}>
                        {[0, 6, 12, 18, 23].map(h => (
                            <View key={h} style={{ flex: h === 23 ? 1 : (h === 0 ? 1 : 6), alignItems: h === 0 ? 'flex-start' : h === 23 ? 'flex-end' : 'center' }}>
                                <Text style={{ fontSize: 9, color: SiagaColors.secondary, fontWeight: '600' }}>{`${h < 10 ? '0' : ''}${h}:00`}</Text>
                            </View>
                        ))}
                    </View>
                    {/* Summary chips */}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                        <View style={{ flex: 1, backgroundColor: '#fffbeb', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: '#d97706' }}>19:00</Text>
                            <Text style={{ fontSize: 10, color: '#d97706', fontWeight: '600', marginTop: 1 }}>Jam Tersibuk</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#f5f3ff', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: '#7c3aed' }}>12:00–14:00</Text>
                            <Text style={{ fontSize: 10, color: '#7c3aed', fontWeight: '600', marginTop: 1 }}>Siesta Aktif</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#ecfdf5', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: SiagaColors.success }}>03:00</Text>
                            <Text style={{ fontSize: 10, color: SiagaColors.success, fontWeight: '600', marginTop: 1 }}>Paling Sepi</Text>
                        </View>
                    </View>
                </Card>

                {/* ── EKSPOR LAPORAN ── */}
                <View style={{ gap: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Ekspor Data</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {[
                            { label: 'Laporan PDF', sub: 'Ringkasan analitik', icon: DownloadSimple, color: SiagaColors.danger, bg: '#fef2f2' },
                            { label: 'Ekspor CSV', sub: 'Data mentah', icon: FunnelSimple, color: '#059669', bg: '#ecfdf5' },
                        ].map((btn, i) => {
                            const IconComp = btn.icon;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={{
                                        flex: 1, backgroundColor: '#fff', borderRadius: 16,
                                        padding: 14, borderWidth: 1, borderColor: '#edf2f9',
                                        flexDirection: 'row', alignItems: 'center', gap: 10,
                                        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: btn.bg, alignItems: 'center', justifyContent: 'center' }}>
                                        <IconComp size={20} color={btn.color} weight="duotone" />
                                    </View>
                                    <View>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{btn.label}</Text>
                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{btn.sub}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Auto-refresh info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
                        <ArrowClockwise size={13} color={SiagaColors.secondary} weight="bold" />
                        <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>
                            Data diperbarui otomatis setiap <Text style={{ fontWeight: '700' }}>5 menit</Text> · Tarik untuk refresh manual
                        </Text>
                    </View>
                </View>

                {/* ── FOOTER ── */}
                <View style={{ paddingTop: 8, paddingBottom: 4, alignItems: 'center', gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
                            <ChartLineUp size={13} color="#fff" weight="duotone" />
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>SIAGA Analytics</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>v1.0.0 · Data Platform Analytics · PROXOCORIS 2026</Text>
                </View>

            </ScrollView>
        </View>
    );
}
