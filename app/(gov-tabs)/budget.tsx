import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
    ChartPieSlice, Warning, CheckCircle, CaretRight, ArrowRight,
    RoadHorizon, Tree, Drop, Heartbeat, Briefcase,
    TrendUp, TrendDown, Clock, Buildings, ArrowClockwise,
    WarningDiamond, SealCheck, HourglassMedium, Info,
    ChatText, Megaphone,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import {
  getBudgetProjects, getBudgetDinas,
  type BudgetProject, type BudgetDinas, type BudgetSummary, type FilterCounts,
} from '@/services/budget.service';

const { width } = Dimensions.get('window');

// Icon mapping — API returns string names, map to Phosphor components
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  RoadHorizon, Tree, Drop, Heartbeat, Briefcase, Buildings,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjectStatus = 'Normal' | 'Anomali' | 'Selesai' | 'Tunda';
type FilterKey = 'Semua' | 'Normal' | 'Anomali' | 'Selesai';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { text: string; bg: string; icon: any; label: string }> = {
    Normal: { text: SiagaColors.success, bg: '#d1fae5', icon: SealCheck, label: 'Normal' },
    Anomali: { text: '#92400e', bg: '#fef3c7', icon: Warning, label: 'Anomali' },
    Selesai: { text: SiagaColors.info, bg: '#eff6ff', icon: CheckCircle, label: 'Selesai' },
    Tunda: { text: SiagaColors.secondary, bg: '#f1f5f9', icon: HourglassMedium, label: 'Ditunda' },
};

const ACTIVITIES = [
    {
        text: 'Laporan #1042 ditandai',
        highlight: 'Selesai',
        highlightColor: SiagaColors.success,
        sub: 'Jalan Rusak Jl. Braga · 15 menit lalu',
        icon: CheckCircle,
        iconColor: SiagaColors.success,
        bgColor: '#ecfdf5',
        showLine: true,
    },
    {
        text: 'Respons dikirim ke Laporan',
        highlight: '#1038',
        highlightColor: SiagaColors.info,
        sub: 'Banjir Kec. Dayeuhkolot · 1 jam lalu',
        icon: ChatText,
        iconColor: SiagaColors.info,
        bgColor: '#eff6ff',
        showLine: true,
    },
    {
        text: 'Status diubah ke',
        highlight: 'Diproses',
        highlightColor: SiagaColors.warning,
        sub: 'Sampah Gg. Melati · 2 jam lalu',
        icon: ArrowClockwise,
        iconColor: SiagaColors.warning,
        bgColor: '#fffbeb',
        showLine: true,
    },
    {
        text: 'Broadcast ke',
        highlight: 'Kec. Coblong',
        highlightColor: '#7c3aed',
        sub: 'Peringatan Cuaca · 3 jam lalu',
        icon: Megaphone,
        iconColor: '#7c3aed',
        bgColor: '#f5f3ff',
        showLine: false,
    },
];



// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRp = (n: number): string => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}Jt`;
    return `Rp ${n.toLocaleString()}`;
};

const DONUT_SIZE = 120;
const DONUT_R = 48;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
    value, label, sub, color, bg, IconComp, animate,
}: {
    value: string; label: string; sub: string;
    color: string; bg: string;
    IconComp: any; animate: Animated.Value;
}) {
    return (
        <Animated.View
            style={{
                opacity: animate,
                width: (width - 48) / 2,
                backgroundColor: '#fff',
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: '#edf2f9',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            }}
        >
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <IconComp size={20} color={color} weight="duotone" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: SiagaColors.primary, lineHeight: 24 }}>{value}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color }}>{sub}</Text>
            </View>
        </Animated.View>
    );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
    return (
        <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
            <View style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: `${Math.max(pct, 3)}%` }} />
        </View>
    );
}

function AnomalyBanner({ anomaliCount, anomaliProjects }: { anomaliCount: number; anomaliProjects: BudgetProject[] }) {
    return (
        <View style={{
            borderRadius: 18, overflow: 'hidden',
            borderWidth: 1, borderColor: 'rgba(231,76,60,0.2)',
            backgroundColor: '#fff',
            elevation: 2, shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08, shadowRadius: 8,
        }}>
            <View style={{ height: 4, backgroundColor: SiagaColors.danger }} />
            <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                        <WarningDiamond size={19} color={SiagaColors.danger} weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.danger, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Perhatian Khusus
                        </Text>
                        <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 1 }}>
                            {anomaliCount} proyek terdeteksi anomali anggaran
                        </Text>
                    </View>
                    <View style={{ backgroundColor: SiagaColors.danger, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>{anomaliCount}</Text>
                    </View>
                </View>
                {anomaliProjects.map((p: BudgetProject, i: number) => (
                    <View key={p.id} style={{
                        flexDirection: 'row', alignItems: 'center', gap: 8,
                        paddingVertical: 8,
                        borderTopWidth: i > 0 ? 1 : 0,
                        borderTopColor: '#fef2f2',
                    }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: SiagaColors.danger }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }} numberOfLines={1}>
                                {p.title}
                            </Text>
                            <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 1 }}>
                                {p.anomali_note}
                            </Text>
                        </View>
                        <CaretRight size={14} color={SiagaColors.secondary} weight="bold" />
                    </View>
                ))}
            </View>
        </View>
    );
}

function ProjectCard({ project }: { project: BudgetProject }) {
    const IconComp = ICON_MAP[project.icon] || Briefcase;
    const st = STATUS_CONFIG[project.status];
    const StIcon = st.icon;
    const isAnomali = project.status === 'Anomali';
    const isSelesai = project.status === 'Selesai';
    const gap = project.realisasi - project.fisik;

    const barColor = isSelesai
        ? SiagaColors.success
        : isAnomali
            ? SiagaColors.danger
            : project.fisik >= 60
                ? SiagaColors.success
                : project.fisik >= 40
                    ? '#f59e0b'
                    : SiagaColors.danger;

    return (
        <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: isAnomali ? 'rgba(231,76,60,0.2)' : isSelesai ? 'rgba(39,174,96,0.2)' : '#edf2f9',
            elevation: isAnomali ? 3 : 1,
            shadowColor: isAnomali ? SiagaColors.danger : '#000',
            shadowOffset: { width: 0, height: isAnomali ? 3 : 1 },
            shadowOpacity: isAnomali ? 0.1 : 0.04,
            shadowRadius: isAnomali ? 8 : 3,
        }}>
            {/* Accent top bar */}
            <View style={{ height: 3, backgroundColor: isAnomali ? SiagaColors.danger : isSelesai ? SiagaColors.success : SiagaColors.primary }} />

            <View style={{ padding: 14 }}>
                {/* Header row */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: project.bg_color, alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={24} color={project.icon_color} weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {project.id}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary, lineHeight: 17 }} numberOfLines={2}>
                            {project.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            <Buildings size={12} color={SiagaColors.secondary} weight="duotone" />
                            <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>
                                {project.org} · {project.kec}
                            </Text>
                        </View>
                    </View>
                    {/* Status badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: st.bg }}>
                        <StIcon size={11} color={st.text} weight="fill" />
                        <Text style={{ fontSize: 9, fontWeight: '800', color: st.text }}>{st.label}</Text>
                    </View>
                </View>

                {/* Metrics 3-grid */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {[
                        { label: 'Anggaran', value: formatRp(project.budget), color: SiagaColors.primary, bg: '#f8fafd' },
                        { label: 'Realisasi', value: `${project.realisasi}%`, color: project.realisasi >= 80 ? SiagaColors.danger : project.realisasi >= 60 ? '#f59e0b' : SiagaColors.success, bg: '#f8fafd' },
                        { label: 'Fisik', value: `${project.fisik}%`, color: project.fisik >= 70 ? SiagaColors.success : project.fisik >= 50 ? '#f59e0b' : SiagaColors.danger, bg: '#f8fafd' },
                    ].map((m, i) => (
                        <View key={i} style={{ flex: 1, backgroundColor: '#f8fafd', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 3 }}>
                                {m.label}
                            </Text>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: m.color }}>{m.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Anomali gap alert */}
                {isAnomali && gap > 0 && (
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        backgroundColor: '#fef2f2', borderRadius: 10,
                        paddingHorizontal: 10, paddingVertical: 8, marginBottom: 12,
                    }}>
                        <Info size={15} color={SiagaColors.danger} weight="duotone" />
                        <Text style={{ flex: 1, fontSize: 12, color: '#9f1239', fontWeight: '600' }}>
                            {project.anomali_note || `Gap Realisasi vs Fisik: ${gap}%`}
                        </Text>
                    </View>
                )}

                {/* Progress bar fisik */}
                <View style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={{ fontSize: 12, color: SiagaColors.secondary, fontWeight: '600' }}>Progress Fisik</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: barColor }}>{project.fisik}%</Text>
                    </View>
                    <View style={{ height: 7, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                        <View style={{ height: '100%', borderRadius: 5, backgroundColor: barColor, width: `${project.fisik}%` }} />
                    </View>
                </View>

                {/* Footer row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color={SiagaColors.secondary} weight="duotone" />
                        <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>
                            Deadline: <Text style={{ fontWeight: '700', color: isAnomali && project.deadline === 'Feb 2026' ? SiagaColors.danger : SiagaColors.primary }}>{project.deadline}</Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 4,
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                            backgroundColor: isAnomali ? SiagaColors.danger : SiagaColors.primary,
                        }}
                        onPress={() => {
                            // Ideally navigate to project detail, fallback to action-detail
                            const router = require('expo-router').useRouter();
                            router.push('/action-detail');
                        }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Detail</Text>
                        <ArrowRight size={12} color="#fff" weight="bold" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GovBudgetScreen() {
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState<FilterKey>('Semua');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    // API state
    const [projects, setProjects] = useState<BudgetProject[]>([]);
    const [dinasData, setDinasData] = useState<BudgetDinas[]>([]);
    const [summary, setSummary] = useState<BudgetSummary>({ totalApbd: 0, totalTerserap: 0, totalSisa: 0, pctSerap: 0, anomaliCount: 0, totalProjects: 0 });
    const [filterCounts, setFilterCounts] = useState<FilterCounts>({ Semua: 0, Normal: 0, Anomali: 0, Selesai: 0 });

    useEffect(() => {
        async function load() {
            const [projResult, dinasResult] = await Promise.all([
                getBudgetProjects(),
                getBudgetDinas(),
            ]);
            if (projResult.success && projResult.data) {
                setProjects(projResult.data.projects);
                setSummary(projResult.data.summary);
                setFilterCounts(projResult.data.filterCounts);
            }
            if (dinasResult.success && dinasResult.data) {
                setDinasData(dinasResult.data);
            }
        }
        load();
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    const filteredProjects = projects.filter(p =>
        activeFilter === 'Semua' ? true : p.status === activeFilter
    );

    const FILTER_TABS: { key: FilterKey; count: number }[] = [
        { key: 'Semua', count: filterCounts.Semua },
        { key: 'Normal', count: filterCounts.Normal },
        { key: 'Anomali', count: filterCounts.Anomali },
        { key: 'Selesai', count: filterCounts.Selesai },
    ];

    // Donut
    const dashOffset = DONUT_CIRC * (1 - summary.pctSerap / 100);

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ──────────────────────────────────────────────── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
                {/* Decorative */}
                <View style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <View style={{ position: 'absolute', left: -30, bottom: -30, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12 }}>
                    {/* Top row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: SiagaColors.info, alignItems: 'center', justifyContent: 'center' }}>
                                <ChartPieSlice size={21} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>Budget Watch</Text>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                    APBD 2026 · Q1
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ArrowClockwise size={19} color="rgba(255,255,255,0.75)" weight="duotone" />
                            </TouchableOpacity>
                            {summary.anomaliCount > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(231,76,60,0.2)', borderWidth: 1, borderColor: 'rgba(231,76,60,0.35)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
                                    <WarningDiamond size={15} color="#fca5a5" weight="fill" />
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#fca5a5' }}>{summary.anomaliCount} Anomali</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Period + updated info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: SiagaColors.success }} />
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                            Periode: <Text style={{ color: '#fff', fontWeight: '700' }}>Jan — Mar 2026</Text>
                        </Text>
                        <View style={{ flex: 1 }} />
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Update: 25 Feb 2026</Text>
                    </View>
                </View>
            </View>

            {/* ── SCROLLABLE CONTENT ──────────────────────────────────── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
            >
                {/* ── ANOMALI BANNER ────────────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <AnomalyBanner anomaliCount={summary.anomaliCount} anomaliProjects={projects.filter(p => p.status === 'Anomali')} />
                </Animated.View>

                {/* ── STAT CARDS 2×2 ───────────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>
                        Ringkasan Anggaran
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        <SummaryCard
                            value={formatRp(summary.totalApbd)}
                            label="Total APBD"
                            sub="Tahun 2026"
                            color={SiagaColors.primary}
                            bg={SiagaColors.surface}
                            IconComp={ChartPieSlice}
                            animate={fadeAnim}
                        />
                        <SummaryCard
                            value={formatRp(summary.totalTerserap)}
                            label="Terserap"
                            sub={`${summary.pctSerap}% dari total`}
                            color={SiagaColors.success}
                            bg="#ecfdf5"
                            IconComp={TrendUp}
                            animate={fadeAnim}
                        />
                        <SummaryCard
                            value={formatRp(summary.totalSisa)}
                            label="Sisa Anggaran"
                            sub={`${100 - summary.pctSerap}% belum terserap`}
                            color={SiagaColors.secondary}
                            bg="#f1f5f9"
                            IconComp={TrendDown}
                            animate={fadeAnim}
                        />
                        <SummaryCard
                            value={`${summary.anomaliCount}`}
                            label="Proyek Anomali"
                            sub="Gap > 15%"
                            color={SiagaColors.danger}
                            bg="#fef2f2"
                            IconComp={WarningDiamond}
                            animate={fadeAnim}
                        />
                    </View>
                </Animated.View>

                {/* ── DONUT CHART ───────────────────────────────────── */}
                <View style={{
                    backgroundColor: '#fff', borderRadius: 20, padding: 16,
                    borderWidth: 1, borderColor: '#edf2f9',
                    elevation: 2, shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: SiagaColors.info }} />
                        <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Serapan Anggaran Keseluruhan</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                        {/* Donut SVG */}
                        <View style={{ width: DONUT_SIZE, height: DONUT_SIZE, alignItems: 'center', justifyContent: 'center' }}>
                            <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox="0 0 120 120" style={{ transform: [{ rotate: '-90deg' }] }}>
                                <Circle cx={60} cy={60} r={DONUT_R} fill="none" stroke="#edf2f9" strokeWidth={12} />
                                <Circle
                                    cx={60} cy={60} r={DONUT_R} fill="none"
                                    stroke={SiagaColors.info}
                                    strokeWidth={12}
                                    strokeDasharray={DONUT_CIRC}
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                />
                                {/* Anomali segment */}
                                <Circle
                                    cx={60} cy={60} r={DONUT_R} fill="none"
                                    stroke={SiagaColors.danger}
                                    strokeWidth={12}
                                    strokeDasharray={`${DONUT_CIRC * 0.12} ${DONUT_CIRC}`}
                                    strokeDashoffset={-DONUT_CIRC * (summary.pctSerap / 100 - 0.12)}
                                    strokeLinecap="round"
                                />
                            </Svg>
                            <View style={{ position: 'absolute', alignItems: 'center' }}>
                                <Text style={{ fontSize: 22, fontWeight: '900', color: SiagaColors.primary }}>{summary.pctSerap}%</Text>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 1 }}>Terserap</Text>
                            </View>
                        </View>

                        {/* Legend */}
                        <View style={{ flex: 1, gap: 10 }}>
                            {[
                                { label: 'Terserap Normal', value: `${Math.max(0, summary.pctSerap - 12)}%`, color: SiagaColors.info },
                                { label: 'Terserap Anomali', value: '12%', color: SiagaColors.danger },
                                { label: 'Belum Terserap', value: `${100 - summary.pctSerap}%`, color: '#edf2f9', textColor: SiagaColors.secondary },
                            ].map((item, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color, borderWidth: item.color === '#edf2f9' ? 1 : 0, borderColor: '#cbd5e1' }} />
                                        <Text style={{ fontSize: 13, color: SiagaColors.secondary }}>{item.label}</Text>
                                    </View>
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: item.textColor ?? SiagaColors.primary }}>{item.value}</Text>
                                </View>
                            ))}

                            <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: SiagaColors.secondary }}>Total APBD</Text>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>{formatRp(summary.totalApbd)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ── SERAPAN PER DINAS ─────────────────────────────── */}
                <View style={{
                    backgroundColor: '#fff', borderRadius: 20, padding: 16,
                    borderWidth: 1, borderColor: '#edf2f9',
                    elevation: 2, shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: SiagaColors.success }} />
                        <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Serapan per Dinas</Text>
                    </View>

                    <View style={{ gap: 12 }}>
                        {dinasData.map((d, i) => {
                            return (
                                <View key={i}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        {/* Avatar */}
                                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: d.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 12, fontWeight: '800', color: d.color }}>{d.short}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }} numberOfLines={1}>{d.name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>{d.budget}</Text>
                                                    <Text style={{ fontSize: 14, fontWeight: '800', color: d.color }}>{d.serap}%</Text>
                                                </View>
                                            </View>
                                            <ProgressBar pct={d.serap} color={d.color} />
                                        </View>
                                    </View>
                                    {i < dinasData.length - 1 && (
                                        <View style={{ height: 1, backgroundColor: '#f8fafd', marginLeft: 42 }} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* ── DAFTAR PROYEK ─────────────────────────────────── */}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#7c3aed' }} />
                            <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Daftar Proyek</Text>
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: SiagaColors.secondary }}>{filteredProjects.length} proyek</Text>
                    </View>

                    {/* Filter tabs */}
                    <ScrollView
                        horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 6, marginBottom: 12 }}
                    >
                        {FILTER_TABS.map(tab => {
                            const isActive = activeFilter === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => setActiveFilter(tab.key)}
                                    activeOpacity={0.75}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 5,
                                        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                                        backgroundColor: isActive ? SiagaColors.primary : '#fff',
                                        borderWidth: 1,
                                        borderColor: isActive ? SiagaColors.primary : '#edf2f9',
                                        elevation: isActive ? 2 : 0,
                                        shadowColor: SiagaColors.primary,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: isActive ? 0.15 : 0,
                                        shadowRadius: 4,
                                    }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: isActive ? '#fff' : SiagaColors.secondary }}>
                                        {tab.key}
                                    </Text>
                                    <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }}>
                                        <Text style={{ fontSize: 10, fontWeight: '800', color: isActive ? '#fff' : SiagaColors.secondary }}>
                                            {tab.count}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Cards */}
                    <View style={{ gap: 12 }}>
                        {filteredProjects.map(p => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </View>
                </View>

                <View style={{
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#edf2f9',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 5,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#7c3aed' }} />
                            <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Aktivitas Terkini</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f8f5ff' }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#7c3aed' }}>Audit Trail</Text>
                        </View>
                    </View>

                    <View style={{ gap: 4 }}>
                        {ACTIVITIES.map((activity, index) => {
                            const ActivityIcon = activity.icon;
                            return (
                                <View key={`${activity.text}-${index}`} style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 14,
                                            backgroundColor: activity.bgColor,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <ActivityIcon size={20} color={activity.iconColor} weight="duotone" />
                                        </View>
                                        {activity.showLine && (
                                            <View style={{ width: 1, flex: 1, backgroundColor: '#e2e8f0', marginVertical: 6 }} />
                                        )}
                                    </View>

                                    <View style={{ flex: 1, paddingTop: 3, paddingBottom: 14 }}>
                                        <Text style={{ fontSize: 13, color: SiagaColors.primary, lineHeight: 20 }}>
                                            {activity.text}{' '}
                                            <Text style={{ fontWeight: '800', color: activity.highlightColor }}>
                                                {activity.highlight}
                                            </Text>
                                        </Text>
                                        <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 2 }}>
                                            {activity.sub}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* ── FOOTER NOTE ──────────────────────────────────── */}
                <View style={{ alignItems: 'center', paddingTop: 4 }}>
                    <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>
                        Data diperbarui dari SIPD · 25 Feb 2026 · 18:00 WIB
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
