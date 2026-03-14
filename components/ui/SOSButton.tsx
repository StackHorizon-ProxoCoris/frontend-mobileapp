import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';
import { WarningDiamond } from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

interface SOSButtonProps {
    onPress: () => void;
    bottom?: number;
}

export default function SOSButton({ onPress, bottom = 88 }: SOSButtonProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.5, duration: 1200, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
                    Animated.timing(opacityAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
                ]),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <View className="absolute right-5 z-40 items-center" style={{ bottom }}>
            {/* Pulse ring */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: 60, height: 60, borderRadius: 30,
                    borderWidth: 3, borderColor: SiagaColors.danger,
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim,
                }}
            />
            {/* Main button */}
            <TouchableOpacity
                className="w-[60px] h-[60px] rounded-full items-center justify-center"
                style={{
                    backgroundColor: SiagaColors.danger,
                    shadowColor: SiagaColors.danger,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                }}
                onPress={onPress}
                activeOpacity={0.8}
                hitSlop={6}
            >
                <WarningDiamond size={22} color="#fff" weight="fill" />
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900', marginTop: -1, letterSpacing: 1.2 }}>SOS</Text>
            </TouchableOpacity>
        </View>
    );
}
