import React, { useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
    ShieldCheck, CaretRight, MapPin,
    Waves, Mountains, RoadHorizon, Fire, Trash,
    ChartDonut, ChartBar,
    ClockCounterClockwise, ChatText, ArrowClockwise,
    Megaphone, CheckCircle,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

// ───── Data ─────

const CATEGORIES_LIVE = [
    { label: 'Banjir', count: 18, pct: 75, icon: Waves, color: SiagaColors.info, bgColor: SiagaColors.infoSoft },
    { label: 'Longsor', count: 7, pct: 30, icon: Mountains, color: '#ea580c', bgColor: '#fff7ed' },
    { label: 'Jalan Rusak', count: 12, pct: 50, icon: RoadHorizon, color: SiagaColors.warning, bgColor: SiagaColors.warningSoft },
    { label: 'Kebakaran', count: 4, pct: 17, icon: Fire, color: SiagaColors.danger, bgColor: SiagaColors.dangerSoft },
    { label: 'Sampah', count: 9, pct: 38, icon: Trash, color: SiagaColors.success, bgColor: SiagaColors.successSoft },
];

const ACTIVITIES = [
    { text: 'Laporan #1042 ditandai', highlight: 'Selesai', highlightColor: SiagaColors.success, sub: 'Jalan Rusak Jl. Braga · 15 menit lalu', icon: CheckCircle, iconColor: SiagaColors.success, bgColor: '#ecfdf5', showLine: true },
    { text: 'Respons dikirim ke Laporan', highlight: '#1038', highlightColor: SiagaColors.info, sub: 'Banjir Kec. Dayeuhkolot · 1 jam lalu', icon: ChatText, iconColor: SiagaColors.info, bgColor: '#eff6ff', showLine: true },
    { text: 'Status diubah ke', highlight: 'Diproses', highlightColor: SiagaColors.warning, sub: 'Sampah Gg. Melati · 2 jam lalu', icon: ArrowClockwise, iconColor: SiagaColors.warning, bgColor: '#fffbeb', showLine: true },
    { text: 'Broadcast ke', highlight: 'Kec. Coblong', highlightColor: '#7c3aed', sub: 'Peringatan Cuaca · 3 jam lalu', icon: Megaphone, iconColor: '#7c3aed', bgColor: '#f5f3ff', showLine: false },
];

// ───── Component ─────

export default function AnalyticsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View className="flex-1" style={{ backgroundColor: SiagaColors.background }}>
            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
                <View style={{ position: 'absolute', right: -24, top: -24, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                <View style={{ position: 'absolute', right: 40, bottom: -32, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                <View className="px-5 pb-5 pt-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2.5">
                            <Image source={require('@/assets/images/siaga-logo.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
                            <View>
                                <Text className="text-base font-extrabold text-white tracking-tight">Analitik</Text>
                                <Text className="text-xs font-semibold text-white/45 uppercase tracking-[2px]">Gov Dashboard</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── SCROLLABLE CONTENT ── */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 16 }}
            >
                {/* ── SKOR RESPONSIVITAS ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}>
                        <View className="flex-row items-center gap-2 mb-4">
                            <ChartDonut size={20} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Skor Responsivitas</Text>
                        </View>
                        <View className="flex-row items-center gap-5">
                            {/* Circular progress */}
                            <View className="w-24 h-24 items-center justify-center">
                                <Svg width={96} height={96} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
                                    <Circle cx={50} cy={50} r={42} fill="none" stroke="#edf2f9" strokeWidth={9} />
                                    <Circle cx={50} cy={50} r={42} fill="none" stroke={SiagaColors.info} strokeWidth={9} strokeDasharray="264" strokeDashoffset="34" strokeLinecap="round" />
                                </Svg>
                                <View className="absolute items-center justify-center">
                                    <Text className="text-xl font-extrabold" style={{ color: SiagaColors.primary }}>87%</Text>
                                    <Text className="text-[10px] font-medium" style={{ color: SiagaColors.secondary }}>Response</Text>
                                </View>
                            </View>
                            {/* Stats */}
                            <View className="flex-1 gap-2.5">
                                {[
                                    { label: 'Ditanggapi', value: '47', color: SiagaColors.success },
                                    { label: 'Menunggu', value: '7', color: SiagaColors.warning },
                                    { label: 'Avg. waktu', value: '4.2 jam', color: SiagaColors.info },
                                ].map((item, i) => (
                                    <View key={i} className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <Text className="text-[13px]" style={{ color: SiagaColors.secondary }}>{item.label}</Text>
                                        </View>
                                        <Text className="text-[13px] font-bold" style={{ color: SiagaColors.primary }}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* ── DISTRIBUSI KATEGORI ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}>
                        <View className="flex-row items-center gap-2 mb-4">
                            <ChartBar size={20} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Distribusi Kategori</Text>
                        </View>
                        <View className="gap-3">
                            {CATEGORIES_LIVE.map((cat, i) => {
                                const IconComp = cat.icon;
                                return (
                                    <View key={i}>
                                        <View className="flex-row items-center justify-between mb-1">
                                            <View className="flex-row items-center gap-2">
                                                <IconComp size={16} color={cat.color} weight="duotone" />
                                                <Text className="text-[13px] font-semibold" style={{ color: SiagaColors.primary }}>{cat.label}</Text>
                                            </View>
                                            <Text className="text-[12px] font-bold" style={{ color: SiagaColors.secondary }}>{cat.count}</Text>
                                        </View>
                                        <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: cat.bgColor }}>
                                            <View className="h-full rounded-full" style={{ backgroundColor: cat.color, width: `${cat.pct}%` }} />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </Animated.View>

                {/* ── AKTIVITAS TERKINI ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#edf2f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <ClockCounterClockwise size={20} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[16px] font-bold" style={{ color: SiagaColors.primary }}>Aktivitas Terkini</Text>
                            </View>
                            <TouchableOpacity className="flex-row items-center gap-0.5" activeOpacity={0.7} onPress={() => router.push('/riwayat-aktivitas')}>
                                <Text className="text-[13px] font-bold" style={{ color: SiagaColors.info }}>Semua</Text>
                                <CaretRight size={14} color={SiagaColors.info} weight="bold" />
                            </TouchableOpacity>
                        </View>
                        <View className="gap-3">
                            {ACTIVITIES.map((act, i) => {
                                const IconComp = act.icon;
                                return (
                                    <View key={i} className="flex-row items-start gap-3">
                                        <View className="items-center">
                                            <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: act.bgColor }}>
                                                <IconComp size={18} color={act.iconColor} weight="duotone" />
                                            </View>
                                            {act.showLine && <View className="w-px flex-1 mt-1.5" style={{ backgroundColor: '#f1f5f9' }} />}
                                        </View>
                                        <View className="flex-1 pb-3">
                                            <Text className="text-[14px] font-semibold" style={{ color: SiagaColors.primary }}>
                                                {act.text}{' '}
                                                <Text style={{ color: act.highlightColor, fontWeight: '700' }}>{act.highlight}</Text>
                                            </Text>
                                            <Text className="text-[12px] mt-0.5" style={{ color: SiagaColors.secondary }}>{act.sub}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </Animated.View>

                {/* ── FOOTER ── */}
                <View className="pt-2 pb-2 items-center gap-1">
                    <View className="flex-row items-center gap-1.5">
                        <Image source={require('@/assets/images/siaga-logo.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
                        <Text className="text-[13px] font-bold" style={{ color: SiagaColors.primary }}>SIAGA Dashboard</Text>
                    </View>
                    <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>v1.0.0 · Smart Indonesia Adaptive Governance Application</Text>
                    <View className="flex-row items-center gap-3 mt-0.5">
                        <View className="flex-row items-center gap-1">
                            <MapPin size={12} color={SiagaColors.info} weight="duotone" />
                            <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>Wilayah: <Text className="font-bold" style={{ color: SiagaColors.primary }}>Kota Bandung</Text></Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <ShieldCheck size={12} color={SiagaColors.success} weight="duotone" />
                            <Text className="text-[10px]" style={{ color: SiagaColors.secondary }}>NIP: <Text className="font-bold" style={{ color: SiagaColors.primary }}>{user?.nip || '198001012005011001'}</Text></Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
