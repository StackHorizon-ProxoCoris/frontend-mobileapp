import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ShieldCheck, Bell, Users, FileText, CheckCircle,
    Warning, XCircle, TrendUp, TrendDown, ArrowRight,
    CaretRight, Clock, ArrowClockwise, ChatText, Megaphone,
    ChartLineUp, ChartDonut, Database, Globe, Lock,
    UserGear, Buildings, Waves, RoadHorizon, Trash, Mountains, Fire,
    WarningDiamond, ClockCounterClockwise,
    HardDrives, ShieldWarning, UserCheck, UserCircleCheck,
    Fingerprint, Gear, Pulse,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/context/auth';
import { getReports, getReportStats } from '@/services/report.service';
import { getActions } from '@/services/action.service';
import { getNotifications } from '@/services/notification.service';
import { getAdminUserStats } from '@/services/admin.service';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type AlertLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
type AdminStat = {
    value: string;
    suffix?: string;
    label: string;
    sub: string;
    icon: any;
    iconColor: string;
    bg: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    trendColor: string;
};

const ALERT_STYLE: Record<AlertLevel, { text: string; bg: string }> = {
    Kritis: { text: '#fff', bg: SiagaColors.danger },
    Tinggi: { text: '#9a3412', bg: '#fed7aa' },
    Sedang: { text: '#92400e', bg: '#fef3c7' },
    Rendah: { text: '#065f46', bg: '#d1fae5' },
};

// ────────────────────────────────────────────
// Recent activity feed (static placeholder)
// ────────────────────────────────────────────
const RECENT_ACTIVITIES = [
    { icon: UserCheck, color: '#059669', bg: '#ecfdf5', text: 'Pengguna baru', highlight: 'budi.santoso@gmail.com', sub: 'Mendaftar sebagai Masyarakat · 5 menit lalu', showLine: true },
    { icon: ShieldWarning, color: SiagaColors.danger, bg: '#fef2f2', text: 'Laporan diblokir karena', highlight: 'konten melanggar', sub: 'Laporan #2301 · 20 menit lalu', showLine: true },
    { icon: Megaphone, color: '#7c3aed', bg: '#f5f3ff', text: 'Broadcast dikirim ke', highlight: 'Semua Kecamatan', sub: 'Peringatan Cuaca Ekstrem · 45 menit lalu', showLine: true },
    { icon: Database, color: SiagaColors.info, bg: '#eff6ff', text: 'Backup database', highlight: 'berhasil', sub: 'Otomatis pukul 02:00 WIB · 3 jam lalu', showLine: true },
    { icon: UserCircleCheck, color: '#d97706', bg: '#fffbeb', text: 'Akun pemerintah', highlight: 'diverifikasi', sub: 'Dinas PU Kota Bandung · 4 jam lalu', showLine: false },
];

// ────────────────────────────────────────────
// System health modules
// ────────────────────────────────────────────
const SYSTEM_HEALTH = [
    { label: 'Backend API', status: 'Online', statusColor: SiagaColors.success, value: '99.8%', sub: 'Uptime 30 hari', icon: Globe, color: '#3b82f6' },
    { label: 'Database', status: 'Sehat', statusColor: SiagaColors.success, value: '42%', sub: 'Kapasitas terpakai', icon: Database, color: '#059669' },
    { label: 'Auth Service', status: 'Online', statusColor: SiagaColors.success, value: '12 ms', sub: 'Avg latency', icon: Lock, color: '#7c3aed' },
    { label: 'Storage', status: 'Perhatian', statusColor: SiagaColors.warning, value: '78%', sub: 'Kapasitas terpakai', icon: HardDrives, color: '#d97706' },
];

// ────────────────────────────────────────────
// User role breakdown
// ────────────────────────────────────────────
const USER_ROLES = [
    { label: 'Masyarakat', count: 4820, pct: 94, color: SiagaColors.info, icon: Users },
    { label: 'Pemerintah', count: 214, pct: 4, color: '#7c3aed', icon: Buildings },
    { label: 'Admin', count: 12, pct: 0.2, color: '#d97706', icon: UserGear },
];

export default function AdminDashboardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [totalReports, setTotalReports] = useState(0);
    const [totalActions, setTotalActions] = useState(0);
    const [pendingReports, setPendingReports] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [resolvedReports, setResolvedReports] = useState(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
        ]).start();
        loadStats();
    }, []);

    async function loadStats() {
        const [statsRes, aRes, notifRes, userStatsRes] = await Promise.all([
            getReportStats(),
            getActions({ limit: 50 }),
            getNotifications(),
            getAdminUserStats(),
        ]);
        if (statsRes.success && statsRes.data) {
            setTotalReports(statsRes.data.total);
            setPendingReports(statsRes.data.pending);
            setResolvedReports(statsRes.data.resolved);
        }
        if (aRes.success && aRes.data) setTotalActions(aRes.data.length);
        if (notifRes.success && notifRes.data) setUnreadCount(notifRes.data.unreadCount);
        if (userStatsRes.success && userStatsRes.data) setTotalUsers(userStatsRes.data.total);
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const STATS: AdminStat[] = useMemo(() => [
        {
            value: String(totalUsers), label: 'Total Pengguna', sub: 'Terdaftar aktif', icon: Users,
            iconColor: '#3b82f6', bg: '#eff6ff', trend: 'up', trendValue: `${totalUsers} user`, trendColor: SiagaColors.success,
        },
        {
            value: String(totalReports), label: 'Total Laporan', sub: `${pendingReports} menunggu`, icon: FileText,
            iconColor: SiagaColors.danger, bg: '#fef2f2', trend: 'up', trendValue: `+${pendingReports} baru`, trendColor: SiagaColors.warning,
        },
        {
            value: String(totalActions), label: 'Aksi Komunitas', sub: 'Terdokumentasi', icon: CheckCircle,
            iconColor: SiagaColors.success, bg: '#ecfdf5', trend: 'up', trendValue: `${resolvedReports} selesai`, trendColor: SiagaColors.success,
        },
        {
            value: '99.8%', label: 'Uptime Sistem', sub: '30 hari terakhir', icon: Globe,
            iconColor: '#7c3aed', bg: '#f5f3ff', trend: 'neutral', trendValue: 'Stabil', trendColor: SiagaColors.secondary,
        },
    ], [totalReports, totalActions, pendingReports, totalUsers, resolvedReports]);

    // ── Moderation queue items ──
    const MOD_QUEUE = useMemo(() => [
        { title: 'Dugaan laporan palsu tentang banjir', user: 'warga_xyz123', cat: 'Banjir', level: 'Kritis' as AlertLevel, icon: Waves, iconColor: '#2563eb', bg: '#eff6ff', time: '5 menit lalu' },
        { title: 'Konten tidak pantas di komentar', user: 'anonim_444', cat: 'Komentar', level: 'Tinggi' as AlertLevel, icon: Trash, iconColor: '#059669', bg: '#ecfdf5', time: '18 menit lalu' },
        { title: 'Spam laporan jalan rusak duplikat', user: 'test_user99', cat: 'Jalan Rusak', level: 'Sedang' as AlertLevel, icon: RoadHorizon, iconColor: '#d97706', bg: '#fffbeb', time: '1 jam lalu' },
    ], []);

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                {/* Decorative circles */}
                <View style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 60, bottom: -28, width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 }}>
                    {/* Top row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={22} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: -0.3 }}>SIAGA</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' }}>Admin Panel</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
                                activeOpacity={0.7}
                                onPress={() => router.push('/notifikasi')}
                            >
                                <Bell size={20} color="rgba(255,255,255,0.8)" weight="duotone" />
                                {unreadCount > 0 && (
                                    <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: SiagaColors.danger, borderWidth: 1.5, borderColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                                        <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
                                activeOpacity={0.7}
                                onPress={() => router.push('/(admin-tabs)/settings' as any)}
                            >
                                <Gear size={20} color="rgba(255,255,255,0.8)" weight="duotone" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Profile row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{user?.initials || 'AD'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Selamat datang 👋</Text>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }} numberOfLines={1}>{user?.fullName || 'Administrator'}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Super Admin · SIAGA System</Text>
                        </View>
                        <View>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'right' }}>{today}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, justifyContent: 'flex-end' }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
                                <Text style={{ color: '#4ade80', fontWeight: '700', fontSize: 11 }}>Online</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── CONTENT ── */}
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
            >

                {/* ── CRITICAL ALERT ── */}
                {pendingReports > 0 && (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#fff', borderRadius: 18, padding: 14,
                                borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)',
                                elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
                            }}
                            activeOpacity={0.85}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                                    <WarningDiamond size={24} color={SiagaColors.danger} weight="duotone" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                        <Text style={{ color: SiagaColors.danger, fontWeight: '800', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Butuh Perhatian</Text>
                                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: SiagaColors.danger }}>
                                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 10 }}>{pendingReports}</Text>
                                        </View>
                                    </View>
                                    <Text style={{ color: SiagaColors.primary, fontWeight: '800', fontSize: 15 }}>Laporan Menunggu Tinjauan</Text>
                                    <Text style={{ color: SiagaColors.secondary, fontSize: 13, marginTop: 2 }}>Ada laporan yang belum diproses dan memerlukan tindakan segera.</Text>
                                </View>
                                <CaretRight size={14} color={SiagaColors.secondary} style={{ marginTop: 12 }} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* ── QUICK ACTIONS GRID (TOP) ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Aksi Admin Cepat</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {[
                            { label: 'Kelola Pengguna', icon: Users, color: '#3b82f6', bg: '#eff6ff', route: '/(admin-tabs)/users' },
                            { label: 'Buat Akun Gov', icon: Buildings, color: '#d97706', bg: '#fffbeb', route: '/(admin-tabs)/users' },
                            { label: 'Kelola Laporan', icon: FileText, color: SiagaColors.danger, bg: '#fef2f2', route: '/(admin-tabs)/moderation' },
                        ].map((action, i) => {
                            const IconComp = action.icon;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={{
                                        width: (width - 32 - 16) / 3, // 32 for screen padding, 16 for gaps between 3 items (2 gaps * 8)
                                        backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8,
                                        alignItems: 'center', gap: 8,
                                        borderWidth: 1, borderColor: '#edf2f9',
                                        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
                                    }}
                                    activeOpacity={0.8}
                                    onPress={() => router.push(action.route as any)}
                                >
                                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: action.bg, alignItems: 'center', justifyContent: 'center' }}>
                                        <IconComp size={22} color={action.color} weight="duotone" />
                                    </View>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.primary, textAlign: 'center', lineHeight: 14 }} numberOfLines={2}>
                                        {action.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* ── STAT CARDS 2x2 ── */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {STATS.map((stat, i) => {
                        const IconComp = stat.icon;
                        const TrendIcon = stat.trend === 'up' ? TrendUp : stat.trend === 'down' ? TrendDown : ArrowClockwise;
                        return (
                            <Animated.View key={i} style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: CARD_W }}>
                                <View style={{
                                    backgroundColor: '#fff', borderRadius: 18, padding: 14,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: stat.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={22} color={stat.iconColor} weight="duotone" />
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                            <TrendIcon size={11} color={stat.trendColor} weight="bold" />
                                            <Text style={{ fontSize: 10, fontWeight: '700', color: stat.trendColor }}>{stat.trendValue}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                                        <Text style={{ fontSize: 24, fontWeight: '900', color: SiagaColors.primary, lineHeight: 28 }}>{stat.value}</Text>
                                        {stat.suffix && <Text style={{ fontSize: 13, color: SiagaColors.secondary }}>{stat.suffix}</Text>}
                                    </View>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary, marginTop: 2 }}>{stat.label}</Text>
                                    <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{stat.sub}</Text>
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* ── SYSTEM HEALTH ── */}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Pulse size={20} color="#7c3aed" weight="duotone" />
                        <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Status Sistem</Text>
                    </View>
                    <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#edf2f9', overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }}>
                        {SYSTEM_HEALTH.map((item, i) => {
                            const IconComp = item.icon;
                            return (
                                <View key={i} style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14,
                                    borderBottomWidth: i < SYSTEM_HEALTH.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc',
                                }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${item.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                                        <IconComp size={20} color={item.color} weight="duotone" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>{item.label}</Text>
                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{item.sub}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 3 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>{item.value}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.statusColor }} />
                                            <Text style={{ fontSize: 11, fontWeight: '700', color: item.statusColor }}>{item.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* ── USER BREAKDOWN ── */}
                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <ChartDonut size={20} color="#7c3aed" weight="duotone" />
                            <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Distribusi Pengguna</Text>
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} activeOpacity={0.7}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed' }}>Detail</Text>
                            <CaretRight size={13} color="#7c3aed" weight="bold" />
                        </TouchableOpacity>
                    </View>

                    {/* Donut chart placeholder + legend */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Svg width={100} height={100} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
                                <Circle cx={50} cy={50} r={40} fill="none" stroke="#f1f5f9" strokeWidth={14} />
                                {/* Masyarakat 94% */}
                                <Circle cx={50} cy={50} r={40} fill="none" stroke={SiagaColors.info} strokeWidth={14} strokeDasharray="251.3" strokeDashoffset="15" strokeLinecap="butt" />
                                {/* Pemerintah 4% */}
                                <Circle cx={50} cy={50} r={40} fill="none" stroke="#7c3aed" strokeWidth={14} strokeDasharray="251.3" strokeDashoffset="241" strokeLinecap="butt" />
                            </Svg>
                            <View style={{ position: 'absolute', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: SiagaColors.primary }}>5K+</Text>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary }}>Total</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, gap: 10 }}>
                            {USER_ROLES.map((role, i) => {
                                const IconComp = role.icon;
                                return (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${role.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={16} color={role.color} weight="duotone" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{role.label}</Text>
                                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>{role.count.toLocaleString('id-ID')}</Text>
                                            </View>
                                            <View style={{ height: 4, borderRadius: 2, backgroundColor: '#f1f5f9', marginTop: 4 }}>
                                                <View style={{ height: 4, borderRadius: 2, backgroundColor: role.color, width: `${role.pct}%` }} />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* ── MODERATION QUEUE ── */}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <ShieldWarning size={20} color="#7c3aed" weight="duotone" />
                            <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Antrian Moderasi</Text>
                            <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#fef2f2' }}>
                                <Text style={{ fontSize: 11, fontWeight: '800', color: SiagaColors.danger }}>{MOD_QUEUE.length}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} activeOpacity={0.7}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed' }}>Semua</Text>
                            <CaretRight size={13} color="#7c3aed" weight="bold" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ gap: 10 }}>
                        {MOD_QUEUE.map((item, i) => {
                            const IconComp = item.icon;
                            const alertStyle = ALERT_STYLE[item.level];
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={{
                                        backgroundColor: '#fff', borderRadius: 18, padding: 14,
                                        borderWidth: 1, borderColor: '#edf2f9',
                                        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={24} color={item.iconColor} weight="duotone" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary, flex: 1, marginRight: 8 }} numberOfLines={1}>{item.title}</Text>
                                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: alertStyle.bg }}>
                                                    <Text style={{ fontSize: 10, fontWeight: '800', color: alertStyle.text }}>{item.level}</Text>
                                                </View>
                                            </View>
                                            <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>
                                                <Text style={{ fontWeight: '600' }}>@{item.user}</Text> · {item.cat}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={12} color={SiagaColors.secondary} />
                                                    <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{item.time}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fef2f2' }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <XCircle size={13} color={SiagaColors.danger} weight="fill" />
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.danger }}>Tolak</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f0fdf4' }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <CheckCircle size={13} color={SiagaColors.success} weight="fill" />
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.success }}>Setujui</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── RECENT ACTIVITY FEED ── */}
                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <ClockCounterClockwise size={20} color="#7c3aed" weight="duotone" />
                            <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Log Aktivitas</Text>
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} activeOpacity={0.7}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed' }}>Semua</Text>
                            <CaretRight size={13} color="#7c3aed" weight="bold" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ gap: 12 }}>
                        {RECENT_ACTIVITIES.map((act, i) => {
                            const IconComp = act.icon;
                            return (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: act.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={18} color={act.color} weight="duotone" />
                                        </View>
                                        {act.showLine && <View style={{ width: 1, flex: 1, backgroundColor: '#f1f5f9', marginTop: 4, minHeight: 12 }} />}
                                    </View>
                                    <View style={{ flex: 1, paddingBottom: act.showLine ? 12 : 0 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '600', color: SiagaColors.primary }}>
                                            {act.text} <Text style={{ color: act.color, fontWeight: '800' }}>{act.highlight}</Text>
                                        </Text>
                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>{act.sub}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>



                {/* ── FOOTER ── */}
                <View style={{ paddingVertical: 8, alignItems: 'center', gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={13} color="#fff" weight="duotone" />
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>SIAGA Admin Panel</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>v1.0.0 · Super Admin Access · PROXOCORIS 2026</Text>
                </View>

            </ScrollView>
        </View>
    );
}
