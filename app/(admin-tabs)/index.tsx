import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Dimensions,
    RefreshControl, Image, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Bell, Users, FileText, CheckCircle, TrendUp,
    CaretRight, Clock, ChartDonut, Database, Globe,
    Buildings, Gear, Pulse, WarningDiamond, ShieldWarning,
    ClockCounterClockwise, UserGear, Fingerprint, Waves, RoadHorizon,
    Trash, Mountains, Fire, Leaf, Tree, ShieldCheck, UserCheck,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import {
    getAdminDashboard,
    type AdminActivityLogItem,
    type AdminDashboardData,
    type AdminModerationQueueItem,
    type AdminSystemStatusItem,
} from '@/services/admin.service';

const { width } = Dimensions.get('window');
const CARD_W = (width - 44) / 2;

type AdminStat = {
    value: string;
    label: string;
    sub: string;
    icon: any;
    iconColor: string;
    bg: string;
    trendValue: string;
    trendColor: string;
};

const ACTIVITY_ICON_MAP: Record<string, any> = {
    UserCheck,
    ShieldCheck,
    CheckCircle,
    Clock,
    FileText,
    Buildings,
    UserGear,
    Waves,
    RoadHorizon,
    Trash,
    Mountains,
    Fire,
    Leaf,
    Tree,
    Users,
};

const SYSTEM_ICON_MAP: Record<AdminSystemStatusItem['key'], { icon: any; color: string }> = {
    backend: { icon: Globe, color: '#3b82f6' },
    database: { icon: Database, color: '#059669' },
    accounts: { icon: Fingerprint, color: '#7c3aed' },
    moderation: { icon: ShieldWarning, color: '#d97706' },
};

const ROLE_CONFIG = [
    { key: 'user' as const, label: 'Masyarakat', color: SiagaColors.info },
    { key: 'pemerintah' as const, label: 'Pemerintah', color: '#7c3aed' },
    { key: 'admin' as const, label: 'Admin', color: '#d97706' },
];

function getTrendLabel(value: number, unit: string) {
    return `${value.toLocaleString('id-ID')} ${unit}`;
}

function getActivityRoute(item: AdminActivityLogItem) {
    if (!item.refId || !item.targetType) return null;
    if (item.targetType === 'action') {
        return { pathname: '/action-detail' as any, params: { id: item.refId } };
    }
    if (item.targetType === 'report') {
        return { pathname: '/moderasi-detail' as any, params: { id: item.refId } };
    }
    return null;
}

export default function AdminDashboardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
        ]).start();
        loadDashboard();
    }, []);

    async function loadDashboard() {
        const result = await getAdminDashboard();
        if (result.success && result.data) {
            setDashboard(result.data);
        }
        setLoading(false);
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    };

    const summary = dashboard?.summary;
    const stats: AdminStat[] = useMemo(() => {
        if (!summary || !dashboard) return [];
        return [
            {
                value: summary.totalUsers.toLocaleString('id-ID'),
                label: 'Total Pengguna',
                sub: 'Akun aktif terdaftar',
                icon: Users,
                iconColor: '#3b82f6',
                bg: '#eff6ff',
                trendValue: getTrendLabel(dashboard.userStats.byRole.pemerintah, 'gov'),
                trendColor: SiagaColors.info,
            },
            {
                value: summary.totalReports.toLocaleString('id-ID'),
                label: 'Total Laporan',
                sub: `${summary.pendingReports} menunggu review`,
                icon: FileText,
                iconColor: SiagaColors.danger,
                bg: '#fef2f2',
                trendValue: getTrendLabel(summary.verifiedReports + summary.inProgressReports, 'diproses'),
                trendColor: '#d97706',
            },
            {
                value: summary.totalActions.toLocaleString('id-ID'),
                label: 'Aksi Komunitas',
                sub: 'Tercatat di database',
                icon: CheckCircle,
                iconColor: SiagaColors.success,
                bg: '#ecfdf5',
                trendValue: getTrendLabel(summary.resolvedReports, 'laporan selesai'),
                trendColor: SiagaColors.success,
            },
            {
                value: summary.pendingReports.toLocaleString('id-ID'),
                label: 'Butuh Perhatian',
                sub: 'Antrian moderasi saat ini',
                icon: WarningDiamond,
                iconColor: '#d97706',
                bg: '#fffbeb',
                trendValue: `${summary.unreadNotifications} notifikasi`,
                trendColor: '#7c3aed',
            },
        ];
    }, [dashboard, summary]);

    const userBreakdown = useMemo(() => {
        const total = dashboard?.userStats.total || 0;
        return ROLE_CONFIG.map((role) => {
            const count = dashboard?.userStats.byRole[role.key] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return { ...role, count, pct };
        });
    }, [dashboard]);

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 60, bottom: -28, width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image source={require('@/assets/images/logo.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
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
                                {(summary?.unreadNotifications || 0) > 0 && (
                                    <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: SiagaColors.danger, borderWidth: 1.5, borderColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                                        <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>
                                            {(summary?.unreadNotifications || 0) > 9 ? '9+' : summary?.unreadNotifications}
                                        </Text>
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

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{user?.initials || 'AD'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Selamat datang</Text>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }} numberOfLines={1}>{user?.fullName || 'Administrator'}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Super Admin · Dashboard terhubung database</Text>
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

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
            >
                {loading ? (
                    <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <ActivityIndicator size="large" color="#7c3aed" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Memuat dashboard admin...</Text>
                    </View>
                ) : (
                    <>
                        {(summary?.pendingReports || 0) > 0 && (
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#fff', borderRadius: 18, padding: 14,
                                        borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)',
                                        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
                                    }}
                                    activeOpacity={0.85}
                                    onPress={() => router.push('/(admin-tabs)/moderation' as any)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                                            <WarningDiamond size={24} color={SiagaColors.danger} weight="duotone" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                                <Text style={{ color: SiagaColors.danger, fontWeight: '800', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Butuh Perhatian</Text>
                                                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: SiagaColors.danger }}>
                                                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 10 }}>{summary?.pendingReports}</Text>
                                                </View>
                                            </View>
                                            <Text style={{ color: SiagaColors.primary, fontWeight: '800', fontSize: 15 }}>Laporan Menunggu Tinjauan</Text>
                                            <Text style={{ color: SiagaColors.secondary, fontSize: 13, marginTop: 2 }}>Buka antrian moderasi untuk melihat detail laporan yang harus diproses.</Text>
                                        </View>
                                        <CaretRight size={14} color={SiagaColors.secondary} style={{ marginTop: 12 }} />
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Aksi Admin Cepat</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[
                                    { label: 'Kelola Pengguna', icon: Users, color: '#3b82f6', bg: '#eff6ff', onPress: () => router.push('/(admin-tabs)/users' as any) },
                                    {
                                        label: 'Buat Akun Gov',
                                        icon: Buildings,
                                        color: '#d97706',
                                        bg: '#fffbeb',
                                        onPress: () => router.push({ pathname: '/tambah-pengguna' as any, params: { role: 'Pemerintah' } }),
                                    },
                                    { label: 'Kelola Laporan', icon: FileText, color: SiagaColors.danger, bg: '#fef2f2', onPress: () => router.push('/(admin-tabs)/moderation' as any) },
                                ].map((action, i) => {
                                    const IconComp = action.icon;
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={{
                                                width: (width - 48) / 3,
                                                backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8,
                                                alignItems: 'center', gap: 8,
                                                borderWidth: 1, borderColor: '#edf2f9',
                                                elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
                                            }}
                                            activeOpacity={0.8}
                                            onPress={action.onPress}
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

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {stats.map((stat, i) => {
                                const IconComp = stat.icon;
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
                                                    <TrendUp size={11} color={stat.trendColor} weight="bold" />
                                                    <Text style={{ fontSize: 10, fontWeight: '700', color: stat.trendColor }}>{stat.trendValue}</Text>
                                                </View>
                                            </View>
                                            <Text style={{ fontSize: 24, fontWeight: '900', color: SiagaColors.primary, lineHeight: 28 }}>{stat.value}</Text>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary, marginTop: 2 }}>{stat.label}</Text>
                                            <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{stat.sub}</Text>
                                        </View>
                                    </Animated.View>
                                );
                            })}
                        </View>

                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Pulse size={20} color="#7c3aed" weight="duotone" />
                                <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Status Sistem</Text>
                            </View>
                            <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#edf2f9', overflow: 'hidden' }}>
                                {(dashboard?.systemStatus || []).map((item, i) => {
                                    const iconConfig = SYSTEM_ICON_MAP[item.key];
                                    const IconComp = iconConfig.icon;
                                    const statusColor =
                                        item.status === 'Perhatian' ? '#d97706' :
                                            item.status === 'Stabil' || item.status === 'Online' || item.status === 'Tersambung' || item.status === 'Aktif' ? SiagaColors.success :
                                                SiagaColors.secondary;

                                    return (
                                        <View
                                            key={item.key}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14,
                                                borderBottomWidth: i < (dashboard?.systemStatus.length || 0) - 1 ? 1 : 0, borderBottomColor: '#f8fafc',
                                            }}
                                        >
                                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${iconConfig.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                                                <IconComp size={20} color={iconConfig.color} weight="duotone" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>{item.label}</Text>
                                                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{item.sub}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end', gap: 3 }}>
                                                <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>{item.value}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>{item.status}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <ChartDonut size={20} color="#7c3aed" weight="duotone" />
                                <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Distribusi Pengguna</Text>
                            </View>
                            <View style={{ gap: 12 }}>
                                {userBreakdown.map((role) => (
                                    <View key={role.key} style={{ gap: 5 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{role.label}</Text>
                                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>
                                                {role.count.toLocaleString('id-ID')} ({role.pct}%)
                                            </Text>
                                        </View>
                                        <View style={{ height: 6, borderRadius: 999, backgroundColor: '#f1f5f9' }}>
                                            <View style={{ height: 6, borderRadius: 999, backgroundColor: role.color, width: `${role.pct}%` }} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <ShieldWarning size={20} color="#7c3aed" weight="duotone" />
                                    <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Antrian Moderasi</Text>
                                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#fef2f2' }}>
                                        <Text style={{ fontSize: 11, fontWeight: '800', color: SiagaColors.danger }}>{dashboard?.moderationQueue.length || 0}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} activeOpacity={0.7} onPress={() => router.push('/(admin-tabs)/moderation' as any)}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed' }}>Semua</Text>
                                    <CaretRight size={13} color="#7c3aed" weight="bold" />
                                </TouchableOpacity>
                            </View>

                            <View style={{ gap: 10 }}>
                                {(dashboard?.moderationQueue || []).map((item: AdminModerationQueueItem) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={{
                                            backgroundColor: '#fff', borderRadius: 18, padding: 14,
                                            borderWidth: 1, borderColor: '#edf2f9',
                                        }}
                                        activeOpacity={0.85}
                                        onPress={() => router.push({ pathname: '/moderasi-detail' as any, params: { id: item.id } })}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.category === 'Banjir' && <Waves size={22} color="#2563eb" weight="duotone" />}
                                                {item.category === 'Jalan Rusak' && <RoadHorizon size={22} color="#d97706" weight="duotone" />}
                                                {item.category === 'Sampah' && <Trash size={22} color="#059669" weight="duotone" />}
                                                {(item.category === 'Longsor' || item.category === 'Tanah Longsor') && <Mountains size={22} color="#7c3aed" weight="duotone" />}
                                                {item.category === 'Kebakaran' && <Fire size={22} color={SiagaColors.danger} weight="duotone" />}
                                                {!['Banjir', 'Jalan Rusak', 'Sampah', 'Longsor', 'Tanah Longsor', 'Kebakaran'].includes(item.category) && <FileText size={22} color="#7c3aed" weight="duotone" />}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                                    <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary, flex: 1 }} numberOfLines={1}>{item.title}</Text>
                                                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: item.severity === 'Kritis' ? SiagaColors.danger : item.severity === 'Tinggi' ? '#fed7aa' : item.severity === 'Sedang' ? '#fef3c7' : '#d1fae5' }}>
                                                        <Text style={{ fontSize: 10, fontWeight: '800', color: item.severity === 'Kritis' ? '#fff' : item.severity === 'Tinggi' ? '#9a3412' : item.severity === 'Sedang' ? '#92400e' : '#065f46' }}>
                                                            {item.severity}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 3 }} numberOfLines={2}>
                                                    {item.reporterName} · {item.category}{item.district ? ` · ${item.district}` : ''}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <Clock size={12} color={SiagaColors.secondary} />
                                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{item.time}</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f5f3ff' }}
                                                        activeOpacity={0.7}
                                                        onPress={() => router.push({ pathname: '/moderasi-detail' as any, params: { id: item.id } })}
                                                    >
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#7c3aed' }}>Lihat Detail</Text>
                                                        <CaretRight size={12} color="#7c3aed" weight="bold" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <ClockCounterClockwise size={20} color="#7c3aed" weight="duotone" />
                                    <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Log Aktivitas</Text>
                                </View>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} activeOpacity={0.7} onPress={() => router.push('/riwayat-aktivitas')}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed' }}>Semua</Text>
                                    <CaretRight size={13} color="#7c3aed" weight="bold" />
                                </TouchableOpacity>
                            </View>
                            <View style={{ gap: 12 }}>
                                {(dashboard?.recentActivities || []).map((act: AdminActivityLogItem) => {
                                    const IconComp = ACTIVITY_ICON_MAP[act.icon] || FileText;
                                    const route = getActivityRoute(act);
                                    const Wrapper: any = route ? TouchableOpacity : View;

                                    return (
                                        <Wrapper
                                            key={act.id}
                                            {...(route ? { activeOpacity: 0.8, onPress: () => router.push(route) } : {})}
                                            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
                                        >
                                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: act.bgColor, alignItems: 'center', justifyContent: 'center' }}>
                                                <IconComp size={18} color={act.color} weight="duotone" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{act.title}</Text>
                                                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>{act.desc}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                                                    <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{act.time}</Text>
                                                    {act.status ? (
                                                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: `${act.statusColor || '#94a3b8'}15` }}>
                                                            <Text style={{ fontSize: 10, fontWeight: '700', color: act.statusColor || '#94a3b8' }}>{act.status}</Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                            </View>
                                            {route && <CaretRight size={13} color={SiagaColors.secondary} weight="bold" style={{ marginTop: 8 }} />}
                                        </Wrapper>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={{ paddingVertical: 8, alignItems: 'center', gap: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Image source={require('@/assets/images/logo.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>SIAGA Admin Panel</Text>
                            </View>
                            <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>v1.0.0 · Dashboard Admin Terintegrasi · PROXOCORIS 2026</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
