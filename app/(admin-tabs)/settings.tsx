import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Switch,
    Animated, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Gear, GearSix, Globe, Database, Lock, Bell, Cloud,
    Palette, Key, Fingerprint, Cpu, Power, SignOut,
    CaretRight, ShieldCheck, Info, HardDrives,
    Notification, ClockClockwise, Envelope, Megaphone,
    FloppyDisk, Recycle, Timer, Plug, Moon, Sun,
    Users, WarningDiamond, CalendarBlank, Sliders,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
interface SettingItem {
    label: string;
    sub: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    type: 'navigate' | 'toggle' | 'info' | 'danger';
    value?: boolean;
    infoValue?: string;
}

interface SettingSection {
    title: string;
    titleIcon: any;
    titleColor: string;
    items: SettingItem[];
}

// ────────────────────────────────────────────
// Settings Data
// ────────────────────────────────────────────
function getSettingsSections(toggles: Record<string, boolean>): SettingSection[] {
    return [
        {
            title: 'Umum',
            titleIcon: GearSix,
            titleColor: '#7c3aed',
            items: [
                { label: 'Informasi Aplikasi', sub: 'Versi, nama, dan detail sistem', icon: Info, iconColor: SiagaColors.info, iconBg: '#eff6ff', type: 'navigate' },
                { label: 'Bahasa Sistem', sub: 'Bahasa Indonesia', icon: Globe, iconColor: '#059669', iconBg: '#ecfdf5', type: 'navigate', infoValue: 'ID' },
                { label: 'Zona Waktu', sub: 'Asia/Jakarta (WIB, UTC+7)', icon: Timer, iconColor: '#d97706', iconBg: '#fffbeb', type: 'navigate', infoValue: 'WIB' },
                { label: 'Mode Gelap', sub: 'Aktifkan tampilan gelap', icon: Moon, iconColor: '#7c3aed', iconBg: '#f5f3ff', type: 'toggle', value: toggles.darkMode },
            ],
        },
        {
            title: 'Keamanan & Autentikasi',
            titleIcon: Lock,
            titleColor: SiagaColors.danger,
            items: [
                { label: 'Kebijakan Kata Sandi', sub: 'Min. 8 karakter, huruf besar & simbol', icon: Key, iconColor: SiagaColors.danger, iconBg: '#fef2f2', type: 'navigate' },
                { label: 'Autentikasi 2 Faktor', sub: 'Wajibkan 2FA untuk semua admin', icon: Fingerprint, iconColor: '#7c3aed', iconBg: '#f5f3ff', type: 'toggle', value: toggles.twoFactor },
                { label: 'Sesi Login', sub: 'Auto logout setelah 30 menit', icon: ClockClockwise, iconColor: '#d97706', iconBg: '#fffbeb', type: 'navigate', infoValue: '30m' },
                { label: 'IP Whitelist', sub: 'Batasi akses berdasarkan IP', icon: ShieldCheck, iconColor: SiagaColors.success, iconBg: '#ecfdf5', type: 'navigate' },
            ],
        },
        {
            title: 'Notifikasi',
            titleIcon: Bell,
            titleColor: '#3b82f6',
            items: [
                { label: 'Push Notification', sub: 'Notifikasi perangkat untuk admin', icon: Notification, iconColor: '#3b82f6', iconBg: '#eff6ff', type: 'toggle', value: toggles.pushNotif },
                { label: 'Notifikasi Email', sub: 'Kirim email untuk laporan kritis', icon: Envelope, iconColor: '#059669', iconBg: '#ecfdf5', type: 'toggle', value: toggles.emailNotif },
                { label: 'Alert Broadcast', sub: 'Notifikasi massal ke semua pengguna', icon: Megaphone, iconColor: '#d97706', iconBg: '#fffbeb', type: 'navigate' },
                { label: 'Laporan Kritis', sub: 'Auto-notify untuk severity kritis', icon: WarningDiamond, iconColor: SiagaColors.danger, iconBg: '#fef2f2', type: 'toggle', value: toggles.criticalAlert },
            ],
        },
        {
            title: 'Database & Penyimpanan',
            titleIcon: Database,
            titleColor: '#059669',
            items: [
                { label: 'Backup Otomatis', sub: 'Setiap hari pukul 02:00 WIB', icon: FloppyDisk, iconColor: '#3b82f6', iconBg: '#eff6ff', type: 'toggle', value: toggles.autoBackup },
                { label: 'Status Database', sub: 'PostgreSQL · 42% terpakai', icon: Database, iconColor: '#059669', iconBg: '#ecfdf5', type: 'navigate', infoValue: '42%' },
                { label: 'Penyimpanan File', sub: '12.4 GB dari 50 GB terpakai', icon: HardDrives, iconColor: '#d97706', iconBg: '#fffbeb', type: 'navigate', infoValue: '25%' },
                { label: 'Cloud Sync', sub: 'Sinkronisasi ke cloud storage', icon: Cloud, iconColor: '#7c3aed', iconBg: '#f5f3ff', type: 'toggle', value: toggles.cloudSync },
                { label: 'Bersihkan Cache', sub: 'Hapus data cache & file temp', icon: Recycle, iconColor: SiagaColors.secondary, iconBg: '#f1f5f9', type: 'navigate' },
            ],
        },
        {
            title: 'Integrasi & API',
            titleIcon: Plug,
            titleColor: '#0891b2',
            items: [
                { label: 'API Keys', sub: 'Kelola kunci akses API eksternal', icon: Key, iconColor: '#0891b2', iconBg: '#ecfeff', type: 'navigate' },
                { label: 'Webhook', sub: '3 webhook aktif', icon: Globe, iconColor: '#3b82f6', iconBg: '#eff6ff', type: 'navigate', infoValue: '3' },
                { label: 'BMKG Integration', sub: 'Data cuaca & peringatan bencana', icon: Cloud, iconColor: '#059669', iconBg: '#ecfdf5', type: 'navigate', infoValue: 'Aktif' },
                { label: 'SMS Gateway', sub: 'Kanal SMS untuk notifikasi darurat', icon: Envelope, iconColor: '#d97706', iconBg: '#fffbeb', type: 'navigate', infoValue: 'Aktif' },
            ],
        },
        {
            title: 'Moderasi & Konten',
            titleIcon: ShieldCheck,
            titleColor: '#7c3aed',
            items: [
                { label: 'Auto Moderasi', sub: 'Filter otomatis konten berbahaya', icon: ShieldCheck, iconColor: '#7c3aed', iconBg: '#f5f3ff', type: 'toggle', value: toggles.autoMod },
                { label: 'Word Filter', sub: '284 kata dalam daftar hitam', icon: Sliders, iconColor: SiagaColors.danger, iconBg: '#fef2f2', type: 'navigate', infoValue: '284' },
                { label: 'Batas Laporan Harian', sub: 'Maks. 10 laporan per pengguna/hari', icon: Timer, iconColor: '#d97706', iconBg: '#fffbeb', type: 'navigate', infoValue: '10' },
                { label: 'Verifikasi Foto', sub: 'Wajibkan foto untuk setiap laporan', icon: Palette, iconColor: '#3b82f6', iconBg: '#eff6ff', type: 'toggle', value: toggles.photoRequired },
            ],
        },
        {
            title: 'Pengguna & Akses',
            titleIcon: Users,
            titleColor: '#3b82f6',
            items: [
                { label: 'Registrasi Terbuka', sub: 'Izinkan registrasi publik', icon: Users, iconColor: SiagaColors.success, iconBg: '#ecfdf5', type: 'toggle', value: toggles.openReg },
                { label: 'Verifikasi Email', sub: 'Wajib verifikasi email saat daftar', icon: Envelope, iconColor: '#3b82f6', iconBg: '#eff6ff', type: 'toggle', value: toggles.emailVerify },
                { label: 'Role & Permission', sub: 'Kelola hak akses per peran', icon: Lock, iconColor: '#7c3aed', iconBg: '#f5f3ff', type: 'navigate' },
                { label: 'Log Aktivitas Admin', sub: 'Riwayat semua aksi administrator', icon: ClockClockwise, iconColor: '#d97706', iconBg: '#fffbeb', type: 'navigate' },
            ],
        },
        {
            title: 'Sistem',
            titleIcon: Cpu,
            titleColor: '#94a3b8',
            items: [
                { label: 'Mode Maintenance', sub: 'Nonaktifkan akses publik sementara', icon: Power, iconColor: SiagaColors.danger, iconBg: '#fef2f2', type: 'toggle', value: toggles.maintenance },
                { label: 'Restart Layanan', sub: 'Restart backend & worker service', icon: Cpu, iconColor: '#d97706', iconBg: '#fffbeb', type: 'danger' },
                { label: 'Keluar dari Sistem', sub: 'Logout dari akun administrator', icon: SignOut, iconColor: SiagaColors.danger, iconBg: '#fef2f2', type: 'danger' },
            ],
        },
    ];
}

// ────────────────────────────────────────────
// System Info Card
// ────────────────────────────────────────────
function SystemInfoCard() {
    const items = [
        { label: 'Versi Aplikasi', value: 'v1.0.0' },
        { label: 'Build', value: '2026.02.28-001' },
        { label: 'Backend', value: 'Node.js 20 LTS' },
        { label: 'Database', value: 'PostgreSQL 16' },
        { label: 'Uptime', value: '99.8% (30 hari)' },
        { label: 'Last Deploy', value: '28 Feb 2026, 10:00' },
    ];

    return (
        <View style={{
            backgroundColor: '#fff', borderRadius: 18, padding: 16,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={18} color="#7c3aed" weight="duotone" />
                </View>
                <View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }}>Informasi Sistem</Text>
                    <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>SIAGA Admin Panel</Text>
                </View>
            </View>
            {items.map((item, i) => (
                <View key={i} style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: 9,
                    borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f8fafc',
                }}>
                    <Text style={{ fontSize: 13, color: SiagaColors.secondary }}>{item.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{item.value}</Text>
                </View>
            ))}
        </View>
    );
}

// ────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────
export default function AdminSettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { logout } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    // Toggle states
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        darkMode: false,
        twoFactor: true,
        pushNotif: true,
        emailNotif: true,
        criticalAlert: true,
        autoBackup: true,
        cloudSync: true,
        autoMod: true,
        photoRequired: true,
        openReg: true,
        emailVerify: true,
        maintenance: false,
    });

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

    const handleToggle = (key: string) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Map toggle keys by label for lookup
    const toggleKeyMap: Record<string, string> = {
        'Mode Gelap': 'darkMode',
        'Autentikasi 2 Faktor': 'twoFactor',
        'Push Notification': 'pushNotif',
        'Notifikasi Email': 'emailNotif',
        'Laporan Kritis': 'criticalAlert',
        'Backup Otomatis': 'autoBackup',
        'Cloud Sync': 'cloudSync',
        'Auto Moderasi': 'autoMod',
        'Verifikasi Foto': 'photoRequired',
        'Registrasi Terbuka': 'openReg',
        'Verifikasi Email': 'emailVerify',
        'Mode Maintenance': 'maintenance',
    };

    const sections = getSettingsSections(toggles);

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/(auth)/login' as any);
        } catch { }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ position: 'absolute', right: -24, top: -24, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 50, bottom: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                                <Gear size={22} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3 }}>Pengaturan</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Konfigurasi Sistem</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <CalendarBlank size={12} color="rgba(255,255,255,0.5)" />
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{today}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
                                <Text style={{ color: '#4ade80', fontWeight: '700', fontSize: 11 }}>Semua Aktif</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── CONTENT ── */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
                >
                    {/* ── SECTIONS ── */}
                    {sections.map((section, si) => {
                        const TitleIcon = section.titleIcon;
                        return (
                            <View key={si}>
                                {/* Section header */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <TitleIcon size={18} color={section.titleColor} weight="duotone" />
                                    <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>{section.title}</Text>
                                </View>

                                {/* Section card */}
                                <View style={{
                                    backgroundColor: '#fff', borderRadius: 18,
                                    borderWidth: 1, borderColor: '#edf2f9',
                                    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
                                    overflow: 'hidden',
                                }}>
                                    {section.items.map((item, ii) => {
                                        const IconComp = item.icon;
                                        const isDanger = item.type === 'danger';
                                        const isLast = ii === section.items.length - 1;
                                        const toggleKey = toggleKeyMap[item.label];

                                        return (
                                            <TouchableOpacity
                                                key={ii}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                                    paddingHorizontal: 16, paddingVertical: 14,
                                                    borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#f8fafc',
                                                    backgroundColor: isDanger ? 'rgba(239,68,68,0.02)' : 'transparent',
                                                }}
                                                activeOpacity={item.type === 'toggle' ? 1 : 0.7}
                                                onPress={() => {
                                                    if (item.type === 'toggle' && toggleKey) {
                                                        handleToggle(toggleKey);
                                                    } else if (item.label === 'Keluar dari Sistem') {
                                                        handleLogout();
                                                    }
                                                }}
                                            >
                                                {/* Icon */}
                                                <View style={{
                                                    width: 40, height: 40, borderRadius: 12,
                                                    backgroundColor: item.iconBg,
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <IconComp size={20} color={item.iconColor} weight="duotone" />
                                                </View>

                                                {/* Text */}
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        fontSize: 14, fontWeight: '700',
                                                        color: isDanger ? SiagaColors.danger : SiagaColors.primary,
                                                    }}>{item.label}</Text>
                                                    <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{item.sub}</Text>
                                                </View>

                                                {/* Action */}
                                                {item.type === 'toggle' && toggleKey ? (
                                                    <Switch
                                                        value={toggles[toggleKey]}
                                                        onValueChange={() => handleToggle(toggleKey)}
                                                        trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
                                                        thumbColor={toggles[toggleKey] ? '#7c3aed' : '#94a3b8'}
                                                    />
                                                ) : item.type === 'navigate' ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        {item.infoValue && (
                                                            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#f4f7fb' }}>
                                                                <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary }}>{item.infoValue}</Text>
                                                            </View>
                                                        )}
                                                        <CaretRight size={16} color={SiagaColors.secondary} weight="bold" />
                                                    </View>
                                                ) : item.type === 'danger' ? (
                                                    <CaretRight size={16} color={SiagaColors.danger} weight="bold" />
                                                ) : null}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}

                    {/* ── SYSTEM INFO CARD ── */}
                    <SystemInfoCard />

                    {/* ── FOOTER ── */}
                    <View style={{ paddingTop: 4, paddingBottom: 4, alignItems: 'center', gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
                                <Gear size={13} color="#fff" weight="duotone" />
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>SIAGA System Settings</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>v1.0.0 · Super Admin Configuration · PROXOCORIS 2026</Text>
                    </View>

                </ScrollView>
            </Animated.View>
        </View>
    );
}
