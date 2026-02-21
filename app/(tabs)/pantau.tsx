import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    CaretLeft, MagnifyingGlass, SquaresFour, Funnel,
    Waves, RoadHorizon, Trash, Mountains, Fire,
    MapPin, Clock, CaretRight, Users,
    ListBullets, X, LineSegments,
    ArrowsOut, ArrowCounterClockwise, CaretDown, CaretUp,
    MapTrifold, CheckCircle,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';

const { height: W_HEIGHT } = Dimensions.get('window');

const FILTER_CHIPS = [
    { icon: SquaresFour, label: 'Semua', color: SiagaColors.primary },
    { icon: Waves, label: 'Banjir', color: '#3b82f6' },
    { icon: RoadHorizon, label: 'Jalan', color: '#f59e0b' },
    { icon: Trash, label: 'Sampah', color: '#10b981' },
    { icon: Mountains, label: 'Longsor', color: '#ea580c' },
    { icon: Fire, label: 'Kebakaran', color: SiagaColors.danger },
];

const REPORTS = [
    { type: 'Banjir', typeBg: '#dbeafe', typeColor: '#2563eb', title: 'Banjir Jl. Merdeka', desc: 'Air naik 50cm · Jl. Ir. H. Juanda', time: '10 mnt', urgency: 145, dist: '1.2 KM', votes: 24, status: 'Kritis', statusColor: '#e74c3c', statusBg: '#fee2e2' },
    { type: 'Jalan Rusak', typeBg: '#fef3c7', typeColor: '#d97706', title: 'Lubang Jl. Sudirman', desc: 'Lubang besar · Jl. Sudirman', time: '2 jam', urgency: 70, dist: '800 M', votes: 8, status: 'Sedang', statusColor: '#a16207', statusBg: '#fef9c3' },
    { type: 'Sampah', typeBg: '#dcfce7', typeColor: '#15803d', title: 'Sampah Gang Melati', desc: 'Sampah menumpuk · Gang Melati', time: '5 jam', urgency: 35, dist: '300 M', votes: 3, status: 'Rendah', statusColor: '#15803d', statusBg: '#dcfce7' },
    { type: 'Banjir', typeBg: '#dbeafe', typeColor: '#2563eb', title: 'Genangan Jl. Asia-Afrika', desc: 'Genangan 30cm · Jl. Asia-Afrika', time: '6 jam', urgency: 90, dist: '2.5 KM', votes: 12, status: 'Diproses', statusColor: '#2563eb', statusBg: '#dbeafe' },
    { type: 'Longsor', typeBg: '#ffedd5', typeColor: '#ea580c', title: 'Longsor Ringan Dago', desc: 'Tanah longsor · Jl. Dago Atas', time: '1 hari', urgency: 120, dist: '3.1 KM', votes: 19, status: 'Kritis', statusColor: '#e74c3c', statusBg: '#fee2e2' },
];

export default function PantauScreen() {
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [expanded, setExpanded] = useState(false);
    const [sosVisible, setSosVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const filteredReports = activeFilter === 'Semua' ? REPORTS : REPORTS.filter(r => r.type === activeFilter);

    return (
        <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
            {/* Map Section (placeholder) */}
            <View className="flex-1 bg-surface/50 items-center justify-center" style={{ minHeight: expanded ? 160 : W_HEIGHT * 0.45 }}>
                <View className="absolute top-0 left-0 right-0 z-20 px-4 pt-3">
                    {/* Header */}
                    <View className="bg-white/90 rounded-2xl border border-slate-100 p-3" style={{ elevation: 3 }}>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center flex-shrink-0">
                                <CaretLeft size={14} color={SiagaColors.primary} />
                            </TouchableOpacity>
                            <View className="flex-1 flex-row items-center gap-2 bg-[#f1f6fc] rounded-xl px-3 py-2">
                                <MagnifyingGlass size={14} color={SiagaColors.secondary} weight="duotone" />
                                <Text className="flex-1 text-[12px] text-secondary/50">Cari lokasi atau laporan...</Text>
                            </View>
                            <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center flex-shrink-0">
                                <Funnel size={14} color={SiagaColors.primary} weight="duotone" />
                            </TouchableOpacity>
                        </View>
                        {/* Filter chips */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2" contentContainerStyle={{ gap: 6 }}>
                            {FILTER_CHIPS.map((fc, i) => (
                                <TouchableOpacity
                                    key={i}
                                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl"
                                    style={{
                                        backgroundColor: activeFilter === fc.label ? SiagaColors.primary : '#fff',
                                        borderWidth: 1,
                                        borderColor: activeFilter === fc.label ? SiagaColors.primary : '#e2e8f0',
                                    }}
                                    onPress={() => setActiveFilter(fc.label)}
                                >
                                    <fc.icon size={12} color={activeFilter === fc.label ? '#fff' : fc.color} weight="duotone" />
                                    <Text className="text-[10px] font-semibold" style={{ color: activeFilter === fc.label ? '#fff' : SiagaColors.primary }}>{fc.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Map placeholder */}
                <View className="w-20 h-20 rounded-full bg-white/50 items-center justify-center" style={{ elevation: 1 }}>
                    <MapTrifold size={36} color={SiagaColors.secondary} weight="duotone" />
                </View>
                <Text className="text-[11px] text-secondary font-medium mt-2">Peta Interaktif</Text>
                <Text className="text-[9px] text-secondary/60">(react-native-maps integration)</Text>

                {/* Stats bubbles */}
                <View className="absolute bottom-4 left-4 right-4 flex-row justify-between">
                    {[
                        { label: 'Aktif', value: '12', color: SiagaColors.danger },
                        { label: 'Diproses', value: '8', color: SiagaColors.info },
                        { label: 'Selesai', value: '45', color: SiagaColors.success },
                        { label: 'Total', value: '65', color: SiagaColors.primary },
                    ].map((s, i) => (
                        <View key={i} className="bg-white rounded-xl px-3 py-2 items-center" style={{ elevation: 2, minWidth: 70 }}>
                            <Text className="text-[13px] font-bold" style={{ color: s.color }}>{s.value}</Text>
                            <Text className="text-[8px] font-medium text-secondary">{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Bottom Sheet */}
            <View className="bg-white border-t border-slate-100 rounded-t-3xl" style={{ elevation: 8, maxHeight: expanded ? W_HEIGHT * 0.6 : W_HEIGHT * 0.35 }}>
                <TouchableOpacity className="items-center pt-2.5 pb-1" onPress={() => setExpanded(!expanded)}>
                    <View className="w-10 h-1 bg-slate-200 rounded-full" />
                </TouchableOpacity>

                <View className="px-4 py-2 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <ListBullets size={16} color={SiagaColors.primary} weight="duotone" />
                        <Text className="text-sm font-bold text-primary">Daftar Laporan</Text>
                        <View className="px-1.5 py-0.5 rounded bg-primary">
                            <Text className="text-[9px] font-bold text-white">{filteredReports.length}</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="flex-row items-center gap-0.5" onPress={() => setExpanded(!expanded)}>
                        {expanded ? <CaretDown size={14} color={SiagaColors.info} /> : <CaretUp size={14} color={SiagaColors.info} />}
                        <Text className="text-[10px] font-semibold text-info">{expanded ? 'Kecilkan' : 'Perbesar'}</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredReports}
                    keyExtractor={(_, i) => i.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
                    renderItem={({ item: r }) => (
                        <TouchableOpacity className="bg-white border border-slate-100 rounded-xl p-3" style={{ elevation: 1 }}>
                            <View className="flex-row items-start gap-2.5">
                                <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: r.typeBg }}>
                                    <MapPin size={18} color={r.typeColor} weight="duotone" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-1.5 mb-0.5">
                                        <View className="px-1.5 py-0.5 rounded gap-0.5 flex-row items-center" style={{ backgroundColor: r.statusBg }}>
                                            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: r.statusColor }} />
                                            <Text className="text-[8px] font-bold uppercase" style={{ color: r.statusColor }}>{r.status}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-0.5">
                                            <Clock size={9} color={SiagaColors.secondary} />
                                            <Text className="text-[8px] text-secondary">{r.time}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-[12px] font-bold text-primary">{r.title}</Text>
                                    <View className="flex-row items-center gap-2.5 mt-1.5">
                                        <View className="flex-row items-center gap-0.5">
                                            <MapPin size={9} color={SiagaColors.secondary} weight="duotone" />
                                            <Text className="text-[8px] text-secondary">{r.dist}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-0.5">
                                            <Users size={9} color={SiagaColors.primary} weight="duotone" />
                                            <Text className="text-[8px] font-semibold text-primary">{r.votes}</Text>
                                        </View>
                                    </View>
                                </View>
                                <CaretRight size={14} color={SiagaColors.secondary} />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <SOSButton onPress={() => setSosVisible(true)} bottom={16} />
            <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
        </View>
    );
}
