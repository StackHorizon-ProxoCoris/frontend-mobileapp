import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, Alert, Animated, Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth';
import {
    ShieldCheck, Envelope, Lock, Eye, EyeSlash,
    GoogleLogo, ArrowRight, CaretRight,
    Fingerprint, Globe, Lightning,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Masukkan alamat email Anda.');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Masukkan password Anda.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Error', 'Format email tidak valid.');
            return;
        }

        setIsLoading(true);
        const result = await login(email.trim(), password);
        setIsLoading(false);

        if (!result.success) {
            Alert.alert('Login Gagal', result.message);
        }
        // Jika sukses, AuthGuard otomatis redirect ke (tabs)
    };

    const handleGoogleLogin = () => {
        Alert.alert('Segera Hadir', 'Login dengan Google akan tersedia di versi berikutnya.');
    };

    return (
        <View className="flex-1" style={{ backgroundColor: SiagaColors.primary }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    {/* Hero Section */}
                    <View style={{ paddingTop: insets.top + 20, paddingBottom: 40 }} className="px-7">
                        <Animated.View
                            style={{ opacity: fadeAnim, transform: [{ scale: logoScale }] }}
                            className="items-center mb-6"
                        >
                            {/* App Logo */}
                            <View className="w-20 h-20 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                                <ShieldCheck size={40} color="#fff" weight="duotone" />
                            </View>
                            <Text className="text-3xl font-extrabold text-white tracking-wider">SIAGA</Text>
                            <Text className="text-[11px] text-white/50 mt-1 tracking-widest uppercase">Smart Indonesia Adaptive Governance</Text>
                        </Animated.View>

                        {/* Trust indicators */}
                        <Animated.View
                            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                            className="flex-row items-center justify-center gap-4 mt-2"
                        >
                            {[
                                { icon: <Globe size={10} color="rgba(255,255,255,0.5)" weight="duotone" />, label: 'Open Data' },
                                { icon: <Lightning size={10} color="rgba(255,255,255,0.5)" weight="duotone" />, label: 'Real-time' },
                                { icon: <Fingerprint size={10} color="rgba(255,255,255,0.5)" weight="duotone" />, label: 'Secure' },
                            ].map((item, i) => (
                                <View key={i} className="flex-row items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                                    {item.icon}
                                    <Text className="text-[8px] font-semibold text-white/40">{item.label}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    </View>

                    {/* Form Card */}
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}
                        className="bg-white rounded-t-[32px] px-7 pt-8 pb-6"
                    >
                        {/* Header */}
                        <View className="mb-6">
                            <Text className="text-[22px] font-bold text-primary">Selamat Datang</Text>
                            <Text className="text-[12px] text-secondary mt-1">Masuk untuk melindungi komunitas Anda</Text>
                        </View>

                        {/* Google Login */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-slate-100 mb-5"
                            style={{ backgroundColor: '#fafbfc' }}
                            onPress={handleGoogleLogin}
                            activeOpacity={0.7}
                            disabled={isLoading}
                        >
                            <GoogleLogo size={20} color="#4285F4" weight="bold" />
                            <Text className="text-[13px] font-bold text-primary">Masuk dengan Google</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center gap-3 mb-5">
                            <View className="flex-1 h-px bg-slate-100" />
                            <Text className="text-[10px] font-semibold text-secondary/60 uppercase tracking-wider">atau</Text>
                            <View className="flex-1 h-px bg-slate-100" />
                        </View>

                        {/* Email Input */}
                        <View className="mb-3.5">
                            <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Email</Text>
                            <View
                                className="flex-row items-center rounded-2xl px-4 py-0.5 border-2"
                                style={{
                                    borderColor: focusedField === 'email' ? SiagaColors.primary : '#f1f5f9',
                                    backgroundColor: focusedField === 'email' ? '#f8fafd' : '#fafbfc',
                                }}
                            >
                                <Envelope
                                    size={18}
                                    color={focusedField === 'email' ? SiagaColors.primary : SiagaColors.secondary}
                                    weight="duotone"
                                />
                                <TextInput
                                    className="flex-1 ml-3 text-[13px] font-semibold text-primary py-3"
                                    placeholder="nama@email.com"
                                    placeholderTextColor={SiagaColors.secondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-2">
                            <Text className="text-[11px] font-bold text-primary/70 mb-1.5 ml-1">Password</Text>
                            <View
                                className="flex-row items-center rounded-2xl px-4 py-0.5 border-2"
                                style={{
                                    borderColor: focusedField === 'password' ? SiagaColors.primary : '#f1f5f9',
                                    backgroundColor: focusedField === 'password' ? '#f8fafd' : '#fafbfc',
                                }}
                            >
                                <Lock
                                    size={18}
                                    color={focusedField === 'password' ? SiagaColors.primary : SiagaColors.secondary}
                                    weight="duotone"
                                />
                                <TextInput
                                    className="flex-1 ml-3 text-[13px] font-semibold text-primary py-3"
                                    placeholder="Masukkan password"
                                    placeholderTextColor={SiagaColors.secondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    {showPassword ? (
                                        <EyeSlash size={18} color={SiagaColors.secondary} weight="duotone" />
                                    ) : (
                                        <Eye size={18} color={SiagaColors.secondary} weight="duotone" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            className="self-end mb-6"
                            onPress={() => Alert.alert('Lupa Password', 'Fitur reset password memerlukan backend Supabase.')}
                            activeOpacity={0.7}
                        >
                            <Text className="text-[11px] font-bold" style={{ color: SiagaColors.info }}>Lupa Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl mb-4"
                            style={{
                                backgroundColor: isLoading ? SiagaColors.primaryLight : SiagaColors.primary,
                                elevation: isLoading ? 0 : 4,
                                shadowColor: SiagaColors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                            }}
                            onPress={handleLogin}
                            activeOpacity={0.85}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text className="text-[14px] font-bold text-white">Masuk</Text>
                                    <ArrowRight size={18} color="#fff" weight="bold" />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View className="flex-row items-center justify-center gap-1 mt-2">
                            <Text className="text-[12px] text-secondary">Belum punya akun?</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/register')}
                                activeOpacity={0.7}
                                className="flex-row items-center gap-0.5"
                            >
                                <Text className="text-[12px] font-bold" style={{ color: SiagaColors.primary }}>Daftar Sekarang</Text>
                                <CaretRight size={12} color={SiagaColors.primary} weight="bold" />
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="mt-auto pt-6">
                            <Text className="text-center text-[9px] text-secondary/50">
                                Dengan masuk, Anda menyetujui{' '}
                                <Text className="font-bold text-secondary/60">Syarat & Ketentuan</Text>
                                {' '}dan{' '}
                                <Text className="font-bold text-secondary/60">Kebijakan Privasi</Text>
                                {' '}SIAGA.
                            </Text>
                            <Text className="text-center text-[8px] text-secondary/30 mt-2">SIAGA v1.0.0 — PROXOCORIS 2026</Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
