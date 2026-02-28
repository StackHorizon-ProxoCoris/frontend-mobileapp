import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Switch, Alert, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, ShieldCheck, Lock, Key, DeviceMobile, Eye,
  Fingerprint, CheckCircle, XCircle, Clock, MapPin,
  Warning, CaretRight, ShieldCheckered, LockKey,
  SignIn, Globe, Cursor, UserCircle, Buildings,
  CopySimple, ArrowSquareOut, Info,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';

// ─── Data ─────────────────────────────────────────────────────────────────────
const ACCESS_PERMISSIONS = [
  { label: 'Lihat Laporan', desc: 'Melihat seluruh laporan masuk', granted: true, icon: Eye },
  { label: 'Tindak Laporan', desc: 'Memproses & menyelesaikan laporan', granted: true, icon: CheckCircle },
  { label: 'Upload Dokumen', desc: 'Mengunggah dokumen & foto bukti', granted: true, icon: ArrowSquareOut },
  { label: 'Kelola Budget', desc: 'Melihat & mengatur alokasi anggaran', granted: true, icon: Buildings },
  { label: 'Broadcast Notif', desc: 'Mengirim pemberitahuan ke warga', granted: true, icon: Globe },
  { label: 'Admin Pengguna', desc: 'Mengelola akun pengguna lain', granted: false, icon: UserCircle },
  { label: 'Hapus Data', desc: 'Menghapus data dari sistem', granted: false, icon: XCircle },
];

const LOGIN_HISTORY = [
  { device: 'Android — Samsung Galaxy S24', location: 'Bandung, Jawa Barat', time: 'Hari ini, 08:15 WIB', status: 'active', ip: '192.168.1.xx' },
  { device: 'Web Browser — Chrome 122', location: 'Bandung, Jawa Barat', time: 'Kemarin, 14:30 WIB', status: 'success', ip: '10.0.0.xx' },
  { device: 'Android — Samsung Galaxy S24', location: 'Bandung, Jawa Barat', time: '25 Feb 2026, 09:00 WIB', status: 'success', ip: '192.168.1.xx' },
  { device: 'Web Browser — Firefox', location: 'Jakarta, DKI Jakarta', time: '22 Feb 2026, 11:45 WIB', status: 'failed', ip: '172.16.xx.xx' },
];

const SECURITY_EVENTS = [
  { text: 'Password terakhir diubah', time: '15 Jan 2026', icon: Key, color: '#f59e0b' },
  { text: '2FA diaktifkan', time: '10 Jan 2026', icon: ShieldCheck, color: SiagaColors.success },
  { text: 'Verifikasi identitas selesai', time: '10 Jan 2026', icon: Fingerprint, color: SiagaColors.info },
  { text: 'Akun dibuat', time: '05 Jan 2026', icon: UserCircle, color: '#7c3aed' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: SiagaColors.info }} />
      <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
    </View>
  );
}

function SecurityScoreMeter({ score }: { score: number }) {
  const animWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animWidth, { toValue: score, duration: 800, useNativeDriver: false }).start();
  }, [score]);

  const color = score >= 80 ? SiagaColors.success : score >= 50 ? '#f59e0b' : SiagaColors.danger;
  const label = score >= 80 ? 'Sangat Aman' : score >= 50 ? 'Cukup Aman' : 'Perlu Perhatian';

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Skor Keamanan</Text>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#fff', lineHeight: 42 }}>{score}</Text>
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 5,
          backgroundColor: `${color}25`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
        }}>
          <ShieldCheck size={13} color={color} weight="fill" />
          <Text style={{ fontSize: 12, fontWeight: '700', color }}>{label}</Text>
        </View>
      </View>
      {/* Bar */}
      <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
        <Animated.View style={{
          height: 6, borderRadius: 3, backgroundColor: color,
          width: animWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }} />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AksesKeamananScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  const securityScore = 85; // calculated based on settings

  const USER = {
    accessLevel: 'Supervisor',
    lastLogin: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary }}>
        {/* Decorative */}
        <View style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <View style={{ position: 'absolute', left: -20, bottom: -15, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.03)' }} />

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
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Akses & Keamanan</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Security Score */}
          <SecurityScoreMeter score={securityScore} />

          {/* Quick stats */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {[
              { label: 'Level Akses', value: USER.accessLevel, icon: ShieldCheckered, color: '#93c5fd' },
              { label: 'Login Terakhir', value: USER.lastLogin, icon: Clock, color: '#34d399' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <View key={i} style={{
                  flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Icon size={13} color={s.color} weight="duotone" />
                    <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.45)' }}>{s.label}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }} numberOfLines={1}>{s.value}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }}
      >
        {/* ── Autentikasi ────────────────────────────── */}
        <View>
          <SectionLabel title="Autentikasi" />
          <View style={{
            backgroundColor: '#fff', borderRadius: 20,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 2, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
            overflow: 'hidden',
          }}>
            {/* 2FA */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} color={SiagaColors.success} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Two-Factor Auth (2FA)</Text>
                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Verifikasi ganda saat login</Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={(val) => {
                  if (!val) {
                    Alert.alert('Peringatan', 'Menonaktifkan 2FA akan mengurangi keamanan akun. Lanjutkan?', [
                      { text: 'Batal', style: 'cancel' },
                      { text: 'Nonaktifkan', style: 'destructive', onPress: () => setTwoFactorEnabled(false) },
                    ]);
                  } else {
                    setTwoFactorEnabled(true);
                    showToast({ type: 'success', title: 'Berhasil', message: '2FA berhasil diaktifkan.' });
                  }
                }}
                trackColor={{ false: '#e2e8f0', true: `${SiagaColors.success}40` }}
                thumbColor={twoFactorEnabled ? SiagaColors.success : '#f4f3f4'}
                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
              />
            </View>

            <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

            {/* Biometric */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                <Fingerprint size={20} color="#7c3aed" weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Kunci Biometrik</Text>
                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Buka app dengan sidik jari / wajah</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#e2e8f0', true: '#c084fc' }}
                thumbColor={biometricEnabled ? '#7c3aed' : '#f4f3f4'}
                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
              />
            </View>

            <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

            {/* Change Password */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/pengaturan')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
                <LockKey size={20} color="#f59e0b" weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Ubah Password</Text>
                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Terakhir diubah: 15 Jan 2026</Text>
              </View>
              <CaretRight size={16} color={SiagaColors.secondary} weight="bold" />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

            {/* Privasi Data */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert(
                'Privasi Data',
                'Data Anda dilindungi dengan standar keamanan tinggi:\n\n• Enkripsi end-to-end untuk semua komunikasi\n• Data disimpan di server Indonesia\n• Tidak ada sharing data ke pihak ketiga\n• Sesuai UU Perlindungan Data Pribadi\n• Audit keamanan berkala',
              )}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={20} color="#475569" weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>Privasi Data</Text>
                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Kebijakan perlindungan data</Text>
              </View>
              <CaretRight size={16} color={SiagaColors.secondary} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hak Akses ──────────────────────────────── */}
        <View>
          <SectionLabel title="Hak Akses" />

          {/* Access Level Badge */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: '#eff6ff', borderRadius: 16, padding: 14, marginBottom: 12,
            borderWidth: 1, borderColor: '#dbeafe',
          }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheckered size={22} color={SiagaColors.info} weight="duotone" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }}>Level Akses: {USER.accessLevel}</Text>
              <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>
                {ACCESS_PERMISSIONS.filter(p => p.granted).length} dari {ACCESS_PERMISSIONS.length} izin aktif
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Level Akses', 'Level akses Anda ditentukan oleh administrator sistem berdasarkan jabatan dan tanggung jawab.\n\nSupervisor: Akses penuh ke laporan, budget, dan broadcast.\n\nUntuk perubahan level akses, hubungi admin.')}
            >
              <Info size={18} color={SiagaColors.info} weight="duotone" />
            </TouchableOpacity>
          </View>

          {/* Permissions List */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 2, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
            overflow: 'hidden',
          }}>
            {ACCESS_PERMISSIONS.map((perm, i) => {
              const IconComp = perm.icon;
              const isLast = i === ACCESS_PERMISSIONS.length - 1;
              return (
                <View key={i}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingHorizontal: 16, paddingVertical: 13,
                  }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 12,
                      backgroundColor: perm.granted ? '#ecfdf5' : '#fef2f2',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComp size={18} color={perm.granted ? SiagaColors.success : SiagaColors.danger} weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{perm.label}</Text>
                      <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{perm.desc}</Text>
                    </View>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
                      backgroundColor: perm.granted ? '#ecfdf5' : '#fef2f2',
                      borderWidth: 1,
                      borderColor: perm.granted ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.12)',
                    }}>
                      {perm.granted
                        ? <CheckCircle size={11} color={SiagaColors.success} weight="fill" />
                        : <XCircle size={11} color={SiagaColors.danger} weight="fill" />
                      }
                      <Text style={{
                        fontSize: 10, fontWeight: '700',
                        color: perm.granted ? '#065f46' : '#9f1239',
                      }}>
                        {perm.granted ? 'Aktif' : 'Ditolak'}
                      </Text>
                    </View>
                  </View>
                  {!isLast && <View style={{ height: 1, backgroundColor: '#f4f7fb', marginHorizontal: 16 }} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Perangkat & Sesi ────────────────────────── */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel title="Riwayat Login" />
            <TouchableOpacity onPress={() => setShowLoginHistory(v => !v)} activeOpacity={0.7}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.info }}>
                {showLoginHistory ? 'Sembunyikan' : 'Lihat Riwayat'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Device */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 2, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
            marginBottom: showLoginHistory ? 12 : 0,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <DeviceMobile size={16} color={SiagaColors.info} weight="duotone" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: SiagaColors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Perangkat Aktif
              </Text>
            </View>

            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14,
              borderWidth: 1, borderColor: 'rgba(39,174,96,0.15)',
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
                <DeviceMobile size={22} color={SiagaColors.success} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>Android — Samsung Galaxy</Text>
                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>Perangkat ini · Aktif sekarang</Text>
              </View>
              <View style={{
                width: 10, height: 10, borderRadius: 5,
                backgroundColor: SiagaColors.success,
                borderWidth: 2, borderColor: '#dcfce7',
              }} />
            </View>
          </View>

          {/* Login History */}
          {showLoginHistory && (
            <View style={{
              backgroundColor: '#fff', borderRadius: 20, padding: 16,
              borderWidth: 1, borderColor: '#edf2f9',
              elevation: 2, shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
            }}>
              {LOGIN_HISTORY.map((entry, i) => {
                const isLast = i === LOGIN_HISTORY.length - 1;
                const statusColor = entry.status === 'active' ? SiagaColors.success
                  : entry.status === 'success' ? SiagaColors.info
                  : SiagaColors.danger;
                const statusIcon = entry.status === 'active' ? CheckCircle
                  : entry.status === 'success' ? SignIn
                  : Warning;
                const StatusIcon = statusIcon;
                const statusLabel = entry.status === 'active' ? 'Aktif'
                  : entry.status === 'success' ? 'Berhasil'
                  : 'Gagal';

                return (
                  <View key={i}>
                    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 12 }}>
                      {/* Timeline */}
                      <View style={{ alignItems: 'center', width: 36 }}>
                        <View style={{
                          width: 36, height: 36, borderRadius: 11,
                          backgroundColor: `${statusColor}12`,
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <StatusIcon size={16} color={statusColor} weight="duotone" />
                        </View>
                        {!isLast && <View style={{ width: 1.5, flex: 1, backgroundColor: '#f1f5f9', marginTop: 4 }} />}
                      </View>
                      {/* Content */}
                      <View style={{ flex: 1, paddingTop: 2 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{entry.device}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <MapPin size={10} color={SiagaColors.secondary} />
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{entry.location}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} color={SiagaColors.secondary} />
                            <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>{entry.time}</Text>
                          </View>
                          <View style={{
                            flexDirection: 'row', alignItems: 'center', gap: 3,
                            paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
                            backgroundColor: `${statusColor}12`,
                          }}>
                            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: statusColor }} />
                            <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor }}>{statusLabel}</Text>
                          </View>
                          <Text style={{ fontSize: 10, color: SiagaColors.secondary, fontFamily: 'monospace' }}>{entry.ip}</Text>
                        </View>
                      </View>
                    </View>
                    {!isLast && <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Log Keamanan ────────────────────────────── */}
        <View>
          <SectionLabel title="Log Keamanan" />
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 2, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
          }}>
            {SECURITY_EVENTS.map((event, i) => {
              const IconComp = event.icon;
              const isLast = i === SECURITY_EVENTS.length - 1;
              return (
                <View key={i}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 11,
                      backgroundColor: `${event.color}12`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComp size={16} color={event.color} weight="duotone" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>{event.text}</Text>
                      <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>{event.time}</Text>
                    </View>
                  </View>
                  {!isLast && <View style={{ height: 1, backgroundColor: '#f4f7fb' }} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Rekomendasi Keamanan ────────────────────── */}
        <View>
          <SectionLabel title="Rekomendasi Keamanan" />
          <View style={{
            backgroundColor: '#fff', borderRadius: 20,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 2, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
            overflow: 'hidden',
          }}>
            {[
              { text: 'Aktifkan kunci biometrik', desc: 'Tambahan keamanan untuk membuka aplikasi', done: biometricEnabled, icon: Fingerprint, color: '#7c3aed' },
              { text: 'Two-Factor Authentication', desc: 'Verifikasi ganda saat login', done: twoFactorEnabled, icon: ShieldCheck, color: SiagaColors.success },
              { text: 'Gunakan password kuat', desc: 'Kombinasi huruf, angka, dan simbol', done: true, icon: Key, color: '#f59e0b' },
              { text: 'Periksa riwayat login', desc: 'Pantau aktivitas login mencurigakan', done: showLoginHistory, icon: Clock, color: SiagaColors.info },
            ].map((rec, i, arr) => {
              const IconComp = rec.icon;
              const isLast = i === arr.length - 1;
              return (
                <View key={i}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingHorizontal: 16, paddingVertical: 13,
                  }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 12,
                      backgroundColor: rec.done ? '#ecfdf5' : `${rec.color}10`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {rec.done
                        ? <CheckCircle size={18} color={SiagaColors.success} weight="fill" />
                        : <IconComp size={18} color={rec.color} weight="duotone" />
                      }
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 13, fontWeight: '700',
                        color: rec.done ? SiagaColors.secondary : SiagaColors.primary,
                        textDecorationLine: rec.done ? 'line-through' : 'none',
                      }}>{rec.text}</Text>
                      <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{rec.desc}</Text>
                    </View>
                    {!rec.done && (
                      <View style={{
                        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                        backgroundColor: '#fef3c7',
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#b45309' }}>Aktifkan</Text>
                      </View>
                    )}
                  </View>
                  {!isLast && <View style={{ height: 1, backgroundColor: '#f4f7fb', marginHorizontal: 16 }} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Encryption Info ─────────────────────────── */}
        <View style={{
          backgroundColor: '#eff6ff', borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: '#dbeafe',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Lock size={16} color={SiagaColors.info} weight="duotone" />
            <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Perlindungan Data</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#475569', lineHeight: 17 }}>
            Seluruh data Anda dilindungi dengan enkripsi AES-256. Komunikasi menggunakan TLS 1.3 &
            data disimpan di data center Indonesia sesuai regulasi UU Perlindungan Data Pribadi (UU No. 27/2022).
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {['AES-256', 'TLS 1.3', 'OWASP', 'UU PDP'].map((tag, i) => (
              <View key={i} style={{ backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.info }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer ─────────────────────────────────── */}
        <View style={{ alignItems: 'center', gap: 4, paddingTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color={SiagaColors.primary} weight="duotone" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.primary }}>SIAGA Security Center</Text>
          </View>
          <Text style={{ fontSize: 10, color: SiagaColors.secondary }}>
            Keamanan akun Anda adalah prioritas kami
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
