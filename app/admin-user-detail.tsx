import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Animated, Dimensions, Modal, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft, DotsThree, User, Envelope, MapPin, Phone,
    CalendarBlank, Clock, SealCheck, Buildings, Users, UserGear,
    Warning, ShieldCheck, Bell, Key, PencilSimple, Trash,
    UserMinus, UserCheck, ChartLineUp, FileText, ChatCircleDots,
    Star, CaretRight, Flag, Eye, Medal, TrendUp, TrendDown,
    CheckCircle, XCircle, ArrowClockwise, Copy,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useToast } from '@/contexts/toast.context';

const { width } = Dimensions.get('window');

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type UserRole = 'Masyarakat' | 'Pemerintah' | 'Admin';
type UserStatus = 'Aktif' | 'Nonaktif' | 'Ditangguhkan' | 'Menunggu Verifikasi';

interface UserDetail {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    reports: number;
    joined: string;
    lastActive: string;
    initials: string;
    avatarColor: string;
    verified: boolean;
    district: string;
    phone: string;
    totalReports: number;
    resolvedReports: number;
    pendingReports: number;
    totalComments: number;
    totalActions: number;
    reputation: number;
    registrationIp: string;
    lastLoginIp: string;
    loginCount: number;
    instansi?: string;
}

// ────────────────────────────────────────────
// Dummy Data (simulated from params)
// ────────────────────────────────────────────
const DUMMY_USERS: Record<string, UserDetail> = {
    u01: {
        id: 'u01', name: 'Budi Santoso', email: 'budi.santoso@gmail.com',
        role: 'Masyarakat', status: 'Aktif', reports: 24, joined: '10 Jan 2025',
        lastActive: '2 menit lalu', initials: 'BS', avatarColor: '#3b82f6', verified: true,
        district: 'Kec. Coblong', phone: '081234567890',
        totalReports: 24, resolvedReports: 18, pendingReports: 4, totalComments: 56,
        totalActions: 8, reputation: 92, registrationIp: '103.24.xx.xx', lastLoginIp: '103.24.xx.xx', loginCount: 147,
    },
    u02: {
        id: 'u02', name: 'Dinas PU Kota Bandung', email: 'dpu.bandung@pemkot.go.id',
        role: 'Pemerintah', status: 'Aktif', reports: 8, joined: '3 Feb 2025',
        lastActive: '1 jam lalu', initials: 'PU', avatarColor: '#7c3aed', verified: true,
        district: 'Kec. Bandung Wetan', phone: '022-1234567', instansi: 'Dinas Pekerjaan Umum',
        totalReports: 8, resolvedReports: 45, pendingReports: 12, totalComments: 134,
        totalActions: 37, reputation: 88, registrationIp: '180.xx.xx.xx', lastLoginIp: '180.xx.xx.xx', loginCount: 312,
    },
    u03: {
        id: 'u03', name: 'Siti Rahayu', email: 'siti.rahayu@yahoo.com',
        role: 'Masyarakat', status: 'Aktif', reports: 17, joined: '22 Jan 2025',
        lastActive: '30 menit lalu', initials: 'SR', avatarColor: '#059669', verified: true,
        district: 'Kec. Sukasari', phone: '085678901234',
        totalReports: 17, resolvedReports: 12, pendingReports: 3, totalComments: 41,
        totalActions: 5, reputation: 85, registrationIp: '114.xx.xx.xx', lastLoginIp: '114.xx.xx.xx', loginCount: 89,
    },
    u04: {
        id: 'u04', name: 'Ahmad Fauzi', email: 'ahmad.fauzi92@gmail.com',
        role: 'Masyarakat', status: 'Ditangguhkan', reports: 3, joined: '5 Mar 2025',
        lastActive: '3 hari lalu', initials: 'AF', avatarColor: '#d97706', verified: false,
        district: 'Kec. Cibeunying', phone: '087654321098',
        totalReports: 3, resolvedReports: 1, pendingReports: 0, totalComments: 8,
        totalActions: 0, reputation: 35, registrationIp: '182.xx.xx.xx', lastLoginIp: '182.xx.xx.xx', loginCount: 12,
    },
    u05: {
        id: 'u05', name: 'Kelurahan Pasirkaliki', email: 'kel.pasirkaliki@bandung.go.id',
        role: 'Pemerintah', status: 'Menunggu Verifikasi', reports: 0, joined: '28 Feb 2026',
        lastActive: 'Belum aktif', initials: 'KP', avatarColor: '#0891b2', verified: false,
        district: 'Kec. Cicendo', phone: '022-9876543', instansi: 'Kelurahan Pasirkaliki',
        totalReports: 0, resolvedReports: 0, pendingReports: 0, totalComments: 0,
        totalActions: 0, reputation: 0, registrationIp: '125.xx.xx.xx', lastLoginIp: '-', loginCount: 0,
    },
    u06: {
        id: 'u06', name: 'Rina Marlina', email: 'rinamar@gmail.com',
        role: 'Masyarakat', status: 'Aktif', reports: 41, joined: '14 Jan 2025',
        lastActive: '10 menit lalu', initials: 'RM', avatarColor: '#dc2626', verified: true,
        district: 'Kec. Bojongloa', phone: '089876543210',
        totalReports: 41, resolvedReports: 33, pendingReports: 5, totalComments: 127,
        totalActions: 15, reputation: 97, registrationIp: '110.xx.xx.xx', lastLoginIp: '110.xx.xx.xx', loginCount: 234,
    },
    u07: {
        id: 'u07', name: 'Dinas BPBD Kota Bandung', email: 'bpbd.bandung@pemkot.go.id',
        role: 'Pemerintah', status: 'Aktif', reports: 22, joined: '15 Jan 2025',
        lastActive: '5 menit lalu', initials: 'BP', avatarColor: '#7c3aed', verified: true,
        district: 'Kec. Regol', phone: '022-2345678', instansi: 'Badan Penanggulangan Bencana Daerah',
        totalReports: 22, resolvedReports: 67, pendingReports: 8, totalComments: 198,
        totalActions: 45, reputation: 95, registrationIp: '180.xx.xx.xx', lastLoginIp: '180.xx.xx.xx', loginCount: 456,
    },
    u08: {
        id: 'u08', name: 'Faisal Hendra', email: 'faisalhendra@outlook.com',
        role: 'Masyarakat', status: 'Nonaktif', reports: 0, joined: '30 Jun 2025',
        lastActive: '2 bulan lalu', initials: 'FH', avatarColor: '#94a3b8', verified: false,
        district: 'Kec. Antapani', phone: '081122334455',
        totalReports: 0, resolvedReports: 0, pendingReports: 0, totalComments: 0,
        totalActions: 0, reputation: 10, registrationIp: '36.xx.xx.xx', lastLoginIp: '36.xx.xx.xx', loginCount: 3,
    },
    u09: {
        id: 'u09', name: 'Super Admin', email: 'admin@siaga.id',
        role: 'Admin', status: 'Aktif', reports: 0, joined: '1 Jan 2025',
        lastActive: 'Sekarang', initials: 'SA', avatarColor: '#7c3aed', verified: true,
        district: 'Semua Wilayah', phone: '-',
        totalReports: 0, resolvedReports: 0, pendingReports: 0, totalComments: 45,
        totalActions: 0, reputation: 100, registrationIp: '127.0.0.1', lastLoginIp: '103.xx.xx.xx', loginCount: 567,
    },
    u10: {
        id: 'u10', name: 'Nurainun Dewi', email: 'nura.dewi@gmail.com',
        role: 'Masyarakat', status: 'Aktif', reports: 11, joined: '18 Feb 2025',
        lastActive: '1 hari lalu', initials: 'ND', avatarColor: '#be185d', verified: true,
        district: 'Kec. Cicendo', phone: '082345678901',
        totalReports: 11, resolvedReports: 7, pendingReports: 2, totalComments: 28,
        totalActions: 3, reputation: 78, registrationIp: '103.xx.xx.xx', lastLoginIp: '103.xx.xx.xx', loginCount: 56,
    },
};

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; icon: any }> = {
    Masyarakat: { label: 'Masyarakat', color: SiagaColors.info, bg: '#eff6ff', icon: Users },
    Pemerintah: { label: 'Pemerintah', color: '#7c3aed', bg: '#f5f3ff', icon: Buildings },
    Admin: { label: 'Admin', color: '#d97706', bg: '#fffbeb', icon: UserGear },
};

const STATUS_CONFIG: Record<UserStatus, { color: string; bg: string; dot: string; label: string }> = {
    'Aktif': { color: SiagaColors.success, bg: '#ecfdf5', dot: '#4ade80', label: 'Aktif' },
    'Nonaktif': { color: SiagaColors.secondary, bg: '#f1f5f9', dot: '#94a3b8', label: 'Nonaktif' },
    'Ditangguhkan': { color: SiagaColors.danger, bg: '#fef2f2', dot: SiagaColors.danger, label: 'Ditangguhkan' },
    'Menunggu Verifikasi': { color: '#d97706', bg: '#fffbeb', dot: '#fbbf24', label: 'Menunggu Verifikasi' },
};

// ────────────────────────────────────────────
// Activity Timeline Item
// ────────────────────────────────────────────
const ACTIVITY_LOG = [
    { id: 1, action: 'Login berhasil', time: '2 menit lalu', type: 'login', icon: ArrowClockwise },
    { id: 2, action: 'Mengirim laporan #RPT-0041', time: '1 jam lalu', type: 'report', icon: FileText },
    { id: 3, action: 'Memberikan komentar', time: '3 jam lalu', type: 'comment', icon: ChatCircleDots },
    { id: 4, action: 'Bergabung dalam aksi positif', time: '1 hari lalu', type: 'action', icon: Star },
    { id: 5, action: 'Laporan #RPT-0035 diselesaikan', time: '2 hari lalu', type: 'resolved', icon: CheckCircle },
    { id: 6, action: 'Memperbarui profil', time: '5 hari lalu', type: 'profile', icon: User },
];

const ACTIVITY_COLORS: Record<string, string> = {
    login: '#7c3aed',
    report: SiagaColors.info,
    comment: '#0891b2',
    action: '#d97706',
    resolved: SiagaColors.success,
    profile: SiagaColors.secondary,
};

// ────────────────────────────────────────────
// Quick Action Sheet (Admin actions on user)
// ────────────────────────────────────────────
function AdminQuickActions({
    user,
    visible,
    onClose,
}: {
    user: UserDetail | null;
    visible: boolean;
    onClose: () => void;
}) {
    const { showToast } = useToast();
    if (!user) return null;

    const actions = [
        { label: 'Edit Pengguna', icon: PencilSimple, color: '#7c3aed', onPress: () => { onClose(); showToast({ type: 'info', title: 'Fitur segera hadir' }); } },
        { label: 'Reset Kata Sandi', icon: Key, color: '#d97706', onPress: () => { onClose(); showToast({ type: 'success', title: 'Link reset kata sandi dikirim' }); } },
        user.status === 'Aktif'
            ? { label: 'Tangguhkan Akun', icon: UserMinus, color: SiagaColors.danger, onPress: () => { onClose(); showToast({ type: 'warning', title: 'Akun ditangguhkan' }); } }
            : { label: 'Aktifkan Akun', icon: UserCheck, color: SiagaColors.success, onPress: () => { onClose(); showToast({ type: 'success', title: 'Akun diaktifkan' }); } },
        !user.verified
            ? { label: 'Verifikasi Akun', icon: SealCheck, color: SiagaColors.success, onPress: () => { onClose(); showToast({ type: 'success', title: 'Akun berhasil diverifikasi' }); } }
            : null,
        { label: 'Kirim Notifikasi', icon: Bell, color: '#0891b2', onPress: () => { onClose(); showToast({ type: 'info', title: 'Fitur segera hadir' }); } },
        { label: 'Hapus Pengguna', icon: Trash, color: SiagaColors.danger, onPress: () => { onClose(); showToast({ type: 'info', title: 'Fitur segera hadir' }); } },
    ].filter(Boolean) as { label: string; icon: any; color: string; onPress: () => void }[];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={onClose} />
            <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 32,
            }}>
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                    <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary, paddingHorizontal: 20, marginBottom: 10 }}>Tindakan Admin</Text>
                <View style={{ paddingHorizontal: 16, gap: 4 }}>
                    {actions.map((a, i) => {
                        const IcoComp = a.icon;
                        const isDanger = a.label === 'Hapus Pengguna' || a.label === 'Tangguhkan Akun';
                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={a.onPress}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                    padding: 14, borderRadius: 14,
                                    backgroundColor: isDanger ? '#fef2f2' : '#f8fafc',
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${a.color}18`, alignItems: 'center', justifyContent: 'center' }}>
                                    <IcoComp size={18} color={a.color} weight="duotone" />
                                </View>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: isDanger ? SiagaColors.danger : SiagaColors.primary }}>{a.label}</Text>
                                <CaretRight size={14} color={SiagaColors.secondary} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </Modal>
    );
}

// ────────────────────────────────────────────
// Stat Card (mini)
// ────────────────────────────────────────────
function StatMini({ icon: Icon, label, value, color, trend }: {
    icon: any; label: string; value: string | number; color: string; trend?: 'up' | 'down';
}) {
    return (
        <View style={{
            flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14,
            borderWidth: 1, borderColor: '#edf2f9', alignItems: 'center', gap: 6,
        }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${color}12`, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} weight="duotone" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: SiagaColors.primary }}>{value}</Text>
                {trend && (
                    trend === 'up'
                        ? <TrendUp size={14} color={SiagaColors.success} weight="bold" />
                        : <TrendDown size={14} color={SiagaColors.danger} weight="bold" />
                )}
            </View>
            <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, textAlign: 'center' }}>{label}</Text>
        </View>
    );
}

// ────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────
export default function AdminUserDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { showToast } = useToast();

    const user = DUMMY_USERS[params.id || 'u01'];
    const roleCfg = ROLE_CONFIG[user.role];
    const statusCfg = STATUS_CONFIG[user.status];
    const RoleIcon = roleCfg.icon;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const [refreshing, setRefreshing] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'stats'>('info');

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 800));
        setRefreshing(false);
    };

    // Reputation color
    const repColor = user.reputation >= 80 ? SiagaColors.success : user.reputation >= 50 ? '#d97706' : SiagaColors.danger;

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ position: 'absolute', right: -24, top: -24, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 50, bottom: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                {/* Top bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={20} color="#fff" weight="bold" />
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Detail Pengguna</Text>
                    <TouchableOpacity
                        onPress={() => setShowActions(true)}
                        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
                        activeOpacity={0.7}
                    >
                        <DotsThree size={22} color="#fff" weight="bold" />
                    </TouchableOpacity>
                </View>

                {/* User Profile Card in Header */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 22 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        {/* Avatar */}
                        <View style={{ position: 'relative' }}>
                            <View style={{
                                width: 64, height: 64, borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.3)',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>{user.initials}</Text>
                            </View>
                            {user.verified && (
                                <View style={{
                                    position: 'absolute', bottom: -2, right: -2,
                                    backgroundColor: '#fff', borderRadius: 10, padding: 2,
                                }}>
                                    <SealCheck size={16} color={SiagaColors.info} weight="fill" />
                                </View>
                            )}
                            {/* Status dot */}
                            <View style={{
                                position: 'absolute', top: -2, right: -2,
                                width: 14, height: 14, borderRadius: 7,
                                backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusCfg.dot }} />
                            </View>
                        </View>

                        {/* Name & Info */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3 }} numberOfLines={1}>{user.name}</Text>
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{user.email}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 4,
                                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                                    backgroundColor: 'rgba(255,255,255,0.18)',
                                }}>
                                    <RoleIcon size={12} color="#fff" weight="fill" />
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{roleCfg.label}</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 4,
                                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                                    backgroundColor: `${statusCfg.dot}30`,
                                }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusCfg.dot }} />
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{statusCfg.label}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Quick stats in header */}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{user.totalReports}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Laporan</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{user.totalComments}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Komentar</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{user.totalActions}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Aksi</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: repColor, fontWeight: '900', fontSize: 16 }}>{user.reputation}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Reputasi</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── TAB SWITCHER ── */}
            <View style={{
                flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8,
                borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 6,
            }}>
                {([
                    { key: 'info' as const, label: 'Informasi', icon: User },
                    { key: 'activity' as const, label: 'Aktivitas', icon: Clock },
                    { key: 'stats' as const, label: 'Statistik', icon: ChartLineUp },
                ]).map(tab => {
                    const active = activeTab === tab.key;
                    const TabIcon = tab.icon;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                                paddingVertical: 10, borderRadius: 12,
                                backgroundColor: active ? '#f5f3ff' : 'transparent',
                                borderWidth: 1, borderColor: active ? '#c4b5fd' : 'transparent',
                            }}
                            activeOpacity={0.7}
                        >
                            <TabIcon size={16} color={active ? '#7c3aed' : SiagaColors.secondary} weight={active ? 'fill' : 'duotone'} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#7c3aed' : SiagaColors.secondary }}>{tab.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── CONTENT ── */}
            <Animated.ScrollView
                style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
            >
                {/* ── TAB: Informasi ── */}
                {activeTab === 'info' && (
                    <>
                        {/* Warning banner for suspended/pending */}
                        {(user.status === 'Ditangguhkan' || user.status === 'Menunggu Verifikasi') && (
                            <View style={{
                                flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
                                backgroundColor: user.status === 'Ditangguhkan' ? '#fef2f2' : '#fffbeb',
                                borderRadius: 16, padding: 14,
                                borderWidth: 1, borderColor: user.status === 'Ditangguhkan' ? '#fecaca' : '#fde68a',
                            }}>
                                <View style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    backgroundColor: user.status === 'Ditangguhkan' ? '#fee2e2' : '#fef3c7',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Warning size={20} color={user.status === 'Ditangguhkan' ? SiagaColors.danger : '#d97706'} weight="duotone" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: user.status === 'Ditangguhkan' ? '#991b1b' : '#92400e' }}>
                                        {user.status === 'Ditangguhkan' ? 'Akun Ditangguhkan' : 'Menunggu Verifikasi'}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: user.status === 'Ditangguhkan' ? '#b91c1c' : '#b45309', marginTop: 1 }}>
                                        {user.status === 'Ditangguhkan' ? 'Akun ini telah ditangguhkan oleh admin' : 'Akun ini belum diverifikasi oleh admin'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={{
                                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                                        backgroundColor: user.status === 'Ditangguhkan' ? SiagaColors.success : '#d97706',
                                    }}
                                    activeOpacity={0.8}
                                    onPress={() => showToast({ type: 'success', title: user.status === 'Ditangguhkan' ? 'Akun diaktifkan' : 'Akun diverifikasi' })}
                                >
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                                        {user.status === 'Ditangguhkan' ? 'Aktifkan' : 'Verifikasi'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Personal Info */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Informasi Pribadi</Text>
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#edf2f9',
                                overflow: 'hidden',
                            }}>
                                {[
                                    { label: 'Nama Lengkap', value: user.name, icon: User, color: '#7c3aed' },
                                    { label: 'Email', value: user.email, icon: Envelope, color: SiagaColors.info },
                                    { label: 'Telepon', value: user.phone, icon: Phone, color: SiagaColors.success },
                                    { label: 'Wilayah', value: user.district, icon: MapPin, color: '#d97706' },
                                    ...(user.instansi ? [{ label: 'Instansi', value: user.instansi, icon: Buildings, color: '#7c3aed' }] : []),
                                ].map((item, i, arr) => {
                                    const InfoIcon = item.icon;
                                    return (
                                        <View key={i} style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            paddingHorizontal: 16, paddingVertical: 14,
                                            borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                                            borderBottomColor: '#f1f5f9',
                                        }}>
                                            <View style={{
                                                width: 34, height: 34, borderRadius: 10,
                                                backgroundColor: `${item.color}12`,
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <InfoIcon size={16} color={item.color} weight="duotone" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: SiagaColors.primary, marginTop: 2 }}>{item.value}</Text>
                                            </View>
                                            <TouchableOpacity activeOpacity={0.7} onPress={() => showToast({ type: 'success', title: 'Disalin!' })}>
                                                <Copy size={16} color={SiagaColors.secondary} weight="duotone" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Account Info */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Informasi Akun</Text>
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#edf2f9',
                                overflow: 'hidden',
                            }}>
                                {[
                                    { label: 'ID Pengguna', value: user.id.toUpperCase(), icon: Flag, color: '#7c3aed' },
                                    { label: 'Tanggal Bergabung', value: user.joined, icon: CalendarBlank, color: SiagaColors.info },
                                    { label: 'Terakhir Aktif', value: user.lastActive, icon: Clock, color: SiagaColors.success },
                                    { label: 'Total Login', value: `${user.loginCount} kali`, icon: ArrowClockwise, color: '#d97706' },
                                    { label: 'Verifikasi', value: user.verified ? 'Terverifikasi' : 'Belum Diverifikasi', icon: SealCheck, color: user.verified ? SiagaColors.success : SiagaColors.danger },
                                ].map((item, i, arr) => {
                                    const InfoIcon = item.icon;
                                    return (
                                        <View key={i} style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            paddingHorizontal: 16, paddingVertical: 14,
                                            borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                                            borderBottomColor: '#f1f5f9',
                                        }}>
                                            <View style={{
                                                width: 34, height: 34, borderRadius: 10,
                                                backgroundColor: `${item.color}12`,
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <InfoIcon size={16} color={item.color} weight="duotone" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
                                                <Text style={{
                                                    fontSize: 14, fontWeight: '600', marginTop: 2,
                                                    color: item.label === 'Verifikasi'
                                                        ? (user.verified ? SiagaColors.success : SiagaColors.danger)
                                                        : SiagaColors.primary,
                                                }}>{item.value}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Security Info */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Keamanan</Text>
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#edf2f9',
                                overflow: 'hidden',
                            }}>
                                {[
                                    { label: 'IP Registrasi', value: user.registrationIp, icon: ShieldCheck, color: '#7c3aed' },
                                    { label: 'IP Login Terakhir', value: user.lastLoginIp, icon: Eye, color: SiagaColors.info },
                                ].map((item, i, arr) => {
                                    const InfoIcon = item.icon;
                                    return (
                                        <View key={i} style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            paddingHorizontal: 16, paddingVertical: 14,
                                            borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                                            borderBottomColor: '#f1f5f9',
                                        }}>
                                            <View style={{
                                                width: 34, height: 34, borderRadius: 10,
                                                backgroundColor: `${item.color}12`,
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <InfoIcon size={16} color={item.color} weight="duotone" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: SiagaColors.primary, marginTop: 2 }}>{item.value}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Reputation card */}
                        <View style={{
                            backgroundColor: '#fff', borderRadius: 18, padding: 16,
                            borderWidth: 1, borderColor: '#edf2f9',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <Medal size={18} color="#7c3aed" weight="duotone" />
                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Skor Reputasi</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                <View style={{
                                    width: 64, height: 64, borderRadius: 32,
                                    borderWidth: 4, borderColor: `${repColor}30`,
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Text style={{ fontSize: 22, fontWeight: '900', color: repColor }}>{user.reputation}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: '800', color: repColor }}>
                                        {user.reputation >= 80 ? 'Sangat Baik' : user.reputation >= 50 ? 'Baik' : 'Perlu Perhatian'}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 2 }}>
                                        {user.reputation >= 80
                                            ? 'Pengguna ini memiliki reputasi yang sangat baik.'
                                            : user.reputation >= 50
                                                ? 'Pengguna ini memiliki reputasi yang cukup baik.'
                                                : 'Pengguna ini perlu diperhatikan lebih lanjut.'}
                                    </Text>
                                    {/* Progress bar */}
                                    <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginTop: 8 }}>
                                        <View style={{
                                            height: 6, borderRadius: 3,
                                            backgroundColor: repColor,
                                            width: `${user.reputation}%`,
                                        }} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* ── TAB: Aktivitas ── */}
                {activeTab === 'activity' && (
                    <>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Aktivitas Terbaru</Text>
                        <View style={{ gap: 0 }}>
                            {ACTIVITY_LOG.map((item, i) => {
                                const IcoComp = item.icon;
                                const color = ACTIVITY_COLORS[item.type] || SiagaColors.secondary;
                                const isLast = i === ACTIVITY_LOG.length - 1;
                                return (
                                    <View key={item.id} style={{ flexDirection: 'row', gap: 12 }}>
                                        {/* Timeline line + dot */}
                                        <View style={{ alignItems: 'center', width: 36 }}>
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 12,
                                                backgroundColor: `${color}15`,
                                                alignItems: 'center', justifyContent: 'center',
                                                zIndex: 1,
                                            }}>
                                                <IcoComp size={18} color={color} weight="duotone" />
                                            </View>
                                            {!isLast && (
                                                <View style={{
                                                    width: 2, flex: 1, backgroundColor: '#edf2f9',
                                                    marginTop: -2,
                                                }} />
                                            )}
                                        </View>

                                        {/* Content */}
                                        <View style={{
                                            flex: 1, backgroundColor: '#fff', borderRadius: 14,
                                            padding: 14, marginBottom: 10,
                                            borderWidth: 1, borderColor: '#edf2f9',
                                        }}>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{item.action}</Text>
                                            <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 3, fontWeight: '500' }}>{item.time}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* View all button */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                                backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 6,
                                borderWidth: 1, borderColor: '#edf2f9',
                            }}
                            activeOpacity={0.8}
                            onPress={() => showToast({ type: 'info', title: 'Fitur segera hadir' })}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed' }}>Lihat Semua Aktivitas</Text>
                            <CaretRight size={14} color="#7c3aed" weight="bold" />
                        </TouchableOpacity>
                    </>
                )}

                {/* ── TAB: Statistik ── */}
                {activeTab === 'stats' && (
                    <>
                        {/* Stats Grid */}
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Ringkasan Aktivitas</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <StatMini icon={FileText} label="Total Laporan" value={user.totalReports} color={SiagaColors.info} trend="up" />
                            <StatMini icon={CheckCircle} label="Diselesaikan" value={user.resolvedReports} color={SiagaColors.success} />
                            <StatMini icon={Clock} label="Pending" value={user.pendingReports} color="#d97706" />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                            <StatMini icon={ChatCircleDots} label="Komentar" value={user.totalComments} color="#0891b2" />
                            <StatMini icon={Star} label="Aksi Positif" value={user.totalActions} color="#d97706" trend="up" />
                            <StatMini icon={Medal} label="Reputasi" value={user.reputation} color={repColor} />
                        </View>

                        {/* Report breakdown */}
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Distribusi Laporan</Text>
                        <View style={{
                            backgroundColor: '#fff', borderRadius: 18, padding: 16,
                            borderWidth: 1, borderColor: '#edf2f9', gap: 12,
                        }}>
                            {/* Resolved */}
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>Diselesaikan</Text>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: SiagaColors.success }}>
                                        {user.totalReports > 0 ? Math.round((user.resolvedReports / Math.max(user.totalReports, user.resolvedReports)) * 100) : 0}%
                                    </Text>
                                </View>
                                <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                    <View style={{
                                        height: 8, borderRadius: 4, backgroundColor: SiagaColors.success,
                                        width: `${user.totalReports > 0 ? (user.resolvedReports / Math.max(user.totalReports, user.resolvedReports)) * 100 : 0}%`,
                                    }} />
                                </View>
                            </View>
                            {/* Pending */}
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>Pending</Text>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#d97706' }}>
                                        {user.totalReports > 0 ? Math.round((user.pendingReports / Math.max(user.totalReports, user.resolvedReports)) * 100) : 0}%
                                    </Text>
                                </View>
                                <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                    <View style={{
                                        height: 8, borderRadius: 4, backgroundColor: '#d97706',
                                        width: `${user.totalReports > 0 ? (user.pendingReports / Math.max(user.totalReports, user.resolvedReports)) * 100 : 0}%`,
                                    }} />
                                </View>
                            </View>
                            {/* Remaining */}
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>Dalam Proses</Text>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: SiagaColors.info }}>
                                        {user.totalReports > 0
                                            ? Math.max(0, 100 - Math.round((user.resolvedReports / Math.max(user.totalReports, user.resolvedReports)) * 100) - Math.round((user.pendingReports / Math.max(user.totalReports, user.resolvedReports)) * 100))
                                            : 0}%
                                    </Text>
                                </View>
                                <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                    <View style={{
                                        height: 8, borderRadius: 4, backgroundColor: SiagaColors.info,
                                        width: `${user.totalReports > 0
                                            ? Math.max(0, 100 - (user.resolvedReports / Math.max(user.totalReports, user.resolvedReports)) * 100 - (user.pendingReports / Math.max(user.totalReports, user.resolvedReports)) * 100)
                                            : 0}%`,
                                    }} />
                                </View>
                            </View>
                        </View>

                        {/* Login stats */}
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12, marginTop: 20 }}>Statistik Login</Text>
                        <View style={{
                            backgroundColor: '#fff', borderRadius: 18, padding: 16,
                            borderWidth: 1, borderColor: '#edf2f9',
                        }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#f5f3ff', borderRadius: 14 }}>
                                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#7c3aed' }}>{user.loginCount}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>Total Login</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#ecfdf5', borderRadius: 14 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.success }}>{user.lastActive}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>Terakhir Aktif</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </Animated.ScrollView>

            {/* ── BOTTOM ACTION BAR ── */}
            <View style={{
                backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
                paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16),
                flexDirection: 'row', gap: 10,
            }}>
                <TouchableOpacity
                    onPress={() => showToast({ type: 'info', title: 'Fitur segera hadir' })}
                    style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                        backgroundColor: '#f5f3ff', borderRadius: 14, paddingVertical: 14,
                        borderWidth: 1.5, borderColor: '#c4b5fd',
                    }}
                    activeOpacity={0.8}
                >
                    <PencilSimple size={18} color="#7c3aed" weight="bold" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#7c3aed' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowActions(true)}
                    style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                        backgroundColor: '#7c3aed', borderRadius: 14, paddingVertical: 14,
                        elevation: 3, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2, shadowRadius: 8,
                    }}
                    activeOpacity={0.85}
                >
                    <ShieldCheck size={18} color="#fff" weight="bold" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Tindakan</Text>
                </TouchableOpacity>
            </View>

            {/* ── ACTION SHEET MODAL ── */}
            <AdminQuickActions
                user={user}
                visible={showActions}
                onClose={() => setShowActions(false)}
            />
        </View>
    );
}
