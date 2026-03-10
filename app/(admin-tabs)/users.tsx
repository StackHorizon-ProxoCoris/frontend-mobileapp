import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    Animated, Dimensions, RefreshControl, Modal, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Users, UserGear, Buildings, UserCheck, UserCircleCheck,
    MagnifyingGlass, FunnelSimple, Plus, CaretRight, CaretDown,
    CheckCircle, XCircle, Clock, DotsThreeVertical, PencilSimple,
    Trash, ShieldCheck, Bell, Warning, WarningDiamond,
    ArrowClockwise, Eye, Key, UserMinus, SealCheck, Sliders,
    ArrowUp, ArrowDown, CaretUpDown,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getAdminUsers, getAdminUserStats, toggleUserSuspend, type AdminUser, type UserStats } from '@/services/admin.service';

const { width } = Dimensions.get('window');

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type UserRole = 'Masyarakat' | 'Pemerintah' | 'Admin';
type UserStatus = 'Aktif' | 'Nonaktif' | 'Ditangguhkan' | 'Menunggu Verifikasi';
type SortKey = 'name' | 'reports' | 'joined' | 'role';

interface UserItem {
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
    instansi?: string;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
const ROLE_MAP: Record<string, UserRole> = { user: 'Masyarakat', pemerintah: 'Pemerintah', admin: 'Admin' };
const AVATAR_COLORS = ['#3b82f6', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#be185d', '#94a3b8'];

function getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function mapAdminUserToItem(u: AdminUser, idx: number): UserItem {
    const isSuspended = !!u.settings?.suspended;
    return {
        id: u.id,
        name: u.full_name || 'Tanpa Nama',
        email: u.email || '-',
        role: ROLE_MAP[u.role] || 'Masyarakat',
        status: isSuspended ? 'Ditangguhkan' : 'Aktif',
        reports: u.eco_points || 0,
        joined: new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        lastActive: '-',
        initials: getInitials(u.full_name || 'NN'),
        avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        verified: u.current_badge !== null,
        district: u.district || u.instansi || '-',
        phone: u.phone || '-',
        instansi: u.instansi || undefined,
    };
}

function toAdminUserDetailParams(user: UserItem) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        reports: String(user.reports),
        joined: user.joined,
        lastActive: user.lastActive,
        initials: user.initials,
        avatarColor: user.avatarColor,
        verified: String(user.verified),
        district: user.district,
        phone: user.phone,
        ...(user.instansi ? { instansi: user.instansi } : {}),
    };
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; icon: any }> = {
    Masyarakat: { label: 'Masyarakat', color: SiagaColors.info, bg: '#eff6ff', icon: Users },
    Pemerintah: { label: 'Pemerintah', color: '#7c3aed', bg: '#f5f3ff', icon: Buildings },
    Admin: { label: 'Admin', color: '#d97706', bg: '#fffbeb', icon: UserGear },
};

const STATUS_CONFIG: Record<UserStatus, { color: string; bg: string; dot: string }> = {
    'Aktif': { color: SiagaColors.success, bg: '#ecfdf5', dot: '#4ade80' },
    'Nonaktif': { color: SiagaColors.secondary, bg: '#f1f5f9', dot: '#94a3b8' },
    'Ditangguhkan': { color: SiagaColors.danger, bg: '#fef2f2', dot: SiagaColors.danger },
    'Menunggu Verifikasi': { color: '#d97706', bg: '#fffbeb', dot: '#fbbf24' },
};

const FILTER_ROLES: (UserRole | 'Semua')[] = ['Semua', 'Masyarakat', 'Pemerintah', 'Admin'];
const FILTER_STATUS: (UserStatus | 'Semua')[] = ['Semua', 'Aktif', 'Nonaktif', 'Ditangguhkan', 'Menunggu Verifikasi'];

// ────────────────────────────────────────────
// User Action Sheet Modal
// ────────────────────────────────────────────
function UserActionSheet({
    user,
    visible,
    onClose,
    onViewProfile,
    onSuspendToggle,
}: {
    user: UserItem | null;
    visible: boolean;
    onClose: () => void;
    onViewProfile?: (user: UserItem) => void;
    onSuspendToggle?: (user: UserItem) => void;
}) {
    if (!user) return null;
    const statusCfg = STATUS_CONFIG[user.status];
    const roleCfg = ROLE_CONFIG[user.role];

    const actions = [
        { label: 'Lihat Profil', icon: Eye, color: SiagaColors.info },
        { label: 'Edit Pengguna', icon: PencilSimple, color: '#7c3aed' },
        { label: 'Reset Kata Sandi', icon: Key, color: '#d97706' },
        user.status === 'Aktif'
            ? { label: 'Tangguhkan Akun', icon: UserMinus, color: SiagaColors.danger }
            : { label: 'Aktifkan Akun', icon: UserCheck, color: SiagaColors.success },
        !user.verified
            ? { label: 'Verifikasi Akun', icon: SealCheck, color: SiagaColors.success }
            : null,
        { label: 'Kirim Notifikasi', icon: Bell, color: '#0891b2' },
        { label: 'Hapus Pengguna', icon: Trash, color: SiagaColors.danger },
    ].filter(Boolean) as { label: string; icon: any; color: string }[];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
                activeOpacity={1}
                onPress={onClose}
            />
            <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
                paddingBottom: 32,
            }}>
                {/* Handle */}
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                    <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
                </View>

                {/* User Identity */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{
                            width: 52, height: 52, borderRadius: 16,
                            backgroundColor: `${user.avatarColor}20`,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 2, borderColor: `${user.avatarColor}30`,
                        }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: user.avatarColor }}>{user.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>{user.name}</Text>
                                {user.verified && <SealCheck size={15} color={SiagaColors.info} weight="fill" />}
                            </View>
                            <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 1 }}>{user.email}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 5 }}>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: roleCfg.bg }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: roleCfg.color }}>{roleCfg.label}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: statusCfg.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: statusCfg.dot }} />
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: statusCfg.color }}>{user.status}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 4 }}>
                    {actions.map((action, i) => {
                        const IconComp = action.icon;
                        const isDelete = action.label === 'Hapus Pengguna';
                        return (
                            <TouchableOpacity
                                key={i}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                    padding: 14, borderRadius: 14,
                                    backgroundColor: isDelete ? '#fef2f2' : '#f8fafc',
                                }}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (action.label === 'Lihat Profil' && onViewProfile && user) {
                                        onClose();
                                        onViewProfile(user);
                                    } else if ((action.label === 'Tangguhkan Akun' || action.label === 'Aktifkan Akun') && onSuspendToggle && user) {
                                        onClose();
                                        onSuspendToggle(user);
                                    } else {
                                        onClose();
                                    }
                                }}
                            >
                                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${action.color}18`, alignItems: 'center', justifyContent: 'center' }}>
                                    <IconComp size={18} color={action.color} weight="duotone" />
                                </View>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: isDelete ? SiagaColors.danger : SiagaColors.primary }}>{action.label}</Text>
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
// User Card Component
// ────────────────────────────────────────────
function UserCard({ user, onAction }: { user: UserItem; onAction: (u: UserItem) => void }) {
    const roleCfg = ROLE_CONFIG[user.role];
    const statusCfg = STATUS_CONFIG[user.status];
    const RoleIcon = roleCfg.icon;

    return (
        <View style={{
            backgroundColor: '#fff', borderRadius: 18, padding: 14,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
        }}>
            {/* Top row */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                {/* Avatar */}
                <View style={{ position: 'relative' }}>
                    <View style={{
                        width: 46, height: 46, borderRadius: 14,
                        backgroundColor: `${user.avatarColor}18`,
                        borderWidth: 1.5, borderColor: `${user.avatarColor}30`,
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: user.avatarColor }}>{user.initials}</Text>
                    </View>
                    {user.verified && (
                        <View style={{ position: 'absolute', bottom: -3, right: -3, backgroundColor: '#fff', borderRadius: 8, padding: 1 }}>
                            <SealCheck size={14} color={SiagaColors.info} weight="fill" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }} numberOfLines={1}>{user.name}</Text>
                    <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }} numberOfLines={1}>{user.email}</Text>

                    {/* Tags */}
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: roleCfg.bg }}>
                            <RoleIcon size={10} color={roleCfg.color} weight="fill" />
                            <Text style={{ fontSize: 10, fontWeight: '700', color: roleCfg.color }}>{roleCfg.label}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: statusCfg.bg }}>
                            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: statusCfg.dot }} />
                            <Text style={{ fontSize: 10, fontWeight: '700', color: statusCfg.color }}>{user.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu button */}
                <TouchableOpacity
                    onPress={() => onAction(user)}
                    style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}
                    activeOpacity={0.7}
                >
                    <DotsThreeVertical size={18} color={SiagaColors.secondary} weight="bold" />
                </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginTop: 12, marginBottom: 10 }} />

            {/* Bottom stats row */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: SiagaColors.primary }}>{user.reports}</Text>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 1 }}>Laporan</Text>
                </View>
                <View style={{ width: 1, height: 28, backgroundColor: '#f1f5f9' }} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.primary }} numberOfLines={1}>{user.district}</Text>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 1 }}>Wilayah</Text>
                </View>
                <View style={{ width: 1, height: 28, backgroundColor: '#f1f5f9' }} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary }} numberOfLines={1}>{user.joined}</Text>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 1 }}>Bergabung</Text>
                </View>
            </View>
        </View>
    );
}

// Sort icon helper (plain function, NOT a component, to avoid react-native-css-interop wrap-jsx crash)
function getSortIcon(k: SortKey, sortKey: SortKey, sortAsc: boolean) {
    if (sortKey !== k) return <CaretUpDown size={11} color={SiagaColors.secondary} weight="bold" />;
    return sortAsc
        ? <ArrowUp size={11} color="#7c3aed" weight="bold" />
        : <ArrowDown size={11} color="#7c3aed" weight="bold" />;
}

// ────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────
export default function AdminUsersScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [filterRole, setFilterRole] = useState<UserRole | 'Semua'>('Semua');
    const [filterStatus, setFilterStatus] = useState<UserStatus | 'Semua'>('Semua');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // API state
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    const loadUsers = useCallback(async () => {
        try {
            const roleFilter = filterRole !== 'Semua'
                ? (filterRole === 'Masyarakat' ? 'user' : filterRole === 'Pemerintah' ? 'pemerintah' : 'admin')
                : undefined;
            const [usersRes, statsRes] = await Promise.all([
                getAdminUsers({ role: roleFilter, search: query || undefined, limit: 50 }),
                getAdminUserStats(),
            ]);
            if (usersRes.success && usersRes.data) {
                setUsers(usersRes.data.map((u: AdminUser, i: number) => mapAdminUserToItem(u, i)));
            }
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch { /* no-op */ } finally {
            setLoading(false);
        }
    }, [filterRole, query]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
        ]).start();
        loadUsers();
    }, [loadUsers]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    };

    const handleSuspendToggle = useCallback(async (user: UserItem) => {
        const isSuspended = user.status === 'Ditangguhkan';
        const action = isSuspended ? 'mengaktifkan' : 'menangguhkan';
        Alert.alert(
            isSuspended ? 'Aktifkan Akun' : 'Tangguhkan Akun',
            `Apakah Anda yakin ingin ${action} akun ${user.name}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Ya',
                    style: isSuspended ? 'default' : 'destructive',
                    onPress: async () => {
                        const res = await toggleUserSuspend(user.id, !isSuspended);
                        if (res.success) loadUsers();
                    },
                },
            ]
        );
    }, [loadUsers]);

    // ── Filtered & sorted list ──
    const filteredUsers = useMemo(() => {
        let list = users.filter(u => {
            const matchS = filterStatus === 'Semua' || u.status === filterStatus;
            return matchS;
        });
        list = [...list].sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortKey === 'reports') cmp = a.reports - b.reports;
            else if (sortKey === 'role') cmp = a.role.localeCompare(b.role);
            else if (sortKey === 'joined') cmp = a.joined.localeCompare(b.joined);
            return sortAsc ? cmp : -cmp;
        });
        return list;
    }, [users, filterStatus, sortKey, sortAsc]);

    // ── Summary stats ──
    const totalPending = 0;

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc(prev => !prev);
        else { setSortKey(key); setSortAsc(true); }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ position: 'absolute', right: -24, top: -24, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 50, bottom: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 }}>
                    {/* Title row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={22} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3 }}>Pengguna</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Manajemen Akun</Text>
                            </View>
                        </View>
                        {/* Add user button */}
                        <TouchableOpacity
                            onPress={() => router.push('/tambah-pengguna' as any)}
                            style={{
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                            backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 8,
                            borderRadius: 12,
                        }} activeOpacity={0.8}>
                            <Plus size={15} color="#fff" weight="bold" />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Tambah</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats chips */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{stats?.total || users.length}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Total</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(74,222,128,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#4ade80', fontWeight: '900', fontSize: 18 }}>{stats?.byRole?.user || 0}</Text>
                            <Text style={{ color: 'rgba(74,222,128,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Masyarakat</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(251,191,36,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fbbf24', fontWeight: '900', fontSize: 18 }}>{stats?.byRole?.pemerintah || 0}</Text>
                            <Text style={{ color: 'rgba(251,191,36,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Pemerintah</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#f87171', fontWeight: '900', fontSize: 18 }}>{stats?.byRole?.admin || 0}</Text>
                            <Text style={{ color: 'rgba(248,113,113,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Admin</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── SEARCH & FILTER BAR ── */}
            <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 }}>
                {/* Search input */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f7fb', borderRadius: 14, paddingHorizontal: 12, gap: 8, height: 44 }}>
                    <MagnifyingGlass size={18} color={SiagaColors.secondary} weight="bold" />
                    <TextInput
                        placeholder="Cari nama atau email..."
                        placeholderTextColor={SiagaColors.secondary}
                        value={query}
                        onChangeText={setQuery}
                        style={{ flex: 1, fontSize: 14, fontWeight: '500', color: SiagaColors.primary }}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
                            <XCircle size={18} color={SiagaColors.secondary} weight="fill" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter toggle row */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        style={{
                            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                            backgroundColor: showFilters ? '#f5f3ff' : '#f4f7fb', borderRadius: 12, paddingVertical: 9,
                            borderWidth: 1, borderColor: showFilters ? '#c4b5fd' : 'transparent',
                        }}
                        activeOpacity={0.8}
                        onPress={() => setShowFilters(v => !v)}
                    >
                        <Sliders size={15} color={showFilters ? '#7c3aed' : SiagaColors.secondary} weight="bold" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: showFilters ? '#7c3aed' : SiagaColors.secondary }}>Filter</Text>
                        {(filterRole !== 'Semua' || filterStatus !== 'Semua') && (
                            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#7c3aed', marginLeft: 2 }} />
                        )}
                    </TouchableOpacity>

                    {/* Sort buttons */}
                    {([
                        { k: 'name' as SortKey, label: 'Nama' },
                        { k: 'reports' as SortKey, label: 'Laporan' },
                        { k: 'role' as SortKey, label: 'Peran' },
                    ]).map(s => (
                        <TouchableOpacity
                            key={s.k}
                            style={{
                                flexDirection: 'row', alignItems: 'center', gap: 4,
                                backgroundColor: sortKey === s.k ? '#f5f3ff' : '#f4f7fb',
                                borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9,
                                borderWidth: 1, borderColor: sortKey === s.k ? '#c4b5fd' : 'transparent',
                            }}
                            activeOpacity={0.8}
                            onPress={() => toggleSort(s.k)}
                        >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: sortKey === s.k ? '#7c3aed' : SiagaColors.secondary }}>{s.label}</Text>
                            {getSortIcon(s.k, sortKey, sortAsc)}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Expanded filters */}
                {showFilters && (
                    <View style={{ gap: 10 }}>
                        {/* Role filter */}
                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>PERAN PENGGUNA</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={{ flexDirection: 'row', gap: 7 }}>
                                    {FILTER_ROLES.map(r => {
                                        const active = filterRole === r;
                                        return (
                                            <TouchableOpacity
                                                key={r}
                                                onPress={() => setFilterRole(r as any)}
                                                style={{
                                                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
                                                    backgroundColor: active ? '#7c3aed' : '#f4f7fb',
                                                    borderWidth: 1, borderColor: active ? '#7c3aed' : 'transparent',
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : SiagaColors.secondary }}>{r}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                        {/* Status filter */}
                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>STATUS AKUN</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={{ flexDirection: 'row', gap: 7 }}>
                                    {FILTER_STATUS.map(s => {
                                        const active = filterStatus === s;
                                        return (
                                            <TouchableOpacity
                                                key={s}
                                                onPress={() => setFilterStatus(s as any)}
                                                style={{
                                                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
                                                    backgroundColor: active ? '#7c3aed' : '#f4f7fb',
                                                    borderWidth: 1, borderColor: active ? '#7c3aed' : 'transparent',
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : SiagaColors.secondary }}>{s}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </View>

            {/* ── PENDING VERIFICATION BANNER ── */}
            {totalPending > 0 && (
                <TouchableOpacity
                    style={{
                        marginHorizontal: 16, marginTop: 12,
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        backgroundColor: '#fffbeb', borderRadius: 16, padding: 12,
                        borderWidth: 1, borderColor: '#fde68a',
                    }}
                    activeOpacity={0.85}
                >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
                        <WarningDiamond size={20} color="#d97706" weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#92400e' }}>{totalPending} Akun Menunggu Verifikasi</Text>
                        <Text style={{ fontSize: 11, color: '#b45309', marginTop: 1 }}>Periksa dan verifikasi akun pemerintah baru</Text>
                    </View>
                    <CaretRight size={14} color="#d97706" weight="bold" />
                </TouchableOpacity>
            )}

            {/* ── USER LIST ── */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <FlatList
                    data={filteredUsers}
                    keyExtractor={u => u.id}
                    contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
                    ListHeaderComponent={
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.secondary }}>
                                Menampilkan{' '}
                                <Text style={{ color: SiagaColors.primary, fontWeight: '800' }}>{filteredUsers.length}</Text>
                                {' '}dari {stats?.total || users.length} pengguna
                            </Text>
                            {(filterRole !== 'Semua' || filterStatus !== 'Semua' || query !== '') && (
                                <TouchableOpacity
                                    onPress={() => { setFilterRole('Semua'); setFilterStatus('Semua'); setQuery(''); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#7c3aed' }}>Reset Filter</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 10 }}>
                            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={32} color={SiagaColors.secondary} weight="duotone" />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Tidak ada pengguna</Text>
                            <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center' }}>
                                Coba ubah kata kunci atau filter yang digunakan.
                            </Text>
                            <TouchableOpacity
                                onPress={() => { setFilterRole('Semua'); setFilterStatus('Semua'); setQuery(''); }}
                                style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#7c3aed', borderRadius: 12, marginTop: 4 }}
                                activeOpacity={0.8}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Reset Filter</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => router.push({ pathname: '/admin-user-detail' as any, params: toAdminUserDetailParams(item) })}
                        >
                            <UserCard user={item} onAction={(u) => { setSelectedUser(u); setSheetVisible(true); }} />
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            </Animated.View>

            {/* ── ACTION SHEET MODAL ── */}
            <UserActionSheet
                user={selectedUser}
                visible={sheetVisible}
                onClose={() => { setSheetVisible(false); setSelectedUser(null); }}
                onViewProfile={(u) => router.push({ pathname: '/admin-user-detail' as any, params: toAdminUserDetailParams(u) })}
                onSuspendToggle={handleSuspendToggle}
            />
        </View>
    );
}
