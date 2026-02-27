import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Camera, UserCircle, Envelope, Phone, MapPin,
  CalendarBlank, GenderIntersex, House, PencilSimple, CheckCircle,
  FloppyDisk, IdentificationCard,
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
}

export default function EditProfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: user?.fullName || '',
    bio: 'Warga aktif yang peduli lingkungan dan infrastruktur kota.',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: '',
    gender: '',
    address: '',
    district: user?.district || '',
    city: user?.city || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const fields: FormField[] = [
    { key: 'name', label: 'Nama Lengkap', icon: UserCircle, iconColor: SiagaColors.primary, value: form.name, placeholder: 'Masukkan nama lengkap' },
    { key: 'bio', label: 'Bio', icon: PencilSimple, iconColor: '#7c3aed', value: form.bio, placeholder: 'Tulis bio singkat...', multiline: true },
    { key: 'email', label: 'Email', icon: Envelope, iconColor: '#3b82f6', value: form.email, placeholder: 'email@example.com', keyboardType: 'email-address' },
    { key: 'phone', label: 'No. Telepon', icon: Phone, iconColor: '#059669', value: form.phone, placeholder: '+62xxx', keyboardType: 'phone-pad' },
    { key: 'birthDate', label: 'Tanggal Lahir', icon: CalendarBlank, iconColor: '#f59e0b', value: form.birthDate, placeholder: 'DD MMMM YYYY' },
    { key: 'gender', label: 'Jenis Kelamin', icon: GenderIntersex, iconColor: '#ec4899', value: form.gender, placeholder: 'Laki-laki / Perempuan' },
    { key: 'address', label: 'Alamat', icon: House, iconColor: '#ea580c', value: form.address, placeholder: 'Masukkan alamat lengkap', multiline: true },
    { key: 'district', label: 'Kecamatan', icon: MapPin, iconColor: SiagaColors.info, value: form.district, placeholder: 'Kecamatan', editable: false },
    { key: 'city', label: 'Kota', icon: MapPin, iconColor: SiagaColors.info, value: form.city, placeholder: 'Kota', editable: false },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    const result = await apiPatch('/auth/profile', {
      fullName: form.name,
      email: form.email,
      phone: form.phone,
      district: form.district,
      city: form.city,
    });
    setIsSaving(false);
    if (result.success) {
      if (refreshUser) await refreshUser();
      showToast({ type: 'success', title: 'Berhasil! ✅', message: 'Profil berhasil diperbarui.' });
      router.back();
    } else {
      showToast({ type: 'error', title: 'Gagal', message: result.message || 'Terjadi kesalahan saat menyimpan profil.' });
    }
  };

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

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
        <Text className="text-sm font-bold text-primary">Edit Profil</Text>
        <TouchableOpacity
          className="px-3.5 py-2 rounded-xl flex-row items-center gap-1.5"
          style={{ backgroundColor: isSaving ? '#e2e8f0' : SiagaColors.primary }}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <FloppyDisk size={14} color="#fff" weight="bold" />
          <Text className="text-xs font-bold text-white">{isSaving ? 'Menyimpan...' : 'Simpan'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Avatar Section */}
          <View className="items-center pt-6 pb-4">
            <View className="relative">
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{ backgroundColor: SiagaColors.primary, elevation: 4, shadowColor: SiagaColors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
              >
                <Text className="text-3xl font-bold text-white">{user?.initials || 'U'}</Text>
              </View>
              <TouchableOpacity
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-white"
                style={{ backgroundColor: SiagaColors.info, elevation: 3 }}
                activeOpacity={0.7}
              >
                <Camera size={14} color="#fff" weight="bold" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-secondary mt-2">Tap ikon kamera untuk mengganti foto</Text>
          </View>

          {/* Verification Banner */}
          <View className="mx-5 mb-4 bg-green-50 border border-green-100 rounded-2xl p-3.5 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
              <IdentificationCard size={20} color="#059669" weight="duotone" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-bold text-primary">Identitas Terverifikasi</Text>
                <CheckCircle size={12} color="#059669" weight="fill" />
              </View>
              <Text className="text-[11px] text-secondary mt-0.5">KTP telah diverifikasi pada 10 Jan 2026</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View className="px-5 gap-3.5">
            {fields.map((field) => {
              const IconComp = field.icon;
              return (
                <View key={field.key}>
                  <Text className="text-xs font-semibold text-primary mb-1.5 ml-1">{field.label}</Text>
                  <View
                    className="bg-white border border-slate-100 rounded-xl flex-row items-start gap-3 px-3.5 py-3"
                    style={{ elevation: 1, opacity: field.editable === false ? 0.6 : 1 }}
                  >
                    <View className="w-8 h-8 rounded-lg items-center justify-center mt-0.5" style={{ backgroundColor: `${field.iconColor}12` }}>
                      <IconComp size={16} color={field.iconColor} weight="duotone" />
                    </View>
                    <TextInput
                      className="flex-1 text-[13px] text-primary py-0"
                      value={field.value}
                      onChangeText={(val) => updateField(field.key, val)}
                      placeholder={field.placeholder}
                      placeholderTextColor={SiagaColors.secondary}
                      keyboardType={field.keyboardType || 'default'}
                      multiline={field.multiline}
                      editable={field.editable !== false}
                      style={{
                        minHeight: field.multiline ? 60 : 32,
                        textAlignVertical: field.multiline ? 'top' : 'center',
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Member Info */}
          <View className="mx-5 mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <Text className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">Informasi Keanggotaan</Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-secondary">Bergabung sejak</Text>
                <Text className="text-xs font-semibold text-primary">-</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-secondary">ID Pengguna</Text>
                <Text className="text-xs font-semibold text-primary font-mono">{user?.id?.slice(0, 8) || '-'}...</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-secondary">Total Laporan</Text>
                <Text className="text-xs font-semibold text-primary">{user?.totalReports || 0}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-secondary">Total Aksi</Text>
                <Text className="text-xs font-semibold text-primary">{user?.totalActions || 0}</Text>
              </View>
            </View>
          </View>

          {/* Delete Account */}
          <View className="mx-5 mt-5">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-red-200 bg-red-50"
              activeOpacity={0.7}
              onPress={() => Alert.alert(
                'Hapus Akun',
                'Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.',
                [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Hapus', style: 'destructive', onPress: () => Alert.alert('Info', 'Fitur ini memerlukan backend.') },
                ]
              )}
            >
              <Text className="text-[13px] font-semibold text-danger">Hapus Akun</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
