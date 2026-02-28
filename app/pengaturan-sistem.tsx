import React, { useState, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Gear, Bell, BellRinging, ChartBar, Clock,
  Globe, CircleHalf, MapPin, Sliders, Timer,
  ShieldCheck, ArrowsClockwise, Database, CloudArrowUp,
  FunnelSimple, CheckCircle, Info, CaretRight,
  Lightning, Megaphone, Users, ClipboardText,
  SpeakerHigh, Envelope, Vibrate, WarningCircle,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { apiPatch } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToggleItem {
  icon: any;
  label: string;
  desc: string;
  color: string;
  key: string;
}

interface InfoItem {
  icon: any;
  label: string;
  value: string;
  color: string;
  onPress?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_SYS_SETTINGS: Record<string, boolean> = {
  autoAssign: true,
  priorityEscalation: true,
  responseReminder: true,
  weeklyDigest: true,
  realtimeSync: true,
  autoBackup: true,
  soundNotif: true,
  emailNotif: false,
  vibration: true,
  criticalAlerts: true,
  broadcastEnabled: true,
  citizenFeedback: true,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: any; title: string; subtitle: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <View style={{
        width: 40, height: 40, borderRadius: 13,
        backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} weight="duotone" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: SiagaColors.primary }}>{title}</Text>
        <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 1 }}>{subtitle}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 2 }} />;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PengaturanSistemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState(DEFAULT_SYS_SETTINGS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Debounced save ────────────────────────────────────────
  const saveSettings = useCallback((newSettings: Record<string, boolean>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await apiPatch('/auth/settings', newSettings);
      if (!result.success) {
        showToast({ type: 'error', title: 'Gagal', message: 'Tidak dapat menyimpan pengaturan.' });
      }
    }, 800);
  }, [showToast]);

  const toggle = (key: string, val: boolean) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSettings(next);
  };

  // ─── Data ──────────────────────────────────────────────────
  const REPORT_HANDLING: ToggleItem[] = [
    { icon: ArrowsClockwise, label: 'Auto-assign Laporan', desc: 'Otomatis distribusi laporan berdasarkan wilayah & bidang', color: SiagaColors.info, key: 'autoAssign' },
    { icon: Lightning, label: 'Eskalasi Prioritas', desc: 'Eskalasi otomatis jika laporan tidak ditangani >24 jam', color: '#f59e0b', key: 'priorityEscalation' },
    { icon: Timer, label: 'Pengingat Respons', desc: 'Notifikasi pengingat sebelum deadline respons', color: SiagaColors.danger, key: 'responseReminder' },
    { icon: ChartBar, label: 'Laporan Mingguan', desc: 'Kirim ringkasan kinerja setiap Senin pagi', color: '#7c3aed', key: 'weeklyDigest' },
  ];

  const DATA_SYNC: ToggleItem[] = [
    { icon: CloudArrowUp, label: 'Sinkronisasi Real-time', desc: 'Data selalu terbarui secara otomatis', color: SiagaColors.info, key: 'realtimeSync' },
    { icon: Database, label: 'Auto Backup', desc: 'Cadangkan data penting setiap 24 jam', color: SiagaColors.success, key: 'autoBackup' },
  ];

  const NOTIFICATION_PREFS: ToggleItem[] = [
    { icon: SpeakerHigh, label: 'Suara Notifikasi', desc: 'Putar suara saat menerima notifikasi', color: SiagaColors.info, key: 'soundNotif' },
    { icon: Envelope, label: 'Email Notifikasi', desc: 'Kirim salinan notifikasi penting ke email dinas', color: '#3b82f6', key: 'emailNotif' },
    { icon: Vibrate, label: 'Getar', desc: 'Getarkan perangkat saat ada notifikasi masuk', color: '#7c3aed', key: 'vibration' },
    { icon: WarningCircle, label: 'Peringatan Kritis', desc: 'Selalu tampilkan notifikasi darurat & bencana', color: SiagaColors.danger, key: 'criticalAlerts' },
  ];

  const GOVERNANCE: ToggleItem[] = [
    { icon: Megaphone, label: 'Broadcast ke Warga', desc: 'Izinkan mengirim broadcast notifikasi ke masyarakat', color: '#ea580c', key: 'broadcastEnabled' },
    { icon: Users, label: 'Feedback Warga', desc: 'Terima notifikasi komentar & feedback dari warga', color: SiagaColors.success, key: 'citizenFeedback' },
  ];

  const SYSTEM_INFO: InfoItem[] = [
    { icon: Clock, label: 'Target Respons', value: '4 Jam', color: '#f59e0b', onPress: () => Alert.alert('Target Respons', 'Target waktu respons untuk laporan masuk adalah 4 jam kerja.\n\nTarget ini dapat disesuaikan oleh admin sistem.') },
    { icon: FunnelSimple, label: 'Prioritas Auto', value: 'Tinggi & Kritis', color: SiagaColors.danger, onPress: () => Alert.alert('Prioritas Auto-Eskalasi', 'Laporan dengan prioritas Tinggi dan Kritis akan otomatis ter-eskalasi jika tidak ditangani dalam waktu yang ditentukan.') },
    { icon: MapPin, label: 'Wilayah Cakupan', value: user?.city || 'Kota Bandung', color: SiagaColors.success },
    { icon: Globe, label: 'Bahasa Sistem', value: '🇮🇩 Indonesia', color: SiagaColors.info, onPress: () => Alert.alert('Bahasa', 'Saat ini sistem hanya tersedia dalam Bahasa Indonesia.') },
    { icon: CircleHalf, label: 'Tema Tampilan', value: 'Light Mode', color: '#475569', onPress: () => Alert.alert('Tema', 'Fitur dark mode akan tersedia di versi berikutnya.') },
  ];

  // ─── Render Helpers ────────────────────────────────────────
  const renderToggleSection = (items: ToggleItem[]) => (
    <View style={{
      backgroundColor: '#fff', borderRadius: 20, padding: 4,
      borderWidth: 1, borderColor: '#edf2f9',
      elevation: 2, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
    }}>
      {items.map((item, i) => {
        const IconComp = item.icon;
        const isLast = i === items.length - 1;
        return (
          <View key={item.key}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 14, paddingVertical: 13,
            }}>
              <View style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: `${item.color}12`, alignItems: 'center', justifyContent: 'center',
              }}>
                <IconComp size={18} color={item.color} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>{item.label}</Text>
                <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2, lineHeight: 15 }}>{item.desc}</Text>
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={(val) => toggle(item.key, val)}
                trackColor={{ false: '#e2e8f0', true: `${item.color}40` }}
                thumbColor={settings[item.key] ? item.color : '#f4f3f4'}
                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
              />
            </View>
            {!isLast && <Divider />}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <View style={{
        paddingTop: insets.top, backgroundColor: SiagaColors.primary,
      }}>
        {/* Decorative circles */}
        <View style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <View style={{ position: 'absolute', left: -15, bottom: -10, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.03)' }} />

        <View style={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 }}>
          {/* Top bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Pengaturan Sistem</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Summary Cards */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sliders size={16} color="#93c5fd" weight="duotone" />
                <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Aktif</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>
                {Object.values(settings).filter(Boolean).length}
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                dari {Object.keys(settings).length} pengaturan
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={16} color="#34d399" weight="duotone" />
                <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Status</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#34d399' }}>Optimal</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                Semua sistem berjalan
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }}
      >
        {/* ── Penanganan Laporan ─────────────────────── */}
        <View>
          <SectionHeader
            icon={ClipboardText}
            title="Penanganan Laporan"
            subtitle="Konfigurasi alur & distribusi laporan masuk"
            color={SiagaColors.info}
          />
          {renderToggleSection(REPORT_HANDLING)}
        </View>

        {/* ── Notifikasi Sistem ──────────────────────── */}
        <View>
          <SectionHeader
            icon={BellRinging}
            title="Notifikasi Sistem"
            subtitle="Atur preferensi pemberitahuan"
            color="#f59e0b"
          />
          {renderToggleSection(NOTIFICATION_PREFS)}
        </View>

        {/* ── Tata Kelola ────────────────────────────── */}
        <View>
          <SectionHeader
            icon={Users}
            title="Tata Kelola"
            subtitle="Interaksi dengan warga & stakeholder"
            color={SiagaColors.success}
          />
          {renderToggleSection(GOVERNANCE)}
        </View>

        {/* ── Data & Sinkronisasi ────────────────────── */}
        <View>
          <SectionHeader
            icon={Database}
            title="Data & Sinkronisasi"
            subtitle="Pengaturan data & backup"
            color="#7c3aed"
          />
          {renderToggleSection(DATA_SYNC)}
        </View>

        {/* ── Info Sistem ────────────────────────────── */}
        <View>
          <SectionHeader
            icon={Info}
            title="Informasi Sistem"
            subtitle="Parameter & konfigurasi saat ini"
            color={SiagaColors.primary}
          />
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 4,
            borderWidth: 1, borderColor: '#edf2f9',
            elevation: 2, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
          }}>
            {SYSTEM_INFO.map((item, i) => {
              const IconComp = item.icon;
              const isLast = i === SYSTEM_INFO.length - 1;
              return (
                <View key={i}>
                  <TouchableOpacity
                    activeOpacity={item.onPress ? 0.7 : 1}
                    onPress={item.onPress}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                      paddingHorizontal: 14, paddingVertical: 13,
                    }}
                  >
                    <View style={{
                      width: 38, height: 38, borderRadius: 12,
                      backgroundColor: `${item.color}12`, alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComp size={18} color={item.color} weight="duotone" />
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: SiagaColors.primary }}>{item.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.secondary }}>{item.value}</Text>
                    {item.onPress && <CaretRight size={14} color={SiagaColors.secondary} weight="bold" />}
                  </TouchableOpacity>
                  {!isLast && <Divider />}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Reset Button ───────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              'Reset Pengaturan',
              'Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Reset', style: 'destructive', onPress: () => {
                    setSettings(DEFAULT_SYS_SETTINGS);
                    showToast({ type: 'success', title: 'Berhasil', message: 'Pengaturan dikembalikan ke default.' });
                  },
                },
              ],
            );
          }}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            paddingVertical: 14, borderRadius: 20,
            backgroundColor: '#fff',
            borderWidth: 1.5, borderColor: 'rgba(231,76,60,0.2)',
          }}
        >
          <ArrowsClockwise size={18} color={SiagaColors.danger} weight="duotone" />
          <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.danger }}>Reset ke Default</Text>
        </TouchableOpacity>

        {/* ── Footer ─────────────────────────────────── */}
        <View style={{ alignItems: 'center', gap: 4, paddingTop: 4 }}>
          <Text style={{ fontSize: 11, color: SiagaColors.secondary }}>Perubahan disimpan secara otomatis</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={10} color={SiagaColors.success} weight="fill" />
            <Text style={{ fontSize: 10, color: SiagaColors.success, fontWeight: '600' }}>Terakhir disimpan: Baru saja</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
