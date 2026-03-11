import React, { useEffect, useMemo, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft, ShieldWarning, Clock, MapPin, User,
    FileText, ChatText, CheckCircle, CircleNotch, CalendarBlank,
    WarningDiamond, Waves, RoadHorizon, Trash, Mountains, Fire,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useToast } from '@/contexts/toast.context';
import { getReportById, updateReportStatus, type BackendReportStatus, type ReportData } from '@/services/report.service';
import { useAuth } from '@/context/auth';

const STATUS_OPTIONS: BackendReportStatus[] = ['Menunggu', 'Diverifikasi', 'Ditangani', 'Selesai'];

function getSeverity(urgency: number) {
    if (urgency >= 90) return { label: 'Kritis', bg: SiagaColors.danger, color: '#fff' };
    if (urgency >= 70) return { label: 'Tinggi', bg: '#fed7aa', color: '#9a3412' };
    if (urgency >= 40) return { label: 'Sedang', bg: '#fef3c7', color: '#92400e' };
    return { label: 'Rendah', bg: '#d1fae5', color: '#065f46' };
}

function getStatusStyle(status: BackendReportStatus) {
    if (status === 'Menunggu') return { color: '#d97706', bg: '#fffbeb' };
    if (status === 'Diverifikasi') return { color: '#2563eb', bg: '#eff6ff' };
    if (status === 'Ditangani') return { color: '#7c3aed', bg: '#f5f3ff' };
    return { color: SiagaColors.success, bg: '#ecfdf5' };
}

function getCategoryIcon(category: string) {
    if (category === 'Banjir') return { icon: Waves, color: '#2563eb', bg: '#eff6ff' };
    if (category === 'Jalan Rusak') return { icon: RoadHorizon, color: '#d97706', bg: '#fffbeb' };
    if (category === 'Sampah') return { icon: Trash, color: '#059669', bg: '#ecfdf5' };
    if (category === 'Longsor' || category === 'Tanah Longsor') return { icon: Mountains, color: '#7c3aed', bg: '#f5f3ff' };
    if (category === 'Kebakaran') return { icon: Fire, color: SiagaColors.danger, bg: '#fef2f2' };
    return { icon: FileText, color: '#3b82f6', bg: '#eff6ff' };
}

export default function ModerationDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<BackendReportStatus | null>(null);

    useEffect(() => {
        loadDetail();
    }, [params.id]);

    async function loadDetail() {
        if (!params.id) return;
        const result = await getReportById(params.id);
        if (result.success && result.data) {
            setReport(result.data);
        }
        setLoading(false);
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDetail();
        setRefreshing(false);
    };

    async function handleStatusChange(status: BackendReportStatus) {
        if (!report || report.status === status) return;
        setUpdatingStatus(status);
        const result = await updateReportStatus(report.id, status, user?.fullName || 'Admin SIAGA');
        setUpdatingStatus(null);

        if (!result.success) {
            showToast({ type: 'error', title: result.message || 'Gagal memperbarui status' });
            return;
        }

        showToast({ type: 'success', title: `Status diubah ke ${status}` });
        await loadDetail();
    }

    const timeline = useMemo(() => {
        if (!report) return [];
        const items = [
            {
                id: 'created',
                title: 'Laporan dibuat',
                desc: `Masuk pada ${new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            },
        ];

        if (report.status === 'Diverifikasi' || report.status === 'Ditangani' || report.status === 'Selesai') {
            items.push({
                id: 'verified',
                title: 'Laporan diverifikasi',
                desc: `${report.verifiedCount} verifikasi terkumpul`,
            });
        }

        if (report.status === 'Ditangani' || report.status === 'Selesai') {
            items.push({
                id: 'handled',
                title: 'Laporan ditangani',
                desc: report.respondedBy || 'Sudah ditindaklanjuti oleh petugas',
            });
        }

        if (report.status === 'Selesai') {
            items.push({
                id: 'done',
                title: 'Laporan selesai',
                desc: 'Penanganan telah ditutup di sistem',
            });
        }

        return items;
    }, [report]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f4f7fb', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Memuat detail moderasi...</Text>
            </View>
        );
    }

    if (!report) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f4f7fb', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
                <WarningDiamond size={32} color={SiagaColors.danger} weight="duotone" />
                <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Detail laporan tidak ditemukan</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ backgroundColor: '#7c3aed', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const severity = getSeverity(report.urgency);
    const status = getStatusStyle(report.status);
    const category = getCategoryIcon(report.category);
    const CategoryIcon = category.icon;

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}
                        activeOpacity={0.8}
                    >
                        <ArrowLeft size={20} color="#fff" weight="bold" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>Detail Moderasi</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>Laporan terhubung ke database</Text>
                    </View>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldWarning size={20} color="#fff" weight="duotone" />
                    </View>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: category.bg, alignItems: 'center', justifyContent: 'center' }}>
                            <CategoryIcon size={24} color={category.color} weight="duotone" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>{report.title}</Text>
                            <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 4 }}>{report.category}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: severity.bg }}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: severity.color }}>{severity.label}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: status.bg }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: status.color }}>{report.status}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#f8fafc' }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary }}>Urgensi {report.urgency}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#edf2f9' }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: SiagaColors.primary }}>{report.votesCount}</Text>
                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Dukungan</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#edf2f9' }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: SiagaColors.primary }}>{report.verifiedCount}</Text>
                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Verifikasi</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#edf2f9' }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: SiagaColors.primary }}>{report.commentsCount}</Text>
                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Komentar</Text>
                    </View>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9', gap: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }}>Informasi Laporan</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <User size={18} color="#7c3aed" weight="duotone" />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>{report.reporter?.fullName || 'Pelapor SIAGA'}</Text>
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{report.reporter?.currentBadge || 'Tanpa badge'}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <MapPin size={18} color="#7c3aed" weight="duotone" />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>{report.address}</Text>
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{report.district}, {report.city}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <CalendarBlank size={18} color="#7c3aed" weight="duotone" />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>
                                {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </Text>
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>Terakhir diperbarui {new Date(report.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Deskripsi</Text>
                    <Text style={{ fontSize: 14, color: SiagaColors.primary, lineHeight: 22 }}>{report.description}</Text>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Ubah Status</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {STATUS_OPTIONS.map((option) => {
                            const active = report.status === option;
                            const optionStyle = getStatusStyle(option);
                            const isUpdating = updatingStatus === option;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => handleStatusChange(option)}
                                    disabled={active || !!updatingStatus}
                                    style={{
                                        paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
                                        backgroundColor: active ? optionStyle.bg : '#f8fafc',
                                        borderWidth: 1, borderColor: active ? optionStyle.color : '#edf2f9',
                                        flexDirection: 'row', alignItems: 'center', gap: 6,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {isUpdating ? (
                                        <CircleNotch size={14} color={optionStyle.color} weight="bold" />
                                    ) : active ? (
                                        <CheckCircle size={14} color={optionStyle.color} weight="fill" />
                                    ) : null}
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? optionStyle.color : SiagaColors.primary }}>{option}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Riwayat Penanganan</Text>
                    <View style={{ gap: 12 }}>
                        {timeline.map((item, index) => (
                            <View key={item.id} style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={18} color="#7c3aed" weight="duotone" />
                                    </View>
                                    {index < timeline.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: '#edf2f9', marginTop: 4 }} />}
                                </View>
                                <View style={{ flex: 1, paddingBottom: 10 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{item.title}</Text>
                                    <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 3 }}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#edf2f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <ChatText size={18} color="#7c3aed" weight="duotone" />
                        <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }}>Komentar</Text>
                    </View>
                    <View style={{ gap: 10 }}>
                        {(report.comments || []).length > 0 ? (
                            report.comments?.map((comment: any) => (
                                <View key={comment.id} style={{ backgroundColor: '#f8fafc', borderRadius: 14, padding: 12 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>
                                        {comment.user?.fullName || 'Pengguna SIAGA'}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 2 }}>{comment.text}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>Belum ada komentar pada laporan ini.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
