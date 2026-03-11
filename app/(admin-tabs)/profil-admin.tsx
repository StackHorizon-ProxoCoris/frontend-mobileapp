import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    UserCircle, CaretRight, SignOut, Gear,
    ShieldCheck, Bell, Lock, EnvelopeSimple,
    ClipboardText, CheckCircle, Clock, ChartBar,
    Star, Eye, Users, Buildings,
    ArrowClockwise, Warning, ChatCircle, TrendUp,
    Medal, Crown, Database, Globe,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { getReportStats, type ReportStats } from '@/services/report.service';
import { getActivities, type ActivityItem } from '@/services/activity.service';
import { getAdminUserStats, type UserStats } from '@/services/admin.service';

// ─── Activity icon mapping ───
const ACTIVITY_ICON_MAP: Record<string, React.ComponentType<any>> = {
    CheckCircle, ChatCircle, Warning, ArrowClockwise, Bell,
    ClipboardText, Star, ShieldCheck, Eye, TrendUp,
};

// ─── Menu sections ───
type MenuSection = {
    title: string;
    items: { label: string; icon: any; color: string; danger?: boolean; action?: string }[];
};

const MENU_SECTIONS: MenuSection[] = [
    {
        title: 'Akun',
        items: [
            { label: 'Edit Profil', icon: UserCircle, color: '#7c3aed', action: '/edit-profil' },
            { label: 'Ganti Password', icon: Lock, color: SiagaColors.info, action: '/ganti-password' },
            { label: 'Notifikasi', icon: Bell, color: '#f59e0b', action: '/notifikasi' },
        ],
    },
    {
        title: 'Administrasi',
        items: [
            { label: 'Pengaturan Sistem', icon: Gear, color: SiagaColors.primary, action: '/(admin-tabs)/settings' },
            { label: 'Riwayat Aktivitas', icon: ChartBar, color: SiagaColors.success, action: '/riwayat-aktivitas' },
            { label: 'Akses & Keamanan', icon: ShieldCheck, color: SiagaColors.info, action: '/akses-keamanan' },
        ],
    },
    {
        title: 'Informasi',
        items: [
            { label: 'Tentang SIAGA', icon: ShieldCheck, color: SiagaColors.info, action: '/tentang' },
            { label: 'Panduan Penggunaan', icon: Eye, color: '#059669', action: '/bantuan' },
        ],
    },
];

// ─── Sub-components ───
function InfoRow({ label, value, icon: IconComp, accent }: { label: string; value: string; icon: any; accent?: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: accent ? accent + '18' : '#f4f7fb', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={18} color={accent ?? SiagaColors.secondary} weight="duotone" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>
                    {label}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function SectionLabel({ title }: { title: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#7c3aed' }} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Text>
        </View>
    );
}

// ─── Main Screen ───
export default function AdminProfilScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        (async () => {
            const [statsResult, activitiesResult, userStatsResult] = await Promise.all([
                getReportStats(),
                getActivities(),
                getAdminUserStats(),
            ]);
            if (statsResult.success && statsResult.data) setStats(statsResult.data);
            if (activitiesResult.success && activitiesResult.data) {
                setRecentActivities(activitiesResult.data.slice(0, 5));
            }
            if (userStatsResult.success && userStatsResult.data) setUserStats(userStatsResult.data);
            setLoadingActivities(false);
        })();
    }, []);

    const OVERVIEW_STATS = useMemo(() => {
        const totalReports = stats?.total ?? 0;
        const resolved = stats?.resolved ?? 0;
        const totalUsers = userStats?.total ?? 0;
        return [
            { label: 'Total Pengguna', value: String(totalUsers), icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Total Laporan', value: String(totalReports), icon: ClipboardText, color: SiagaColors.info, bg: '#eff6ff' },
            { label: 'Laporan Selesai', value: String(resolved), icon: CheckCircle, color: SiagaColors.success, bg: '#ecfdf5' },
            { label: 'Uptime Sistem', value: '99.8%', icon: Globe, color: '#d97706', bg: '#fffbeb' },
        ];
    }, [stats, userStats]);

    const USER = {
        name: user?.fullName || 'Admin',
        initials: user?.initials || 'AD',
        email: user?.email || 'admin@siaga.id',
        phone: user?.phone || '-',
        district: user?.district || '-',
        city: user?.city || '-',
        province: user?.province || '-',
        lastLogin: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;
    const avatarScale = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
            Animated.spring(avatarScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <View style={{ position: 'absolute', left: -20, bottom: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                <View style={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 14, alignItems: 'center' }}>
                    <Animated.View style={{ transform: [{ scale: avatarScale }], marginBottom: 12 }}>
                        <View style={{
                            width: 80, height: 80, borderRadius: 40,
                            backgroundColor: '#5b21b6',
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
                            elevation: 6,
                            shadowColor: '#5b21b6',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                        }}>
                            <Text style={{ fontSize: 26, fontWeight: '900', color: '#fff' }}>
                                {USER.initials}
                            </Text>
                        </View>
                        <View style={{
                            position: 'absolute', bottom: 2, right: 2,
                            width: 16, height: 16, borderRadius: 8,
                            backgroundColor: SiagaColors.success,
                            borderWidth: 2.5, borderColor: '#7c3aed',
                        }} />
                    </Animated.View>

                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3, marginBottom: 3 }}>
                        {USER.name}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>
                        {USER.email}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                            <Crown size={14} color="#fbbf24" weight="fill" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fbbf24' }}>Super Admin</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(52,211,153,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' }}>
                            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: SiagaColors.success }} />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#34d399' }}>Online</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                            <ShieldCheck size={14} color="#c4b5fd" weight="fill" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#c4b5fd' }}>Full Access</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>

                {/* ── INFORMASI AKUN ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <SectionLabel title="Informasi Akun" />
                    <View style={{
                        backgroundColor: '#fff', borderRadius: 20, padding: 16,
                        borderWidth: 1, borderColor: '#edf2f9',
                        elevation: 2, shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                        gap: 14,
                    }}>
                        <InfoRow label="Email" value={USER.email} icon={EnvelopeSimple} accent={SiagaColors.info} />
                        <InfoRow label="Telepon" value={USER.phone} icon={Lock} accent="#7c3aed" />
                        <InfoRow label="Kecamatan" value={USER.district} icon={Buildings} accent="#d97706" />
                        <InfoRow label="Kota" value={`${USER.city}, ${USER.province}`} icon={Globe} accent={SiagaColors.success} />
                    </View>
                </Animated.View>

                {/* ── STATISTIK OVERVIEW ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <SectionLabel title="Statistik Platform" />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {OVERVIEW_STATS.map((s, i) => {
                            const IconComp = s.icon;
                            return (
                                <View key={i} style={{
                                    width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                    elevation: 1, shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={16} color={s.color} weight="duotone" />
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 22, fontWeight: '900', color: SiagaColors.primary }}>{s.value}</Text>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>{s.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* ── AKTIVITAS TERKINI ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <SectionLabel title="Aktivitas Terkini" />
                    <View style={{
                        backgroundColor: '#fff', borderRadius: 20, padding: 16,
                        borderWidth: 1, borderColor: '#edf2f9',
                        elevation: 2, shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                    }}>
                        {loadingActivities ? (
                            <ActivityIndicator size="small" color="#7c3aed" />
                        ) : recentActivities.length === 0 ? (
                            <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center', paddingVertical: 16 }}>Belum ada aktivitas.</Text>
                        ) : (
                            recentActivities.map((act, i) => {
                                const IconComp = ACTIVITY_ICON_MAP[act.icon] || ClipboardText;
                                return (
                                    <TouchableOpacity
                                        key={act.id || i}
                                        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderBottomWidth: i < recentActivities.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9' }}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            if (act.refId && act.type === 'report') router.push({ pathname: '/report-detail', params: { id: act.refId } });
                                            else if (act.refId && act.type === 'action') router.push({ pathname: '/action-detail', params: { id: act.refId } });
                                        }}
                                    >
                                        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: act.bgColor || '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={16} color={act.color || '#7c3aed'} weight="duotone" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{act.title}</Text>
                                            <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>{act.desc}</Text>
                                            <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 3 }}>{act.time}</Text>
                                        </View>
                                        {act.points > 0 && (
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.success }}>+{act.points} pts</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </Animated.View>

                {/* ── MENU NAVIGASI ── */}
                {MENU_SECTIONS.map((section, si) => (
                    <Animated.View key={si} style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <SectionLabel title={section.title} />
                        <View style={{
                            backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
                            borderWidth: 1, borderColor: '#edf2f9',
                            elevation: 2, shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                        }}>
                            {section.items.map((item, ii) => {
                                const IconComp = item.icon;
                                return (
                                    <TouchableOpacity
                                        key={ii}
                                        style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            paddingVertical: 14, paddingHorizontal: 16,
                                            borderBottomWidth: ii < section.items.length - 1 ? 1 : 0,
                                            borderBottomColor: '#f1f5f9',
                                        }}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            if (item.action) router.push(item.action as any);
                                        }}
                                    >
                                        <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={18} color={item.color} weight="duotone" />
                                        </View>
                                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: item.danger ? SiagaColors.danger : SiagaColors.primary }}>
                                            {item.label}
                                        </Text>
                                        <CaretRight size={16} color={SiagaColors.secondary} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Animated.View>
                ))}

                {/* ── LOGOUT ── */}
                <TouchableOpacity
                    style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                        backgroundColor: '#fff', borderRadius: 16, padding: 16,
                        borderWidth: 1, borderColor: SiagaColors.danger + '30',
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                        Alert.alert('Keluar', 'Yakin ingin keluar dari akun admin?', [
                            { text: 'Batal', style: 'cancel' },
                            {
                                text: 'Keluar', style: 'destructive', onPress: async () => {
                                    await logout();
                                    showToast({ type: 'info', title: 'Logout', message: 'Berhasil keluar dari akun.' });
                                },
                            },
                        ]);
                    }}
                >
                    <SignOut size={20} color={SiagaColors.danger} weight="bold" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.danger }}>Keluar dari Akun</Text>
                </TouchableOpacity>

                {/* ── FOOTER INFO ── */}
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                    <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>SIAGA Admin Panel v1.0.0</Text>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 2 }}>Login terakhir: {USER.lastLogin}</Text>
                </View>
            </ScrollView>
        </View>
    );
}
