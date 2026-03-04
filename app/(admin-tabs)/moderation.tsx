import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    Animated, Dimensions, RefreshControl, Modal, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ShieldWarning, ShieldCheck, Shield,
    MagnifyingGlass, FunnelSimple, CaretRight, CaretDown,
    CheckCircle, XCircle, Clock, DotsThreeVertical,
    Trash, Eye, Flag, Prohibit, Gavel,
    Waves, RoadHorizon, Mountains, Fire, Leaf,
    ChatText, Image, Megaphone,
    Users, Warning, WarningDiamond,
    CalendarBlank, Funnel,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type SeverityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
type ModerationStatus = 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Eskalasi';
type ContentType = 'Laporan' | 'Komentar' | 'Gambar' | 'Profil';
type FilterTab = 'Semua' | 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Eskalasi';

interface ModerationItem {
    id: string;
    title: string;
    description: string;
    user: string;
    userInitials: string;
    userColor: string;
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
}

// ────────────────────────────────────────────
// Config
// ────────────────────────────────────────────
const SEVERITY_STYLE: Record<SeverityLevel, { text: string; bg: string; border: string }> = {
    Kritis: { text: '#fff', bg: SiagaColors.danger, border: SiagaColors.danger },
    Tinggi: { text: '#9a3412', bg: '#fed7aa', border: '#fdba74' },
    Sedang: { text: '#92400e', bg: '#fef3c7', border: '#fde68a' },
    Rendah: { text: '#065f46', bg: '#d1fae5', border: '#a7f3d0' },
};

const STATUS_STYLE: Record<ModerationStatus, { color: string; bg: string; icon: any }> = {
    Menunggu: { color: '#d97706', bg: '#fffbeb', icon: Clock },
    Disetujui: { color: SiagaColors.success, bg: '#ecfdf5', icon: CheckCircle },
    Ditolak: { color: SiagaColors.danger, bg: '#fef2f2', icon: XCircle },
    Eskalasi: { color: '#7c3aed', bg: '#f5f3ff', icon: ShieldWarning },
};

const CONTENT_TYPE_STYLE: Record<ContentType, { color: string; bg: string }> = {
    Laporan: { color: SiagaColors.info, bg: '#eff6ff' },
    Komentar: { color: '#7c3aed', bg: '#f5f3ff' },
    Gambar: { color: '#d97706', bg: '#fffbeb' },
    Profil: { color: '#059669', bg: '#ecfdf5' },
};

// ────────────────────────────────────────────
// Moderation Data
// ────────────────────────────────────────────
const MODERATION_ITEMS: ModerationItem[] = [
    {
        id: 'mod01', title: 'Dugaan laporan palsu tentang banjir',
        description: 'Laporan lokasi banjir di Jl. Merdeka tidak sesuai dengan data BMKG dan laporan lainnya di area tersebut.',
        user: 'warga_xyz123', userInitials: 'WX', userColor: '#3b82f6',
        category: 'Banjir', categoryIcon: Waves, categoryColor: '#2563eb', categoryBg: '#eff6ff',
        contentType: 'Laporan', severity: 'Kritis', status: 'Menunggu',
        time: '5 menit lalu', reason: 'Informasi palsu / hoax', flagCount: 12,
    },
    {
        id: 'mod02', title: 'Konten tidak pantas di komentar',
        description: 'Komentar mengandung kata-kata kasar dan ujaran kebencian pada laporan jalan rusak #1892.',
        user: 'anonim_444', userInitials: 'AN', userColor: '#dc2626',
        category: 'Komentar', categoryIcon: ChatText, categoryColor: '#7c3aed', categoryBg: '#f5f3ff',
        contentType: 'Komentar', severity: 'Tinggi', status: 'Menunggu',
        time: '18 menit lalu', reason: 'Kata kasar / hate speech', flagCount: 7,
    },
    {
        id: 'mod03', title: 'Spam laporan jalan rusak duplikat',
        description: 'Pengguna membuat 8 laporan identik tentang jalan rusak di lokasi yang sama dalam waktu 10 menit.',
        user: 'test_user99', userInitials: 'TU', userColor: '#d97706',
        category: 'Jalan Rusak', categoryIcon: RoadHorizon, categoryColor: '#d97706', categoryBg: '#fffbeb',
        contentType: 'Laporan', severity: 'Sedang', status: 'Menunggu',
        time: '1 jam lalu', reason: 'Spam / duplikasi', flagCount: 3,
    },
    {
        id: 'mod04', title: 'Gambar tidak relevan di laporan kebakaran',
        description: 'Foto yang diunggah tidak menampilkan lokasi kebakaran, melainkan gambar meme yang tidak sesuai.',
        user: 'joker_321', userInitials: 'JK', userColor: '#059669',
        category: 'Kebakaran', categoryIcon: Fire, categoryColor: SiagaColors.danger, categoryBg: '#fef2f2',
        contentType: 'Gambar', severity: 'Tinggi', status: 'Menunggu',
        time: '2 jam lalu', reason: 'Konten tidak relevan', flagCount: 5,
    },
    {
        id: 'mod05', title: 'Profil pengguna dengan nama ofensif',
        description: 'Nama pengguna mengandung kata-kata vulgar dan tidak sesuai dengan pedoman komunitas.',
        user: 'xxx_vulgar', userInitials: 'XV', userColor: '#94a3b8',
        category: 'Profil', categoryIcon: Users, categoryColor: '#059669', categoryBg: '#ecfdf5',
        contentType: 'Profil', severity: 'Sedang', status: 'Eskalasi',
        time: '3 jam lalu', reason: 'Nama tidak sesuai', flagCount: 2,
    },
    {
        id: 'mod06', title: 'Laporan longsor yang sudah ditangani',
        description: 'Laporan tentang tanah longsor yang sudah ditangani sebulan lalu namun masih dilaporkan ulang.',
        user: 'warga_baru42', userInitials: 'WB', userColor: '#0891b2',
        category: 'Tanah Longsor', categoryIcon: Mountains, categoryColor: '#7c3aed', categoryBg: '#f5f3ff',
        contentType: 'Laporan', severity: 'Rendah', status: 'Disetujui',
        time: '4 jam lalu', reason: 'Laporan kadaluarsa', flagCount: 1,
    },
    {
        id: 'mod07', title: 'Komentar promosi / iklan di forum',
        description: 'Pengguna mempromosikan jasa dalam kolom komentar tanpa kaitan dengan laporan.',
        user: 'promo_shop88', userInitials: 'PS', userColor: '#be185d',
        category: 'Komentar', categoryIcon: ChatText, categoryColor: '#7c3aed', categoryBg: '#f5f3ff',
        contentType: 'Komentar', severity: 'Sedang', status: 'Ditolak',
        time: '6 jam lalu', reason: 'Promosi / spam', flagCount: 4,
    },
    {
        id: 'mod08', title: 'Laporan sampah dengan lokasi salah',
        description: 'Koordinat lokasi tidak sesuai dengan deskripsi lokasi yang dilaporkan.',
        user: 'green_hero', userInitials: 'GH', userColor: '#059669',
        category: 'Sampah', categoryIcon: Trash, categoryColor: '#059669', categoryBg: '#ecfdf5',
        contentType: 'Laporan', severity: 'Rendah', status: 'Menunggu',
        time: '8 jam lalu', reason: 'Data tidak akurat', flagCount: 1,
    },
];

const FILTER_TABS: FilterTab[] = ['Semua', 'Menunggu', 'Disetujui', 'Ditolak', 'Eskalasi'];

// ────────────────────────────────────────────
// Action Sheet
// ────────────────────────────────────────────
function ModerationActionSheet({
    item,
    visible,
    onClose,
    onViewDetail,
}: {
    item: ModerationItem | null;
    visible: boolean;
    onClose: () => void;
    onViewDetail?: (item: ModerationItem) => void;
}) {
    if (!item) return null;
    const sevStyle = SEVERITY_STYLE[item.severity];
    const statStyle = STATUS_STYLE[item.status];
    const ctStyle = CONTENT_TYPE_STYLE[item.contentType];
    const StatusIcon = statStyle.icon;
    const CatIcon = item.categoryIcon;

    const actions = [
        { label: 'Lihat Detail', icon: Eye, color: SiagaColors.info },
        item.status === 'Menunggu' || item.status === 'Eskalasi'
            ? { label: 'Setujui Konten', icon: CheckCircle, color: SiagaColors.success }
            : null,
        item.status === 'Menunggu' || item.status === 'Eskalasi'
            ? { label: 'Tolak & Hapus', icon: XCircle, color: SiagaColors.danger }
            : null,
        item.status !== 'Eskalasi'
            ? { label: 'Eskalasi ke Tim', icon: ShieldWarning, color: '#7c3aed' }
            : null,
        { label: 'Blokir Pengguna', icon: Prohibit, color: SiagaColors.danger },
        { label: 'Beri Peringatan', icon: Warning, color: '#d97706' },
        item.status === 'Disetujui'
            ? { label: 'Cabut Persetujuan', icon: Flag, color: '#d97706' }
            : null,
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

                {/* Item Identity */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                        <View style={{
                            width: 48, height: 48, borderRadius: 14,
                            backgroundColor: item.categoryBg,
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CatIcon size={24} color={item.categoryColor} weight="duotone" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }} numberOfLines={2}>{item.title}</Text>
                            <Text style={{ fontSize: 12, color: SiagaColors.secondary, marginTop: 3 }} numberOfLines={2}>{item.description}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: sevStyle.bg }}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: sevStyle.text }}>{item.severity}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: statStyle.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <StatusIcon size={10} color={statStyle.color} weight="fill" />
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: statStyle.color }}>{item.status}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: ctStyle.bg }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: ctStyle.color }}>{item.contentType}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 4 }}>
                    {actions.map((action, i) => {
                        const IconComp = action.icon;
                        const isDanger = action.label === 'Blokir Pengguna' || action.label === 'Tolak & Hapus';
                        return (
                            <TouchableOpacity
                                key={i}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                    padding: 14, borderRadius: 14,
                                    backgroundColor: isDanger ? '#fef2f2' : '#f8fafc',
                                }}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (action.label === 'Lihat Detail' && onViewDetail && item) {
                                        onClose();
                                        onViewDetail(item);
                                    } else {
                                        onClose();
                                    }
                                }}
                            >
                                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${action.color}18`, alignItems: 'center', justifyContent: 'center' }}>
                                    <IconComp size={18} color={action.color} weight="duotone" />
                                </View>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: isDanger ? SiagaColors.danger : SiagaColors.primary }}>{action.label}</Text>
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
// Moderation Card
// ────────────────────────────────────────────
function ModerationCard({ item, onAction }: { item: ModerationItem; onAction: (i: ModerationItem) => void }) {
    const sevStyle = SEVERITY_STYLE[item.severity];
    const statStyle = STATUS_STYLE[item.status];
    const ctStyle = CONTENT_TYPE_STYLE[item.contentType];
    const StatusIcon = statStyle.icon;
    const CatIcon = item.categoryIcon;

    return (
        <View style={{
            backgroundColor: '#fff', borderRadius: 18, padding: 14,
            borderWidth: 1, borderColor: item.severity === 'Kritis' ? 'rgba(220,38,38,0.2)' : '#edf2f9',
            elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
        }}>
            {/* Header row */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                {/* Category icon */}
                <View style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: item.categoryBg,
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <CatIcon size={22} color={item.categoryColor} weight="duotone" />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    {/* Title + severity */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3, gap: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary, flex: 1 }} numberOfLines={1}>{item.title}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: sevStyle.bg }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: sevStyle.text }}>{item.severity}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={{ fontSize: 12, color: SiagaColors.secondary, lineHeight: 17 }} numberOfLines={2}>{item.description}</Text>

                    {/* Tags row */}
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: statStyle.bg }}>
                            <StatusIcon size={10} color={statStyle.color} weight="fill" />
                            <Text style={{ fontSize: 10, fontWeight: '700', color: statStyle.color }}>{item.status}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: ctStyle.bg }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: ctStyle.color }}>{item.contentType}</Text>
                        </View>
                        {item.flagCount > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#fef2f2' }}>
                                <Flag size={10} color={SiagaColors.danger} weight="fill" />
                                <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.danger }}>{item.flagCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 }} />

            {/* Footer: user info + reason + time + actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={{
                        width: 26, height: 26, borderRadius: 8,
                        backgroundColor: `${item.userColor}18`,
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: item.userColor }}>{item.userInitials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.primary }} numberOfLines={1}>@{item.user}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                            <Clock size={10} color={SiagaColors.secondary} />
                            <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>{item.time}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick action buttons */}
                {item.status === 'Menunggu' || item.status === 'Eskalasi' ? (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: '#fef2f2' }}
                            activeOpacity={0.7}
                        >
                            <XCircle size={13} color={SiagaColors.danger} weight="fill" />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.danger }}>Tolak</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: '#f0fdf4' }}
                            activeOpacity={0.7}
                        >
                            <CheckCircle size={13} color={SiagaColors.success} weight="fill" />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.success }}>Setujui</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onAction(item)}
                            style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}
                            activeOpacity={0.7}
                        >
                            <DotsThreeVertical size={16} color={SiagaColors.secondary} weight="bold" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => onAction(item)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#f8fafc' }}
                        activeOpacity={0.7}
                    >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#7c3aed' }}>Detail</Text>
                        <CaretRight size={12} color="#7c3aed" weight="bold" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────
export default function AdminModerationScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('Semua');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
        ]).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 800));
        setRefreshing(false);
    };

    // ── Computed ──
    const filteredItems = useMemo(() => {
        return MODERATION_ITEMS.filter(item => {
            const matchQ = query === '' || item.title.toLowerCase().includes(query.toLowerCase()) || item.user.toLowerCase().includes(query.toLowerCase());
            const matchTab = activeTab === 'Semua' || item.status === activeTab;
            return matchQ && matchTab;
        });
    }, [query, activeTab]);

    const counts = useMemo(() => ({
        Semua: MODERATION_ITEMS.length,
        Menunggu: MODERATION_ITEMS.filter(i => i.status === 'Menunggu').length,
        Disetujui: MODERATION_ITEMS.filter(i => i.status === 'Disetujui').length,
        Ditolak: MODERATION_ITEMS.filter(i => i.status === 'Ditolak').length,
        Eskalasi: MODERATION_ITEMS.filter(i => i.status === 'Eskalasi').length,
    }), []);

    const criticalCount = MODERATION_ITEMS.filter(i => i.severity === 'Kritis' && i.status === 'Menunggu').length;

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

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
                                <ShieldWarning size={22} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3 }}>Moderasi</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Kontrol Konten</Text>
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

                    {/* Stats row */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{counts.Semua}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Total</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(251,191,36,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#fbbf24', fontWeight: '900', fontSize: 18 }}>{counts.Menunggu}</Text>
                            <Text style={{ color: 'rgba(251,191,36,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Menunggu</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(74,222,128,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#4ade80', fontWeight: '900', fontSize: 18 }}>{counts.Disetujui}</Text>
                            <Text style={{ color: 'rgba(74,222,128,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Disetujui</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.18)', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: '#f87171', fontWeight: '900', fontSize: 18 }}>{counts.Ditolak + counts.Eskalasi}</Text>
                            <Text style={{ color: 'rgba(248,113,113,0.8)', fontSize: 10, fontWeight: '600', marginTop: 1 }}>Ditolak/Esk</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── SEARCH & FILTER ── */}
            <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 }}>
                {/* Search */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f7fb', borderRadius: 14, paddingHorizontal: 12, gap: 8, height: 44 }}>
                    <MagnifyingGlass size={18} color={SiagaColors.secondary} weight="bold" />
                    <TextInput
                        placeholder="Cari judul atau pengguna..."
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

                {/* Status tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 7 }}>
                        {FILTER_TABS.map(tab => {
                            const active = activeTab === tab;
                            const count = counts[tab];
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 5,
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                                        backgroundColor: active ? '#7c3aed' : '#f4f7fb',
                                        borderWidth: 1, borderColor: active ? '#7c3aed' : 'transparent',
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : SiagaColors.secondary }}>{tab}</Text>
                                    <View style={{
                                        backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#edf2f9',
                                        paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6,
                                    }}>
                                        <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#fff' : SiagaColors.secondary }}>{count}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            {/* ── CRITICAL ALERT BANNER ── */}
            {criticalCount > 0 && activeTab !== 'Disetujui' && activeTab !== 'Ditolak' && (
                <TouchableOpacity
                    style={{
                        marginHorizontal: 16, marginTop: 12,
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        backgroundColor: '#fef2f2', borderRadius: 16, padding: 12,
                        borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)',
                    }}
                    activeOpacity={0.85}
                >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                        <WarningDiamond size={20} color={SiagaColors.danger} weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.danger }}>{criticalCount} Konten Kritis Menunggu</Text>
                        <Text style={{ fontSize: 11, color: '#991b1b', marginTop: 1 }}>Butuh tindakan segera dari moderator</Text>
                    </View>
                    <CaretRight size={14} color={SiagaColors.danger} weight="bold" />
                </TouchableOpacity>
            )}

            {/* ── MODERATION QUEUE LIST ── */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <FlatList
                    data={filteredItems}
                    keyExtractor={i => i.id}
                    contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
                    ListHeaderComponent={
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.secondary }}>
                                Menampilkan{' '}
                                <Text style={{ color: SiagaColors.primary, fontWeight: '800' }}>{filteredItems.length}</Text>
                                {' '}item moderasi
                            </Text>
                            {(activeTab !== 'Semua' || query !== '') && (
                                <TouchableOpacity
                                    onPress={() => { setActiveTab('Semua'); setQuery(''); }}
                                    activeOpacity={0.7}
                                >
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
                            <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary }}>Tidak ada item</Text>
                            <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center', paddingHorizontal: 20 }}>
                                {activeTab === 'Menunggu'
                                    ? 'Semua konten sudah dimoderasi. Kerja bagus! 🎉'
                                    : 'Tidak ditemukan item yang cocok.'}
                            </Text>
                            {activeTab !== 'Semua' && (
                                <TouchableOpacity
                                    onPress={() => { setActiveTab('Semua'); setQuery(''); }}
                                    style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#7c3aed', borderRadius: 12, marginTop: 4 }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Lihat Semua</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => router.push({ pathname: '/moderasi-detail' as any, params: { id: item.id } })}
                        >
                            <ModerationCard item={item} onAction={(i) => { setSelectedItem(i); setSheetVisible(true); }} />
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        filteredItems.length > 0 ? (
                            <View style={{ paddingTop: 8, alignItems: 'center', gap: 6 }}>
                                {/* Moderation Guidelines */}
                                <View style={{
                                    backgroundColor: '#fff', borderRadius: 16, padding: 14,
                                    borderWidth: 1, borderColor: '#edf2f9', width: '100%',
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <Gavel size={16} color="#7c3aed" weight="duotone" />
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Pedoman Moderasi</Text>
                                    </View>
                                    <View style={{ gap: 6 }}>
                                        {[
                                            { text: 'Kritis — Tindak dalam 15 menit, potensi keselamatan', color: SiagaColors.danger },
                                            { text: 'Tinggi — Tindak dalam 1 jam, konten ofensif/hoax', color: '#d97706' },
                                            { text: 'Sedang — Tindak dalam 4 jam, spam/duplikasi', color: SiagaColors.warning },
                                            { text: 'Rendah — Tindak dalam 24 jam, data tidak akurat', color: SiagaColors.success },
                                        ].map((g, i) => (
                                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: g.color }} />
                                                <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{g.text}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Footer */}
                                <View style={{ paddingTop: 8, paddingBottom: 4, alignItems: 'center', gap: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShieldWarning size={13} color="#fff" weight="duotone" />
                                        </View>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>SIAGA Moderation</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>v1.0.0 · Content Moderation System · PROXOCORIS 2026</Text>
                                </View>
                            </View>
                        ) : null
                    }
                />
            </Animated.View>

            {/* ── ACTION SHEET ── */}
            <ModerationActionSheet
                item={selectedItem}
                visible={sheetVisible}
                onClose={() => { setSheetVisible(false); setSelectedItem(null); }}
                onViewDetail={(i) => router.push({ pathname: '/moderasi-detail' as any, params: { id: i.id } })}
            />
        </View>
    );
}
