import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Linking } from 'react-native';
import { Warning, Waves, Mountains, Car, Fire, X, Phone } from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

interface SOSModalProps {
    visible: boolean;
    onClose: () => void;
}

const emergencyTypes = [
    { icon: Waves, label: 'Banjir', color: '#3b82f6', bgColor: '#dbeafe', borderColor: '#bfdbfe', phone: '112' },
    { icon: Mountains, label: 'Longsor', color: '#b45309', bgColor: '#fef3c7', borderColor: '#fde68a', phone: '112' },
    { icon: Car, label: 'Kecelakaan', color: '#475569', bgColor: '#f1f5f9', borderColor: '#cbd5e1', phone: '110' },
    { icon: Fire, label: 'Kebakaran', color: SiagaColors.danger, bgColor: '#fee2e2', borderColor: '#fca5a5', phone: '113', autoCall: true },
];

export default function SOSModal({ visible, onClose }: SOSModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity className="flex-1 bg-black/60" activeOpacity={1} onPress={onClose}>
                <View className="flex-1" />
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View className="bg-white rounded-t-3xl px-5 pt-3 pb-8">
                        <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-4" />
                        <View className="items-center mb-1">
                            <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mb-2">
                                <Warning size={24} color={SiagaColors.danger} weight="duotone" />
                            </View>
                            <Text className="text-base font-bold text-primary text-center">Pilih Jenis Darurat</Text>
                            <Text className="text-[11px] text-secondary text-center mt-1">Bantuan akan segera dikirim ke lokasi Anda</Text>
                        </View>

                        <View className="flex-row flex-wrap gap-3 mt-4 mb-4">
                            {emergencyTypes.map((item, i) => (
                                <TouchableOpacity
                                    key={i}
                                    className="w-[48%] border-2 rounded-2xl p-4 items-center"
                                    style={{ borderColor: item.borderColor, backgroundColor: item.autoCall ? '#fef2f2' : '#fff' }}
                                    onPress={() => { Linking.openURL(`tel:${item.phone}`); onClose(); }}
                                >
                                    {item.autoCall && (
                                        <View className="absolute top-2 right-2 bg-danger px-1.5 py-0.5 rounded-full flex-row items-center gap-0.5">
                                            <Phone size={8} color="#fff" weight="bold" />
                                            <Text className="text-[7px] font-bold text-white">AUTO CALL</Text>
                                        </View>
                                    )}
                                    <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: item.bgColor }}>
                                        <item.icon size={28} color={item.color} weight="duotone" />
                                    </View>
                                    <Text className="text-xs font-bold" style={{ color: item.autoCall ? SiagaColors.danger : SiagaColors.primary }}>{item.label}</Text>
                                    <View className="flex-row items-center gap-1 mt-0.5">
                                        <Phone size={9} color={SiagaColors.secondary} />
                                        <Text className="text-[9px] text-secondary">{item.autoCall ? `Langsung call ${item.phone}` : 'SOS + Quick Call'}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity className="w-full py-3 rounded-xl bg-slate-100 items-center flex-row justify-center gap-1.5" onPress={onClose}>
                            <X size={14} color={SiagaColors.secondary} />
                            <Text className="text-sm font-semibold text-secondary">Batal</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
