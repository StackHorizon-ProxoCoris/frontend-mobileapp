import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Camera, UserCircle, Envelope, Phone, MapPin,
  Buildings, PencilSimple, CheckCircle,
  FloppyDisk, IdentificationBadge, Medal, ShieldCheck,
  CalendarBlank, Briefcase,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { apiPatch } from '@/services/api';



interface FormField {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  value: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  editable?: boolean;
  section: 'identity' | 'contact' | 'position';
}

export default function EditProfilGovScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: user?.fullName || '',
    bio: user?.bio || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nip: user?.nip || '',
    jabatan: user?.jabatan || '',
    instansi: user?.instansi || '',
    unit: user?.unitKerja || '',
    golongan: user?.golongan || '',
    tmt: user?.tmt || '',
    district: user?.district || '',
    city: user?.city || 'Kota Bandung',
  });

  const [isSaving, setIsSaving] = useState(false);

  const identityFields: FormField[] = [
    { key: 'name', label: 'Nama Lengkap', icon: UserCircle, iconColor: SiagaColors.primary, value: form.name, placeholder: 'Masukkan nama lengkap', section: 'identity' },
    { key: 'nip', label: 'NIP', icon: IdentificationBadge, iconColor: SiagaColors.primary, value: form.nip, placeholder: 'Nomor Induk Pegawai', editable: false, section: 'identity' },
    { key: 'bio', label: 'Bio / Deskripsi', icon: PencilSimple, iconColor: '#7c3aed', value: form.bio, placeholder: 'Tulis deskripsi tugas singkat...', multiline: true, section: 'identity' },
  ];

  const positionFields: FormField[] = [
    { key: 'jabatan', label: 'Jabatan', icon: Briefcase, iconColor: SiagaColors.info, value: form.jabatan, placeholder: 'Jabatan', editable: false, section: 'position' },
    { key: 'instansi', label: 'Instansi', icon: Buildings, iconColor: '#7c3aed', value: form.instansi, placeholder: 'Instansi', editable: false, section: 'position' },
    { key: 'unit', label: 'Unit Kerja', icon: Buildings, iconColor: SiagaColors.info, value: form.unit, placeholder: 'Unit Kerja', editable: false, section: 'position' },
    { key: 'golongan', label: 'Golongan', icon: Medal, iconColor: '#f59e0b', value: form.golongan, placeholder: 'Golongan / Pangkat', editable: false, section: 'position' },
    { key: 'tmt', label: 'TMT (Terhitung Mulai Tanggal)', icon: CalendarBlank, iconColor: SiagaColors.secondary, value: form.tmt, placeholder: 'TMT', editable: false, section: 'position' },
  ];

  const contactFields: FormField[] = [
    { key: 'email', label: 'Email Dinas', icon: Envelope, iconColor: '#3b82f6', value: form.email, placeholder: 'email@dinas.go.id', keyboardType: 'email-address', section: 'contact' },
    { key: 'phone', label: 'No. Telepon', icon: Phone, iconColor: '#059669', value: form.phone, placeholder: '+62xxx', keyboardType: 'phone-pad', section: 'contact' },
    { key: 'district', label: 'Kecamatan Wilayah Tugas', icon: MapPin, iconColor: SiagaColors.info, value: form.district, placeholder: 'Kecamatan', section: 'contact' },
    { key: 'city', label: 'Kota / Kabupaten', icon: MapPin, iconColor: SiagaColors.info, value: form.city, placeholder: 'Kota', editable: false, section: 'contact' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    const result = await apiPatch('/auth/profile', {
      fullName: form.name,
      bio: form.bio,
      email: form.email,
      phone: form.phone,
      district: form.district,
      city: form.city,
      // Gov-specific fields
      nip: form.nip,
      jabatan: form.jabatan,
      instansi: form.instansi,
      unitKerja: form.unit,
      golongan: form.golongan,
      tmt: form.tmt,
    });
    setIsSaving(false);
    if (result.success) {
      if (refreshUser) await refreshUser();
      showToast({ type: 'success', title: 'Berhasil!', message: 'Profil berhasil diperbarui.' });
      router.back();
    } else {
      showToast({ type: 'error', title: 'Gagal', message: result.message || 'Terjadi kesalahan saat menyimpan profil.' });
    }
  };

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const renderFieldGroup = (title: string, fields: FormField[]) => (
    <View style={{ marginBottom: 20 }}>
      {/* Section Label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingHorizontal: 4 }}>
        <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: SiagaColors.info }} />
        <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
      </View>

      <View style={{
        backgroundColor: '#fff', borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: '#edf2f9',
        elevation: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
        gap: 14,
      }}>
        {fields.map((field, idx) => {
          const IconComp = field.icon;
          return (
            <View key={field.key}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 2 }}>
                {field.label}
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                opacity: field.editable === false ? 0.65 : 1,
              }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 11,
                  backgroundColor: `${field.iconColor}18`,
                  alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}>
                  <IconComp size={18} color={field.iconColor} weight="duotone" />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={{
                      fontSize: 14, fontWeight: '700', color: SiagaColors.primary,
                      paddingVertical: 4,
                      minHeight: field.multiline ? 60 : 32,
                      textAlignVertical: field.multiline ? 'top' : 'center',
                    }}
                    value={field.value}
                    onChangeText={(val) => updateField(field.key, val)}
                    placeholder={field.placeholder}
                    placeholderTextColor={SiagaColors.secondary}
                    keyboardType={field.keyboardType || 'default'}
                    multiline={field.multiline}
                    editable={field.editable !== false}
                  />
                  {field.editable === false && (
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 2 }}>
                      Tidak dapat diubah — hubungi admin
                    </Text>
                  )}
                </View>
              </View>
              {idx < fields.length - 1 && (
                <View style={{ height: 1, backgroundColor: '#f4f7fb', marginTop: 14 }} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <View style={{
        paddingTop: insets.top + 8, paddingBottom: 12, paddingHorizontal: 20,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <TouchableOpacity
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f4f7fb', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={SiagaColors.primary} weight="bold" />
        </TouchableOpacity>
        <Text style={{ fontSize: 14, fontWeight: '800', color: SiagaColors.primary }}>Edit Profil Pemerintah</Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
            backgroundColor: isSaving ? '#e2e8f0' : SiagaColors.primary,
          }}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <FloppyDisk size={14} color="#fff" weight="bold" />
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        >
          {/* ── Avatar ─────────────────────────────────────────── */}
          <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 16 }}>
            <View style={{ position: 'relative' }}>
              <View style={{
                width: 88, height: 88, borderRadius: 44,
                backgroundColor: SiagaColors.info,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 3, borderColor: 'rgba(52,152,219,0.2)',
                elevation: 4, shadowColor: SiagaColors.info,
                shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
              }}>
                <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff' }}>
                  {user?.initials || 'GU'}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 30, height: 30, borderRadius: 15,
                  backgroundColor: SiagaColors.primary,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2.5, borderColor: '#fff',
                  elevation: 3,
                }}
                activeOpacity={0.7}
              >
                <Camera size={14} color="#fff" weight="bold" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 8 }}>Tap ikon kamera untuk mengganti foto</Text>
          </View>

          {/* ── Verification Banner ────────────────────────────── */}
          <View style={{
            marginHorizontal: 20, marginBottom: 20,
            backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#dbeafe',
            borderRadius: 16, padding: 14,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={20} color={SiagaColors.info} weight="duotone" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: SiagaColors.primary }}>Akun Terverifikasi</Text>
                <CheckCircle size={13} color={SiagaColors.success} weight="fill" />
              </View>
              <Text style={{ fontSize: 11, color: SiagaColors.secondary, marginTop: 2 }}>
                Terdaftar sebagai Aparatur Sipil Negara
              </Text>
            </View>
          </View>

          {/* ── Form Sections ──────────────────────────────────── */}
          <View style={{ paddingHorizontal: 20 }}>
            {renderFieldGroup('Data Identitas', identityFields)}
            {renderFieldGroup('Jabatan & Kepegawaian', positionFields)}
            {renderFieldGroup('Kontak & Wilayah', contactFields)}
          </View>

          {/* ── Info Box ───────────────────────────────────────── */}
          <View style={{
            marginHorizontal: 20, marginTop: 4,
            backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a',
            borderRadius: 16, padding: 14,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#92400e', marginBottom: 4 }}>
              Informasi Penting
            </Text>
            <Text style={{ fontSize: 11, color: '#92400e', lineHeight: 17 }}>
              Data kepegawaian (NIP, Jabatan, Golongan, dll) dikelola oleh admin sistem. 
              Untuk perubahan data kepegawaian, silakan hubungi administrator melalui menu Pengaturan → Kirim Feedback.
            </Text>
          </View>

          {/* ── Membership Info ────────────────────────────────── */}
          <View style={{
            marginHorizontal: 20, marginTop: 16,
            backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
            borderRadius: 16, padding: 16,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Informasi Akun
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>ID Pengguna</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                  {user?.id?.slice(0, 8) || '-'}...
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>Role</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <ShieldCheck size={11} color={SiagaColors.info} weight="fill" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: SiagaColors.info }}>Pemerintah</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: SiagaColors.secondary }}>Laporan Ditangani</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: SiagaColors.primary }}>{user?.totalReports || 0}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
