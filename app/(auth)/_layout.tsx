import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
    return (
        <>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
            </Stack>
            <StatusBar style="light" />
        </>
    );
}
