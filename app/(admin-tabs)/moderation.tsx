import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity, ScrollView,
    Animated, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ShieldWarning, ShieldCheck, MagnifyingGlass, XCircle,
    CaretRight, WarningDiamond, CalendarBlank, Waves, RoadHorizon,
    Trash, Mountains, Fire, FileText, Clock,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getReports, type ReportData } from '@/services/report.service';
import { getAdminAnalytics } from '@/services/admin.service';

type StatusTab = 'Semua' | 'Menunggu' | 'Diverifikasi' | 'Ditangani' | 'Selesai';

const FILTER_TABS: StatusTab[] = ['Semua', 'Menunggu', 'Diverifikasi', 'Ditangani', 'Selesai'];

function getSeverity(urgency: number) {
    if (urgency >= 90) return { label: 'Kritis', bg: SiagaColors.danger, color: '#fff' };
    if (urgency >= 70) return { label: 'Tinggi', bg: '#fed7aa', color: '#9a3412' };
    if (urgency >= 40) return { label: 'Sedang', bg: '#fef3c7', color: '#92400e' };
    return { label: 'Rendah', bg: '#d1fae5', color: '#065f46' };
}

function getCategoryIcon(category: string) {
    if (category === 'Banjir') return { icon: Waves, color: '#2563eb', bg: '#eff6ff' };
    if (category === 'Jalan Rusak') return { icon: RoadHorizon, color: '#d97706', bg: '#fffbeb' };
    if (category === 'Sampah') return { icon: Trash, color: '#059669', bg: '#ecfdf5' };
    if (category === 'Longsor' || category === 'Tanah Longsor') return { icon: Mountains, color: '#7c3aed', bg: '#f5f3ff' };
    if (category === 'Kebakaran') return { icon: Fire, color: SiagaColors.danger, bg: '#fef2f2' };
    return { icon: FileText, color: '#3b82f6', bg: '#eff6ff' };
}

function getStatusStyle(status: ReportData['status']) {
    if (status === 'Menunggu') return { color: '#d97706', bg: '#fffbeb' };
    if (status === 'Diverifikasi') return { color: '#2563eb', bg: '#eff6ff' };
    if (status === 'Ditangani') return { color: '#7c3aed', bg: '#f5f3ff' };
    return { color: SiagaColors.success, bg: '#ecfdf5' };
}

function ModerationCard({ item, onPress }: { item: ReportData; onPress: () => void }) {
    const severity = getSeverity(item.urgency);
    const status = getStatusStyle(item.status);
    const category = getCategoryIcon(item.category);
    const CategoryIcon = category.icon;

    return (
        <TouchableOpacity
            style={{
                backgroundColor: '#fff', borderRadius: 18, padding: 14,
                borderWidth: 1, borderColor: '#edf2f9',
            }}
            activeOpacity={0.85}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: category.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <CategoryIcon size={22} color={category.color} weight="duotone" />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary, flex: 1 }} numberOfLines={1}>{item.title}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: severity.bg }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: severity.color }}>{severity.label}</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 4 }} numberOfLines={2}>
                        {item.reporter?.fullName || 'Pelapor SIAGA'} · {item.category}{item.district ? ` · ${item.district}` : ''}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: status.bg }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: status.color }}>{item.status}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#f8fafc' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary }}>Urgensi {item.urgency}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#f8fafc' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary }}>{item.commentsCount} komentar</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} color={SiagaColors.secondary} />
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>
                                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#7c3aed' }}>Lihat Detail</Text>
                            <CaretRight size={12} color="#7c3aed" weight="bold" />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function AdminModerationScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<StatusTab>('Semua');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<ReportData[]>([]);
    const [reportStats, setReportStats] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        inProgress: 0,
        resolved: 0,
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
        ]).start();
        loadModeration();
    }, []);

    async function loadModeration() {
        const [reportsRes, analyticsRes] = await Promise.all([
            getReports({ limit: 50 }),
            getAdminAnalytics(),
        ]);

        if (reportsRes.success && reportsRes.data) {
            setReports(reportsRes.data);
        }

        if (analyticsRes.success && analyticsRes.data) {
            setReportStats(analyticsRes.data.reportStats);
        }

        setLoading(false);
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadModeration();
        setRefreshing(false);
    };

    const filteredReports = useMemo(() => {
        return reports.filter((item) => {
            const matchesQuery =
                !query ||
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.category.toLowerCase().includes(query.toLowerCase()) ||
                item.district.toLowerCase().includes(query.toLowerCase());
            const matchesTab = activeTab === 'Semua' || item.status === activeTab;
            return matchesQuery && matchesTab;
        });
    }, [activeTab, query, reports]);

    const counts = {
        Semua: reportStats.total,
        Menunggu: reportStats.pending,
        Diverifikasi: reportStats.verified,
        Ditangani: reportStats.inProgress,
        Selesai: reportStats.resolved,
    };

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ position: 'absolute', right: -24, top: -24, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 50, bottom: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldWarning size={22} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3 }}>Moderasi</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Tinjau Laporan</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <CalendarBlank size={12} color="rgba(255,255,255,0.5)" />
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{today}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
                                <Text style={{ color: '#4ade80', fontWeight: '700', fontSize: 11 }}>Live</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{counts.Semua}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Total</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(251,191,36,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fbbf24', fontWeight: '900', fontSize: 18 }}>{counts.Menunggu}</Text>
                            <Text style={{ color: 'rgba(251,191,36,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Menunggu</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(59,130,246,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#60a5fa', fontWeight: '900', fontSize: 18 }}>{counts.Diverifikasi}</Text>
                            <Text style={{ color: 'rgba(96,165,250,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Verifikasi</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(167,139,250,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#c4b5fd', fontWeight: '900', fontSize: 18 }}>{counts.Ditangani + counts.Selesai}</Text>
                            <Text style={{ color: 'rgba(196,181,253,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Lanjutan</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f7fb', borderRadius: 14, paddingHorizontal: 12, gap: 8, height: 44 }}>
                    <MagnifyingGlass size={18} color={SiagaColors.secondary} weight="bold" />
                    <TextInput
                        placeholder="Cari judul, kategori, atau kecamatan..."
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

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 7 }}>
                        {FILTER_TABS.map((tab) => {
                            const active = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 5,
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                                        backgroundColor: active ? '#7c3aed' : '#f4f7fb',
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : SiagaColors.secondary }}>{tab}</Text>
                                    <View style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#edf2f9', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                                        <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#fff' : SiagaColors.secondary }}>{counts[tab]}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            {counts.Menunggu > 0 && activeTab !== 'Selesai' && (
                <TouchableOpacity
                    style={{
                        marginHorizontal: 16, marginTop: 12,
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        backgroundColor: '#fef2f2', borderRadius: 16, padding: 12,
                        borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)',
                    }}
                    activeOpacity={0.85}
                    onPress={() => setActiveTab('Menunggu')}
                >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                        <WarningDiamond size={20} color={SiagaColors.danger} weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.danger }}>{counts.Menunggu} laporan menunggu tinjauan</Text>
                        <Text style={{ fontSize: 11, color: '#991b1b', marginTop: 1 }}>Prioritaskan laporan dengan urgensi tinggi lebih dulu.</Text>
                    </View>
                    <CaretRight size={14} color={SiagaColors.danger} weight="bold" />
                </TouchableOpacity>
            )}

            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {loading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <ActivityIndicator size="large" color="#7c3aed" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Memuat laporan moderasi...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredReports}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
                        ListHeaderComponent={
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.secondary }}>
                                    Menampilkan <Text style={{ color: SiagaColors.primary, fontWeight: '800' }}>{filteredReports.length}</Text> laporan
                                </Text>
                                {(activeTab !== 'Semua' || query !== '') && (
                                    <TouchableOpacity onPress={() => { setActiveTab('Semua'); setQuery(''); }} activeOpacity={0.7}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#7c3aed' }}>Reset</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', paddingTop: 60, gap: 10 }}>
                                <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShieldCheck size={32} color={SiagaColors.success} weight="duotone" />
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Tidak ada laporan</Text>
                                <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center', paddingHorizontal: 20 }}>
                                    Coba ubah filter atau kata kunci pencarian.
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <ModerationCard item={item} onPress={() => router.push({ pathname: '/moderasi-detail' as any, params: { id: item.id } })} />
                        )}
                    />
                )}
            </Animated.View>
        </View>
    );
}
