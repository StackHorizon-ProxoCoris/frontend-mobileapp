import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, UserCircle, Envelope, LockKey, Fingerprint,
  Bell, ShieldCheckered, Globe, CircleHalf, Info, Question,
  ChatCircleDots, CaretRight, CheckCircle, SignOut,
  Trash, Phone, Eye, BellRinging, MapPin,
  ShieldCheck, Lock, Key, DeviceMobile,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { dummyUserProfile } from '@/data/dummy';

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

export default function PengaturanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = dummyUserProfile;

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    'Push Notification': true,
    'Peringatan Bencana': true,
    'Update Laporan': true,
    'Aktivitas Komunitas': false,
    'Mode Gelap': false,
    'Lokasi Otomatis': true,
    'Kunci Biometrik': false,
  });

  const toggleSwitch = (key: string, val: boolean) => {
    setToggleStates(prev => ({ ...prev, [key]: val }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => Alert.alert('Info', 'Fitur logout memerlukan backend.') },
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
          extra: user.email,
          onPress: () => Alert.alert('Email', `Email Anda: ${user.email}\n\nUntuk mengganti email, silakan verifikasi melalui email lama.`),
        },
        {
          icon: Phone, label: 'No. Telepon', color: '#059669',
          extra: user.phone.slice(0, 8) + '****',
          onPress: () => Alert.alert('Telepon', `No. Telepon: ${user.phone}\n\nUntuk mengganti nomor, diperlukan verifikasi OTP.`),
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
          onPress: () => Alert.alert('Ubah Password', 'Fitur ubah password memerlukan backend auth.'),
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
        <Text className="text-sm font-bold text-primary">Pengaturan</Text>
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
            <Text className="text-lg font-bold text-white">{user.initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-primary">{user.name}</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <CheckCircle size={10} color="#059669" weight="fill" />
              <Text className="text-xs text-secondary">{user.email}</Text>
            </View>
          </View>
          <CaretRight size={16} color={SiagaColors.secondary} />
        </TouchableOpacity>

        {/* Settings Groups */}
        <View className="gap-5">
          {SETTINGS_GROUPS.map((group, gi) => (
            <View key={gi}>
              <Text className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-2 ml-1">{group.title}</Text>
              <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                {group.items.map((item, ii) => (
                  <TouchableOpacity
                    key={ii}
                    className="flex-row items-center gap-3 px-4 py-3.5"
                    style={{
                      borderBottomWidth: ii < group.items.length - 1 ? 1 : 0,
                      borderBottomColor: '#f8fafc',
                    }}
                    onPress={item.toggle ? undefined : item.onPress}
                    activeOpacity={item.toggle ? 1 : 0.7}
                  >
                    <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>
                      <item.icon size={16} color={item.color} weight="duotone" />
                    </View>
                    <Text className="flex-1 text-sm font-semibold text-primary">{item.label}</Text>
                    {item.badge && (
                      <View className="px-1.5 py-0.5 rounded flex-row items-center gap-0.5" style={{ backgroundColor: item.badgeBg }}>
                        <CheckCircle size={8} color={item.badgeColor} weight="fill" />
                        <Text className="text-[10px] font-bold" style={{ color: item.badgeColor }}>{item.badge}</Text>
                      </View>
                    )}
                    {item.extra && <Text className="text-[11px] font-medium text-secondary max-w-[120px]" numberOfLines={1}>{item.extra}</Text>}
                    {item.toggle ? (
                      <Switch
                        value={toggleStates[item.label]}
                        onValueChange={(val) => toggleSwitch(item.label, val)}
                        trackColor={{ false: '#e2e8f0', true: `${item.color}40` }}
                        thumbColor={toggleStates[item.label] ? item.color : '#f4f3f4'}
                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
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
    </View>
  );
}
