import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { House, Megaphone, MapTrifold, ChatCenteredDots, UserCircle } from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

const TAB_ITEMS = [
  { name: 'index', label: 'Beranda', Icon: House },
  { name: 'lapor', label: 'Lapor', Icon: Megaphone },
  { name: 'pantau', label: 'Pantau', Icon: MapTrifold },
  { name: 'aichat', label: 'AI Chat', Icon: ChatCenteredDots },
  { name: 'profil', label: 'Profil', Icon: UserCircle },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: SiagaColors.primary,
        tabBarInactiveTintColor: SiagaColors.secondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {TAB_ITEMS.map(({ name, label, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <Icon size={26} color={color} weight="duotone" />
                {focused && (
                  <View className="w-5 h-[3px] bg-primary rounded-full mt-0.5" />
                )}
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}