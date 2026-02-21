import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    CaretLeft, Robot, Info, DotsThreeVertical,
    PaperPlaneRight, Microphone, Paperclip,
    ShieldCheck, FileText, MapPin, Lightbulb, Bell,
    Sparkle, CheckCircle,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import SOSButton from '@/components/ui/SOSButton';
import SOSModal from '@/components/ui/SOSModal';

interface Message {
    id: string;
    type: 'user' | 'ai';
    text: string;
    time: string;
}

const QUICK_TOPICS = [
    { icon: ShieldCheck, label: 'Mitigasi Banjir', color: '#3b82f6', bg: '#eff6ff' },
    { icon: FileText, label: 'Cara Lapor', color: '#059669', bg: '#ecfdf5' },
    { icon: MapPin, label: 'Info Bencana', color: '#ea580c', bg: '#fff7ed' },
    { icon: Lightbulb, label: 'Tips Darurat', color: '#f59e0b', bg: '#fffbeb' },
    { icon: Bell, label: 'Hak Warga', color: '#7c3aed', bg: '#f5f3ff' },
];

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        type: 'ai',
        text: 'Halo! 👋 Saya SIAGA AI, asisten civic Anda. Saya bisa membantu Anda dengan:\n\n🛡️ Mitigasi bencana\n📝 Cara pelaporan\n📍 Info kondisi terkini\n💡 Tips keselamatan\n\nAda yang bisa saya bantu?',
        time: '12:00',
    },
];

export default function AIChatScreen() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sosVisible, setSosVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();

    const sendMessage = (text?: string) => {
        const msg = text || inputText.trim();
        if (!msg) return;

        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const userMsg: Message = { id: Date.now().toString(), type: 'user', text: msg, time };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: getAIResponse(msg),
                time,
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1500);
    };

    const getAIResponse = (q: string): string => {
        const lower = q.toLowerCase();
        if (lower.includes('banjir') || lower.includes('mitigasi')) {
            return '🌊 **Tips Mitigasi Banjir:**\n\n1. Pantau peringatan BMKG via aplikasi SIAGA\n2. Siapkan tas darurat (dokumen, obat, senter)\n3. Ketahui rute evakuasi terdekat\n4. Pastikan saluran air di sekitar rumah tidak tersumbat\n5. Simpan nomor darurat: 112\n\nJika air sudah naik, segera ke tempat tinggi dan hubungi SAR (115).';
        }
        if (lower.includes('lapor') || lower.includes('cara')) {
            return '📝 **Cara Membuat Laporan:**\n\n1. Buka tab "Lapor"\n2. Pilih kategori masalah\n3. Ambil foto bukti (min. 1 foto)\n4. Tulis deskripsi singkat\n5. Lokasi otomatis terdeteksi GPS\n6. Tap "Kirim Laporan"\n\n✅ Laporan akan divalidasi AI dalam 1-3 menit.\n⭐ Dapatkan Eco-Points untuk setiap laporan valid!';
        }
        return '✨ Terima kasih atas pertanyaan Anda! Saya sedang memproses informasi terkait.\n\nUntuk informasi darurat, gunakan tombol SOS atau hubungi:\n📞 112 (Darurat Umum)\n📞 113 (Pemadam)\n📞 118 (Ambulance)\n\nAda pertanyaan lain yang bisa saya bantu?';
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View className={`mb-3 ${item.type === 'user' ? 'items-end' : 'items-start'}`}>
            {item.type === 'ai' && (
                <View className="flex-row items-center gap-1.5 mb-1 ml-1">
                    <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.info }}>
                        <Robot size={10} color="#fff" weight="fill" />
                    </View>
                    <Text className="text-[9px] font-semibold text-secondary">SIAGA AI</Text>
                    <Text className="text-[8px] text-secondary/50">{item.time}</Text>
                </View>
            )}
            <View
                className={`px-4 py-3 max-w-[85%] ${item.type === 'user' ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
                style={{
                    backgroundColor: item.type === 'user' ? SiagaColors.primary : '#ffffff',
                    borderWidth: item.type === 'ai' ? 1 : 0,
                    borderColor: '#f1f5f9',
                    elevation: item.type === 'ai' ? 1 : 0,
                }}
            >
                <Text className="text-[12px] leading-5" style={{ color: item.type === 'user' ? '#fff' : SiagaColors.primary }}>{item.text}</Text>
            </View>
            {item.type === 'user' && (
                <View className="flex-row items-center gap-1 mt-0.5 mr-1">
                    <Text className="text-[8px] text-secondary/50">{item.time}</Text>
                    <CheckCircle size={10} color={SiagaColors.info} weight="fill" />
                </View>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-4 pt-3 pb-3 bg-white/90 border-b border-slate-100 z-30" style={{ elevation: 2 }}>
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center flex-shrink-0">
                        <CaretLeft size={14} color={SiagaColors.primary} />
                    </TouchableOpacity>
                    <View className="relative flex-shrink-0">
                        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.info }}>
                            <Robot size={20} color="#fff" weight="duotone" />
                        </View>
                        <View className="absolute -bottom-0 -right-0 w-3 h-3 bg-success rounded-full border-2 border-white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[13px] font-bold text-primary">SIAGA AI</Text>
                        <View className="flex-row items-center gap-1">
                            <View className="w-1.5 h-1.5 rounded-full bg-success" />
                            <Text className="text-[9px] font-medium text-success">Online · Civic AI Assistant</Text>
                        </View>
                    </View>
                    <View className="flex-row gap-1.5">
                        <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center">
                            <Info size={16} color={SiagaColors.primary} weight="duotone" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center">
                            <DotsThreeVertical size={16} color={SiagaColors.primary} weight="duotone" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Capability Banner */}
            {messages.length <= 1 && (
                <View className="mx-4 mt-3 rounded-2xl p-3.5" style={{ backgroundColor: SiagaColors.info }}>
                    <View className="flex-row items-start gap-2.5">
                        <View className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center mt-0.5">
                            <Sparkle size={18} color="#fff" weight="fill" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[12px] font-bold text-white">AI Assistant Baru! ✨</Text>
                            <Text className="text-[10px] text-white/80 leading-5 mt-0.5">
                                Tanyakan apa saja tentang mitigasi bencana, pelaporan warga, atau informasi keselamatan.
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Quick Topics */}
            {messages.length <= 1 && (
                <View className="px-4 mt-3 mb-1">
                    <Text className="text-[10px] font-semibold text-secondary uppercase tracking-wider mb-2">Topik Populer</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {QUICK_TOPICS.map((t, i) => (
                            <TouchableOpacity
                                key={i}
                                className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-100 bg-white"
                                onPress={() => sendMessage(t.label)}
                            >
                                <t.icon size={12} color={t.color} weight="duotone" />
                                <Text className="text-[10px] font-semibold text-primary">{t.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                className="flex-1 px-4 pt-3"
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    isTyping ? (
                        <View className="items-start mb-3">
                            <View className="flex-row items-center gap-1.5 mb-1 ml-1">
                                <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: SiagaColors.info }}>
                                    <Robot size={10} color="#fff" weight="fill" />
                                </View>
                                <Text className="text-[9px] font-semibold text-secondary">SIAGA AI</Text>
                            </View>
                            <View className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex-row items-center gap-1.5" style={{ elevation: 1 }}>
                                {[0, 1, 2].map(i => (
                                    <View key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: `rgba(52,152,219,${0.3 + i * 0.25})` }} />
                                ))}
                            </View>
                        </View>
                    ) : null
                }
            />

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View className="px-4 py-3 bg-white border-t border-slate-100" style={{ elevation: 3 }}>
                    <View className="flex-row items-end gap-2">
                        <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center">
                            <Paperclip size={16} color={SiagaColors.secondary} weight="duotone" />
                        </TouchableOpacity>
                        <View className="flex-1 bg-[#f1f6fc] rounded-2xl px-4 py-2.5 flex-row items-center">
                            <TextInput
                                className="flex-1 text-[12px] text-primary"
                                placeholder="Ketik pesan..."
                                placeholderTextColor="rgba(152,172,195,0.6)"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={() => sendMessage()}
                                returnKeyType="send"
                            />
                        </View>
                        {inputText.trim() ? (
                            <TouchableOpacity
                                className="w-9 h-9 rounded-full items-center justify-center"
                                style={{ backgroundColor: SiagaColors.primary }}
                                onPress={() => sendMessage()}
                            >
                                <PaperPlaneRight size={16} color="#fff" weight="fill" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity className="w-9 h-9 rounded-full bg-surface items-center justify-center">
                                <Microphone size={16} color={SiagaColors.primary} weight="duotone" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>

            <SOSButton onPress={() => setSosVisible(true)} bottom={68} />
            <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
        </View>
    );
}
