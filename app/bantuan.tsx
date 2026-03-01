import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, MagnifyingGlass, CaretDown, CaretUp,
  Megaphone, Leaf, ShieldCheck, Lock, HandsClapping,
  Siren, ChatCircle, EnvelopeSimple, Phone,
  Question, BookOpen,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

// ── FAQ Data (konstanta lokal — tidak perlu API dinamis untuk MVP) ──
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  { id: 'faq_01', question: 'Bagaimana cara membuat laporan?', answer: 'Buka tab Lapor, ambil foto, isi detail lokasi dan deskripsi masalah, lalu kirim. Laporan Anda akan diverifikasi oleh warga sekitar sebelum diteruskan ke dinas terkait.', category: 'Laporan' },
  { id: 'faq_02', question: 'Apa itu Eco-Points?', answer: 'Eco-Points adalah poin reward yang didapat saat berkontribusi di SIAGA. Anda mendapat poin dari membuat laporan (+10), berpartisipasi dalam aksi (+50), mendukung laporan (+5), dan memverifikasi (+5). Poin dapat ditukar dengan badge dan hadiah.', category: 'Eco-Points' },
  { id: 'faq_03', question: 'Bagaimana cara mendapatkan badge?', answer: 'Badge didapatkan berdasarkan akumulasi Eco-Points dan aktivitas. Setiap level badge memiliki threshold poin tertentu. Contoh: Warga Peduli (100 pts), Relawan Aktif (200 pts), Pahlawan Komunitas (300 pts).', category: 'Badge' },
  { id: 'faq_04', question: 'Apakah laporan saya anonim?', answer: 'Secara default, nama pelapor ditampilkan untuk membangun kepercayaan. Namun, Anda bisa memilih opsi anonim saat membuat laporan jika diperlukan.', category: 'Privasi' },
  { id: 'faq_05', question: 'Bagaimana proses penanganan laporan?', answer: 'Setelah dibuat, laporan akan diverifikasi warga (min. 3 verifikasi), lalu diteruskan ke dinas terkait. Tim lapangan akan dikirim dan progress bisa dipantau real-time melalui halaman Pantau.', category: 'Laporan' },
  { id: 'faq_06', question: 'Apa itu fitur SOS darurat?', answer: 'Fitur SOS memungkinkan Anda mengirim sinyal darurat beserta lokasi GPS ke layanan darurat (112), pemadam (113), ambulance (118), dan polisi (110) dalam satu ketukan.', category: 'Darurat' },
  { id: 'faq_07', question: 'Bagaimana cara berpartisipasi dalam aksi positif?', answer: 'Buka halaman Beranda, scroll ke bagian Aksi Positif, dan pilih aksi yang ingin diikuti. Klik "Gabung" untuk mendaftar. Anda akan mendapat notifikasi saat acara dimulai.', category: 'Aksi Positif' },
  { id: 'faq_08', question: 'Apakah data saya aman?', answer: 'Ya, SIAGA menggunakan enkripsi end-to-end dan mematuhi standar keamanan data. Data lokasi hanya digunakan saat diperlukan. Anda dapat mengelola pengaturan privasi di menu Pengaturan.', category: 'Privasi' },
];

const CATEGORY_ICONS: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  Laporan: { icon: Megaphone, color: '#3b82f6', bg: '#eff6ff' },
  'Eco-Points': { icon: Leaf, color: '#059669', bg: '#ecfdf5' },
  Badge: { icon: ShieldCheck, color: '#f59e0b', bg: '#fef3c7' },
  Privasi: { icon: Lock, color: '#7c3aed', bg: '#f5f3ff' },
  Darurat: { icon: Siren, color: '#dc2626', bg: '#fef2f2' },
  'Aksi Positif': { icon: HandsClapping, color: '#ea580c', bg: '#fff7ed' },
};

const CATEGORIES = ['Semua', ...Object.keys(CATEGORY_ICONS)];

export default function BantuanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredFAQ = FAQ_DATA.filter(faq => {
    const matchCategory = activeCategory === 'Semua' || faq.category === activeCategory;
    const matchSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <View className="flex-1 bg-[#f8fafd]">
      {/* Header */}
      <View
        className="px-5 pb-4 border-b border-slate-100"
        style={{ paddingTop: insets.top + 8, backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={SiagaColors.primary} weight="bold" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-primary">Bantuan & FAQ</Text>
          <View className="w-9" />
        </View>

        {/* Search */}
        <View className="bg-[#f1f6fc] rounded-xl px-3.5 py-2.5 flex-row items-center gap-2">
          <MagnifyingGlass size={16} color={SiagaColors.secondary} weight="duotone" />
          <TextInput
            className="flex-1 text-[13px] text-primary"
            placeholder="Cari pertanyaan..."
            placeholderTextColor={SiagaColors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 6 }}>
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={i}
                className="px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: isActive ? SiagaColors.primary : '#f1f5f9',
                }}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Text className="text-[11px] font-semibold" style={{ color: isActive ? '#fff' : SiagaColors.secondary }}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* FAQ Header */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 rounded-lg bg-purple-50 items-center justify-center">
            <BookOpen size={16} color="#7c3aed" weight="duotone" />
          </View>
          <View>
            <Text className="text-base font-bold text-primary">Pertanyaan Umum</Text>
            <Text className="text-[11px] text-secondary">{filteredFAQ.length} pertanyaan ditemukan</Text>
          </View>
        </View>

        {/* FAQ List */}
        <View className="gap-2.5">
          {filteredFAQ.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const catInfo = CATEGORY_ICONS[faq.category] || { icon: Question, color: SiagaColors.secondary, bg: '#f1f5f9' };
            const CatIcon = catInfo.icon;

            return (
              <TouchableOpacity
                key={faq.id}
                className="bg-white border rounded-2xl overflow-hidden"
                style={{
                  borderColor: isExpanded ? `${catInfo.color}30` : '#f1f5f9',
                  elevation: isExpanded ? 2 : 1,
                }}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View className="p-3.5 flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: catInfo.bg }}>
                    <CatIcon size={16} color={catInfo.color} weight="duotone" />
                  </View>
                  <Text className="flex-1 text-sm font-semibold text-primary leading-4">{faq.question}</Text>
                  {isExpanded
                    ? <CaretUp size={14} color={catInfo.color} weight="bold" />
                    : <CaretDown size={14} color={SiagaColors.secondary} />
                  }
                </View>
                {isExpanded && (
                  <View className="px-3.5 pb-3.5 pt-0 ml-12">
                    <View className="bg-slate-50 rounded-xl p-3">
                      <Text className="text-xs text-primary/70 leading-5">{faq.answer}</Text>
                    </View>
                    <View className="mt-2 flex-row items-center gap-1">
                      <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: catInfo.bg }}>
                        <Text className="text-[10px] font-bold" style={{ color: catInfo.color }}>{faq.category}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredFAQ.length === 0 && (
          <View className="items-center justify-center py-16">
            <Question size={40} color={SiagaColors.secondary} weight="duotone" />
            <Text className="text-sm font-semibold text-secondary mt-3">Tidak ditemukan</Text>
            <Text className="text-[11px] text-secondary/60 mt-1 text-center">Coba kata kunci atau kategori lain</Text>
          </View>
        )}

        {/* Contact Section */}
        <View className="mt-6">
          <Text className="text-base font-bold text-primary mb-3">Masih butuh bantuan?</Text>
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
              onPress={() => router.push('/feedback')}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-lg bg-green-50 items-center justify-center">
                <ChatCircle size={18} color="#059669" weight="duotone" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-primary">Kirim Feedback</Text>
                <Text className="text-[11px] text-secondary">Saran & masukan untuk SIAGA</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white border border-slate-100 rounded-xl p-3.5 flex-row items-center gap-3"
              style={{ elevation: 1 }}
              onPress={() => Linking.openURL('tel:112')}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-lg bg-red-50 items-center justify-center">
                <Phone size={18} color="#dc2626" weight="duotone" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-primary">Hotline Darurat</Text>
                <Text className="text-[11px] text-secondary">112 (24 jam)</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
