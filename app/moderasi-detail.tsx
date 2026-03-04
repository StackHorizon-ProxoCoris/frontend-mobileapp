import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Animated, Modal, RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft, DotsThree, ShieldWarning, ShieldCheck, Shield,
    CheckCircle, XCircle, Clock, Eye, Flag, Prohibit, Gavel,
    Waves, RoadHorizon, Mountains, Fire, Leaf,
    ChatText, Image, Megaphone, Users, Warning, WarningDiamond,
    CalendarBlank, User, Envelope, MapPin, CaretRight,
    Trash, PencilSimple, Bell, Key, SealCheck,
    Copy, FileText, ChartLineUp, TrendUp,
    Siren, Lightning, Handshake, ChatCircleDots,
    ArrowClockwise, Star, Medal, Info,
    UserMinus, UserCheck,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useToast } from '@/contexts/toast.context';

const { width } = Dimensions.get('window');

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type SeverityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
type ModerationStatus = 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Eskalasi';
type ContentType = 'Laporan' | 'Komentar' | 'Gambar' | 'Profil';

interface ModerationDetail {
    id: string;
    title: string;
    description: string;
    user: string;
    userInitials: string;
    userColor: string;
    userEmail: string;
    userId: string;
    userJoined: string;
    userReports: number;
    userWarnings: number;
    category: string;
    categoryIcon: any;
    categoryColor: string;
    categoryBg: string;
    contentType: ContentType;
    severity: SeverityLevel;
    status: ModerationStatus;
    time: string;
    reason: string;
    flagCount: number;
    reportedBy: string[];
    originalContent: string;
    location?: string;
    coordinates?: string;
    relatedReportId?: string;
    moderationHistory: { action: string; by: string; time: string; note?: string }[];
    autoDetected: boolean;
    aiConfidence?: number;
}

// ────────────────────────────────────────────
// Config
// ────────────────────────────────────────────
const SEVERITY_STYLE: Record<SeverityLevel, { text: string; bg: string; border: string; label: string }> = {
    Kritis: { text: '#fff', bg: SiagaColors.danger, border: SiagaColors.danger, label: 'Kritis' },
    Tinggi: { text: '#9a3412', bg: '#fed7aa', border: '#fdba74', label: 'Tinggi' },
    Sedang: { text: '#92400e', bg: '#fef3c7', border: '#fde68a', label: 'Sedang' },
    Rendah: { text: '#065f46', bg: '#d1fae5', border: '#a7f3d0', label: 'Rendah' },
};

const STATUS_STYLE: Record<ModerationStatus, { color: string; bg: string; icon: any; label: string }> = {
    Menunggu: { color: '#d97706', bg: '#fffbeb', icon: Clock, label: 'Menunggu Review' },
    Disetujui: { color: SiagaColors.success, bg: '#ecfdf5', icon: CheckCircle, label: 'Disetujui' },
    Ditolak: { color: SiagaColors.danger, bg: '#fef2f2', icon: XCircle, label: 'Ditolak' },
    Eskalasi: { color: '#7c3aed', bg: '#f5f3ff', icon: ShieldWarning, label: 'Dieskalasi' },
};

const CONTENT_TYPE_STYLE: Record<ContentType, { color: string; bg: string; icon: any }> = {
    Laporan: { color: SiagaColors.info, bg: '#eff6ff', icon: FileText },
    Komentar: { color: '#7c3aed', bg: '#f5f3ff', icon: ChatText },
    Gambar: { color: '#d97706', bg: '#fffbeb', icon: Image },
    Profil: { color: '#059669', bg: '#ecfdf5', icon: User },
};

// ────────────────────────────────────────────
// Dummy Data
// ────────────────────────────────────────────
const MODERATION_DETAILS: Record<string, ModerationDetail> = {
    mod01: {
        id: 'mod01', title: 'Dugaan laporan palsu tentang banjir',
        description: 'Laporan lokasi banjir di Jl. Merdeka tidak sesuai dengan data BMKG dan laporan lainnya di area tersebut.',
        user: 'warga_xyz123', userInitials: 'WX', userColor: '#3b82f6',
        userEmail: 'warga.xyz@gmail.com', userId: 'u11', userJoined: '15 Mar 2025',
        userReports: 3, userWarnings: 1,
        category: 'Banjir', categoryIcon: Waves, categoryColor: '#2563eb', categoryBg: '#eff6ff',
        contentType: 'Laporan', severity: 'Kritis', status: 'Menunggu',
        time: '5 menit lalu', reason: 'Informasi palsu / hoax', flagCount: 12,
        reportedBy: ['warga_abc', 'dinas_pu', 'moderator_1', 'warga_def', 'admin_siaga'],
        originalContent: 'BANJIR BESAR!! Jl. Merdeka sudah terendam 2 meter air!! Semua warga harus segera mengungsi! Bantuan belum datang sama sekali! Pemerintah tidak peduli!! #BanjirBandung #Darurat',
        location: 'Jl. Merdeka No. 45, Kec. Coblong, Bandung',
        coordinates: '-6.8957, 107.6186',
        relatedReportId: 'RPT-0089',
        moderationHistory: [
            { action: 'Dilaporkan otomatis', by: 'AI System', time: '5 menit lalu', note: 'Deteksi kata kunci sensitif & pola hoax' },
            { action: 'Flag oleh pengguna', by: 'warga_abc', time: '4 menit lalu', note: 'Banjir di lokasi tsb hanya setinggi 10cm' },
            { action: 'Flag oleh instansi', by: 'dinas_pu', time: '3 menit lalu', note: 'Tidak sesuai data lapangan kami' },
        ],
        autoDetected: true, aiConfidence: 94,
    },
    mod02: {
        id: 'mod02', title: 'Konten tidak pantas di komentar',
        description: 'Komentar mengandung kata-kata kasar dan ujaran kebencian pada laporan jalan rusak #1892.',
        user: 'anonim_444', userInitials: 'AN', userColor: '#dc2626',
        userEmail: 'anonim444@mail.com', userId: 'u12', userJoined: '1 Jun 2025',
        userReports: 0, userWarnings: 3,
        category: 'Komentar', categoryIcon: ChatText, categoryColor: '#7c3aed', categoryBg: '#f5f3ff',
        contentType: 'Komentar', severity: 'Tinggi', status: 'Menunggu',
        time: '18 menit lalu', reason: 'Kata kasar / hate speech', flagCount: 7,
        reportedBy: ['warga_siti', 'moderator_2', 'warga_budi'],
        originalContent: '[Konten disembunyikan karena mengandung kata-kata kasar dan ujaran kebencian yang melanggar pedoman komunitas SIAGA]',
        relatedReportId: 'RPT-1892',
        moderationHistory: [
            { action: 'Dilaporkan otomatis', by: 'AI System', time: '18 menit lalu', note: 'Terdeteksi hate speech score 0.91' },
            { action: 'Flag oleh pengguna', by: 'warga_siti', time: '15 menit lalu' },
        ],
        autoDetected: true, aiConfidence: 91,
    },
    mod03: {
        id: 'mod03', title: 'Spam laporan jalan rusak duplikat',
        description: 'Pengguna membuat 8 laporan identik tentang jalan rusak di lokasi yang sama dalam waktu 10 menit.',
        user: 'test_user99', userInitials: 'TU', userColor: '#d97706',
        userEmail: 'test.user99@gmail.com', userId: 'u13', userJoined: '20 May 2025',
        userReports: 8, userWarnings: 0,
        category: 'Jalan Rusak', categoryIcon: RoadHorizon, categoryColor: '#d97706', categoryBg: '#fffbeb',
        contentType: 'Laporan', severity: 'Sedang', status: 'Menunggu',
        time: '1 jam lalu', reason: 'Spam / duplikasi', flagCount: 3,
        reportedBy: ['system_auto'],
        originalContent: 'Jalan rusak parah di Jl. Asia Afrika depan hotel Savoy Homann. Lubang besar berbahaya buat pengendara motor. Mohon segera ditangani.',
        location: 'Jl. Asia Afrika No. 112, Kec. Lengkong, Bandung',
        coordinates: '-6.9175, 107.6091',
        relatedReportId: 'RPT-2001',
        moderationHistory: [
            { action: 'Dilaporkan otomatis', by: 'Anti-Spam System', time: '1 jam lalu', note: '8 duplikasi terdeteksi dalam 10 menit' },
        ],
        autoDetected: true, aiConfidence: 98,
    },
    mod04: {
        id: 'mod04', title: 'Gambar tidak relevan di laporan kebakaran',
        description: 'Foto yang diunggah tidak menampilkan lokasi kebakaran, melainkan gambar meme yang tidak sesuai.',
        user: 'joker_321', userInitials: 'JK', userColor: '#059669',
        userEmail: 'joker321@mail.com', userId: 'u14', userJoined: '10 Apr 2025',
        userReports: 1, userWarnings: 2,
        category: 'Kebakaran', categoryIcon: Fire, categoryColor: SiagaColors.danger, categoryBg: '#fef2f2',
        contentType: 'Gambar', severity: 'Tinggi', status: 'Menunggu',
        time: '2 jam lalu', reason: 'Konten tidak relevan', flagCount: 5,
        reportedBy: ['moderator_1', 'warga_rini'],
        originalContent: '[Gambar meme internet yang tidak terkait dengan laporan kebakaran. Gambar menampilkan konten humor yang tidak relevan dengan situasi darurat.]',
        location: 'Jl. Braga No. 78, Kec. Sumur Bandung',
        coordinates: '-6.9167, 107.6095',
        relatedReportId: 'RPT-1756',
        moderationHistory: [
            { action: 'Dilaporkan oleh moderator', by: 'moderator_1', time: '2 jam lalu', note: 'Gambar bukan foto kebakaran' },
            { action: 'Flag oleh pengguna', by: 'warga_rini', time: '1 jam 45 menit lalu' },
        ],
        autoDetected: false,
    },
    mod05: {
        id: 'mod05', title: 'Profil pengguna dengan nama ofensif',
        description: 'Nama pengguna mengandung kata-kata vulgar dan tidak sesuai dengan pedoman komunitas.',
        user: 'xxx_vulgar', userInitials: 'XV', userColor: '#94a3b8',
        userEmail: 'xxxvulgar@mail.com', userId: 'u15', userJoined: '25 Jun 2025',
        userReports: 0, userWarnings: 1,
        category: 'Profil', categoryIcon: Users, categoryColor: '#059669', categoryBg: '#ecfdf5',
        contentType: 'Profil', severity: 'Sedang', status: 'Eskalasi',
        time: '3 jam lalu', reason: 'Nama tidak sesuai', flagCount: 2,
        reportedBy: ['moderator_2'],
        originalContent: 'Nama profil: [disembunyikan karena mengandung konten vulgar]. Bio: "Testing aja bro hehe"',
        moderationHistory: [
            { action: 'Dilaporkan oleh moderator', by: 'moderator_2', time: '3 jam lalu', note: 'Nama pengguna melanggar kebijakan' },
            { action: 'Dieskalasi', by: 'moderator_2', time: '2 jam 30 menit lalu', note: 'Butuh keputusan admin senior' },
        ],
        autoDetected: false,
    },
    mod06: {
        id: 'mod06', title: 'Laporan longsor yang sudah ditangani',
        description: 'Laporan tentang tanah longsor yang sudah ditangani sebulan lalu namun masih dilaporkan ulang.',
        user: 'warga_baru42', userInitials: 'WB', userColor: '#0891b2',
        userEmail: 'wargabaru42@gmail.com', userId: 'u16', userJoined: '5 Feb 2025',
        userReports: 12, userWarnings: 0,
        category: 'Tanah Longsor', categoryIcon: Mountains, categoryColor: '#7c3aed', categoryBg: '#f5f3ff',
        contentType: 'Laporan', severity: 'Rendah', status: 'Disetujui',
        time: '4 jam lalu', reason: 'Laporan kadaluarsa', flagCount: 1,
        reportedBy: ['system_auto'],
        originalContent: 'Longsor di Jl. Dago Atas masih belum diperbaiki. Jalan masih tertutup material longsor.',
        location: 'Jl. Dago Atas Km 3, Kec. Coblong, Bandung',
        coordinates: '-6.8624, 107.6176',
        relatedReportId: 'RPT-0912',
        moderationHistory: [
            { action: 'Dilaporkan otomatis', by: 'System', time: '4 jam lalu', note: 'Duplikasi laporan #RPT-0912' },
            { action: 'Disetujui', by: 'Admin Moderator', time: '3 jam lalu', note: 'Konten valid, ditandai sebagai update dari laporan sebelumnya' },
        ],
        autoDetected: true, aiConfidence: 72,
    },
    mod07: {
        id: 'mod07', title: 'Komentar promosi / iklan di forum',
        description: 'Pengguna mempromosikan jasa dalam kolom komentar tanpa kaitan dengan laporan.',
        user: 'promo_shop88', userInitials: 'PS', userColor: '#be185d',
        userEmail: 'promoshop88@mail.com', userId: 'u17', userJoined: '12 Jul 2025',
        userReports: 0, userWarnings: 4,
        category: 'Komentar', categoryIcon: ChatText, categoryColor: '#7c3aed', categoryBg: '#f5f3ff',
        contentType: 'Komentar', severity: 'Sedang', status: 'Ditolak',
        time: '6 jam lalu', reason: 'Promosi / spam', flagCount: 4,
        reportedBy: ['warga_abc', 'moderator_1'],
        originalContent: 'Butuh jasa renovasi rumah? Hubungi kami di 081xxx! Harga murah kualitas terjamin! Diskon 50% untuk pemesanan minggu ini! #JasaRenovasi #BandungMurah',
        moderationHistory: [
            { action: 'Dilaporkan otomatis', by: 'Anti-Spam System', time: '6 jam lalu', note: 'Deteksi pola promosi' },
            { action: 'Flag oleh pengguna', by: 'warga_abc', time: '5 jam 30 menit lalu' },
            { action: 'Ditolak & dihapus', by: 'Moderator Senior', time: '5 jam lalu', note: 'Konten promosi melanggar kebijakan komunitas' },
        ],
        autoDetected: true, aiConfidence: 97,
    },
    mod08: {
        id: 'mod08', title: 'Laporan sampah dengan lokasi salah',
        description: 'Koordinat lokasi tidak sesuai dengan deskripsi lokasi yang dilaporkan.',
        user: 'green_hero', userInitials: 'GH', userColor: '#059669',
        userEmail: 'greenhero@gmail.com', userId: 'u18', userJoined: '8 Jan 2025',
        userReports: 28, userWarnings: 0,
        category: 'Sampah', categoryIcon: Trash, categoryColor: '#059669', categoryBg: '#ecfdf5',
        contentType: 'Laporan', severity: 'Rendah', status: 'Menunggu',
        time: '8 jam lalu', reason: 'Data tidak akurat', flagCount: 1,
        reportedBy: ['system_auto'],
        originalContent: 'Tumpukan sampah besar di pinggir Sungai Cikapundung dekat Jl. Siliwangi. Sudah 3 hari tidak diangkut. Menimbulkan bau tidak sedap.',
        location: 'Jl. Siliwangi, Kec. Coblong, Bandung',
        coordinates: '-6.8845, 107.6103',
        relatedReportId: 'RPT-2104',
        moderationHistory: [
            { action: 'Dilaporkan otomatis', by: 'Location Validator', time: '8 jam lalu', note: 'Koordinat GPS tidak cocok dengan alamat (deviasi 1.2 km)' },
        ],
        autoDetected: true, aiConfidence: 65,
    },
};

// ────────────────────────────────────────────
// Admin Action Sheet
// ────────────────────────────────────────────
function ActionSheet({
    visible,
    onClose,
    item,
}: {
    visible: boolean;
    onClose: () => void;
    item: ModerationDetail;
}) {
    const { showToast } = useToast();

    const actions = [
        item.status === 'Menunggu' || item.status === 'Eskalasi'
            ? { label: 'Setujui Konten', icon: CheckCircle, color: SiagaColors.success, onPress: () => { onClose(); showToast({ type: 'success', title: 'Konten disetujui' }); } }
            : null,
        item.status === 'Menunggu' || item.status === 'Eskalasi'
            ? { label: 'Tolak & Hapus', icon: XCircle, color: SiagaColors.danger, onPress: () => { onClose(); showToast({ type: 'success', title: 'Konten ditolak & dihapus' }); } }
            : null,
        item.status !== 'Eskalasi'
            ? { label: 'Eskalasi ke Tim', icon: ShieldWarning, color: '#7c3aed', onPress: () => { onClose(); showToast({ type: 'info', title: 'Dieskalasi ke tim senior' }); } }
            : null,
        { label: 'Blokir Pengguna', icon: Prohibit, color: SiagaColors.danger, onPress: () => { onClose(); showToast({ type: 'warning', title: 'Pengguna diblokir' }); } },
        { label: 'Beri Peringatan', icon: Warning, color: '#d97706', onPress: () => { onClose(); showToast({ type: 'warning', title: 'Peringatan terkirim' }); } },
        item.status === 'Disetujui'
            ? { label: 'Cabut Persetujuan', icon: Flag, color: '#d97706', onPress: () => { onClose(); showToast({ type: 'info', title: 'Persetujuan dicabut' }); } }
            : null,
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
                <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary, paddingHorizontal: 20, marginBottom: 10 }}>Tindakan Moderasi</Text>
                <View style={{ paddingHorizontal: 16, gap: 4 }}>
                    {actions.map((a, i) => {
                        const IcoComp = a.icon;
                        const isDanger = a.label === 'Blokir Pengguna' || a.label === 'Tolak & Hapus';
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
// Main Screen
// ────────────────────────────────────────────
export default function ModerationDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { showToast } = useToast();

    const item = MODERATION_DETAILS[params.id || 'mod01'];
    const sevStyle = SEVERITY_STYLE[item.severity];
    const statStyle = STATUS_STYLE[item.status];
    const ctStyle = CONTENT_TYPE_STYLE[item.contentType];
    const StatusIcon = statStyle.icon;
    const CatIcon = item.categoryIcon;
    const ContentIcon = ctStyle.icon;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const [refreshing, setRefreshing] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [activeTab, setActiveTab] = useState<'detail' | 'konten' | 'riwayat'>('detail');

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

    const isCritical = item.severity === 'Kritis';
    const headerBg = isCritical ? '#dc2626' : '#7c3aed';

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: headerBg }}>
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
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Detail Moderasi</Text>
                    <TouchableOpacity
                        onPress={() => setShowActions(true)}
                        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
                        activeOpacity={0.7}
                    >
                        <DotsThree size={22} color="#fff" weight="bold" />
                    </TouchableOpacity>
                </View>

                {/* Item Summary */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 22 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                        {/* Category icon */}
                        <View style={{
                            width: 56, height: 56, borderRadius: 18,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CatIcon size={28} color="#fff" weight="duotone" />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: -0.3 }} numberOfLines={2}>{item.title}</Text>
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }} numberOfLines={1}>ID: {item.id.toUpperCase()} · {item.time}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                <View style={{
                                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                                    backgroundColor: isCritical ? 'rgba(255,255,255,0.25)' : sevStyle.bg,
                                }}>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: isCritical ? '#fff' : sevStyle.text }}>{item.severity}</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 4,
                                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                                    backgroundColor: 'rgba(255,255,255,0.18)',
                                }}>
                                    <StatusIcon size={12} color="#fff" weight="fill" />
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{statStyle.label}</Text>
                                </View>
                                <View style={{
                                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                                    backgroundColor: 'rgba(255,255,255,0.18)',
                                }}>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{item.contentType}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Quick stats in header */}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{item.flagCount}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Flag</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{item.reportedBy.length}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Pelapor</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{item.moderationHistory.length}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Riwayat</Text>
                        </View>
                        {item.aiConfidence !== undefined && (
                            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                                <Text style={{ color: item.aiConfidence >= 80 ? '#f87171' : '#fbbf24', fontWeight: '900', fontSize: 16 }}>{item.aiConfidence}%</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>AI Score</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* ── TAB SWITCHER ── */}
            <View style={{
                flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8,
                borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 6,
            }}>
                {([
                    { key: 'detail' as const, label: 'Detail', icon: Info },
                    { key: 'konten' as const, label: 'Konten', icon: FileText },
                    { key: 'riwayat' as const, label: 'Riwayat', icon: Clock },
                ]).map(tab => {
                    const active = activeTab === tab.key;
                    const TabIcon = tab.icon;
                    const accentColor = isCritical ? SiagaColors.danger : '#7c3aed';
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                                paddingVertical: 10, borderRadius: 12,
                                backgroundColor: active ? (isCritical ? '#fef2f2' : '#f5f3ff') : 'transparent',
                                borderWidth: 1, borderColor: active ? (isCritical ? '#fecaca' : '#c4b5fd') : 'transparent',
                            }}
                            activeOpacity={0.7}
                        >
                            <TabIcon size={16} color={active ? accentColor : SiagaColors.secondary} weight={active ? 'fill' : 'duotone'} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: active ? accentColor : SiagaColors.secondary }}>{tab.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── CONTENT ── */}
            <Animated.ScrollView
                style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={headerBg} colors={[headerBg]} />}
            >
                {/* ── CRITICAL ALERT ── */}
                {isCritical && item.status === 'Menunggu' && (
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
                        backgroundColor: '#fef2f2', borderRadius: 16, padding: 14,
                        borderWidth: 1.5, borderColor: '#fecaca',
                    }}>
                        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
                            <Siren size={24} color={SiagaColors.danger} weight="duotone" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: '#991b1b' }}>KONTEN KRITIS</Text>
                            <Text style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>Butuh tindakan segera! Konten ini berpotensi membahayakan keselamatan publik.</Text>
                        </View>
                    </View>
                )}

                {/* ── TAB: Detail ── */}
                {activeTab === 'detail' && (
                    <>
                        {/* Reason & Category */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Informasi Pelanggaran</Text>
                            <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#edf2f9', overflow: 'hidden' }}>
                                {[
                                    { label: 'Alasan', value: item.reason, icon: Flag, color: SiagaColors.danger },
                                    { label: 'Kategori', value: item.category, icon: CatIcon, color: item.categoryColor },
                                    { label: 'Tipe Konten', value: item.contentType, icon: ContentIcon, color: ctStyle.color },
                                    { label: 'Tingkat Keparahan', value: item.severity, icon: Warning, color: sevStyle.bg === SiagaColors.danger ? '#fff' : sevStyle.text },
                                    { label: 'Status', value: statStyle.label, icon: StatusIcon, color: statStyle.color },
                                    { label: 'Jumlah Flag', value: `${item.flagCount} laporan`, icon: Flag, color: '#d97706' },
                                ].map((row, i, arr) => {
                                    const RowIcon = row.icon;
                                    return (
                                        <View key={i} style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            paddingHorizontal: 16, paddingVertical: 14,
                                            borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9',
                                        }}>
                                            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${row.color}12`, alignItems: 'center', justifyContent: 'center' }}>
                                                <RowIcon size={16} color={row.color} weight="duotone" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{row.label}</Text>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: SiagaColors.primary, marginTop: 2 }}>{row.value}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Location if present */}
                        {item.location && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Lokasi</Text>
                                <View style={{
                                    backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                        <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#d9770612', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPin size={20} color="#d97706" weight="duotone" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>{item.location}</Text>
                                            {item.coordinates && (
                                                <TouchableOpacity
                                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                                                    activeOpacity={0.7}
                                                    onPress={() => showToast({ type: 'success', title: 'Koordinat disalin!' })}
                                                >
                                                    <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>{item.coordinates}</Text>
                                                    <Copy size={12} color={SiagaColors.secondary} weight="duotone" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                    {/* Map placeholder */}
                                    <View style={{
                                        height: 120, backgroundColor: '#f4f7fb', borderRadius: 14, marginTop: 12,
                                        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#edf2f9',
                                    }}>
                                        <MapPin size={28} color={SiagaColors.secondary} weight="duotone" />
                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 4, fontWeight: '600' }}>Peta Lokasi</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Reporter Info */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Informasi Pengguna</Text>
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                borderWidth: 1, borderColor: '#edf2f9',
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                    <View style={{
                                        width: 48, height: 48, borderRadius: 14,
                                        backgroundColor: `${item.userColor}18`,
                                        borderWidth: 1.5, borderColor: `${item.userColor}30`,
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontSize: 16, fontWeight: '900', color: item.userColor }}>{item.userInitials}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }}>@{item.user}</Text>
                                        <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 1 }}>{item.userEmail}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                                            backgroundColor: '#f5f3ff', borderWidth: 1, borderColor: '#c4b5fd',
                                        }}
                                        activeOpacity={0.7}
                                        onPress={() => router.push({ pathname: '/admin-user-detail' as any, params: { id: item.userId } })}
                                    >
                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#7c3aed' }}>Profil</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 }} />

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1, alignItems: 'center', padding: 10, backgroundColor: '#f8fafd', borderRadius: 12 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '900', color: SiagaColors.primary }}>{item.userReports}</Text>
                                        <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 1 }}>Laporan</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center', padding: 10, backgroundColor: item.userWarnings > 0 ? '#fffbeb' : '#f8fafd', borderRadius: 12 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '900', color: item.userWarnings > 0 ? '#d97706' : SiagaColors.primary }}>{item.userWarnings}</Text>
                                        <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 1 }}>Peringatan</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center', padding: 10, backgroundColor: '#f8fafd', borderRadius: 12 }}>
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary }}>{item.userJoined}</Text>
                                        <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 1 }}>Bergabung</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* AI Detection */}
                        {item.autoDetected && item.aiConfidence !== undefined && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Deteksi AI</Text>
                                <View style={{
                                    backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={{
                                            width: 52, height: 52, borderRadius: 26,
                                            borderWidth: 3.5, borderColor: item.aiConfidence >= 80 ? `${SiagaColors.danger}30` : `#d9770630`,
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Text style={{
                                                fontSize: 18, fontWeight: '900',
                                                color: item.aiConfidence >= 80 ? SiagaColors.danger : '#d97706',
                                            }}>{item.aiConfidence}%</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: 14, fontWeight: '800',
                                                color: item.aiConfidence >= 80 ? SiagaColors.danger : '#d97706',
                                            }}>
                                                {item.aiConfidence >= 90 ? 'Sangat Mencurigakan' : item.aiConfidence >= 80 ? 'Mencurigakan' : item.aiConfidence >= 60 ? 'Perlu Perhatian' : 'Rendah'}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 2 }}>
                                                Tingkat keyakinan AI dalam mendeteksi pelanggaran konten ini.
                                            </Text>
                                            {/* Confidence bar */}
                                            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                                                <View style={{
                                                    height: 6, borderRadius: 3,
                                                    backgroundColor: item.aiConfidence >= 80 ? SiagaColors.danger : '#d97706',
                                                    width: `${item.aiConfidence}%`,
                                                }} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Reported By */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Dilaporkan Oleh</Text>
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                borderWidth: 1, borderColor: '#edf2f9', gap: 8,
                            }}>
                                {item.reportedBy.map((reporter, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{
                                            width: 30, height: 30, borderRadius: 10,
                                            backgroundColor: '#f5f3ff',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <User size={14} color="#7c3aed" weight="duotone" />
                                        </View>
                                        <Text style={{ fontSize: 13, fontWeight: '600', color: SiagaColors.primary, flex: 1 }}>@{reporter}</Text>
                                        <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>#{i + 1}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Related Report */}
                        {item.relatedReportId && (
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                    backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                }}
                                activeOpacity={0.8}
                                onPress={() => showToast({ type: 'info', title: 'Membuka laporan terkait...' })}
                            >
                                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#3498db12', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={20} color={SiagaColors.info} weight="duotone" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Laporan Terkait</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.info, marginTop: 2 }}>{item.relatedReportId}</Text>
                                </View>
                                <CaretRight size={16} color={SiagaColors.secondary} weight="bold" />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* ── TAB: Konten ── */}
                {activeTab === 'konten' && (
                    <>
                        {/* Content Preview */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Konten yang Dilaporkan</Text>
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                borderWidth: 1, borderColor: isCritical ? '#fecaca' : '#edf2f9',
                            }}>
                                {/* Content type badge */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 6,
                                        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
                                        backgroundColor: ctStyle.bg,
                                    }}>
                                        <ContentIcon size={14} color={ctStyle.color} weight="duotone" />
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: ctStyle.color }}>{item.contentType}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} color={SiagaColors.secondary} />
                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{item.time}</Text>
                                    </View>
                                </View>

                                {/* Actual content */}
                                <View style={{
                                    backgroundColor: isCritical ? '#fef2f2' : '#f8fafd',
                                    borderRadius: 14, padding: 16,
                                    borderWidth: 1, borderColor: isCritical ? '#fecaca' : '#edf2f9',
                                    borderLeftWidth: 4,
                                    borderLeftColor: isCritical ? SiagaColors.danger : '#c4b5fd',
                                }}>
                                    <Text style={{
                                        fontSize: 14, fontWeight: '500', color: SiagaColors.primary,
                                        lineHeight: 22, fontStyle: 'italic',
                                    }}>
                                        "{item.originalContent}"
                                    </Text>
                                </View>

                                {/* Content author */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
                                    <View style={{
                                        width: 32, height: 32, borderRadius: 10,
                                        backgroundColor: `${item.userColor}18`,
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontSize: 11, fontWeight: '900', color: item.userColor }}>{item.userInitials}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>@{item.user}</Text>
                                        <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 1 }}>Pembuat konten</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Description */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 10 }}>Deskripsi Pelanggaran</Text>
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                borderWidth: 1, borderColor: '#edf2f9',
                            }}>
                                <Text style={{ fontSize: 14, fontWeight: '500', color: SiagaColors.primary, lineHeight: 22 }}>
                                    {item.description}
                                </Text>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14,
                                    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9',
                                }}>
                                    <Flag size={14} color={SiagaColors.danger} weight="duotone" />
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.danger }}>{item.reason}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Moderation guidelines reference */}
                        <View style={{
                            backgroundColor: '#fff', borderRadius: 18, padding: 16,
                            borderWidth: 1, borderColor: '#edf2f9',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Gavel size={16} color="#7c3aed" weight="duotone" />
                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Panduan Tindakan</Text>
                            </View>
                            <View style={{ gap: 8 }}>
                                {item.severity === 'Kritis' && (
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12 }}>
                                        <Siren size={16} color={SiagaColors.danger} weight="duotone" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#991b1b' }}>Tindakan Segera</Text>
                                            <Text style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>Konten kritis harus ditindak dalam 15 menit. Pertimbangkan untuk menghapus konten dan memberi peringatan atau memblokir pengguna.</Text>
                                        </View>
                                    </View>
                                )}
                                {item.severity === 'Tinggi' && (
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fffbeb', borderRadius: 12, padding: 12 }}>
                                        <Warning size={16} color="#d97706" weight="duotone" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#92400e' }}>Perlu Perhatian</Text>
                                            <Text style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>Konten tingkat tinggi harus ditindak dalam 1 jam. Review konten dan beri peringatan jika perlu.</Text>
                                        </View>
                                    </View>
                                )}
                                {(item.severity === 'Sedang' || item.severity === 'Rendah') && (
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#f8fafd', borderRadius: 12, padding: 12 }}>
                                        <Info size={16} color={SiagaColors.info} weight="duotone" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>Tindakan Normal</Text>
                                            <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>
                                                {item.severity === 'Sedang'
                                                    ? 'Tindak dalam 4 jam. Evaluasi konten dan tentukan tindakan yang sesuai.'
                                                    : 'Tindak dalam 24 jam. Konten kemungkinan tidak berbahaya namun perlu divalidasi.'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                )}

                {/* ── TAB: Riwayat ── */}
                {activeTab === 'riwayat' && (
                    <>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, marginBottom: 12 }}>Riwayat Moderasi</Text>
                        <View style={{ gap: 0 }}>
                            {item.moderationHistory.map((entry, i) => {
                                const isLast = i === item.moderationHistory.length - 1;
                                const actionColor =
                                    entry.action.includes('Disetujui') ? SiagaColors.success :
                                    entry.action.includes('Ditolak') ? SiagaColors.danger :
                                    entry.action.includes('Dieskalasi') ? '#7c3aed' :
                                    entry.action.includes('Flag') ? '#d97706' :
                                    SiagaColors.info;
                                const ActionIcon =
                                    entry.action.includes('Disetujui') ? CheckCircle :
                                    entry.action.includes('Ditolak') ? XCircle :
                                    entry.action.includes('Dieskalasi') ? ShieldWarning :
                                    entry.action.includes('Flag') ? Flag :
                                    entry.action.includes('otomatis') ? Lightning :
                                    Clock;
                                return (
                                    <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                                        {/* Timeline */}
                                        <View style={{ alignItems: 'center', width: 36 }}>
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 12,
                                                backgroundColor: `${actionColor}15`,
                                                alignItems: 'center', justifyContent: 'center',
                                                zIndex: 1,
                                            }}>
                                                <ActionIcon size={18} color={actionColor} weight="duotone" />
                                            </View>
                                            {!isLast && (
                                                <View style={{ width: 2, flex: 1, backgroundColor: '#edf2f9', marginTop: -2 }} />
                                            )}
                                        </View>

                                        {/* Content */}
                                        <View style={{
                                            flex: 1, backgroundColor: '#fff', borderRadius: 14,
                                            padding: 14, marginBottom: 10,
                                            borderWidth: 1, borderColor: '#edf2f9',
                                        }}>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{entry.action}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                <User size={12} color={SiagaColors.secondary} weight="duotone" />
                                                <Text style={{ fontSize: 11, color: SiagaColors.secondary, fontWeight: '600' }}>{entry.by}</Text>
                                                <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>·</Text>
                                                <Clock size={10} color={SiagaColors.secondary} />
                                                <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{entry.time}</Text>
                                            </View>
                                            {entry.note && (
                                                <View style={{
                                                    marginTop: 8, backgroundColor: '#f8fafd', borderRadius: 10,
                                                    padding: 10, borderLeftWidth: 3, borderLeftColor: actionColor,
                                                }}>
                                                    <Text style={{ fontSize: 12, color: SiagaColors.primary, lineHeight: 18 }}>{entry.note}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Summary card */}
                        <View style={{
                            backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 6,
                            borderWidth: 1, borderColor: '#edf2f9',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <ChartLineUp size={16} color="#7c3aed" weight="duotone" />
                                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Ringkasan</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#f5f3ff', borderRadius: 14 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#7c3aed' }}>{item.moderationHistory.length}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>Total Aksi</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#eff6ff', borderRadius: 14 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '900', color: SiagaColors.info }}>{item.flagCount}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>Total Flag</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#fffbeb', borderRadius: 14 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#d97706' }}>{item.reportedBy.length}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 2 }}>Pelapor</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </Animated.ScrollView>

            {/* ── BOTTOM ACTION BAR ── */}
            {(item.status === 'Menunggu' || item.status === 'Eskalasi') && (
                <View style={{
                    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
                    paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16),
                    flexDirection: 'row', gap: 10,
                }}>
                    <TouchableOpacity
                        onPress={() => showToast({ type: 'success', title: 'Konten ditolak & dihapus' })}
                        style={{
                            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                            backgroundColor: '#fef2f2', borderRadius: 14, paddingVertical: 14,
                            borderWidth: 1.5, borderColor: '#fecaca',
                        }}
                        activeOpacity={0.8}
                    >
                        <XCircle size={18} color={SiagaColors.danger} weight="bold" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.danger }}>Tolak</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => showToast({ type: 'success', title: 'Konten disetujui' })}
                        style={{
                            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                            backgroundColor: isCritical ? SiagaColors.danger : '#7c3aed',
                            borderRadius: 14, paddingVertical: 14,
                            elevation: 3, shadowColor: isCritical ? SiagaColors.danger : '#7c3aed',
                            shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
                        }}
                        activeOpacity={0.85}
                    >
                        <CheckCircle size={18} color="#fff" weight="bold" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Setujui</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Already resolved bottom bar */}
            {(item.status === 'Disetujui' || item.status === 'Ditolak') && (
                <View style={{
                    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
                    paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16),
                    flexDirection: 'row', gap: 10,
                }}>
                    <TouchableOpacity
                        onPress={() => setShowActions(true)}
                        style={{
                            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                            backgroundColor: '#f5f3ff', borderRadius: 14, paddingVertical: 14,
                            borderWidth: 1.5, borderColor: '#c4b5fd',
                        }}
                        activeOpacity={0.8}
                    >
                        <Gavel size={18} color="#7c3aed" weight="bold" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#7c3aed' }}>Tindakan Lain</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── ACTION SHEET ── */}
            <ActionSheet
                item={item}
                visible={showActions}
                onClose={() => setShowActions(false)}
            />
        </View>
    );
}
