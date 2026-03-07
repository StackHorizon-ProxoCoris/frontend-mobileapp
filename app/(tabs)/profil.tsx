import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    MapPin, ShieldCheck,
    FileText, HandsClapping, Leaf, TrendUp,
    Star, Medal, Trophy, Crown, Target,
    CaretRight, Clock, Camera, Trash, Wrench,
    Bell, SignOut, PencilSimple,
    CheckCircle, Sparkle, Gear, ArrowRight,
    ChartBar, Eye, ShieldCheckered,
    Plant, Newspaper, CloudRain, BookOpenText, MegaphoneSimple,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getActivities, type ActivityItem } from '@/services/activity.service';
import { getActions, type ActionData } from '@/services/action.service';
import { getInfoList, type InfoFeedData } from '@/services/info.service';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';

const ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
    Medal, Star, ShieldCheck, Trophy, Crown, Target,
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    Camera, Trash, Wrench,
};

export default function ProfilScreen() {
    const [sosVisible, setSosVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, logout, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
    const [rewardActions, setRewardActions] = useState<ActionData[]>([]);
    const [infoFeed, setInfoFeed] = useState<InfoFeedData[]>([]);

    useEffect(() => {
        async function load() {
            // Refresh user profile to get updated ecoPoints
            if (refreshUser) await refreshUser();
            const [activitiesResult, actionsResult, infoResult] = await Promise.all([
                getActivities(),
                getActions({ limit: 5 }),
                getInfoList({ limit: 3 }),
            ]);
            if (activitiesResult.success && activitiesResult.data) setRecentActivities(activitiesResult.data.slice(0, 3));
            if (actionsResult.success && actionsResult.data) setRewardActions(actionsResult.data);
            if (infoResult.success && infoResult.data) setInfoFeed(infoResult.data);
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
                                    onPress={() => router.push('/notifikasi')}
                                    activeOpacity={0.7}
                                >
                                    <Bell size={16} color="rgba(255,255,255,0.8)" weight="duotone" />

                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                                    onPress={() => router.push('/pengaturan')}
                                    activeOpacity={0.7}
                                >
                                    <Gear size={16} color="rgba(255,255,255,0.8)" weight="duotone" />
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
                                <CheckCircle size={12} color="#fff" weight="fill" />
                            </View>
                        </View>

                        {/* Info */}
                        <View className="flex-1">
                            <Text className="text-[18px] font-bold text-primary">{user?.fullName || 'User'}</Text>
                            <View className="flex-row items-center gap-1 mt-0.5">
                                <MapPin size={13} color={SiagaColors.secondary} weight="duotone" />
                                <Text className="text-[14px] text-secondary">{user?.district || '-'}, {user?.city || '-'}</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5 mt-2">
                                <View className="flex-row items-center gap-1 px-3 py-1 rounded-md" style={{ backgroundColor: '#dcfce7' }}>
                                    <CheckCircle size={12} color="#15803d" weight="fill" />
                                    <Text className="text-[12px] font-bold text-success">Terverifikasi</Text>
                                </View>
                                <View className="flex-row items-center gap-1 px-3 py-1 rounded-md bg-amber-50">
                                    <Medal size={12} color="#f59e0b" weight="duotone" />
                                    <Text className="text-[12px] font-bold" style={{ color: '#b45309' }}>{user?.currentBadge || 'Warga Baru'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Edit Button */}
                        <TouchableOpacity
                            className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center"
                            onPress={() => router.push('/edit-profil')}
                            activeOpacity={0.7}
                        >
                            <PencilSimple size={16} color={SiagaColors.primary} weight="duotone" />
                        </TouchableOpacity>
                    </View>

                    {/* Bio */}
                    <Text className="text-[13px] text-secondary mt-3 leading-5">{user?.bio || 'Belum ada bio'}</Text>

                    {/* Stats Row */}
                    <View className="flex-row gap-2 mt-4">
                        {[
                            { value: (user?.totalReports || 0).toString(), label: 'Laporan', color: SiagaColors.info },
                            { value: (user?.totalActions || 0).toString(), label: 'Aksi', color: SiagaColors.success },
                            { value: (user?.ecoPoints || 0).toString(), label: 'Eco-Points', color: '#f59e0b' },
                            { value: `#${user?.rank || '-'}`, label: 'Rank', color: '#7c3aed' },
                        ].map((s, i) => (
                            <View key={i} className="flex-1 bg-slate-50 rounded-xl p-2.5 items-center">
                                <Text className="text-base font-bold" style={{ color: s.color }}>{s.value}</Text>
                                <Text className="text-[12px] font-medium text-secondary mt-0.5">{s.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Eco-Points Card */}
                <View className="mx-5 mt-4 rounded-2xl p-4 overflow-hidden" style={{ backgroundColor: SiagaColors.primary, elevation: 2 }}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-1.5">
                            <Leaf size={18} color="#fff" weight="duotone" />
                            <Text className="text-[16px] font-bold text-white">Eco-Points</Text>
                        </View>
                        <View className="bg-white/10 rounded-lg px-2 py-1 flex-row items-center gap-1">
                            <TrendUp size={10} color="#10b981" weight="bold" />
                            <Text className="text-[11px] font-bold text-success">+{user?.weeklyPoints || 0} minggu ini</Text>
                        </View>
                    </View>
                    <View className="flex-row items-end gap-1 mb-2">
                        <Text className="text-3xl font-extrabold text-white">{user?.ecoPoints || 0}</Text>
                        <Text className="text-[14px] text-white/50 pb-1">points</Text>
                    </View>
                    <View className="mb-2">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[13px] font-medium text-white/60">Level berikutnya</Text>
                            <Text className="text-[13px] font-bold text-white">{user?.ecoPoints || 0} pts</Text>
                        </View>
                        <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(((user?.ecoPoints || 0) / 300) * 100, 100)}%`, backgroundColor: '#10b981' }}
                            />
                        </View>
                        <Text className="text-[12px] text-white/40 mt-1">Terus berkontribusi untuk badge berikutnya!</Text>
                    </View>
                    <View className="flex-row gap-2 mt-1">
                        {[
                            { icon: <FileText size={12} color="#fff" weight="duotone" />, label: 'Lapor: +10 pts' },
                            { icon: <HandsClapping size={12} color="#fff" weight="duotone" />, label: 'Aksi: +50 pts' },
                            { icon: <Sparkle size={12} color="#fff" weight="duotone" />, label: 'Validasi: +5 pts' },
                        ].map((p, i) => (
                            <View key={i} className="flex-row items-center gap-1 bg-white/10 rounded-md px-2 py-1">
                                {p.icon}
                                <Text className="text-[12px] font-medium text-white/80">{p.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Positive Actions */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center">
                                <Plant size={18} color="#059669" weight="duotone" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-primary">Aksi Positif</Text>
                                <Text className="text-xs text-secondary">Kontribusi yang menambah rewards Anda</Text>
                            </View>
                        </View>
                        <View className="px-3 py-2 rounded-xl bg-emerald-50">
                            <Text className="text-xs font-bold text-success">{rewardActions.length} aksi</Text>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                        {rewardActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                className="w-[260px] bg-white border border-emerald-100 rounded-2xl p-4"
                                style={{ elevation: 1 }}
                                onPress={() => router.push({ pathname: '/action-detail', params: { id: action.id } })}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-start justify-between mb-3">
                                    <View className="w-11 h-11 rounded-2xl bg-emerald-50 items-center justify-center">
                                        <Plant size={22} color="#059669" weight="duotone" />
                                    </View>
                                    <View className="px-2.5 py-1 rounded-full bg-emerald-50">
                                        <Text className="text-xs font-bold text-success">{action.status}</Text>
                                    </View>
                                </View>

                                <Text className="text-base font-bold text-primary" numberOfLines={2}>{action.title}</Text>
                                <Text className="text-xs text-secondary mt-1" numberOfLines={2}>
                                    {action.address}, {action.district}
                                </Text>

                                <View className="flex-row items-center justify-between mt-4">
                                    <Text className="text-xs text-secondary">{action.date || 'Jadwal menyusul'}</Text>
                                    <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50">
                                        <Leaf size={12} color="#b45309" weight="duotone" />
                                        <Text className="text-xs font-bold" style={{ color: '#b45309' }}>+{action.points} pts</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Badges */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <View className="w-7 h-7 rounded-lg bg-amber-50 items-center justify-center">
                                <Trophy size={16} color="#f59e0b" weight="duotone" />
                            </View>
                            <Text className="text-base font-bold text-primary">Badge Saya</Text>
                        </View>
                        <View className="bg-amber-50 rounded-md px-2 py-0.5">
                            <Text className="text-[11px] font-semibold" style={{ color: '#b45309' }}>{user?.badgeCount?.active || 0} / {user?.badgeCount?.total || 6} terkumpul</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        {(user?.badges || []).map((b, i) => {
                            const IconComp = ICON_COMPONENTS[b.icon] || Medal;
                            return (
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
                                <View
                                    className="w-10 h-10 rounded-xl items-center justify-center mb-1.5"
                                    style={{ backgroundColor: b.active ? b.bg : '#f8fafc' }}
                                >
                                    <IconComp size={20} color={b.active ? b.color : '#94a3b8'} weight={b.active ? 'duotone' : 'light'} />
                                </View>
                                <Text className="text-[12px] font-bold text-center" style={{ color: b.active ? SiagaColors.primary : '#999' }} numberOfLines={2}>{b.label}</Text>
                                {b.active && (
                                    <View className="absolute -top-1 -right-1">
                                        <CheckCircle size={16} color={b.color} weight="fill" />
                                    </View>
                                )}
                            </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Recent Activity */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                                <Clock size={16} color="#3b82f6" weight="duotone" />
                            </View>
                            <Text className="text-base font-bold text-primary">Aktivitas Terkini</Text>
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5.5 rounded-lg"
                            onPress={() => router.push('/riwayat-aktivitas')}
                            activeOpacity={0.7}
                        >
                            <Text className="text-[13px] font-bold text-info">Lihat Semua</Text>
                            <ArrowRight size={12} color={SiagaColors.info} weight="bold" />
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
                                        <IconComp size={20} color={a.color} weight="duotone" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[16px] font-bold text-primary" numberOfLines={1}>{a.title}</Text>
                                        <View className="flex-row items-center gap-2 mt-0.5">
                                            <View className="flex-row items-center gap-0.5">
                                                <Clock size={11} color={SiagaColors.secondary} />
                                                <Text className="text-[13px] text-secondary">{a.time}</Text>
                                            </View>
                                            <View className="flex-row items-center gap-0.5">
                                                <Leaf size={11} color="#059669" weight="duotone" />
                                                <Text className="text-[13px] font-bold text-success">+{a.points} pts</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {a.refId && <CaretRight size={16} color={SiagaColors.secondary} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Education Feed */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <View className="w-8 h-8 rounded-xl bg-sky-50 items-center justify-center">
                                <Newspaper size={18} color={SiagaColors.info} weight="duotone" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-primary">Info & Edukasi</Text>
                                <Text className="text-xs text-secondary">Bacaan singkat untuk kesiapsiagaan harian</Text>
                            </View>
                        </View>
                        <View className="px-3 py-2 rounded-xl bg-sky-50">
                            <Text className="text-xs font-bold text-info">Topik Pilihan</Text>
                        </View>
                    </View>

                    <View className="gap-3">
                        {infoFeed.map((info) => {
                            const InfoIcon = info.type === 'CloudRain'
                                ? CloudRain
                                : info.type === 'BookOpenText'
                                    ? BookOpenText
                                    : MegaphoneSimple;

                            return (
                                <TouchableOpacity
                                    key={info.id}
                                    className="bg-white border border-slate-100 rounded-2xl p-4 flex-row items-center gap-3"
                                    style={{ elevation: 1 }}
                                    onPress={() => router.push({ pathname: '/info-detail', params: { id: info.id } })}
                                    activeOpacity={0.7}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: info.bg }}>
                                        <InfoIcon size={22} color={info.color} weight="duotone" />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2 mb-1">
                                            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: info.bg }}>
                                                <Text className="text-xs font-bold" style={{ color: info.color }}>{info.category}</Text>
                                            </View>
                                            <Text className="text-xs text-secondary">{info.source}</Text>
                                        </View>
                                        <Text className="text-[15px] font-bold text-primary" numberOfLines={2}>{info.title}</Text>
                                        <Text className="text-xs text-secondary mt-1" numberOfLines={2}>{info.subtitle}</Text>
                                    </View>
                                    <CaretRight size={16} color={SiagaColors.secondary} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Quick Menu */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center gap-2 mb-3">
                        <View className="w-7 h-7 rounded-lg bg-slate-100 items-center justify-center">
                            <Gear size={16} color={SiagaColors.primary} weight="duotone" />
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
                                    <item.icon size={18} color={item.color} weight="duotone" />
                                </View>
                                <Text className="flex-1 text-[16px] font-semibold text-primary">{item.label}</Text>
                                <CaretRight size={16} color={SiagaColors.secondary} />
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
                        <SignOut size={20} color={SiagaColors.danger} weight="duotone" />
                        <Text className="text-[16px] font-bold text-danger">Keluar</Text>
                    </TouchableOpacity>
                    <Text className="text-center text-[13px] text-secondary mt-3">SIAGA v1.0.0 · Build 2026</Text>
                    <Text className="text-center text-[12px] text-secondary/50 mt-0.5">SIAGA — ProxoCoris</Text>
                </View>
            </ScrollView>

            <SOSButton onPress={() => setSosVisible(true)} />
            <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
        </View>
    );
}
