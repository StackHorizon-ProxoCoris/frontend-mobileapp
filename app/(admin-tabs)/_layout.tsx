import { Tabs, Redirect } from 'expo-router';
import { View } from 'react-native';
import {
    HouseSimple, ChartBar, Users, ShieldCheck, Gear,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function AdminTabsLayout() {
    const { isLoading, role } = useAuth();

    // Early return: jangan render UI admin jika bukan admin
    if (!isLoading && role !== 'admin') {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    height: 64,
                    paddingBottom: 10,
                    paddingTop: 6,
                    elevation: 8,
                    shadowColor: '#082a4c',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: '#7c3aed',
                tabBarInactiveTintColor: SiagaColors.secondary,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            width: 28, height: 28, borderRadius: 8,
                            backgroundColor: focused ? '#f5f3ff' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <HouseSimple size={20} color={color} weight={focused ? 'fill' : 'duotone'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analitik',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            width: 28, height: 28, borderRadius: 8,
                            backgroundColor: focused ? '#f5f3ff' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ChartBar size={20} color={color} weight={focused ? 'fill' : 'duotone'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: 'Pengguna',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            width: 28, height: 28, borderRadius: 8,
                            backgroundColor: focused ? '#f5f3ff' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Users size={20} color={color} weight={focused ? 'fill' : 'duotone'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="moderation"
                options={{
                    title: 'Moderasi',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            width: 28, height: 28, borderRadius: 8,
                            backgroundColor: focused ? '#f5f3ff' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ShieldCheck size={20} color={color} weight={focused ? 'fill' : 'duotone'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Sistem',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            width: 28, height: 28, borderRadius: 8,
                            backgroundColor: focused ? '#f5f3ff' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Gear size={20} color={color} weight={focused ? 'fill' : 'duotone'} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
