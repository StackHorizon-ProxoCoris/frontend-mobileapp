import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    MapPin, DotsThreeVertical, ShieldCheck,
    FileText, HandsClapping, Leaf, TrendUp,
    Star, Medal, Trophy, Crown, Target,
    CaretRight, Clock, Camera, Trash, Wrench,
    UserCircle, Bell, ShieldCheckered, Globe, CircleHalf,
    SignOut, Envelope, LockKey, Fingerprint, PencilSimple,
    Info, Question, ChatCircleDots,
    CheckCircle, Sparkle,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
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

const ACTIVITIES = [
    { icon: Camera, bgColor: '#eff6ff', color: '#3b82f6', title: 'Melaporkan: Banjir Jl. Merdeka', time: '10 menit lalu', points: '+10 pts' },
    { icon: Trash, bgColor: '#ecfdf5', color: '#059669', title: 'Aksi: Bersih-bersih Sungai', time: '2 jam lalu', points: '+50 pts' },
    { icon: Wrench, bgColor: '#fef3c7', color: '#d97706', title: 'Dukungan: Perbaikan Jalan', time: '5 jam lalu', points: '+5 pts' },
];

interface SettingItem {
    icon: any;
    label: string;
    color: string;
    badge?: string;
    badgeBg?: string;
    badgeColor?: string;
    toggle?: boolean;
    defaultOff?: boolean;
    extra?: string;
}

const SETTINGS_GROUPS: { title: string; items: SettingItem[] }[] = [
    {
        title: 'Akun',
        items: [
            { icon: UserCircle, label: 'Edit Profil', color: SiagaColors.primary },
            { icon: Envelope, label: 'Email & Telepon', color: '#3b82f6' },
            { icon: LockKey, label: 'Keamanan', color: '#f59e0b' },
            { icon: Fingerprint, label: 'Verifikasi Identitas', color: '#059669', badge: 'Verified', badgeBg: '#dcfce7', badgeColor: '#15803d' },
        ],
    },
    {
        title: 'Notifikasi',
        items: [
            { icon: Bell, label: 'Push Notification', color: '#f59e0b', toggle: true },
            { icon: ShieldCheckered, label: 'Peringatan Bencana', color: SiagaColors.danger, toggle: true },
        ],
    },
    {
        title: 'Lainnya',
        items: [
            { icon: Globe, label: 'Bahasa', color: SiagaColors.info, extra: '🇮🇩 Indonesia' },
            { icon: CircleHalf, label: 'Mode Gelap', color: '#475569', toggle: true, defaultOff: true },
            { icon: Info, label: 'Tentang SIAGA', color: SiagaColors.primary },
            { icon: Question, label: 'Bantuan', color: '#7c3aed' },
            { icon: ChatCircleDots, label: 'Feedback', color: '#059669' },
        ],
    },
];

export default function ProfilScreen() {
    const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
        'Push Notification': true,
        'Peringatan Bencana': true,
        'Mode Gelap': false,
    });
    const [sosVisible, setSosVisible] = useState(false);
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Profile Header */}
                <View className="h-28" style={{ backgroundColor: SiagaColors.primary }}>
                    <View className="flex-row items-center justify-end gap-2 px-4 pt-3">
                        <TouchableOpacity className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                            <PencilSimple size={14} color="rgba(255,255,255,0.8)" weight="duotone" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                            <DotsThreeVertical size={14} color="rgba(255,255,255,0.8)" weight="duotone" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Avatar & Info */}
                <View className="items-center -mt-10 px-5">
                    <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center" style={{ backgroundColor: SiagaColors.primaryLight, elevation: 4 }}>
                        <Text className="text-2xl font-bold text-white">DK</Text>
                    </View>
                    <Text className="text-lg font-bold text-primary mt-2">Diyon Kobi</Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                        <MapPin size={12} color={SiagaColors.secondary} weight="duotone" />
                        <Text className="text-[11px] text-secondary">Kec. Coblong, Bandung</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 mt-1.5">
                        <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dcfce7' }}>
                            <CheckCircle size={10} color="#15803d" weight="fill" />
                            <Text className="text-[9px] font-bold text-success">Terverifikasi</Text>
                        </View>
                        <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50">
                            <Medal size={10} color="#f59e0b" weight="duotone" />
                            <Text className="text-[9px] font-bold" style={{ color: '#b45309' }}>Warga Peduli</Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View className="flex-row gap-2 mx-5 mt-5">
                    {[
                        { value: '24', label: 'Laporan', color: SiagaColors.info },
                        { value: '12', label: 'Aksi Positif', color: SiagaColors.success },
                        { value: '285', label: 'Eco-Points', color: '#f59e0b' },
                        { value: '#42', label: 'Rank', color: '#7c3aed' },
                    ].map((s, i) => (
                        <View key={i} className="flex-1 bg-white border border-slate-100 rounded-xl p-2.5 items-center" style={{ elevation: 1 }}>
                            <Text className="text-lg font-bold" style={{ color: s.color }}>{s.value}</Text>
                            <Text className="text-[8px] font-medium text-secondary mt-0.5">{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Eco-Points Card */}
                <View className="mx-5 mt-5 rounded-2xl p-4 overflow-hidden" style={{ backgroundColor: SiagaColors.primary }}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-1.5">
                            <Leaf size={16} color="#fff" weight="duotone" />
                            <Text className="text-[12px] font-bold text-white">Eco-Points</Text>
                        </View>
                        <View className="bg-white/10 rounded-lg px-2 py-1 flex-row items-center gap-1">
                            <TrendUp size={10} color="#10b981" weight="bold" />
                            <Text className="text-[9px] font-bold text-success">+45 minggu ini</Text>
                        </View>
                    </View>
                    <View className="flex-row items-end gap-1 mb-2">
                        <Text className="text-3xl font-extrabold text-white">285</Text>
                        <Text className="text-xs text-white/50 pb-1">points</Text>
                    </View>
                    <View className="mb-2">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[9px] font-medium text-white/60">Menuju Pahlawan Komunitas</Text>
                            <Text className="text-[9px] font-bold text-white">285 / 300</Text>
                        </View>
                        <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <View className="w-[95%] h-full rounded-full" style={{ backgroundColor: '#10b981' }} />
                        </View>
                    </View>
                    <View className="flex-row gap-2 mt-1">
                        {[
                            { icon: <FileText size={10} color="#fff" weight="duotone" />, label: 'Lapor: +10 pts' },
                            { icon: <HandsClapping size={10} color="#fff" weight="duotone" />, label: 'Aksi: +50 pts' },
                            { icon: <Sparkle size={10} color="#fff" weight="duotone" />, label: 'Validasi: +5 pts' },
                        ].map((p, i) => (
                            <View key={i} className="flex-row items-center gap-1 bg-white/10 rounded-md px-2 py-1">
                                {p.icon}
                                <Text className="text-[8px] font-medium text-white/80">{p.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Badges */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-bold text-primary">Badge Saya</Text>
                        <Text className="text-[10px] font-semibold text-info">3 / 6 terkumpul</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        {BADGES.map((b, i) => (
                            <View
                                key={i}
                                className="w-20 items-center p-2.5 rounded-xl border-2"
                                style={{
                                    borderColor: b.active ? b.border : '#f1f5f9',
                                    backgroundColor: b.active ? b.bg : '#fafafa',
                                    opacity: b.active ? 1 : 0.5,
                                }}
                            >
                                <View className="w-10 h-10 rounded-xl items-center justify-center mb-1.5" style={{ backgroundColor: b.active ? `${b.color}15` : '#f1f5f9' }}>
                                    <b.icon size={20} color={b.active ? b.color : '#c4c4c4'} weight="duotone" />
                                </View>
                                <Text className="text-[8px] font-bold text-center" style={{ color: b.active ? SiagaColors.primary : '#999' }} numberOfLines={2}>{b.label}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Recent Activity */}
                <View className="mt-5 px-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-bold text-primary">Aktivitas Terkini</Text>
                        <TouchableOpacity className="flex-row items-center gap-0.5">
                            <Text className="text-[10px] font-semibold text-info">Semua</Text>
                            <CaretRight size={10} color={SiagaColors.info} />
                        </TouchableOpacity>
                    </View>
                    <View className="gap-2">
                        {ACTIVITIES.map((a, i) => (
                            <View key={i} className="bg-white border border-slate-100 rounded-xl p-3 flex-row items-center gap-3" style={{ elevation: 1 }}>
                                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: a.bgColor }}>
                                    <a.icon size={18} color={a.color} weight="duotone" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[11px] font-bold text-primary" numberOfLines={1}>{a.title}</Text>
                                    <View className="flex-row items-center gap-2 mt-0.5">
                                        <View className="flex-row items-center gap-0.5">
                                            <Clock size={9} color={SiagaColors.secondary} />
                                            <Text className="text-[9px] text-secondary">{a.time}</Text>
                                        </View>
                                        <Text className="text-[9px] font-bold text-success">{a.points}</Text>
                                    </View>
                                </View>
                                <CaretRight size={14} color={SiagaColors.secondary} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Settings */}
                <View className="mt-5 px-5">
                    <Text className="text-sm font-bold text-primary mb-3">Pengaturan</Text>
                    <View className="gap-4">
                        {SETTINGS_GROUPS.map((group, gi) => (
                            <View key={gi}>
                                <Text className="text-[10px] font-semibold text-secondary uppercase tracking-wider mb-2">{group.title}</Text>
                                <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                                    {group.items.map((item, ii) => (
                                        <TouchableOpacity
                                            key={ii}
                                            className="flex-row items-center gap-3 px-4 py-3"
                                            style={{ borderBottomWidth: ii < group.items.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}
                                        >
                                            <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                                                <item.icon size={16} color={item.color} weight="duotone" />
                                            </View>
                                            <Text className="flex-1 text-[12px] font-semibold text-primary">{item.label}</Text>
                                            {item.badge && (
                                                <View className="px-1.5 py-0.5 rounded flex-row items-center gap-0.5" style={{ backgroundColor: item.badgeBg }}>
                                                    <CheckCircle size={8} color={item.badgeColor} weight="fill" />
                                                    <Text className="text-[8px] font-bold" style={{ color: item.badgeColor }}>{item.badge}</Text>
                                                </View>
                                            )}
                                            {item.extra && <Text className="text-[10px] font-medium text-secondary">{item.extra}</Text>}
                                            {item.toggle ? (
                                                <Switch
                                                    value={toggleStates[item.label]}
                                                    onValueChange={(val) => setToggleStates(prev => ({ ...prev, [item.label]: val }))}
                                                    trackColor={{ false: '#e2e8f0', true: `${item.color}40` }}
                                                    thumbColor={toggleStates[item.label] ? item.color : '#f4f3f4'}
                                                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                                />
                                            ) : (
                                                <CaretRight size={14} color={SiagaColors.secondary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Logout */}
                <View className="mx-5 mt-5">
                    <TouchableOpacity className="flex-row items-center justify-center gap-2 py-3.5 bg-red-50 border border-red-100 rounded-2xl">
                        <SignOut size={18} color={SiagaColors.danger} weight="duotone" />
                        <Text className="text-[13px] font-bold text-danger">Keluar</Text>
                    </TouchableOpacity>
                    <Text className="text-center text-[9px] text-secondary mt-3">SIAGA v1.0.0 · Build 2026</Text>
                </View>
            </ScrollView>

            <SOSButton onPress={() => setSosVisible(true)} />
            <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
        </View>
    );
}
