import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    Animated, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, UserPlus, User, Envelope, MapPin,
    Buildings, Users, UserGear, Eye, EyeSlash,
    Key, CheckCircle, CaretDown, CaretUp, Check,
    ShieldCheck, IdentificationBadge, Phone,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useToast } from '@/contexts/toast.context';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type UserRole = 'Masyarakat' | 'Pemerintah' | 'Admin';

interface FormData {
    nama: string;
    email: string;
    telepon: string;
    role: UserRole;
    kecamatan: string;
    instansi: string;
    password: string;
    konfirmasiPassword: string;
}

interface FormErrors {
    [key: string]: string;
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────
const ROLE_OPTIONS: { value: UserRole; label: string; desc: string; icon: any; color: string; bg: string }[] = [
    { value: 'Masyarakat', label: 'Masyarakat', desc: 'Pengguna umum yang dapat membuat laporan', icon: Users, color: SiagaColors.info, bg: '#eff6ff' },
    { value: 'Pemerintah', label: 'Pemerintah', desc: 'Instansi pemerintah yang menangani laporan', icon: Buildings, color: '#7c3aed', bg: '#f5f3ff' },
    { value: 'Admin', label: 'Admin', desc: 'Administrator sistem dengan akses penuh', icon: UserGear, color: '#d97706', bg: '#fffbeb' },
];

const KECAMATAN_LIST = [
    'Kec. Coblong', 'Kec. Bandung Wetan', 'Kec. Sukasari', 'Kec. Cibeunying',
    'Kec. Cicendo', 'Kec. Bojongloa', 'Kec. Regol', 'Kec. Antapani',
    'Kec. Lengkong', 'Kec. Sumur Bandung', 'Kec. Astana Anyar', 'Kec. Babakan Ciparay',
];

// ────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────
export default function TambahPenggunaScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { showToast } = useToast();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const [form, setForm] = useState<FormData>({
        nama: '', email: '', telepon: '', role: 'Masyarakat',
        kecamatan: '', instansi: '', password: '', konfirmasiPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRolePicker, setShowRolePicker] = useState(false);
    const [showKecamatanPicker, setShowKecamatanPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const updateField = (field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!form.nama.trim()) errs.nama = 'Nama lengkap wajib diisi';
        if (!form.email.trim()) errs.email = 'Email wajib diisi';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid';
        if (!form.telepon.trim()) errs.telepon = 'Nomor telepon wajib diisi';
        else if (!/^(\+62|62|0)[0-9]{8,13}$/.test(form.telepon.replace(/[\s-]/g, ''))) errs.telepon = 'Format nomor telepon tidak valid';
        if (!form.kecamatan) errs.kecamatan = 'Kecamatan wajib dipilih';
        if (form.role === 'Pemerintah' && !form.instansi.trim()) errs.instansi = 'Nama instansi wajib diisi';
        if (!form.password) errs.password = 'Kata sandi wajib diisi';
        else if (form.password.length < 8) errs.password = 'Kata sandi minimal 8 karakter';
        if (form.password !== form.konfirmasiPassword) errs.konfirmasiPassword = 'Konfirmasi kata sandi tidak cocok';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1200));
        setIsSubmitting(false);
        showToast({ type: 'success', title: 'Pengguna berhasil ditambahkan!' });
        router.back();
    };

    const selectedRole = ROLE_OPTIONS.find(r => r.value === form.role)!;

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            {/* ── HEADER ── */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#7c3aed' }}>
                <View style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <View style={{ position: 'absolute', left: 40, bottom: -25, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18, gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            width: 40, height: 40, borderRadius: 12,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={20} color="#fff" weight="bold" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3 }}>Tambah Pengguna</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Buat Akun Baru</Text>
                    </View>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={20} color="#fff" weight="duotone" />
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Animated.ScrollView
                    style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── SECTION: Informasi Dasar ── */}
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                                <IdentificationBadge size={18} color="#7c3aed" weight="duotone" />
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Informasi Dasar</Text>
                        </View>

                        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: '#edf2f9' }}>
                            {/* Nama */}
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Nama Lengkap <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 10,
                                    backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                    borderWidth: 1.5, borderColor: errors.nama ? SiagaColors.danger : form.nama ? '#c4b5fd' : '#edf2f9',
                                }}>
                                    <User size={18} color={errors.nama ? SiagaColors.danger : '#7c3aed'} weight="duotone" />
                                    <TextInput
                                        placeholder="Masukkan nama lengkap"
                                        placeholderTextColor={SiagaColors.secondary}
                                        value={form.nama}
                                        onChangeText={v => updateField('nama', v)}
                                        style={{ flex: 1, fontSize: 14, fontWeight: '500', color: SiagaColors.primary }}
                                    />
                                </View>
                                {errors.nama && <Text style={{ fontSize: 11, color: SiagaColors.danger, marginTop: 4, fontWeight: '600' }}>{errors.nama}</Text>}
                            </View>

                            {/* Email */}
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Email <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 10,
                                    backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                    borderWidth: 1.5, borderColor: errors.email ? SiagaColors.danger : form.email ? '#c4b5fd' : '#edf2f9',
                                }}>
                                    <Envelope size={18} color={errors.email ? SiagaColors.danger : '#7c3aed'} weight="duotone" />
                                    <TextInput
                                        placeholder="contoh@email.com"
                                        placeholderTextColor={SiagaColors.secondary}
                                        value={form.email}
                                        onChangeText={v => updateField('email', v)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        style={{ flex: 1, fontSize: 14, fontWeight: '500', color: SiagaColors.primary }}
                                    />
                                </View>
                                {errors.email && <Text style={{ fontSize: 11, color: SiagaColors.danger, marginTop: 4, fontWeight: '600' }}>{errors.email}</Text>}
                            </View>

                            {/* Telepon */}
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Nomor Telepon <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 10,
                                    backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                    borderWidth: 1.5, borderColor: errors.telepon ? SiagaColors.danger : form.telepon ? '#c4b5fd' : '#edf2f9',
                                }}>
                                    <Phone size={18} color={errors.telepon ? SiagaColors.danger : '#7c3aed'} weight="duotone" />
                                    <TextInput
                                        placeholder="08xxxxxxxxxx"
                                        placeholderTextColor={SiagaColors.secondary}
                                        value={form.telepon}
                                        onChangeText={v => updateField('telepon', v)}
                                        keyboardType="phone-pad"
                                        style={{ flex: 1, fontSize: 14, fontWeight: '500', color: SiagaColors.primary }}
                                    />
                                </View>
                                {errors.telepon && <Text style={{ fontSize: 11, color: SiagaColors.danger, marginTop: 4, fontWeight: '600' }}>{errors.telepon}</Text>}
                            </View>
                        </View>
                    </View>

                    {/* ── SECTION: Peran & Wilayah ── */}
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={18} color="#7c3aed" weight="duotone" />
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Peran & Wilayah</Text>
                        </View>

                        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: '#edf2f9' }}>
                            {/* Role Picker */}
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Peran Pengguna <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                <TouchableOpacity
                                    onPress={() => setShowRolePicker(!showRolePicker)}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 10,
                                        backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                        borderWidth: 1.5, borderColor: '#c4b5fd',
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <selectedRole.icon size={18} color={selectedRole.color} weight="duotone" />
                                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: SiagaColors.primary }}>{selectedRole.label}</Text>
                                    {showRolePicker
                                        ? <CaretUp size={16} color="#7c3aed" weight="bold" />
                                        : <CaretDown size={16} color={SiagaColors.secondary} weight="bold" />
                                    }
                                </TouchableOpacity>

                                {showRolePicker && (
                                    <View style={{ marginTop: 8, gap: 6 }}>
                                        {ROLE_OPTIONS.map(opt => {
                                            const isSelected = form.role === opt.value;
                                            const Icon = opt.icon;
                                            return (
                                                <TouchableOpacity
                                                    key={opt.value}
                                                    onPress={() => { updateField('role', opt.value); setShowRolePicker(false); }}
                                                    style={{
                                                        flexDirection: 'row', alignItems: 'center', gap: 12,
                                                        padding: 12, borderRadius: 14,
                                                        backgroundColor: isSelected ? opt.bg : '#f8fafc',
                                                        borderWidth: 1.5, borderColor: isSelected ? `${opt.color}40` : 'transparent',
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={{
                                                        width: 38, height: 38, borderRadius: 12,
                                                        backgroundColor: `${opt.color}15`,
                                                        alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Icon size={20} color={opt.color} weight="duotone" />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>{opt.label}</Text>
                                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{opt.desc}</Text>
                                                    </View>
                                                    {isSelected && <Check size={18} color={opt.color} weight="bold" />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            {/* Instansi (conditional for Pemerintah) */}
                            {form.role === 'Pemerintah' && (
                                <View>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Nama Instansi <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 10,
                                        backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                        borderWidth: 1.5, borderColor: errors.instansi ? SiagaColors.danger : form.instansi ? '#c4b5fd' : '#edf2f9',
                                    }}>
                                        <Buildings size={18} color={errors.instansi ? SiagaColors.danger : '#7c3aed'} weight="duotone" />
                                        <TextInput
                                            placeholder="Contoh: Dinas PU Kota Bandung"
                                            placeholderTextColor={SiagaColors.secondary}
                                            value={form.instansi}
                                            onChangeText={v => updateField('instansi', v)}
                                            style={{ flex: 1, fontSize: 14, fontWeight: '500', color: SiagaColors.primary }}
                                        />
                                    </View>
                                    {errors.instansi && <Text style={{ fontSize: 11, color: SiagaColors.danger, marginTop: 4, fontWeight: '600' }}>{errors.instansi}</Text>}
                                </View>
                            )}

                            {/* Kecamatan Picker */}
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Kecamatan <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                <TouchableOpacity
                                    onPress={() => setShowKecamatanPicker(!showKecamatanPicker)}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', gap: 10,
                                        backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                        borderWidth: 1.5, borderColor: errors.kecamatan ? SiagaColors.danger : form.kecamatan ? '#c4b5fd' : '#edf2f9',
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <MapPin size={18} color={errors.kecamatan ? SiagaColors.danger : '#7c3aed'} weight="duotone" />
                                    <Text style={{
                                        flex: 1, fontSize: 14, fontWeight: form.kecamatan ? '600' : '400',
                                        color: form.kecamatan ? SiagaColors.primary : SiagaColors.secondary,
                                    }}>
                                        {form.kecamatan || 'Pilih kecamatan'}
                                    </Text>
                                    {showKecamatanPicker
                                        ? <CaretUp size={16} color="#7c3aed" weight="bold" />
                                        : <CaretDown size={16} color={SiagaColors.secondary} weight="bold" />
                                    }
                                </TouchableOpacity>
                                {errors.kecamatan && <Text style={{ fontSize: 11, color: SiagaColors.danger, marginTop: 4, fontWeight: '600' }}>{errors.kecamatan}</Text>}

                                {showKecamatanPicker && (
                                    <View style={{
                                        marginTop: 8, backgroundColor: '#f8fafc', borderRadius: 14,
                                        maxHeight: 200, overflow: 'hidden', borderWidth: 1, borderColor: '#edf2f9',
                                    }}>
                                        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                            {KECAMATAN_LIST.map(kec => {
                                                const isSelected = form.kecamatan === kec;
                                                return (
                                                    <TouchableOpacity
                                                        key={kec}
                                                        onPress={() => { updateField('kecamatan', kec); setShowKecamatanPicker(false); }}
                                                        style={{
                                                            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                                            paddingHorizontal: 14, paddingVertical: 12,
                                                            backgroundColor: isSelected ? '#f5f3ff' : 'transparent',
                                                            borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={{
                                                            fontSize: 13, fontWeight: isSelected ? '700' : '500',
                                                            color: isSelected ? '#7c3aed' : SiagaColors.primary,
                                                        }}>{kec}</Text>
                                                        {isSelected && <Check size={16} color="#7c3aed" weight="bold" />}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* ── SECTION: Keamanan ── */}
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                                <Key size={18} color="#7c3aed" weight="duotone" />
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Keamanan</Text>
                        </View>

                        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: '#edf2f9' }}>
                            {/* Password */}
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Kata Sandi <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 10,
                                    backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                    borderWidth: 1.5, borderColor: errors.password ? SiagaColors.danger : form.password ? '#c4b5fd' : '#edf2f9',
                                }}>
                                    <Key size={18} color={errors.password ? SiagaColors.danger : '#7c3aed'} weight="duotone" />
                                    <TextInput
                                        placeholder="Minimal 8 karakter"
                                        placeholderTextColor={SiagaColors.secondary}
                                        value={form.password}
                                        onChangeText={v => updateField('password', v)}
                                        secureTextEntry={!showPassword}
                                        style={{ flex: 1, fontSize: 14, fontWeight: '500', color: SiagaColors.primary }}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                        {showPassword
                                            ? <Eye size={18} color={SiagaColors.secondary} weight="duotone" />
                                            : <EyeSlash size={18} color={SiagaColors.secondary} weight="duotone" />
                                        }
                                    </TouchableOpacity>
                                </View>
                                {errors.password && <Text style={{ fontSize: 11, color: SiagaColors.danger, marginTop: 4, fontWeight: '600' }}>{errors.password}</Text>}

                                {/* Password strength indicator */}
                                {form.password.length > 0 && (
                                    <View style={{ marginTop: 8, gap: 4 }}>
                                        <View style={{ flexDirection: 'row', gap: 4 }}>
                                            {[1, 2, 3, 4].map(i => {
                                                const strength = form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 5 ? 2 : 1;
                                                return (
                                                    <View key={i} style={{
                                                        flex: 1, height: 3, borderRadius: 2,
                                                        backgroundColor: i <= strength
                                                            ? strength >= 4 ? SiagaColors.success : strength >= 3 ? '#f39c12' : SiagaColors.danger
                                                            : '#e2e8f0',
                                                    }} />
                                                );
                                            })}
                                        </View>
                                        <Text style={{
                                            fontSize: 10, fontWeight: '600',
                                            color: form.password.length >= 12 ? SiagaColors.success : form.password.length >= 8 ? '#f39c12' : SiagaColors.danger,
                                        }}>
                                            {form.password.length >= 12 ? 'Kuat' : form.password.length >= 8 ? 'Sedang' : 'Lemah'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Confirm Password */}
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 6 }}>Konfirmasi Kata Sandi <Text style={{ color: SiagaColors.danger }}>*</Text></Text>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 10,
                                    backgroundColor: '#f8fafd', borderRadius: 14, paddingHorizontal: 14, height: 48,
                                    borderWidth: 1.5, borderColor: errors.konfirmasiPassword ? SiagaColors.danger : form.konfirmasiPassword ? '#c4b5fd' : '#edf2f9',
                                }}>
                                    <Key size={18} color={errors.konfirmasiPassword ? SiagaColors.danger : '#7c3aed'} weight="duotone" />
                                    <TextInput
                                        placeholder="Masukkan ulang kata sandi"
                                        placeholderTextColor={SiagaColors.secondary}
                                        value={form.konfirmasiPassword}
                                        onChangeText={v => updateField('konfirmasiPassword', v)}
                                        secureTextEntry={!showConfirmPassword}
                                        style={{ flex: 1, fontSize: 14, fontWeight: '500', color: SiagaColors.primary }}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                                        {showConfirmPassword
                                            ? <Eye size={18} color={SiagaColors.secondary} weight="duotone" />
                                            : <EyeSlash size={18} color={SiagaColors.secondary} weight="duotone" />
                                        }
                                    </TouchableOpacity>
                                </View>
                                {errors.konfirmasiPassword && <Text style={{ fontSize: 11, color: SiagaColors.danger, marginTop: 4, fontWeight: '600' }}>{errors.konfirmasiPassword}</Text>}

                                {/* Match indicator */}
                                {form.konfirmasiPassword.length > 0 && form.password === form.konfirmasiPassword && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                        <CheckCircle size={14} color={SiagaColors.success} weight="fill" />
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: SiagaColors.success }}>Kata sandi cocok</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* ── PREVIEW CARD ── */}
                    {form.nama && (
                        <View style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                                    <Eye size={18} color="#7c3aed" weight="duotone" />
                                </View>
                                <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>Preview</Text>
                            </View>

                            <View style={{
                                backgroundColor: '#fff', borderRadius: 18, padding: 16,
                                borderWidth: 1, borderColor: '#edf2f9',
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{
                                        width: 48, height: 48, borderRadius: 14,
                                        backgroundColor: `${selectedRole.color}18`,
                                        borderWidth: 1.5, borderColor: `${selectedRole.color}30`,
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontSize: 16, fontWeight: '900', color: selectedRole.color }}>
                                            {form.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }}>{form.nama}</Text>
                                        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{form.email || 'email@contoh.com'}</Text>
                                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                                            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: selectedRole.bg }}>
                                                <Text style={{ fontSize: 10, fontWeight: '700', color: selectedRole.color }}>{selectedRole.label}</Text>
                                            </View>
                                            {form.kecamatan ? (
                                                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#f1f5f9' }}>
                                                    <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary }}>{form.kecamatan}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ── ACTION BUTTONS ── */}
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                                backgroundColor: isSubmitting ? '#a78bfa' : '#7c3aed',
                                borderRadius: 16, paddingVertical: 16,
                                elevation: 3, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2, shadowRadius: 8,
                            }}
                            activeOpacity={0.85}
                        >
                            {isSubmitting ? (
                                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Menyimpan...</Text>
                            ) : (
                                <>
                                    <UserPlus size={20} color="#fff" weight="bold" />
                                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Tambah Pengguna</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#f4f7fb', borderRadius: 16, paddingVertical: 14,
                                borderWidth: 1.5, borderColor: '#edf2f9',
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: SiagaColors.secondary, fontWeight: '700', fontSize: 14 }}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
