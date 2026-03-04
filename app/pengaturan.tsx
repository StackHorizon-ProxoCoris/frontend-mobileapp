import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, UserCircle, Envelope, LockKey, Fingerprint,
  Bell, ShieldCheckered, Globe, CircleHalf, Info, Question,
  ChatCircleDots, CaretRight, CheckCircle, SignOut,
  Trash, Phone, Eye, BellRinging, MapPin,
  ShieldCheck, Lock, Key, DeviceMobile, X,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { apiPatch, apiPost } from '@/services/api';

interface SettingItem {
  icon: any;
  label: string;
  color: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  toggle?: boolean;
  extra?: string;
  onPress?: () => void;
}

// Default settings jika belum ada dari backend
const DEFAULT_SETTINGS: Record<string, boolean> = {
  'Push Notification': true,
  'Peringatan Bencana': true,
  'Update Laporan': true,
  'Aktivitas Komunitas': false,
  'Mode Gelap': false,
  'Lokasi Otomatis': true,
  'Kunci Biometrik': false,
};

export default function PengaturanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // --- Settings toggle state (dari API atau default) ---
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(DEFAULT_SETTINGS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inisialisasi state dari user?.settings saat mount
  useEffect(() => {
    if (user?.settings && Object.keys(user.settings).length > 0) {
      setToggleStates(prev => ({ ...prev, ...user.settings }));
    }
  }, [user?.settings]);

  // Debounced save ke API
  const saveSettings = useCallback((newSettings: Record<string, boolean>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await apiPatch('/auth/settings', newSettings);
      if (!result.success) {
        showToast({ type: 'error', title: 'Gagal', message: 'Tidak dapat menyimpan pengaturan.', duration: 2000 });
      }
    }, 800);
  }, [showToast]);

  const toggleSwitch = (key: string, val: boolean) => {
    const newStates = { ...toggleStates, [key]: val };
    setToggleStates(newStates);
    saveSettings(newStates);
  };

  // --- Change Password Modal ---
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPw.trim()) {
      showToast({ type: 'error', title: 'Error', message: 'Password lama wajib diisi.' });
      return;
    }
    if (newPw.length < 8) {
      showToast({ type: 'error', title: 'Error', message: 'Password baru minimal 8 karakter.' });
      return;
    }
    if (newPw !== confirmPw) {
      showToast({ type: 'error', title: 'Error', message: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setPwLoading(true);
    const result = await apiPost('/auth/change-password', {
      currentPassword: currentPw,
      newPassword: newPw,
    });
    setPwLoading(false);

    if (result.success) {
      showToast({ type: 'success', title: 'Berhasil!', message: 'Password berhasil diubah.' });
      setPwModalVisible(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } else {
      showToast({ type: 'error', title: 'Gagal', message: result.message || 'Gagal mengubah password.' });
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: async () => { await logout(); } },
      ]
    );
  };

  const SETTINGS_GROUPS: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Akun',
      items: [
        {
          icon: UserCircle, label: 'Edit Profil', color: SiagaColors.primary,
          onPress: () => router.push('/edit-profil'),
        },
        {
          icon: Envelope, label: 'Email', color: '#3b82f6',
          extra: user?.email || '-',
          onPress: () => Alert.alert('Email', `Email Anda: ${user?.email || '-'}`),
        },
        {
          icon: Phone, label: 'No. Telepon', color: '#059669',
          extra: (user?.phone || '').slice(0, 8) + '****',
          onPress: () => Alert.alert('Telepon', `No. Telepon: ${user?.phone || '-'}`),
        },
        {
          icon: Fingerprint, label: 'Verifikasi Identitas', color: '#059669',
          badge: 'Verified', badgeBg: '#dcfce7', badgeColor: '#15803d',
          onPress: () => Alert.alert('Verifikasi', 'Identitas Anda sudah terverifikasi pada 10 Januari 2026.'),
        },
      ],
    },
    {
      title: 'Keamanan',
      items: [
        {
          icon: LockKey, label: 'Ubah Password', color: '#f59e0b',
          onPress: () => setPwModalVisible(true),
        },
        { icon: Lock, label: 'Kunci Biometrik', color: '#7c3aed', toggle: true },
        {
          icon: DeviceMobile, label: 'Perangkat Aktif', color: SiagaColors.primary,
          extra: '1 Perangkat',
          onPress: () => Alert.alert('Perangkat Aktif', 'Saat ini 1 perangkat aktif:\n\n• Android - Samsung Galaxy (Perangkat ini)'),
        },
        {
          icon: Eye, label: 'Privasi Data', color: '#475569',
          onPress: () => Alert.alert('Privasi', 'Data Anda dilindungi dengan enkripsi end-to-end. Kami tidak membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan.'),
        },
      ],
    },
    {
      title: 'Notifikasi',
      items: [
        { icon: Bell, label: 'Push Notification', color: '#f59e0b', toggle: true },
        { icon: ShieldCheckered, label: 'Peringatan Bencana', color: SiagaColors.danger, toggle: true },
        { icon: BellRinging, label: 'Update Laporan', color: '#3b82f6', toggle: true },
        { icon: ChatCircleDots, label: 'Aktivitas Komunitas', color: '#059669', toggle: true },
      ],
    },
    {
      title: 'Preferensi',
      items: [
        { icon: Globe, label: 'Bahasa', color: SiagaColors.info, extra: '🇮🇩 Indonesia',
          onPress: () => Alert.alert('Bahasa', 'Saat ini hanya tersedia dalam Bahasa Indonesia.') },
        { icon: CircleHalf, label: 'Mode Gelap', color: '#475569', toggle: true },
        { icon: MapPin, label: 'Lokasi Otomatis', color: '#ea580c', toggle: true },
      ],
    },
    {
      title: 'Bantuan & Info',
      items: [
        {
          icon: Info, label: 'Tentang SIAGA', color: SiagaColors.primary,
          onPress: () => router.push('/tentang'),
        },
        {
          icon: Question, label: 'Bantuan & FAQ', color: '#7c3aed',
          onPress: () => router.push('/bantuan'),
        },
        {
          icon: ChatCircleDots, label: 'Kirim Feedback', color: '#059669',
          onPress: () => router.push('/feedback'),
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-[#f8fafd]">
      {/* Header */}
      <View
        className="px-5 pb-3 flex-row items-center justify-between border-b border-slate-100"
        style={{ paddingTop: insets.top + 8, backgroundColor: '#fff' }}
      >
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={SiagaColors.primary} weight="bold" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary">Pengaturan</Text>
        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 }}
      >
        {/* Quick Profile Card */}
        <TouchableOpacity
          className="bg-white border border-slate-100 rounded-2xl p-4 flex-row items-center gap-3 mb-5"
          style={{ elevation: 2, shadowColor: '#082a4c', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }}
          onPress={() => router.push('/edit-profil')}
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
            <Text className="text-lg font-bold text-white">{user?.initials || 'U'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-primary">{user?.fullName || 'User'}</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <CheckCircle size={10} color="#059669" weight="fill" />
              <Text className="text-[13px] text-secondary">{user?.email || '-'}</Text>
            </View>
          </View>
          <CaretRight size={16} color={SiagaColors.secondary} />
        </TouchableOpacity>

        {/* Settings Groups */}
        <View className="gap-5">
          {SETTINGS_GROUPS.map((group, gi) => (
            <View key={gi}>
              <Text className="text-[12px] font-bold text-secondary uppercase tracking-widest mb-2.5 ml-1">{group.title}</Text>
              <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                {group.items.map((item, ii) => (
                  <TouchableOpacity
                    key={ii}
                    className="flex-row items-center gap-3.5 px-4 py-4"
                    style={{
                      borderBottomWidth: ii < group.items.length - 1 ? 1 : 0,
                      borderBottomColor: '#f8fafc',
                    }}
                    onPress={item.toggle ? undefined : item.onPress}
                    activeOpacity={item.toggle ? 1 : 0.7}
                  >
                    <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>
                      <item.icon size={18} color={item.color} weight="duotone" />
                    </View>
                    <Text className="flex-1 text-[15px] font-semibold text-primary">{item.label}</Text>
                    {item.badge && (
                      <View className="px-1.5 py-0.5 rounded flex-row items-center gap-0.5" style={{ backgroundColor: item.badgeBg }}>
                        <CheckCircle size={8} color={item.badgeColor} weight="fill" />
                        <Text className="text-[11px] font-bold" style={{ color: item.badgeColor }}>{item.badge}</Text>
                      </View>
                    )}
                    {item.extra && <Text className="text-[12px] font-medium text-secondary max-w-[120px]" numberOfLines={1}>{item.extra}</Text>}
                    {item.toggle ? (
                      <Switch
                        value={toggleStates[item.label]}
                        onValueChange={(val) => toggleSwitch(item.label, val)}
                        trackColor={{ false: '#e2e8f0', true: `${item.color}40` }}
                        thumbColor={toggleStates[item.label] ? item.color : '#f4f3f4'}
                        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                      />
                    ) : (
                      <CaretRight size={14} color={SiagaColors.secondary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <View className="mt-6">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3.5 bg-red-50 border border-red-100 rounded-2xl"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <SignOut size={18} color={SiagaColors.danger} weight="duotone" />
            <Text className="text-sm font-bold text-danger">Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-[11px] text-secondary mt-4">SIAGA v1.0.0 · Build 2026.02</Text>
      </ScrollView>

      {/* ========== Change Password Modal ========== */}
      <Modal visible={pwModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <View className="w-full bg-white rounded-2xl p-5" style={{ elevation: 5 }}>
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                    <Key size={16} color="#f59e0b" weight="duotone" />
                  </View>
                  <Text className="text-base font-bold text-primary">Ubah Password</Text>
                </View>
                <TouchableOpacity
                  onPress={() => { setPwModalVisible(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X size={16} color={SiagaColors.secondary} weight="bold" />
                </TouchableOpacity>
              </View>

              {/* Inputs */}
              <View className="gap-3">
                <View>
                  <Text className="text-xs font-semibold text-secondary mb-1">Password Lama</Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-primary"
                    placeholder="Masukkan password lama"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={currentPw}
                    onChangeText={setCurrentPw}
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-secondary mb-1">Password Baru</Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-primary"
                    placeholder="Minimal 8 karakter"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={newPw}
                    onChangeText={setNewPw}
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-secondary mb-1">Konfirmasi Password Baru</Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-primary"
                    placeholder="Ulangi password baru"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center border border-slate-200"
                  onPress={() => { setPwModalVisible(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-bold text-secondary">Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: pwLoading ? '#94a3b8' : SiagaColors.primary }}
                  onPress={handleChangePassword}
                  disabled={pwLoading}
                  activeOpacity={0.8}
                >
                  <Text className="text-sm font-bold text-white">{pwLoading ? 'Mengubah...' : 'Simpan'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
