import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    UserCircle, CaretRight, SignOut, Gear,
    ShieldCheck, MapPin, Buildings, IdentificationBadge,
    Bell, Lock, Phone, EnvelopeSimple, CalendarBlank,
    ClipboardText, CheckCircle, Clock, TrendUp,
    Medal, Star, ArrowClockwise, ChartBar,
    Eye, ChatCircle, Warning, ArrowRight,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { getReportStats, type ReportStats } from '@/services/report.service';
import { getActivities, type ActivityItem } from '@/services/activity.service';

// ─── Data ─────────────────────────────────────────────────────────────────────
// Gov-specific fields now come from auth context (user?.nip, user?.jabatan, etc.)



// Icon string → Phosphor component mapping for activity items
const ACTIVITY_ICON_MAP: Record<string, React.ComponentType<any>> = {
    CheckCircle, ChatCircle, Warning, ArrowClockwise, Bell,
    ClipboardText, Star, ShieldCheck, Eye, TrendUp,
};

const ACCESS_PERMISSIONS = [
    { label: 'Lihat Laporan', granted: true },
    { label: 'Tindak Laporan', granted: true },
    { label: 'Upload Dokumen', granted: true },
    { label: 'Kelola Budget', granted: true },
    { label: 'Broadcast Notif', granted: true },
    { label: 'Admin Pengguna', granted: false },
    { label: 'Hapus Data', granted: false },
];

type MenuSection = {
    title: string;
    items: { label: string; icon: any; color: string; danger?: boolean; action?: string }[];
};

const MENU_SECTIONS: MenuSection[] = [
    {
        title: 'Akun',
        items: [
            { label: 'Edit Profil', icon: UserCircle, color: SiagaColors.info, action: '/edit-profil-gov' },
            { label: 'Ganti Password', icon: Lock, color: '#7c3aed', action: '/ganti-password' },
            { label: 'Notifikasi', icon: Bell, color: '#f59e0b', action: '/notifikasi' },
        ],
    },
    {
        title: 'Sistem',
        items: [
            { label: 'Pengaturan Sistem', icon: Gear, color: SiagaColors.primary, action: '/pengaturan-sistem' },
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

// ─── Sub-components ───────────────────────────────────────────────────────────
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
            <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: SiagaColors.info }} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GovProfilScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [showAccess, setShowAccess] = useState(false);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    // Load stats + activities from API
    useEffect(() => {
        (async () => {
            const [statsResult, activitiesResult] = await Promise.all([
                getReportStats(),
                getActivities(),
            ]);
            if (statsResult.success && statsResult.data) setStats(statsResult.data);
            if (activitiesResult.success && activitiesResult.data) {
                setRecentActivities(activitiesResult.data.slice(0, 5));
            }
            setLoadingActivities(false);
        })();
    }, []);

    // Build KINERJA_STATS dari data API + mock statis
    const KINERJA_STATS = useMemo(() => {
        const total = stats?.total ?? 0;
        const resolved = stats?.resolved ?? 0;
        const inProgress = stats?.inProgress ?? 0;
        const pct = total > 0 ? `${Math.round(resolved / total * 100)}%` : '0%';
        return [
            { label: 'Total Laporan Masuk', value: String(total), icon: ClipboardText, color: SiagaColors.info, bg: '#eff6ff', trend: `+${inProgress} dalam proses` },
            { label: 'Laporan Selesai', value: String(resolved), icon: CheckCircle, color: SiagaColors.success, bg: '#ecfdf5', trend: pct },
            { label: 'Rata-rata Respons', value: '2.4j', icon: Clock, color: '#f59e0b', bg: '#fffbeb', trend: 'Di bawah target' },
            { label: 'Tingkat Kepuasan', value: '95%', icon: Star, color: '#7c3aed', bg: '#f5f3ff', trend: 'Sangat Baik' },
        ];
    }, [stats]);

    // Derive USER from auth context
    const USER = {
        name: user?.fullName || 'Gov User',
        initials: user?.initials || 'GU',
        nip: user?.nip || '-',
        jabatan: user?.jabatan || '-',
        instansi: user?.instansi || '-',
        unit: user?.unitKerja || '-',
        wilayah: user?.city || 'Kota Bandung',
        golongan: user?.golongan || '-',
        email: user?.email || 'gov@bandung.go.id',
        phone: user?.phone || '-',
        tmt: user?.tmt || '-',
        lastLogin: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
        accessLevel: 'Supervisor',
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

            {/* ── HEADER ──────────────────────────────────────────────── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
                {/* Decorative */}
                <View style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <View style={{ position: 'absolute', left: -20, bottom: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                <View style={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 14, alignItems: 'center' }}>
                    {/* Avatar */}
                    <Animated.View style={{ transform: [{ scale: avatarScale }], marginBottom: 12 }}>
                        <View style={{
                            width: 80, height: 80, borderRadius: 40,
                            backgroundColor: SiagaColors.info,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
                            elevation: 6,
                            shadowColor: SiagaColors.info,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                        }}>
                            <Text style={{ fontSize: 26, fontWeight: '900', color: '#fff' }}>
                                {USER.initials}
                            </Text>
                        </View>
                        {/* Online dot */}
                        <View style={{
                            position: 'absolute', bottom: 2, right: 2,
                            width: 16, height: 16, borderRadius: 8,
                            backgroundColor: SiagaColors.success,
                            borderWidth: 2.5, borderColor: SiagaColors.primary,
                        }} />
                    </Animated.View>

                    {/* Name & title */}
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3, marginBottom: 3 }}>
                        {USER.name}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
                        {USER.jabatan}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                        {USER.instansi} · {USER.wilayah}
                    </Text>

                    {/* Tags row */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                            <Medal size={14} color="#fbbf24" weight="fill" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fbbf24' }}>Gol. {USER.golongan}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(52,211,153,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' }}>
                            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: SiagaColors.success }} />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#34d399' }}>Online</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                            <ShieldCheck size={14} color={SiagaColors.info} weight="fill" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#93c5fd' }}>{USER.accessLevel}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>

                {/* ── DATA IDENTITAS ───────────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <SectionLabel title="Data Identitas" />
                    <View style={{
                        backgroundColor: '#fff', borderRadius: 20, padding: 16,
                        borderWidth: 1, borderColor: '#edf2f9',
                        elevation: 2, shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                        gap: 14,
                    }}>
                        <InfoRow label="NIP" value={USER.nip} icon={IdentificationBadge} accent={SiagaColors.primary} />
                        <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />
                        <InfoRow label="Jabatan" value={USER.jabatan} icon={UserCircle} accent={SiagaColors.info} />
                        <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />
                        <InfoRow label="Unit Kerja" value={USER.unit} icon={Buildings} accent={SiagaColors.info} />
                        <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />
                        <InfoRow label="Instansi" value={USER.instansi} icon={Buildings} accent='#7c3aed' />
                        <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />
                        <InfoRow label="Wilayah" value={USER.wilayah} icon={MapPin} accent={SiagaColors.success} />
                        <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />
                        <InfoRow label="Golongan" value={USER.golongan} icon={Medal} accent='#f59e0b' />
                        <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />
                        <InfoRow label="TMT" value={USER.tmt} icon={CalendarBlank} accent={SiagaColors.secondary} />
                    </View>
                </Animated.View>

                {/* ── KONTAK ───────────────────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <SectionLabel title="Kontak" />
                    <View style={{
                        backgroundColor: '#fff', borderRadius: 20, padding: 16,
                        borderWidth: 1, borderColor: '#edf2f9',
                        elevation: 2, shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                        gap: 14,
                    }}>
                        <InfoRow label="Email Dinas" value={USER.email} icon={EnvelopeSimple} accent={SiagaColors.info} />
                        <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />
                        <InfoRow label="Telepon" value={USER.phone} icon={Phone} accent={SiagaColors.success} />
                    </View>
                </Animated.View>

                {/* ── STATISTIK KINERJA ─────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <SectionLabel title="Statistik Kinerja" />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {KINERJA_STATS.map((stat, i) => {
                            const IconComp = stat.icon;
                            return (
                                <View key={i} style={{
                                    width: '47.5%',
                                    backgroundColor: '#fff', borderRadius: 18, padding: 14,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                    elevation: 1, shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
                                }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: stat.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                        <IconComp size={20} color={stat.color} weight="duotone" />
                                    </View>
                                    <Text style={{ fontSize: 22, fontWeight: '900', color: SiagaColors.primary, lineHeight: 26 }}>
                                        {stat.value}
                                    </Text>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>
                                        {stat.label}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 }}>
                                        <TrendUp size={11} color={stat.color} weight="fill" />
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: stat.color }}>{stat.trend}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* ── RIWAYAT AKTIVITAS ─────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <SectionLabel title="Aktivitas Terkini" />
                    <View style={{
                        backgroundColor: '#fff', borderRadius: 20, padding: 16,
                        borderWidth: 1, borderColor: '#edf2f9',
                        elevation: 2, shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                    }}>
                        {loadingActivities ? (
                            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                <ActivityIndicator size="small" color={SiagaColors.info} />
                                <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 8 }}>Memuat aktivitas...</Text>
                            </View>
                        ) : recentActivities.length === 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                <ClipboardText size={28} color={SiagaColors.secondary} weight="duotone" />
                                <Text style={{ fontSize: 13, color: SiagaColors.secondary, marginTop: 6 }}>Belum ada aktivitas</Text>
                            </View>
                        ) : (
                            <>
                                {recentActivities.map((act, i) => {
                                    const IconComp = ACTIVITY_ICON_MAP[act.icon] || CheckCircle;
                                    const isLast = i === recentActivities.length - 1;
                                    return (
                                        <View key={act.id || i} style={{ flexDirection: 'row', gap: 12, paddingBottom: isLast ? 0 : 14 }}>
                                            {/* Timeline */}
                                            <View style={{ alignItems: 'center', width: 36 }}>
                                                <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: act.bgColor || '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                                    <IconComp size={18} color={act.color || SiagaColors.info} weight="duotone" />
                                                </View>
                                                {!isLast && <View style={{ width: 1.5, flex: 1, backgroundColor: '#f1f5f9', marginTop: 4 }} />}
                                            </View>
                                            {/* Content */}
                                            <View style={{ flex: 1, paddingTop: 3 }}>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: SiagaColors.primary, lineHeight: 17 }}>
                                                    {act.title}
                                                </Text>
                                                {act.desc ? (
                                                    <Text style={{ fontSize: 12, fontWeight: '700', color: act.color || SiagaColors.info, marginTop: 1 }}>{act.desc}</Text>
                                                ) : null}
                                                <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 2 }}>{act.time}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </>
                        )}

                        {/* See all */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
                                marginTop: 14, paddingTop: 12,
                                borderTopWidth: 1, borderTopColor: '#f1f5f9',
                            }}
                            onPress={() => router.push('/riwayat-aktivitas')}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.info }}>Lihat Semua Aktivitas</Text>
                            <ArrowRight size={13} color={SiagaColors.info} weight="bold" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* ── HAK AKSES ─────────────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowAccess(v => !v)}
                        style={{ marginBottom: 8 }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <SectionLabel title="Hak Akses & Keamanan" />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.info }}>{showAccess ? 'Sembunyikan' : 'Tampilkan'}</Text>
                        </View>
                    </TouchableOpacity>

                    {showAccess && (
                        <View style={{
                            backgroundColor: '#fff', borderRadius: 20, padding: 16,
                            borderWidth: 1, borderColor: '#edf2f9',
                            elevation: 2, shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
                        }}>
                            {/* Access level badge */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, padding: 12, backgroundColor: '#eff6ff', borderRadius: 14 }}>
                                <ShieldCheck size={24} color={SiagaColors.info} weight="duotone" />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Level: {USER.accessLevel}</Text>
                                    <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 1 }}>Login terakhir: {USER.lastLogin}</Text>
                                </View>
                            </View>

                            {/* Permissions grid */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {ACCESS_PERMISSIONS.map((p, i) => (
                                    <View key={i} style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 5,
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                        backgroundColor: p.granted ? '#ecfdf5' : '#fef2f2',
                                        borderWidth: 1,
                                        borderColor: p.granted ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.15)',
                                    }}>
                                        <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: p.granted ? SiagaColors.success : SiagaColors.danger }} />
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: p.granted ? '#065f46' : '#9f1239' }}>
                                            {p.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* ── MENU SECTIONS ─────────────────────────────── */}
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
                                const isLast = ii === section.items.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={ii}
                                        activeOpacity={0.7}
                                        style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            paddingHorizontal: 16, paddingVertical: 14,
                                            borderBottomWidth: isLast ? 0 : 1,
                                            borderBottomColor: '#f4f7fb',
                                        }}
                                        onPress={() => item.action && router.push(item.action as any)}
                                    >
                                        <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={20} color={item.color} weight="duotone" />
                                        </View>
                                        <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: SiagaColors.primary }}>
                                            {item.label}
                                        </Text>
                                        <CaretRight size={16} color={SiagaColors.secondary} weight="bold" />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Animated.View>
                ))}

                {/* ── LOGOUT ────────────────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            Alert.alert(
                                'Keluar',
                                'Apakah Anda yakin ingin keluar dari akun ini?',
                                [
                                    { text: 'Batal', style: 'cancel' },
                                    { text: 'Keluar', style: 'destructive', onPress: async () => {
                                        showToast({ type: 'info', title: 'Berhasil Keluar', message: 'Anda telah logout dari akun.' });
                                        await logout();
                                        router.replace('/(auth)/login');
                                    } },
                                ]
                            );
                        }}
                        style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                            paddingVertical: 14, borderRadius: 20,
                            backgroundColor: '#fff',
                            borderWidth: 1.5, borderColor: 'rgba(231,76,60,0.25)',
                            elevation: 1, shadowColor: SiagaColors.danger,
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4,
                        }}
                    >
                        <SignOut size={20} color={SiagaColors.danger} weight="duotone" />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.danger }}>Keluar dari Akun</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── FOOTER ────────────────────────────────────── */}
                <View style={{ alignItems: 'center', paddingTop: 4, gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: SiagaColors.primary, alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={13} color="#fff" weight="duotone" />
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>SIAGA Gov Dashboard</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>v1.0.0 · Smart Indonesia Adaptive Governance</Text>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>NIP: {USER.nip}</Text>
                </View>

            </ScrollView>
        </View>
    );
}
