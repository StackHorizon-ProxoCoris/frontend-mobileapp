import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    MapPin, DotsThreeVertical, ShieldCheck,
    FileText, HandsClapping, Leaf, TrendUp,
    Star, Medal, Trophy, Crown, Target,
    CaretRight, Clock, Camera, Trash, Wrench,
    Bell, SignOut, PencilSimple,
    CheckCircle, Sparkle, Gear, ArrowRight,
    ChartBar, Eye, ShieldCheckered,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getActivities, type ActivityItem } from '@/services/activity.service';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';

const BADGES = [
    { icon: Medal, color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', label: 'Warga Peduli', active: true },
    { icon: Star, color: '#3b82f6', bg: '#dbeafe', border: '#bfdbfe', label: 'Relawan Aktif', active: true },
    { icon: ShieldCheck, color: '#059669', bg: '#d1fae5', border: '#a7f3d0', label: 'Pelapor Handal', active: true },
    { icon: Trophy, color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe', label: 'Top Contributor', active: false },
    { icon: Crown, color: '#ec4899', bg: '#fce7f3', border: '#fbcfe8', label: 'Pahlawan Komunitas', active: false },
    { icon: Target, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: '100 Hari Streak', active: false },
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    Camera, Trash, Wrench,
};

export default function ProfilScreen() {
    const [sosVisible, setSosVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        async function load() {
            const result = await getActivities();
            if (result.success && result.data) setRecentActivities(result.data.slice(0, 3));
        }
        load();
    }, []);

    const handleActivityPress = (refId?: string, type?: string) => {
        if (refId) {
            if (type === 'report' || type === 'support' || type === 'verify') {
                router.push({ pathname: '/report-detail', params: { id: refId } });
            } else if (type === 'action') {
                router.push({ pathname: '/action-detail', params: { id: refId } });
            }
        }
    };

    return (
        <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Profile Header - Gradient Style */}
                <View style={{ backgroundColor: SiagaColors.primary }}>
                    <View className="px-5 pt-3 pb-14">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-base font-bold text-white/80">Profil Saya</Text>
                            <View className="flex-row items-center gap-2">
                                <TouchableOpacity
                                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                                    onPress={() => Alert.alert('Notifikasi', 'Belum ada notifikasi baru.')}
                                    activeOpacity={0.7}
                                >
                                    <Bell size={14} color="rgba(255,255,255,0.8)" weight="duotone" />

                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                                    onPress={() => router.push('/pengaturan')}
                                    activeOpacity={0.7}
                                >
                                    <Gear size={14} color="rgba(255,255,255,0.8)" weight="duotone" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Avatar & Info Card - Overlapping */}
                <View className="mx-5 -mt-10 bg-white rounded-2xl border border-slate-100 p-5" style={{ elevation: 3, shadowColor: '#082a4c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 }}>
                    <View className="flex-row items-start gap-4">
                        {/* Avatar */}
                        <View className="relative">
                            <View
                                className="w-[68px] h-[68px] rounded-2xl items-center justify-center"
                                style={{ backgroundColor: SiagaColors.primary, elevation: 2 }}
                            >
                                <Text className="text-2xl font-bold text-white">{user?.initials || 'U'}</Text>
                            </View>
                            <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white items-center justify-center">
                                <CheckCircle size={10} color="#fff" weight="fill" />
                            </View>
                        </View>

                        {/* Info */}
                        <View className="flex-1">
                            <Text className="text-[16px] font-bold text-primary">{user?.fullName || 'User'}</Text>
                            <View className="flex-row items-center gap-1 mt-0.5">
                                <MapPin size={11} color={SiagaColors.secondary} weight="duotone" />
                                <Text className="text-xs text-secondary">{user?.district || '-'}, {user?.city || '-'}</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5 mt-2">
                                <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md" style={{ backgroundColor: '#dcfce7' }}>
                                    <CheckCircle size={10} color="#15803d" weight="fill" />
                                    <Text className="text-[10px] font-bold text-success">Terverifikasi</Text>
                                </View>
                                <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50">
                                    <Medal size={10} color="#f59e0b" weight="duotone" />
                                    <Text className="text-[10px] font-bold" style={{ color: '#b45309' }}>{user?.currentBadge || 'Warga Baru'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Edit Button */}
                        <TouchableOpacity
                            className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center"
                            onPress={() => router.push('/edit-profil')}
                            activeOpacity={0.7}
                        >
                            <PencilSimple size={14} color={SiagaColors.primary} weight="duotone" />
                        </TouchableOpacity>
                    </View>

                    {/* Bio */}
                    <Text className="text-[13px] text-secondary mt-3 leading-5">Warga aktif yang peduli terhadap lingkungan dan infrastruktur kota.</Text>

                    {/* Stats Row */}
                    <View className="flex-row gap-2 mt-4">
                        {[
                            { value: (user?.totalReports || 0).toString(), label: 'Laporan', color: SiagaColors.info },
                            { value: (user?.totalActions || 0).toString(), label: 'Aksi', color: SiagaColors.success },
                            { value: (user?.ecoPoints || 0).toString(), label: 'Eco-Points', color: '#f59e0b' },
                            { value: '#-', label: 'Rank', color: '#7c3aed' },
                        ].map((s, i) => (
                            <View key={i} className="flex-1 bg-slate-50 rounded-xl p-2.5 items-center">
                                <Text className="text-base font-bold" style={{ color: s.color }}>{s.value}</Text>
                                <Text className="text-[10px] font-medium text-secondary mt-0.5">{s.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Eco-Points Card */}
                <View className="mx-5 mt-4 rounded-2xl p-4 overflow-hidden" style={{ backgroundColor: SiagaColors.primary, elevation: 2 }}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-1.5">
                            <Leaf size={16} color="#fff" weight="duotone" />
                            <Text className="text-sm font-bold text-white">Eco-Points</Text>
                        </View>
                        <View className="bg-white/10 rounded-lg px-2 py-1 flex-row items-center gap-1">
                            <TrendUp size={10} color="#10b981" weight="bold" />
                            <Text className="text-[11px] font-bold text-success">+45 minggu ini</Text>
                        </View>
                    </View>
                    <View className="flex-row items-end gap-1 mb-2">
                        <Text className="text-3xl font-extrabold text-white">{user?.ecoPoints || 0}</Text>
                        <Text className="text-xs text-white/50 pb-1">points</Text>
                    </View>
                    <View className="mb-2">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-medium text-white/60">Level berikutnya</Text>
                            <Text className="text-[11px] font-bold text-white">{user?.ecoPoints || 0} pts</Text>
                        </View>
                        <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(((user?.ecoPoints || 0) / 300) * 100, 100)}%`, backgroundColor: '#10b981' }}
                            />
                        </View>
                        <Text className="text-[10px] text-white/40 mt-1">Terus berkontribusi untuk badge berikutnya!</Text>
                    </View>
                    <View className="flex-row gap-2 mt-1">
                        {[
                            { icon: <FileText size={10} color="#fff" weight="duotone" />, label: 'Lapor: +10 pts' },
                            { icon: <HandsClapping size={10} color="#fff" weight="duotone" />, label: 'Aksi: +50 pts' },
                            { icon: <Sparkle size={10} color="#fff" weight="duotone" />, label: 'Validasi: +5 pts' },
                        ].map((p, i) => (
                            <View key={i} className="flex-row items-center gap-1 bg-white/10 rounded-md px-2 py-1">
                                {p.icon}
                                <Text className="text-[10px] font-medium text-white/80">{p.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Badges */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <View className="w-7 h-7 rounded-lg bg-amber-50 items-center justify-center">
                                <Trophy size={14} color="#f59e0b" weight="duotone" />
                            </View>
                            <Text className="text-base font-bold text-primary">Badge Saya</Text>
                        </View>
                        <View className="bg-amber-50 rounded-md px-2 py-0.5">
                            <Text className="text-[11px] font-semibold" style={{ color: '#b45309' }}>3 / 6 terkumpul</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        {BADGES.map((b, i) => (
                            <TouchableOpacity
                                key={i}
                                className="w-[76px] items-center p-2.5 rounded-xl border-2"
                                style={{
                                    borderColor: b.active ? b.border : '#f1f5f9',
                                    backgroundColor: b.active ? b.bg : '#fafafa',
                                    opacity: b.active ? 1 : 0.45,
                                }}
                                onPress={() => {
                                    if (b.active) {
                                        Alert.alert(b.label, `Badge "${b.label}" berhasil dikumpulkan!`);
                                    } else {
                                        Alert.alert(b.label, `Badge belum terbuka. Terus berkontribusi untuk membuka badge ini.`);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <View className="w-10 h-10 rounded-xl items-center justify-center mb-1.5" style={{ backgroundColor: b.active ? `${b.color}15` : '#f1f5f9' }}>
                                    <b.icon size={20} color={b.active ? b.color : '#c4c4c4'} weight="duotone" />
                                </View>
                                <Text className="text-[10px] font-bold text-center" style={{ color: b.active ? SiagaColors.primary : '#999' }} numberOfLines={2}>{b.label}</Text>
                                {b.active && (
                                    <View className="absolute -top-1 -right-1">
                                        <CheckCircle size={14} color={b.color} weight="fill" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Recent Activity */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                                <Clock size={14} color="#3b82f6" weight="duotone" />
                            </View>
                            <Text className="text-base font-bold text-primary">Aktivitas Terkini</Text>
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg"
                            onPress={() => router.push('/riwayat-aktivitas')}
                            activeOpacity={0.7}
                        >
                            <Text className="text-[11px] font-bold text-info">Lihat Semua</Text>
                            <ArrowRight size={10} color={SiagaColors.info} weight="bold" />
                        </TouchableOpacity>
                    </View>
                    <View className="gap-2">
                        {recentActivities.map((a) => {
                            const IconComp = ICON_MAP[a.icon] || Camera;
                            return (
                                <TouchableOpacity
                                    key={a.id}
                                    className="bg-white border border-slate-100 rounded-xl p-3 flex-row items-center gap-3"
                                    style={{ elevation: 1 }}
                                    onPress={() => handleActivityPress(a.refId, a.type)}
                                    activeOpacity={a.refId ? 0.7 : 1}
                                >
                                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: a.bgColor }}>
                                        <IconComp size={18} color={a.color} weight="duotone" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-primary" numberOfLines={1}>{a.title}</Text>
                                        <View className="flex-row items-center gap-2 mt-0.5">
                                            <View className="flex-row items-center gap-0.5">
                                                <Clock size={9} color={SiagaColors.secondary} />
                                                <Text className="text-[11px] text-secondary">{a.time}</Text>
                                            </View>
                                            <View className="flex-row items-center gap-0.5">
                                                <Leaf size={9} color="#059669" weight="duotone" />
                                                <Text className="text-[11px] font-bold text-success">+{a.points} pts</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {a.refId && <CaretRight size={14} color={SiagaColors.secondary} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Quick Menu */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center gap-2 mb-3">
                        <View className="w-7 h-7 rounded-lg bg-slate-100 items-center justify-center">
                            <Gear size={14} color={SiagaColors.primary} weight="duotone" />
                        </View>
                        <Text className="text-base font-bold text-primary">Menu</Text>
                    </View>
                    <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                        {[
                            { icon: PencilSimple, label: 'Edit Profil', color: SiagaColors.primary, onPress: () => router.push('/edit-profil') },
                            { icon: ChartBar, label: 'Riwayat Aktivitas', color: '#3b82f6', onPress: () => router.push('/riwayat-aktivitas') },
                            { icon: Gear, label: 'Pengaturan', color: '#475569', onPress: () => router.push('/pengaturan') },
                            { icon: ShieldCheckered, label: 'Keamanan & Privasi', color: '#f59e0b', onPress: () => router.push('/pengaturan') },
                            { icon: Eye, label: 'Tentang SIAGA', color: SiagaColors.info, onPress: () => router.push('/tentang') },
                        ].map((item, i, arr) => (
                            <TouchableOpacity
                                key={i}
                                className="flex-row items-center gap-3 px-4 py-3.5"
                                style={{
                                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                                    borderBottomColor: '#f8fafc',
                                }}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>
                                    <item.icon size={16} color={item.color} weight="duotone" />
                                </View>
                                <Text className="flex-1 text-sm font-semibold text-primary">{item.label}</Text>
                                <CaretRight size={14} color={SiagaColors.secondary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout */}
                <View className="mx-5 mt-5">
                    <TouchableOpacity
                        className="flex-row items-center justify-center gap-2 py-3.5 bg-red-50 border border-red-100 rounded-2xl"
                        onPress={() => {
                            Alert.alert(
                                'Keluar',
                                'Apakah Anda yakin ingin keluar dari akun ini?',
                                [
                                    { text: 'Batal', style: 'cancel' },
                                    { text: 'Keluar', style: 'destructive', onPress: async () => {
                                        showToast({ type: 'info', title: 'Berhasil Keluar', message: 'Anda telah logout dari akun.' });
                                        await logout();
                                    } },
                                ]
                            );
                        }}
                        activeOpacity={0.7}
                    >
                        <SignOut size={18} color={SiagaColors.danger} weight="duotone" />
                        <Text className="text-sm font-bold text-danger">Keluar</Text>
                    </TouchableOpacity>
                    <Text className="text-center text-[11px] text-secondary mt-3">SIAGA v1.0.0 · Build 2026</Text>
                    <Text className="text-center text-[10px] text-secondary/50 mt-0.5">SIAGA — ProxoCoris</Text>
                </View>
            </ScrollView>

            <SOSButton onPress={() => setSosVisible(true)} />
            <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
        </View>
    );
}
