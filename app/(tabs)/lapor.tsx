import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, Image as RNImage } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    CaretLeft, ClockCounterClockwise, WarningCircle, HandsClapping, Microphone,
    SquaresFour, Waves, RoadHorizon, Trash, Mountains, Tree, DotsThreeCircle,
    Camera, CameraPlus, Plus, Robot, TextAlignLeft, MapPin, GpsFix,
    CheckCircle, Broadcast, ShieldCheck, PaperPlaneTilt, Star,
    HandHeart, Broom, Wrench, Plant, UsersThree, Image,
    Info, Translate, Stop, Check, PencilSimple,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';
import { useAuth } from '@/context/auth';
import { useToast } from '@/contexts/toast.context';
import { createReport } from '@/services/report.service';
import { createAction } from '@/services/action.service';
import { apiUpload } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

type TabType = 'masalah' | 'aksi' | 'voice';

const CATEGORIES = [
    { icon: Waves, label: 'Banjir', color: '#2563eb', bg: '#eff6ff' },
    { icon: RoadHorizon, label: 'Jalan Rusak', color: '#d97706', bg: '#fffbeb' },
    { icon: Trash, label: 'Sampah', color: '#059669', bg: '#ecfdf5' },
    { icon: Mountains, label: 'Longsor', color: '#ea580c', bg: '#fff7ed' },
    { icon: Tree, label: 'Pohon', color: '#16a34a', bg: '#f0fdf4' },
    { icon: DotsThreeCircle, label: 'Lainnya', color: '#475569', bg: '#f8fafc' },
];

const AKSI_TYPES = [
    { icon: Broom, label: 'Bersih-bersih', color: '#059669', bg: '#ecfdf5' },
    { icon: Wrench, label: 'Perbaikan', color: '#2563eb', bg: '#eff6ff' },
    { icon: Plant, label: 'Tanam Pohon', color: '#16a34a', bg: '#f0fdf4' },
    { icon: UsersThree, label: 'Gotong Royong', color: '#d97706', bg: '#fffbeb' },
];

export default function LaporScreen() {
    const [tab, setTab] = useState<TabType>('masalah');
    const [selectedCat, setSelectedCat] = useState<string | null>(null);
    const [selectedAksi, setSelectedAksi] = useState<string | null>(null);
    const [sosVisible, setSosVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [aksiDesc, setAksiDesc] = useState('');
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [photos, setPhotos] = useState<{ uri: string; uploadedUrl?: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showToast({ type: 'warning', title: 'Izin Diperlukan', message: 'Izinkan akses ke galeri untuk menambahkan foto.' });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsMultipleSelection: true,
            selectionLimit: 3 - photos.length,
        });
        if (!result.canceled && result.assets) {
            const newPhotos = result.assets.map(a => ({ uri: a.uri }));
            setPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            showToast({ type: 'warning', title: 'Izin Diperlukan', message: 'Izinkan akses ke kamera untuk mengambil foto.' });
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
            setPhotos(prev => [...prev, { uri: result.assets[0].uri }].slice(0, 3));
        }
    };

    const uploadPhotos = async (): Promise<string[]> => {
        const urls: string[] = [];
        for (const photo of photos) {
            if (photo.uploadedUrl) { urls.push(photo.uploadedUrl); continue; }
            const formData = new FormData();
            const filename = photo.uri.split('/').pop() || 'photo.jpg';
            formData.append('file', { uri: photo.uri, name: filename, type: 'image/jpeg' } as any);
            const result = await apiUpload<{ url: string }>('/upload', formData);
            if (result.success && result.data?.url) {
                urls.push(result.data.url);
            }
        }
        return urls;
    };

    const tabs: { key: TabType; label: string; icon: any }[] = [
        { key: 'masalah', label: 'Lapor Masalah', icon: WarningCircle },
        { key: 'aksi', label: 'Lapor Aksi', icon: HandsClapping },
        { key: 'voice', label: 'Suara', icon: Microphone },
    ];

    return (
        <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-5 pt-4 pb-3 bg-white border-b border-slate-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center">
                            <CaretLeft size={16} color={SiagaColors.primary} />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-base font-bold text-primary">Buat Laporan</Text>
                            <Text className="text-[12px] text-secondary">Laporkan masalah di sekitar Anda</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center">
                        <ClockCounterClockwise size={20} color={SiagaColors.primary} weight="duotone" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, gap: 20 }}>
                {/* Tab Selector */}
                <View className="bg-white rounded-2xl p-1 border border-slate-100 flex-row gap-1" style={{ elevation: 1 }}>
                    {tabs.map((t) => (
                        <TouchableOpacity
                            key={t.key}
                            className="flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5"
                            style={{ backgroundColor: tab === t.key ? SiagaColors.primary : 'transparent' }}
                            onPress={() => setTab(t.key)}
                        >
                            <t.icon size={16} color={tab === t.key ? '#fff' : SiagaColors.secondary} weight="duotone" />
                            <Text className="text-[13px]" style={{ fontWeight: tab === t.key ? '700' : '600', color: tab === t.key ? '#fff' : SiagaColors.secondary }}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* TAB: MASALAH */}
                {tab === 'masalah' && (
                    <>
                        {/* Categories */}
                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <SquaresFour size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Pilih Kategori</Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {CATEGORIES.map((cat, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        className="w-[31%] border-2 rounded-2xl p-3 items-center gap-1.5"
                                        style={{
                                            borderColor: selectedCat === cat.label ? SiagaColors.primary : '#f1f5f9',
                                            backgroundColor: selectedCat === cat.label ? SiagaColors.surface : '#fff',
                                        }}
                                        onPress={() => setSelectedCat(cat.label)}
                                    >
                                        {selectedCat === cat.label && (
                                            <View className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary items-center justify-center">
                                                <Check size={10} color="#fff" weight="bold" />
                                            </View>
                                        )}
                                        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: cat.bg }}>
                                            <cat.icon size={22} color={cat.color} weight="duotone" />
                                        </View>
                                        <Text className="text-[12px] font-semibold text-primary">{cat.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Photo Upload */}
                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <Camera size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Foto Bukti</Text>
                                <Text className="text-[10px] text-secondary">(min. 1 foto, max 3)</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {photos.map((photo, i) => (
                                    <TouchableOpacity key={i} className="w-28 h-28 rounded-2xl overflow-hidden" onPress={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}>
                                        <RNImage source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                        <View className="absolute top-1 right-1 bg-black/50 rounded-full w-5 h-5 items-center justify-center">
                                            <Text className="text-white text-[10px] font-bold">✕</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                {photos.length < 3 && (
                                    <TouchableOpacity className="w-28 h-28 rounded-2xl border-2 border-dashed border-accent bg-white items-center justify-center gap-1.5" onPress={takePhoto}>
                                        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                                            <CameraPlus size={22} color={SiagaColors.primary} weight="duotone" />
                                        </View>
                                        <Text className="text-[10px] font-semibold text-secondary">Ambil Foto</Text>
                                    </TouchableOpacity>
                                )}
                                {photos.length < 3 && (
                                    <TouchableOpacity className="w-28 h-28 rounded-2xl border-2 border-dashed border-accent bg-white items-center justify-center gap-1.5" onPress={pickImage}>
                                        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                                            <Plus size={22} color={SiagaColors.secondary} weight="duotone" />
                                        </View>
                                        <Text className="text-[10px] font-medium text-secondary">Dari Galeri</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                            <View className="flex-row items-center gap-2 mt-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                                <Robot size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[10px] text-primary/70 flex-1">Foto akan divalidasi otomatis oleh <Text className="font-semibold text-info">AI Vision</Text> — pastikan foto relevan dengan kategori.</Text>
                            </View>
                        </View>

                        {/* Description */}
                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <TextAlignLeft size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Deskripsi</Text>
                            </View>
                            <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                                <TextInput
                                    className="px-4 py-3 text-[14px] text-primary"
                                    placeholder="Judul singkat laporan Anda..."
                                    placeholderTextColor="rgba(152,172,195,0.6)"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                            </View>
                        </View>

                        {/* Description */}
                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <TextAlignLeft size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Deskripsi</Text>
                            </View>
                            <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                                <TextInput
                                    className="px-4 py-3 text-[14px] text-primary"
                                    placeholder="Ceritakan masalah yang Anda temui..."
                                    placeholderTextColor="rgba(152,172,195,0.6)"
                                    multiline numberOfLines={4}
                                    textAlignVertical="top"
                                    maxLength={500}
                                    value={description}
                                    onChangeText={setDescription}
                                    style={{ minHeight: 100 }}
                                />
                                <View className="px-4 py-2 border-t border-slate-50 flex-row items-center justify-between">
                                    <Text className="text-[10px] text-secondary">Maks. 500 karakter</Text>
                                    <Text className="text-[10px] font-semibold text-secondary">{description.length} / 500</Text>
                                </View>
                            </View>
                        </View>

                        {/* Location */}
                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <MapPin size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Lokasi</Text>
                            </View>
                            <View className="bg-white border border-slate-100 rounded-2xl p-4" style={{ elevation: 1 }}>
                                <View className="h-32 bg-surface rounded-xl items-center justify-center mb-3">
                                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                        <MapPin size={22} color={SiagaColors.primary} weight="duotone" />
                                    </View>
                                    <Text className="text-[12px] font-semibold text-primary/60 mt-1">Peta Preview</Text>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(39,174,96,0.1)' }}>
                                        <GpsFix size={20} color={SiagaColors.success} weight="duotone" />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-1">
                                            <CheckCircle size={12} color={SiagaColors.success} weight="fill" />
                                            <Text className="text-[12px] font-bold text-primary">Lokasi Terdeteksi</Text>
                                        </View>
                                        <Text className="text-[12px] text-secondary" numberOfLines={1}>Jl. Ir. H. Juanda No. 45, Kec. Coblong, Bandung</Text>
                                    </View>
                                    <TouchableOpacity><Text className="text-[10px] font-semibold text-info">Ubah</Text></TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Radius Info */}
                        <View className="bg-surface/60 border border-accent/20 rounded-2xl p-3.5">
                            <View className="flex-row gap-2.5">
                                <View className="w-8 h-8 rounded-lg bg-white items-center justify-center mt-0.5">
                                    <Broadcast size={20} color={SiagaColors.info} weight="duotone" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[13px] font-bold text-primary">Radius Visibilitas</Text>
                                    <Text className="text-[12px] text-secondary mt-0.5 leading-5">Laporan Anda akan terlihat oleh warga lain dalam radius berdasarkan kategori yang dipilih.</Text>
                                    <View className="flex-row flex-wrap gap-1.5 mt-2">
                                        {[{ icon: Waves, label: 'Banjir: 3 KM', color: '#3b82f6' }, { icon: RoadHorizon, label: 'Jalan: 1 KM', color: '#f59e0b' }, { icon: Trash, label: 'Sampah: 500 M', color: '#10b981' }].map((r, i) => (
                                            <View key={i} className="flex-row items-center gap-1 bg-white px-2 py-1 rounded-lg">
                                                <r.icon size={12} color={r.color} weight="duotone" />
                                                <Text className="text-[10px] font-semibold text-primary">{r.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            className="py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
                            style={{ backgroundColor: SiagaColors.primary, elevation: 4, opacity: isSubmitting ? 0.7 : 1 }}
                            disabled={isSubmitting}
                            onPress={async () => {
                                if (!selectedCat) { showToast({ type: 'warning', title: 'Kategori diperlukan', message: 'Pilih kategori terlebih dahulu.' }); return; }
                                if (!title.trim()) { showToast({ type: 'warning', title: 'Judul diperlukan', message: 'Masukkan judul laporan.' }); return; }
                                if (!description.trim()) { showToast({ type: 'warning', title: 'Deskripsi diperlukan', message: 'Masukkan deskripsi.' }); return; }
                                setIsSubmitting(true);
                                // Upload foto dulu
                                let photoUrls: string[] = [];
                                if (photos.length > 0) {
                                    setIsUploading(true);
                                    photoUrls = await uploadPhotos();
                                    setIsUploading(false);
                                }
                                const result = await createReport({
                                    category: selectedCat,
                                    type: selectedCat,
                                    title: title.trim(),
                                    description: description.trim(),
                                    address: 'Jl. Ir. H. Juanda No. 45, Kec. Coblong, Bandung',
                                    district: user?.district || 'Coblong',
                                    city: user?.city || 'Bandung',
                                    lat: -6.8915,
                                    lng: 107.6107,
                                    urgency: 50,
                                    photoUrls,
                                });
                                setIsSubmitting(false);
                                if (result.success) {
                                    showToast({ type: 'success', title: 'Berhasil! 🎉', message: 'Laporan Anda berhasil dikirim dan akan segera divalidasi.' });
                                    setSelectedCat(null); setTitle(''); setDescription(''); setPhotos([]);
                                } else {
                                    showToast({ type: 'error', title: 'Gagal', message: result.message || 'Terjadi kesalahan saat mengirim laporan.' });
                                }
                            }}
                        >
                            <PaperPlaneTilt size={20} color="#fff" weight="duotone" />
                            <Text className="text-[15px] font-bold text-white">Kirim Laporan</Text>
                        </TouchableOpacity>
                        <View className="flex-row items-center justify-center gap-1">
                            <ShieldCheck size={12} color={SiagaColors.success} weight="duotone" />
                            <Text className="text-[10px] text-secondary">Laporan akan divalidasi oleh AI sebelum dipublikasikan</Text>
                        </View>
                    </>
                )}

                {/* TAB: AKSI */}
                {tab === 'aksi' && (
                    <>
                        <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                            <View className="flex-row gap-3">
                                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center" style={{ elevation: 1 }}>
                                    <HandHeart size={22} color="#059669" weight="duotone" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] font-bold text-primary">Laporkan Aksi Positif</Text>
                                    <Text className="text-[12px] text-secondary mt-0.5 leading-5">Dokumentasikan kegiatan gotong royong atau perbaikan yang Anda lakukan. Upload foto sebelum & sesudah untuk mendapatkan <Text className="font-bold text-success">+50 Eco-Points</Text>.</Text>
                                </View>
                            </View>
                        </View>

                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <HandHeart size={16} color={SiagaColors.success} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Jenis Aksi</Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {AKSI_TYPES.map((a, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        className="w-[48%] border-2 rounded-2xl p-3 flex-row items-center gap-2.5"
                                        style={{
                                            borderColor: selectedAksi === a.label ? SiagaColors.primary : '#f1f5f9',
                                            backgroundColor: selectedAksi === a.label ? SiagaColors.surface : '#fff',
                                        }}
                                        onPress={() => setSelectedAksi(a.label)}
                                    >
                                        <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: a.bg }}>
                                            <a.icon size={20} color={a.color} weight="duotone" />
                                        </View>
                                        <Text className="text-[12px] font-semibold text-primary">{a.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Before/After Photos */}
                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <Image size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Foto Sebelum & Sesudah</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity className="flex-1 h-36 rounded-2xl border-2 border-dashed border-accent bg-white items-center justify-center gap-2">
                                    <View className="w-11 h-11 rounded-full bg-red-50 items-center justify-center">
                                        <Image size={22} color="rgba(231,76,60,0.7)" weight="duotone" />
                                    </View>
                                    <Text className="text-[12px] font-bold text-primary">SEBELUM</Text>
                                    <Text className="text-[10px] text-secondary">Foto kondisi awal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 h-36 rounded-2xl border-2 border-dashed border-accent bg-white items-center justify-center gap-2">
                                    <View className="w-11 h-11 rounded-full bg-emerald-50 items-center justify-center">
                                        <Image size={22} color="rgba(39,174,96,0.7)" weight="duotone" />
                                    </View>
                                    <Text className="text-[12px] font-bold text-primary">SESUDAH</Text>
                                    <Text className="text-[10px] text-secondary">Foto hasil aksi</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                            <TextInput className="px-4 py-3 text-[14px] text-primary" placeholder="Ceritakan kegiatan apa yang dilakukan..." placeholderTextColor="rgba(152,172,195,0.6)" multiline numberOfLines={3} textAlignVertical="top" style={{ minHeight: 80 }} value={aksiDesc} onChangeText={setAksiDesc} />
                        </View>

                        <TouchableOpacity
                            className="py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
                            style={{ backgroundColor: '#10b981', elevation: 4, opacity: isSubmitting ? 0.7 : 1 }}
                            disabled={isSubmitting}
                            onPress={async () => {
                                if (!selectedAksi) { showToast({ type: 'warning', title: 'Aksi diperlukan', message: 'Pilih jenis aksi terlebih dahulu.' }); return; }
                                if (!aksiDesc.trim()) { showToast({ type: 'warning', title: 'Deskripsi diperlukan', message: 'Masukkan deskripsi aksi.' }); return; }
                                setIsSubmitting(true);
                                const result = await createAction({
                                    category: selectedAksi,
                                    type: selectedAksi,
                                    title: `${selectedAksi} — ${user?.district || 'Area'}`,
                                    description: aksiDesc.trim(),
                                    address: user?.district || 'Area lokal',
                                    district: user?.district || '',
                                    city: user?.city || '',
                                    lat: -6.8915,
                                    lng: 107.6107,
                                });
                                setIsSubmitting(false);
                                if (result.success) {
                                    showToast({ type: 'success', title: 'Berhasil! 🎉', message: 'Aksi positif Anda berhasil dikirim!' });
                                    setSelectedAksi(null); setAksiDesc('');
                                } else {
                                    showToast({ type: 'error', title: 'Gagal', message: result.message || 'Terjadi kesalahan.' });
                                }
                            }}
                        >
                            <PaperPlaneTilt size={20} color="#fff" weight="duotone" />
                            <Text className="text-[15px] font-bold text-white">Kirim Laporan Aksi</Text>
                        </TouchableOpacity>
                        <View className="flex-row items-center justify-center gap-1">
                            <Star size={12} color="#fbbf24" weight="duotone" />
                            <Text className="text-[10px] text-secondary">Dapatkan +50 Eco-Points jika tervalidasi</Text>
                        </View>
                    </>
                )}

                {/* TAB: VOICE */}
                {tab === 'voice' && (
                    <>
                        <View className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
                            <View className="flex-row gap-3">
                                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center" style={{ elevation: 1 }}>
                                    <Microphone size={22} color="#7c3aed" weight="duotone" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] font-bold text-primary">Lapor dengan Suara</Text>
                                    <Text className="text-[12px] text-secondary mt-0.5 leading-5">Ceritakan masalah Anda secara lisan. AI akan otomatis mengisi form laporan berdasarkan cerita Anda.</Text>
                                </View>
                            </View>
                        </View>

                        <View>
                            <View className="flex-row items-center gap-1.5 mb-3">
                                <Translate size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary uppercase tracking-wider">Bahasa</Text>
                            </View>
                            <View className="flex-row gap-2">
                                <TouchableOpacity className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5" style={{ backgroundColor: SiagaColors.primary }}>
                                    <Text className="text-[13px] font-bold text-white">🇮🇩 Indonesia</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 py-2.5 rounded-xl bg-white border border-slate-100 items-center justify-center flex-row gap-1.5">
                                    <Text className="text-[13px] font-semibold text-secondary">🇬🇧 English</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="bg-white border border-slate-100 rounded-3xl p-8 items-center" style={{ elevation: 1 }}>
                            <TouchableOpacity className="w-24 h-24 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#7c3aed', elevation: 4 }}>
                                <Microphone size={36} color="#fff" weight="duotone" />
                            </TouchableOpacity>
                            <Text className="text-[14px] font-bold text-primary">Tekan untuk mulai</Text>
                            <Text className="text-[12px] text-secondary mt-1">Tap mikrofon dan ceritakan masalah Anda</Text>
                        </View>

                        {/* AI Result */}
                        <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden" style={{ elevation: 1 }}>
                            <View className="px-4 py-3 border-b border-slate-50 flex-row items-center gap-2">
                                <Robot size={16} color={SiagaColors.info} weight="duotone" />
                                <Text className="text-[13px] font-bold text-primary">Hasil AI Analisis</Text>
                            </View>
                            <View className="p-4 gap-3">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-[12px] text-secondary">Kategori</Text>
                                    <View className="flex-row items-center gap-1">
                                        <RoadHorizon size={16} color="#f59e0b" weight="duotone" />
                                        <Text className="text-[12px] font-bold text-primary">Jalan Rusak</Text>
                                        <CheckCircle size={12} color={SiagaColors.success} weight="fill" />
                                    </View>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-[12px] text-secondary">Urgensi</Text>
                                    <Text className="text-[12px] font-bold" style={{ color: '#d97706' }}>Tinggi (ada korban)</Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-[12px] text-secondary">Durasi Masalah</Text>
                                    <Text className="text-[12px] font-bold text-primary">2 minggu</Text>
                                </View>
                                <View>
                                    <Text className="text-[12px] text-secondary mb-1">Deskripsi Otomatis</Text>
                                    <View className="bg-surface/50 rounded-xl p-3">
                                        <Text className="text-[13px] text-primary leading-5">"Jalan depan rumah berlubang besar, sudah 2 minggu, motor saya jatuh kemarin."</Text>
                                    </View>
                                </View>
                            </View>
                            <View className="px-4 py-3 border-t border-slate-50 flex-row gap-2">
                                <TouchableOpacity className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5" style={{ backgroundColor: SiagaColors.primary }}>
                                    <Check size={16} color="#fff" weight="fill" />
                                    <Text className="text-[13px] font-bold text-white">Ya, Benar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 items-center justify-center flex-row gap-1.5">
                                    <PencilSimple size={16} color={SiagaColors.primary} />
                                    <Text className="text-[13px] font-semibold text-primary">Edit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            <SOSButton onPress={() => setSosVisible(true)} />
            <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
        </View>
    );
}
