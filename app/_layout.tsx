import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/auth";
import "../global.css";

// ============================================================
// Auth Guard — Redirect berdasarkan status login & role
// ============================================================

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inGovGroup = segments[0] === "(gov-tabs)";
    const inUserGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      // Belum login → arahkan ke halaman login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Sudah login tapi masih di halaman auth → arahkan sesuai role
      if (role === 'pemerintah') {
        router.replace("/(gov-tabs)");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  // Tampilkan loading saat cek token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafd" }}>
        <ActivityIndicator size="large" color="#082a4c" />
      </View>
    );
  }

  return <>{children}</>;
}

// ============================================================
// Root Layout
// ============================================================

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(gov-tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="report-detail"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="action-detail"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="info-detail"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="edit-profil"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="riwayat-aktivitas"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="pengaturan"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="tentang"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="bantuan"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="feedback"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </AuthGuard>
    </AuthProvider>
  );
}

