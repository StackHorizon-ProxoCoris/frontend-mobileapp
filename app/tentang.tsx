import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, ShieldCheck, Megaphone, MapTrifold, ChatCenteredDots,
  Users, Leaf, Heart, Globe, GithubLogo, EnvelopeSimple,
  Buildings, Star, Lightning,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

const FEATURES = [
  { icon: Megaphone, color: '#3b82f6', bg: '#eff6ff', title: 'Lapor Cepat', desc: 'Laporkan masalah lingkungan & infrastruktur dengan foto dan lokasi GPS.' },
  { icon: MapTrifold, color: '#059669', bg: '#ecfdf5', title: 'Pantau Real-time', desc: 'Pantau semua laporan di peta interaktif dan tracking progress penanganan.' },
  { icon: ChatCenteredDots, color: '#7c3aed', bg: '#f5f3ff', title: 'AI Assistant', desc: 'Asisten AI cerdas untuk panduan darurat, mitigasi, dan informasi cepat.' },
  { icon: Users, color: '#ea580c', bg: '#fff7ed', title: 'Komunitas Aktif', desc: 'Bergabung dengan warga lain untuk aksi positif dan gotong royong.' },
  { icon: Leaf, color: '#16a34a', bg: '#f0fdf4', title: 'Eco-Points', desc: 'Dapatkan reward poin dari setiap kontribusi dan tukar dengan badge.' },
  { icon: ShieldCheck, color: SiagaColors.danger, bg: '#fef2f2', title: 'SOS Darurat', desc: 'Kirim sinyal darurat ke layanan emergency dalam satu ketukan.' },
];

const TEAM = [
  { name: 'Tim ProxoCoris', role: 'Development Team', initials: 'PC' },
];

export default function TentangScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        <Text className="text-sm font-bold text-primary">Tentang SIAGA</Text>
        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Section */}
        <View className="items-center pt-8 pb-6 px-5">
          <View
            className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
            style={{ backgroundColor: SiagaColors.primary, elevation: 4, shadowColor: SiagaColors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 }}
          >
            <Lightning size={36} color="#fff" weight="duotone" />
          </View>
          <Text className="text-2xl font-extrabold text-primary">SIAGA</Text>
          <Text className="text-xs text-secondary mt-1 font-semibold">Sistem Informasi Aksi & Gotong-royong Aktif</Text>
          <View className="bg-slate-100 rounded-lg px-2.5 py-1 mt-2">
            <Text className="text-[11px] font-semibold text-secondary">Versi 1.0.0 · Build 2026.02</Text>
          </View>
        </View>

        {/* Description */}
        <View className="px-5 mb-5">
          <View className="bg-white border border-slate-100 rounded-2xl p-4" style={{ elevation: 1 }}>
            <Text className="text-[12px] text-primary/80 leading-5">
              SIAGA adalah platform digital yang menghubungkan warga, pemerintah, dan komunitas untuk membangun kota yang lebih baik.
              Melalui SIAGA, warga dapat melaporkan masalah lingkungan dan infrastruktur, memantau penanganan secara real-time,
              berpartisipasi dalam aksi positif bersama, dan mendapatkan informasi penting terkait kebencanaan dan keamanan kota.
            </Text>
          </View>
        </View>

        {/* Fitur Utama */}
        <View className="px-5 mb-5">
          <Text className="text-base font-bold text-primary mb-3">Fitur Utama</Text>
          <View className="gap-2.5">
            {FEATURES.map((f, i) => (
              <View key={i} className="bg-white border border-slate-100 rounded-xl p-3.5 flex-row items-start gap-3" style={{ elevation: 1 }}>
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: f.bg }}>
                  <f.icon size={20} color={f.color} weight="duotone" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-primary">{f.title}</Text>
                  <Text className="text-[11px] text-secondary mt-0.5 leading-4">{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View className="px-5 mb-5">
          <Text className="text-base font-bold text-primary mb-3">Dampak SIAGA</Text>
          <View className="flex-row gap-2">
            {[
              { value: '1.2K+', label: 'Pengguna', color: SiagaColors.primary },
              { value: '450+', label: 'Laporan', color: SiagaColors.info },
              { value: '120+', label: 'Aksi Positif', color: SiagaColors.success },
              { value: '95%', label: 'Response Rate', color: '#f59e0b' },
            ].map((s, i) => (
              <View key={i} className="flex-1 bg-white border border-slate-100 rounded-xl p-3 items-center" style={{ elevation: 1 }}>
                <Text className="text-base font-bold" style={{ color: s.color }}>{s.value}</Text>
                <Text className="text-[10px] font-medium text-secondary mt-0.5">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team */}
        <View className="px-5 mb-5">
          <Text className="text-base font-bold text-primary mb-3">Tim Pengembang</Text>
          <View className="bg-white border border-slate-100 rounded-2xl p-4" style={{ elevation: 1 }}>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.primary }}>
                <Text className="text-white font-bold text-base">PC</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-primary">Tim ProxoCoris</Text>
                <Text className="text-[11px] text-secondary mt-0.5">Development Team</Text>
              </View>
              <View className="bg-amber-50 rounded-lg px-2 py-1 flex-row items-center gap-1">
                <Star size={10} color="#f59e0b" weight="fill" />
                <Text className="text-[11px] font-bold" style={{ color: '#b45309' }}>Builder</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tech Stack */}
        <View className="px-5 mb-5">
          <Text className="text-base font-bold text-primary mb-3">Teknologi</Text>
          <View className="bg-white border border-slate-100 rounded-2xl p-4" style={{ elevation: 1 }}>
            <View className="flex-row flex-wrap gap-2">
              {['React Native', 'Expo', 'TypeScript', 'NativeWind', 'Expo Router', 'Leaflet Maps'].map((tech, i) => (
                <View key={i} className="bg-slate-50 rounded-lg px-3 py-1.5">
                  <Text className="text-[11px] font-semibold text-primary">{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Contact */}
        <View className="px-5 mb-5">
          <Text className="text-base font-bold text-primary mb-3">Kontak & Tautan</Text>
          <View className="gap-2">
            <TouchableOpacity
              className="bg-white border border-slate-100 rounded-xl p-3.5 flex-row items-center gap-3"
              style={{ elevation: 1 }}
              onPress={() => Linking.openURL('mailto:support@siaga.app')}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-lg bg-blue-50 items-center justify-center">
                <EnvelopeSimple size={18} color="#3b82f6" weight="duotone" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-primary">Email Support</Text>
                <Text className="text-[11px] text-secondary">support@siaga.app</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white border border-slate-100 rounded-xl p-3.5 flex-row items-center gap-3"
              style={{ elevation: 1 }}
              onPress={() => Linking.openURL('https://siaga.app')}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-lg bg-green-50 items-center justify-center">
                <Globe size={18} color="#059669" weight="duotone" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-primary">Website</Text>
                <Text className="text-[11px] text-secondary">siaga.app</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center px-5 pt-2">
          <View className="flex-row items-center gap-1 mb-1">
            <Text className="text-[11px] text-secondary">Dibuat dengan</Text>
            <Heart size={10} color={SiagaColors.danger} weight="fill" />
            <Text className="text-[11px] text-secondary">di Bandung</Text>
          </View>
          <Text className="text-[10px] text-secondary/60">© 2026 ProxoCoris. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
