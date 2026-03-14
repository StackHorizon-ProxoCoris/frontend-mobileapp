import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, LockKey, Eye, EyeSlash, ShieldCheck,
  CheckCircle, XCircle, Key, Lock, Info,
  Warning, Lightning,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useToast } from '@/contexts/toast.context';
import { apiPost } from '@/services/api';

// ─── Password strength helpers ────────────────────────────────────────────────
interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimal 8 karakter', test: (pw) => pw.length >= 8 },
  { label: 'Mengandung huruf besar (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Mengandung huruf kecil (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Mengandung angka (0-9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Mengandung simbol (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrength(pw: string): { level: number; label: string; color: string } {
  const passed = PASSWORD_RULES.filter(r => r.test(pw)).length;
  if (passed <= 1) return { level: 1, label: 'Sangat Lemah', color: SiagaColors.danger };
  if (passed === 2) return { level: 2, label: 'Lemah', color: '#f97316' };
  if (passed === 3) return { level: 3, label: 'Cukup', color: '#f59e0b' };
  if (passed === 4) return { level: 4, label: 'Kuat', color: '#22c55e' };
  return { level: 5, label: 'Sangat Kuat', color: SiagaColors.success };
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GantiPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const newPwRef = useRef<TextInput>(null);
  const confirmPwRef = useRef<TextInput>(null);

  const strength = getStrength(newPw);
  const passwordsMatch = newPw.length > 0 && confirmPw.length > 0 && newPw === confirmPw;
  const passwordsMismatch = confirmPw.length > 0 && newPw !== confirmPw;
  const canSubmit = currentPw.trim().length > 0 && newPw.length >= 8 && passwordsMatch;

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    const result = await apiPost('/auth/change-password', {
      currentPassword: currentPw,
      newPassword: newPw,
    });
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      showToast({
        type: 'error',
        title: 'Gagal Mengubah Password',
        message: result.message || 'Password lama tidak sesuai atau terjadi kesalahan.',
      });
    }
  };

  // ─── Success State ─────────────────────────────────────────
  if (isSuccess) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f7fb', paddingTop: insets.top }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          {/* Success icon */}
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, elevation: 3,
            shadowColor: SiagaColors.success,
            shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12,
          }}>
            <ShieldCheck size={44} color={SiagaColors.success} weight="duotone" />
          </View>

          <Text style={{ fontSize: 22, fontWeight: '900', color: SiagaColors.primary, textAlign: 'center', marginBottom: 8 }}>
            Password Berhasil Diubah
          </Text>
          <Text style={{ fontSize: 13, color: SiagaColors.secondary, textAlign: 'center', lineHeight: 20, marginBottom: 32 }}>
            Password akun Anda telah berhasil diperbarui. Gunakan password baru untuk login selanjutnya.
          </Text>

          {/* Security tips */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16, width: '100%',
            borderWidth: 1, borderColor: '#edf2f9', marginBottom: 28,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Info size={16} color={SiagaColors.info} weight="duotone" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Tips Keamanan</Text>
            </View>
            {[
              'Jangan bagikan password kepada siapapun',
              'Gunakan password yang berbeda untuk setiap akun',
              'Aktifkan Two-Factor Authentication (2FA)',
            ].map((tip, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: i < 2 ? 8 : 0 }}>
                <CheckCircle size={14} color={SiagaColors.success} weight="fill" style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 12, color: SiagaColors.secondary, flex: 1, lineHeight: 17 }}>{tip}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={{
              width: '100%', paddingVertical: 15, borderRadius: 16,
              backgroundColor: SiagaColors.primary, alignItems: 'center',
              elevation: 3, shadowColor: SiagaColors.primary,
              shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
            }}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Kembali ke Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Main Form ─────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
        {/* Decorative */}
        <View style={{ position: 'absolute', right: -25, top: -25, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <View style={{ position: 'absolute', left: -15, bottom: -10, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.03)' }} />

        <View style={{ paddingHorizontal: 16, paddingBottom: 22, paddingTop: 10 }}>
          {/* Top bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <TouchableOpacity
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center', justifyContent: 'center',
              }}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={18} color="#fff" weight="bold" />
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Ganti Password</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Info banner */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          }}>
            <View style={{
              width: 42, height: 42, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <LockKey size={22} color="#fbbf24" weight="duotone" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Keamanan Akun</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 15 }}>
                Pastikan password baru Anda kuat dan mudah diingat
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── FORM CONTENT ────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Password Lama ────────────────────────────── */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 4 }}>
              <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#f59e0b' }} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Password Saat Ini
              </Text>
            </View>

            <View style={{
              backgroundColor: '#fff', borderRadius: 20, padding: 16,
              borderWidth: 1, borderColor: '#edf2f9',
              elevation: 2, shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Password Lama
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#f8fafc', borderRadius: 14,
                borderWidth: 1.5, borderColor: currentPw.length > 0 ? SiagaColors.info : '#e2e8f0',
                paddingHorizontal: 14,
              }}>
                <Lock size={18} color={currentPw.length > 0 ? SiagaColors.info : SiagaColors.secondary} weight="duotone" />
                <TextInput
                  style={{
                    flex: 1, fontSize: 14, fontWeight: '600', color: SiagaColors.primary,
                    paddingVertical: 14, paddingHorizontal: 10,
                  }}
                  placeholder="Masukkan password saat ini"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showCurrent}
                  value={currentPw}
                  onChangeText={setCurrentPw}
                  returnKeyType="next"
                  onSubmitEditing={() => newPwRef.current?.focus()}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {showCurrent
                    ? <EyeSlash size={18} color={SiagaColors.secondary} weight="duotone" />
                    : <Eye size={18} color={SiagaColors.secondary} weight="duotone" />
                  }
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 8, marginLeft: 4 }}>
                Masukkan password yang sedang Anda gunakan saat ini
              </Text>
            </View>
          </View>

          {/* ── Password Baru ────────────────────────────── */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 4 }}>
              <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: SiagaColors.info }} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Password Baru
              </Text>
            </View>

            <View style={{
              backgroundColor: '#fff', borderRadius: 20, padding: 16,
              borderWidth: 1, borderColor: '#edf2f9',
              elevation: 2, shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
              gap: 16,
            }}>
              {/* New Password Input */}
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Password Baru
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#f8fafc', borderRadius: 14,
                  borderWidth: 1.5, borderColor: newPw.length > 0 ? strength.color : '#e2e8f0',
                  paddingHorizontal: 14,
                }}>
                  <Key size={18} color={newPw.length > 0 ? strength.color : SiagaColors.secondary} weight="duotone" />
                  <TextInput
                    ref={newPwRef}
                    style={{
                      flex: 1, fontSize: 14, fontWeight: '600', color: SiagaColors.primary,
                      paddingVertical: 14, paddingHorizontal: 10,
                    }}
                    placeholder="Masukkan password baru"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNew}
                    value={newPw}
                    onChangeText={setNewPw}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPwRef.current?.focus()}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showNew
                      ? <EyeSlash size={18} color={SiagaColors.secondary} weight="duotone" />
                      : <Eye size={18} color={SiagaColors.secondary} weight="duotone" />
                    }
                  </TouchableOpacity>
                </View>
              </View>

              {/* Strength Indicator */}
              {newPw.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary }}>Kekuatan Password</Text>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      backgroundColor: `${strength.color}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                    }}>
                      <Lightning size={10} color={strength.color} weight="fill" />
                      <Text style={{ fontSize: 10, fontWeight: '800', color: strength.color }}>{strength.label}</Text>
                    </View>
                  </View>
                  {/* Strength bar */}
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <View key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        backgroundColor: i <= strength.level ? strength.color : '#e2e8f0',
                      }} />
                    ))}
                  </View>
                </View>
              )}

              {/* Password Rules */}
              {newPw.length > 0 && (
                <View style={{
                  backgroundColor: '#f8fafc', borderRadius: 14, padding: 14,
                  borderWidth: 1, borderColor: '#edf2f9',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Persyaratan Password
                  </Text>
                  <View style={{ gap: 8 }}>
                    {PASSWORD_RULES.map((rule, i) => {
                      const passed = rule.test(newPw);
                      return (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {passed
                            ? <CheckCircle size={15} color={SiagaColors.success} weight="fill" />
                            : <XCircle size={15} color="#cbd5e1" weight="duotone" />
                          }
                          <Text style={{
                            fontSize: 12, fontWeight: '600',
                            color: passed ? '#065f46' : SiagaColors.secondary,
                          }}>
                            {rule.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

              {/* Confirm Password Input */}
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Konfirmasi Password Baru
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#f8fafc', borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: passwordsMatch ? SiagaColors.success
                    : passwordsMismatch ? SiagaColors.danger
                    : '#e2e8f0',
                  paddingHorizontal: 14,
                }}>
                  <Lock size={18} color={passwordsMatch ? SiagaColors.success : passwordsMismatch ? SiagaColors.danger : SiagaColors.secondary} weight="duotone" />
                  <TextInput
                    ref={confirmPwRef}
                    style={{
                      flex: 1, fontSize: 14, fontWeight: '600', color: SiagaColors.primary,
                      paddingVertical: 14, paddingHorizontal: 10,
                    }}
                    placeholder="Ulangi password baru"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirm}
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showConfirm
                      ? <EyeSlash size={18} color={SiagaColors.secondary} weight="duotone" />
                      : <Eye size={18} color={SiagaColors.secondary} weight="duotone" />
                    }
                  </TouchableOpacity>
                </View>
                {/* Match status */}
                {confirmPw.length > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginLeft: 4 }}>
                    {passwordsMatch
                      ? <><CheckCircle size={13} color={SiagaColors.success} weight="fill" /><Text style={{ fontSize: 11, fontWeight: '600', color: '#065f46' }}>Password cocok</Text></>
                      : <><Warning size={13} color={SiagaColors.danger} weight="fill" /><Text style={{ fontSize: 11, fontWeight: '600', color: SiagaColors.danger }}>Password tidak cocok</Text></>
                    }
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ── Warning Box ──────────────────────────────── */}
          <View style={{
            backgroundColor: '#fef3c7', borderRadius: 16, padding: 14,
            borderWidth: 1, borderColor: '#fde68a', marginBottom: 20,
            flexDirection: 'row', alignItems: 'flex-start', gap: 10,
          }}>
            <Warning size={18} color="#92400e" weight="duotone" style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#92400e', marginBottom: 3 }}>Perhatian</Text>
              <Text style={{ fontSize: 11, color: '#92400e', lineHeight: 17 }}>
                Setelah password diubah, Anda mungkin perlu login ulang di perangkat lain yang menggunakan akun ini.
              </Text>
            </View>
          </View>

          {/* ── Submit Button ────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingVertical: 16, borderRadius: 20,
              backgroundColor: canSubmit ? SiagaColors.primary : '#e2e8f0',
              elevation: canSubmit ? 4 : 0,
              shadowColor: SiagaColors.primary,
              shadowOffset: { width: 0, height: 4 }, shadowOpacity: canSubmit ? 0.2 : 0, shadowRadius: 10,
            }}
          >
            <ShieldCheck size={18} color={canSubmit ? '#fff' : '#94a3b8'} weight="bold" />
            <Text style={{ fontSize: 14, fontWeight: '800', color: canSubmit ? '#fff' : '#94a3b8' }}>
              {isLoading ? 'Mengubah Password...' : 'Ubah Password'}
            </Text>
          </TouchableOpacity>

          {/* ── Footer Info ──────────────────────────────── */}
          <View style={{ alignItems: 'center', marginTop: 20, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <LockKey size={12} color={SiagaColors.secondary} weight="duotone" />
              <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>
                Password dienkripsi dengan standar keamanan tinggi
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>
              Terakhir diubah: 15 Januari 2026
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
