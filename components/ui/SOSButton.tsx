import React from 'react';
import { TouchableOpacity } from 'react-native';
import { WarningDiamond } from 'phosphor-react-native';

interface SOSButtonProps {
    onPress: () => void;
    bottom?: number;
}

export default function SOSButton({ onPress, bottom = 88 }: SOSButtonProps) {
    return (
        <TouchableOpacity
            className="absolute right-5 w-14 h-14 rounded-full items-center justify-center z-40"
            style={{
                bottom,
                backgroundColor: '#e74c3c',
                shadowColor: '#e74c3c',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
            }}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <WarningDiamond size={24} color="#fff" weight="duotone" />
        </TouchableOpacity>
    );
}
