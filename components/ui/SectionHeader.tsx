import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    subtitle?: string;
}

export default function SectionHeader({ title, icon, actionLabel = 'Semua', onAction, subtitle }: SectionHeaderProps) {
    return (
        <View className="flex-row items-center justify-between mb-3">
            <View>
                <View className="flex-row items-center gap-1.5">
                    {icon}
                    <Text className="text-sm font-bold text-primary">{title}</Text>
                </View>
                {subtitle && (
                    <Text className="text-[10px] text-secondary mt-0.5">{subtitle}</Text>
                )}
            </View>
            {onAction && (
                <TouchableOpacity className="flex-row items-center gap-0.5" onPress={onAction}>
                    <Text className="text-[11px] font-semibold text-info">{actionLabel}</Text>
                    <CaretRight size={10} color={SiagaColors.info} />
                </TouchableOpacity>
            )}
        </View>
    );
}
