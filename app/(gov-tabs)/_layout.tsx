import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import {
    SquaresFour, ClipboardText, MapTrifold, ChartPieSlice, UserCircle,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

const GOV_TAB_ITEMS = [
    { name: 'index', label: 'Beranda', Icon: SquaresFour },
    { name: 'laporan', label: 'Laporan', Icon: ClipboardText },
    { name: 'peta', label: 'Peta', Icon: MapTrifold },
    { name: 'budget', label: 'Budget', Icon: ChartPieSlice },
    { name: 'profil-gov', label: 'Profil', Icon: UserCircle },
];

export default function GovTabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    borderTopColor: '#f1f5f9',
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 6,
                    elevation: 8,
                    shadowColor: SiagaColors.primary,
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: SiagaColors.info,
                tabBarInactiveTintColor: SiagaColors.secondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            {GOV_TAB_ITEMS.map(({ name, label, Icon }) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{
                        title: label,
                        tabBarIcon: ({ color, focused }) => (
                            <View className="items-center">
                                <Icon size={26} color={color} weight={focused ? 'fill' : 'duotone'} />
                                {focused && (
                                    <View
                                        className="w-5 h-[3px] rounded-full mt-0.5"
                                        style={{ backgroundColor: SiagaColors.info }}
                                    />
                                )}
                            </View>
                        ),
                        ...(name === 'laporan' ? {
                            tabBarBadge: 12,
                            tabBarBadgeStyle: {
                                backgroundColor: SiagaColors.danger,
                                color: '#fff',
                                fontSize: 8,
                                fontWeight: '700',
                                minWidth: 16,
                                height: 16,
                                borderRadius: 8,
                            },
                        } : {}),
                    }}
                />
            ))}
        </Tabs>
    );
}
