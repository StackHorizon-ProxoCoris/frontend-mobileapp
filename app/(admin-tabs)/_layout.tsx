import { Tabs, Redirect } from 'expo-router';
import { View } from 'react-native';
import {
    HouseSimple, ChartBar, Users, ShieldCheck, UserCircle,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

const ADMIN_TAB_ITEMS = [
    { name: 'index', label: 'Dashboard', Icon: HouseSimple },
    { name: 'analytics', label: 'Analitik', Icon: ChartBar },
    { name: 'users', label: 'Pengguna', Icon: Users },
    { name: 'moderation', label: 'Moderasi', Icon: ShieldCheck },
    { name: 'profil-admin', label: 'Profil', Icon: UserCircle },
];

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
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 6,
                    elevation: 8,
                    shadowColor: '#082a4c',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: '#7c3aed',
                tabBarInactiveTintColor: SiagaColors.secondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            {ADMIN_TAB_ITEMS.map(({ name, label, Icon }) => (
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
                                        style={{ backgroundColor: '#7c3aed' }}
                                    />
                                )}
                            </View>
                        ),
                    }}
                />
            ))}
            <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
    );
}
