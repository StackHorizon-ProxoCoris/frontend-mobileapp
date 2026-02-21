import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, PaperPlaneTilt, Star, Bug, Lightbulb,
  Heart, ThumbsUp, ThumbsDown, Smiley, SmileyMeh, SmileySad,
  CheckCircle, ChatCircleDots,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

const FEEDBACK_TYPES = [
  { key: 'saran', icon: Lightbulb, label: 'Saran', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'bug', icon: Bug, label: 'Bug', color: '#dc2626', bg: '#fef2f2' },
  { key: 'pujian', icon: Heart, label: 'Pujian', color: '#ec4899', bg: '#fce7f3' },
  { key: 'lainnya', icon: ChatCircleDots, label: 'Lainnya', color: '#3b82f6', bg: '#eff6ff' },
];

const RATING_EMOJIS = [
  { value: 1, icon: SmileySad, label: 'Buruk', color: '#dc2626' },
  { value: 2, icon: SmileyMeh, label: 'Kurang', color: '#f59e0b' },
  { value: 3, icon: Smiley, label: 'Cukup', color: '#3b82f6' },
  { value: 4, icon: ThumbsUp, label: 'Bagus', color: '#059669' },
  { value: 5, icon: Star, label: 'Sempurna', color: '#f59e0b' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [feedbackType, setFeedbackType] = useState('saran');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const canSend = title.trim().length > 0 && message.trim().length > 10 && rating > 0;

  const handleSend = () => {
    if (!canSend) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1200);
  };

  if (isSent) {
    return (
      <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-5" style={{ elevation: 2 }}>
            <CheckCircle size={40} color="#059669" weight="duotone" />
          </View>
          <Text className="text-xl font-bold text-primary text-center">Terima Kasih!</Text>
          <Text className="text-[13px] text-secondary text-center mt-2 leading-5">
            Feedback Anda telah berhasil dikirim. Kami akan meninjau dan merespons dalam waktu 1-3 hari kerja.
          </Text>
          <TouchableOpacity
            className="mt-6 px-6 py-3 rounded-xl"
            style={{ backgroundColor: SiagaColors.primary }}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text className="text-[13px] font-bold text-white">Kembali ke Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text className="text-sm font-bold text-primary">Kirim Feedback</Text>
        <View className="w-9" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Intro */}
          <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
            <View className="flex-row items-center gap-2 mb-1.5">
              <ChatCircleDots size={16} color="#3b82f6" weight="duotone" />
              <Text className="text-sm font-bold text-primary">Kami Mendengarkan</Text>
            </View>
            <Text className="text-xs text-secondary leading-4">
              Saran, kritik, dan masukan Anda sangat berharga untuk membantu kami meningkatkan kualitas SIAGA.
            </Text>
          </View>

          {/* Feedback Type */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-primary mb-2.5 ml-1">Jenis Feedback</Text>
            <View className="flex-row gap-2">
              {FEEDBACK_TYPES.map((type) => {
                const isActive = feedbackType === type.key;
                const IconComp = type.icon;
                return (
                  <TouchableOpacity
                    key={type.key}
                    className="flex-1 items-center p-3 rounded-xl border-2"
                    style={{
                      borderColor: isActive ? type.color : '#f1f5f9',
                      backgroundColor: isActive ? type.bg : '#fff',
                    }}
                    onPress={() => setFeedbackType(type.key)}
                    activeOpacity={0.7}
                  >
                    <IconComp size={20} color={isActive ? type.color : SiagaColors.secondary} weight={isActive ? 'duotone' : 'regular'} />
                    <Text className="text-[11px] font-semibold mt-1" style={{ color: isActive ? type.color : SiagaColors.secondary }}>{type.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Rating */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-primary mb-2.5 ml-1">Rating Keseluruhan</Text>
            <View className="bg-white border border-slate-100 rounded-2xl p-4" style={{ elevation: 1 }}>
              <View className="flex-row justify-between">
                {RATING_EMOJIS.map((r) => {
                  const isActive = rating === r.value;
                  const IconComp = r.icon;
                  return (
                    <TouchableOpacity
                      key={r.value}
                      className="items-center p-2 rounded-xl"
                      style={{
                        backgroundColor: isActive ? `${r.color}15` : 'transparent',
                        transform: [{ scale: isActive ? 1.15 : 1 }],
                      }}
                      onPress={() => setRating(r.value)}
                      activeOpacity={0.7}
                    >
                      <IconComp size={28} color={isActive ? r.color : '#cbd5e1'} weight={isActive ? 'duotone' : 'regular'} />
                      <Text className="text-[10px] font-semibold mt-1" style={{ color: isActive ? r.color : '#94a3b8' }}>{r.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Title Input */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-primary mb-1.5 ml-1">Judul</Text>
            <View className="bg-white border border-slate-100 rounded-xl px-3.5 py-3" style={{ elevation: 1 }}>
              <TextInput
                className="text-[13px] text-primary"
                placeholder="Ringkasan feedback Anda..."
                placeholderTextColor={SiagaColors.secondary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>
            <Text className="text-[11px] text-secondary mt-1 ml-1">{title.length}/100</Text>
          </View>

          {/* Message Input */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-primary mb-1.5 ml-1">Detail Feedback</Text>
            <View className="bg-white border border-slate-100 rounded-xl px-3.5 py-3" style={{ elevation: 1 }}>
              <TextInput
                className="text-[13px] text-primary"
                placeholder="Jelaskan feedback Anda secara detail..."
                placeholderTextColor={SiagaColors.secondary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
                style={{ minHeight: 120, textAlignVertical: 'top' }}
              />
            </View>
            <Text className="text-[11px] text-secondary mt-1 ml-1">{message.length}/1000 · Minimal 10 karakter</Text>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl"
            style={{
              backgroundColor: canSend ? SiagaColors.primary : '#e2e8f0',
              elevation: canSend ? 3 : 0,
            }}
            onPress={handleSend}
            disabled={!canSend || isSending}
            activeOpacity={0.8}
          >
            <PaperPlaneTilt size={16} color={canSend ? '#fff' : '#94a3b8'} weight="bold" />
            <Text className="text-[13px] font-bold" style={{ color: canSend ? '#fff' : '#94a3b8' }}>
              {isSending ? 'Mengirim...' : 'Kirim Feedback'}
            </Text>
          </TouchableOpacity>

          {/* Privacy Note */}
          <View className="mt-4 items-center">
            <Text className="text-[10px] text-secondary text-center leading-4">
              Feedback Anda akan dikirim secara anonim kecuali Anda menyertakan informasi kontak.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
