import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, Alert, Animated,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ShieldCheck, Envelope, Lock, Eye, EyeSlash,
    User, Phone, MapPin, ArrowLeft, ArrowRight,
    GoogleLogo, CheckCircle, CaretRight, IdentificationCard,
    Buildings, Check, Warning as WarningIcon,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';

type Step = 1 | 2 | 3;

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    district: string;
    city: string;
    agreeTerms: boolean;
}

const PASSWORD_RULES = [
    { label: 'Minimal 8 karakter', test: (pw: string) => pw.length >= 8 },
    { label: 'Mengandung huruf besar', test: (pw: string) => /[A-Z]/.test(pw) },
    { label: 'Mengandung angka', test: (pw: string) => /[0-9]/.test(pw) },
];

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { register } = useAuth();
    const { showToast } = useToast();

    const [step, setStep] = useState<Step>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        district: '',
        city: '',
        agreeTerms: false,
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, [step]);

    const updateForm = (key: keyof FormData, value: string | boolean) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const validateStep1 = (): boolean => {
        if (!form.fullName.trim()) { showToast({ type: 'warning', title: 'Nama diperlukan', message: 'Masukkan nama lengkap Anda.' }); return false; }
        if (form.fullName.trim().length < 3) { showToast({ type: 'warning', title: 'Nama terlalu pendek', message: 'Nama minimal 3 karakter.' }); return false; }
        if (!form.email.trim()) { showToast({ type: 'warning', title: 'Email diperlukan', message: 'Masukkan alamat email.' }); return false; }
        if (!/\S+@\S+\.\S+/.test(form.email)) { showToast({ type: 'warning', title: 'Format salah', message: 'Format email tidak valid.' }); return false; }
        if (!form.phone.trim()) { showToast({ type: 'warning', title: 'Telepon diperlukan', message: 'Masukkan nomor telepon.' }); return false; }
        if (form.phone.trim().length < 10) { showToast({ type: 'warning', title: 'Nomor terlalu pendek', message: 'Nomor telepon minimal 10 digit.' }); return false; }
        return true;
    };

    const validateStep2 = (): boolean => {
        if (!form.password) { showToast({ type: 'warning', title: 'Password diperlukan', message: 'Masukkan password.' }); return false; }
        if (form.password.length < 8) { showToast({ type: 'warning', title: 'Password terlalu pendek', message: 'Password minimal 8 karakter.' }); return false; }
        if (!/[A-Z]/.test(form.password)) { showToast({ type: 'warning', title: 'Password lemah', message: 'Password harus mengandung huruf besar.' }); return false; }
        if (!/[0-9]/.test(form.password)) { showToast({ type: 'warning', title: 'Password lemah', message: 'Password harus mengandung angka.' }); return false; }
        if (form.password !== form.confirmPassword) { showToast({ type: 'warning', title: 'Password tidak cocok', message: 'Password dan konfirmasi password tidak cocok.' }); return false; }
        return true;
    };

    const validateStep3 = (): boolean => {
        if (!form.district.trim()) { showToast({ type: 'warning', title: 'Kecamatan diperlukan', message: 'Masukkan kecamatan Anda.' }); return false; }
        if (!form.city.trim()) { showToast({ type: 'warning', title: 'Kota diperlukan', message: 'Masukkan kota/kabupaten.' }); return false; }
        if (!form.agreeTerms) { showToast({ type: 'warning', title: 'Syarat & Ketentuan', message: 'Anda harus menyetujui Syarat & Ketentuan.' }); return false; }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
        else if (step === 3 && validateStep3()) handleRegister();
    };

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as Step);
        else router.back();
    };

    const handleRegister = async () => {
        setIsLoading(true);
        const result = await register({
            email: form.email.trim(),
            password: form.password,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            district: form.district.trim(),
            city: form.city.trim(),
        });
        setIsLoading(false);

        if (!result.success) {
            showToast({ type: 'error', title: 'Registrasi Gagal', message: result.message });
        } else {
            showToast({ type: 'success', title: 'Registrasi Berhasil! 🎉', message: 'Akun Anda berhasil dibuat.' });
        }
        // Jika sukses, AuthGuard otomatis redirect ke (tabs)
    };

    const handleGoogleRegister = () => {
        showToast({ type: 'info', title: 'Segera Hadir', message: 'Daftar dengan Google akan tersedia di versi berikutnya.' });
    };

    const renderInput = (
        icon: React.ReactNode,
        fieldKey: string,
        placeholder: string,
        value: string,
        onChangeText: (t: string) => void,
        options?: {
            keyboardType?: any;
            autoCapitalize?: any;
            secureTextEntry?: boolean;
            toggleSecure?: () => void;
            showSecure?: boolean;
            autoComplete?: any;
            maxLength?: number;
        }
    ) => (
        <View
            className="flex-row items-center rounded-2xl px-4 py-0.5 border-2"
            style={{
                borderColor: focusedField === fieldKey ? SiagaColors.primary : '#f1f5f9',
                backgroundColor: focusedField === fieldKey ? '#f8fafd' : '#fafbfc',
            }}
        >
            {icon}
            <TextInput
                className="flex-1 ml-3 text-[13px] font-semibold text-primary py-3"
                placeholder={placeholder}
                placeholderTextColor={SiagaColors.secondary}
                value={value}
                onChangeText={onChangeText}
                keyboardType={options?.keyboardType || 'default'}
                autoCapitalize={options?.autoCapitalize || 'none'}
                secureTextEntry={options?.secureTextEntry}
                autoComplete={options?.autoComplete}
                maxLength={options?.maxLength}
                onFocus={() => setFocusedField(fieldKey)}
                onBlur={() => setFocusedField(null)}
            />
            {options?.toggleSecure && (
                <TouchableOpacity onPress={options.toggleSecure} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {options.showSecure ? (
                        <EyeSlash size={18} color={SiagaColors.secondary} weight="duotone" />
                    ) : (
                        <Eye size={18} color={SiagaColors.secondary} weight="duotone" />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

    const renderStep1 = () => (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Step Header */}
            <View className="mb-5">
                <Text className="text-[18px] font-bold text-primary">Data Diri</Text>
                <Text className="text-[11px] text-secondary mt-0.5">Isi informasi dasar akun Anda</Text>
            </View>

            {/* Google Register */}
            <TouchableOpacity
                className="flex-row items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-slate-100 mb-5"
                style={{ backgroundColor: '#fafbfc' }}
                onPress={handleGoogleRegister}
                activeOpacity={0.7}
                disabled={isLoading}
            >
                <GoogleLogo size={20} color="#4285F4" weight="bold" />
                <Text className="text-[13px] font-bold text-primary">Daftar dengan Google</Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-3 mb-5">
                <View className="flex-1 h-px bg-slate-100" />
                <Text className="text-[10px] font-semibold text-secondary/60 uppercase tracking-wider">atau isi manual</Text>
                <View className="flex-1 h-px bg-slate-100" />
            </View>

            {/* Full Name */}
            <View className="mb-3.5">
                <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Nama Lengkap</Text>
                {renderInput(
                    <User size={18} color={focusedField === 'fullName' ? SiagaColors.primary : SiagaColors.secondary} weight="duotone" />,
                    'fullName', 'Masukkan nama lengkap', form.fullName,
                    (t) => updateForm('fullName', t),
                    { autoCapitalize: 'words', autoComplete: 'name', maxLength: 60 }
                )}
            </View>

            {/* Email */}
            <View className="mb-3.5">
                <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Email</Text>
                {renderInput(
                    <Envelope size={18} color={focusedField === 'email' ? SiagaColors.primary : SiagaColors.secondary} weight="duotone" />,
                    'email', 'nama@email.com', form.email,
                    (t) => updateForm('email', t),
                    { keyboardType: 'email-address', autoComplete: 'email' }
                )}
            </View>

            {/* Phone */}
            <View className="mb-1">
                <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Nomor Telepon</Text>
                {renderInput(
                    <Phone size={18} color={focusedField === 'phone' ? SiagaColors.primary : SiagaColors.secondary} weight="duotone" />,
                    'phone', '08xxxxxxxxxx', form.phone,
                    (t) => updateForm('phone', t),
                    { keyboardType: 'phone-pad', autoComplete: 'tel', maxLength: 15 }
                )}
            </View>
        </Animated.View>
    );

    const renderStep2 = () => (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View className="mb-5">
                <Text className="text-[18px] font-bold text-primary">Keamanan</Text>
                <Text className="text-[11px] text-secondary mt-0.5">Buat password yang kuat untuk akun Anda</Text>
            </View>

            {/* Password */}
            <View className="mb-3.5">
                <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Password</Text>
                {renderInput(
                    <Lock size={18} color={focusedField === 'password' ? SiagaColors.primary : SiagaColors.secondary} weight="duotone" />,
                    'password', 'Buat password', form.password,
                    (t) => updateForm('password', t),
                    { secureTextEntry: !showPassword, toggleSecure: () => setShowPassword(!showPassword), showSecure: showPassword, autoComplete: 'new-password' }
                )}
            </View>

            {/* Password Rules */}
            <View className="mb-4 ml-1 gap-1.5">
                {PASSWORD_RULES.map((rule, i) => {
                    const passed = rule.test(form.password);
                    return (
                        <View key={i} className="flex-row items-center gap-2">
                            {passed ? (
                                <Check size={12} color={SiagaColors.success} weight="bold" />
                            ) : (
                                <View className="w-3 h-3 rounded-full border border-slate-200" />
                            )}
                            <Text className="text-[10px] font-medium" style={{ color: passed ? SiagaColors.success : SiagaColors.secondary }}>{rule.label}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Confirm Password */}
            <View className="mb-1">
                <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Konfirmasi Password</Text>
                {renderInput(
                    <Lock size={18} color={focusedField === 'confirmPassword' ? SiagaColors.primary : SiagaColors.secondary} weight="duotone" />,
                    'confirmPassword', 'Ulangi password', form.confirmPassword,
                    (t) => updateForm('confirmPassword', t),
                    { secureTextEntry: !showConfirmPassword, toggleSecure: () => setShowConfirmPassword(!showConfirmPassword), showSecure: showConfirmPassword, autoComplete: 'new-password' }
                )}
                {form.confirmPassword.length > 0 && (
                    <View className="flex-row items-center gap-1 mt-1.5 ml-1">
                        {form.password === form.confirmPassword ? (
                            <>
                                <CheckCircle size={12} color={SiagaColors.success} weight="fill" />
                                <Text className="text-[10px] font-medium text-success">Password cocok</Text>
                            </>
                        ) : (
                            <>
                                <WarningIcon size={12} color={SiagaColors.danger} weight="fill" />
                                <Text className="text-[10px] font-medium text-danger">Password tidak cocok</Text>
                            </>
                        )}
                    </View>
                )}
            </View>
        </Animated.View>
    );

    const renderStep3 = () => (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View className="mb-5">
                <Text className="text-[18px] font-bold text-primary">Lokasi & Konfirmasi</Text>
                <Text className="text-[11px] text-secondary mt-0.5">Bantu kami menampilkan laporan di sekitar Anda</Text>
            </View>

            {/* District */}
            <View className="mb-3.5">
                <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Kecamatan</Text>
                {renderInput(
                    <MapPin size={18} color={focusedField === 'district' ? SiagaColors.primary : SiagaColors.secondary} weight="duotone" />,
                    'district', 'Contoh: Coblong', form.district,
                    (t) => updateForm('district', t),
                    { autoCapitalize: 'words' }
                )}
            </View>

            {/* City */}
            <View className="mb-5">
                <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Kota / Kabupaten</Text>
                {renderInput(
                    <Buildings size={18} color={focusedField === 'city' ? SiagaColors.primary : SiagaColors.secondary} weight="duotone" />,
                    'city', 'Contoh: Kota Bandung', form.city,
                    (t) => updateForm('city', t),
                    { autoCapitalize: 'words' }
                )}
            </View>

            {/* Summary Card */}
            <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5">
                <Text className="text-[11px] font-bold text-primary mb-3">Ringkasan Akun</Text>
                <View className="gap-2">
                    {[
                        { label: 'Nama', value: form.fullName },
                        { label: 'Email', value: form.email },
                        { label: 'Telepon', value: form.phone },
                        { label: 'Lokasi', value: form.district && form.city ? `Kec. ${form.district}, ${form.city}` : '-' },
                    ].map((item, i) => (
                        <View key={i} className="flex-row items-center justify-between">
                            <Text className="text-[10px] text-secondary">{item.label}</Text>
                            <Text className="text-[10px] font-bold text-primary" numberOfLines={1} style={{ maxWidth: '60%' }}>{item.value || '-'}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
                className="flex-row items-start gap-3"
                onPress={() => updateForm('agreeTerms', !form.agreeTerms)}
                activeOpacity={0.7}
            >
                <View
                    className="w-5 h-5 rounded-md items-center justify-center mt-0.5 border-2"
                    style={{
                        borderColor: form.agreeTerms ? SiagaColors.primary : '#cbd5e1',
                        backgroundColor: form.agreeTerms ? SiagaColors.primary : 'transparent',
                    }}
                >
                    {form.agreeTerms && <Check size={12} color="#fff" weight="bold" />}
                </View>
                <Text className="flex-1 text-[11px] text-secondary leading-4">
                    Saya menyetujui{' '}
                    <Text className="font-bold text-primary">Syarat & Ketentuan</Text>
                    {' '}dan{' '}
                    <Text className="font-bold text-primary">Kebijakan Privasi</Text>
                    {' '}SIAGA
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: SiagaColors.primary }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    {/* Top Section */}
                    <View style={{ paddingTop: insets.top + 8 }} className="px-6 pb-8">
                        {/* Back Button */}
                        <TouchableOpacity
                            className="w-10 h-10 rounded-xl items-center justify-center mb-4"
                            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            onPress={handleBack}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft size={20} color="#fff" weight="bold" />
                        </TouchableOpacity>

                        {/* Header */}
                        <View className="flex-row items-center gap-3 mb-3">
                            <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                                <ShieldCheck size={24} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text className="text-[20px] font-bold text-white">Buat Akun</Text>
                                <Text className="text-[10px] text-white/50">Bergabung untuk lindungi komunitas Anda</Text>
                            </View>
                        </View>

                        {/* Step Indicator */}
                        <View className="flex-row items-center gap-2 mt-4">
                            {[
                                { num: 1, label: 'Data Diri' },
                                { num: 2, label: 'Keamanan' },
                                { num: 3, label: 'Lokasi' },
                            ].map((s, i) => {
                                const active = step >= s.num;
                                const current = step === s.num;
                                return (
                                    <React.Fragment key={i}>
                                        <View className="flex-row items-center gap-1.5">
                                            <View
                                                className="w-7 h-7 rounded-full items-center justify-center"
                                                style={{
                                                    backgroundColor: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.1)',
                                                }}
                                            >
                                                {step > s.num ? (
                                                    <Check size={14} color={SiagaColors.primary} weight="bold" />
                                                ) : (
                                                    <Text
                                                        className="text-[11px] font-bold"
                                                        style={{ color: active ? SiagaColors.primary : 'rgba(255,255,255,0.4)' }}
                                                    >
                                                        {s.num}
                                                    </Text>
                                                )}
                                            </View>
                                            <Text
                                                className="text-[9px] font-bold"
                                                style={{ color: current ? '#fff' : 'rgba(255,255,255,0.35)' }}
                                            >
                                                {s.label}
                                            </Text>
                                        </View>
                                        {i < 2 && (
                                            <View className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: step > s.num ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)' }} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    </View>

                    {/* Form Card */}
                    <View className="bg-white rounded-t-[32px] px-7 pt-7 pb-6 flex-1">
                        {/* Step Content */}
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}

                        {/* Action Buttons */}
                        <View className="mt-6">
                            <TouchableOpacity
                                className="flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                                style={{
                                    backgroundColor: isLoading ? SiagaColors.primaryLight : SiagaColors.primary,
                                    elevation: isLoading ? 0 : 4,
                                    shadowColor: SiagaColors.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                }}
                                onPress={handleNext}
                                activeOpacity={0.85}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text className="text-[14px] font-bold text-white">
                                            {step === 3 ? 'Buat Akun' : 'Lanjutkan'}
                                        </Text>
                                        <ArrowRight size={18} color="#fff" weight="bold" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View className="flex-row items-center justify-center gap-1 mt-5">
                            <Text className="text-[12px] text-secondary">Sudah punya akun?</Text>
                            <TouchableOpacity
                                onPress={() => router.replace('/(auth)/login')}
                                activeOpacity={0.7}
                                className="flex-row items-center gap-0.5"
                            >
                                <Text className="text-[12px] font-bold" style={{ color: SiagaColors.primary }}>Masuk</Text>
                                <CaretRight size={12} color={SiagaColors.primary} weight="bold" />
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="mt-auto pt-4">
                            <Text className="text-center text-[8px] text-secondary/30">SIAGA v1.0.0 — PROXOCORIS 2026</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
