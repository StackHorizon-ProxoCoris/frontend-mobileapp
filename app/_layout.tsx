import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/auth";
import { ToastProvider, useToast } from "@/contexts/toast.context";
import { registerForbiddenCallback, unregisterForbiddenCallback } from "@/services/api";
import ToastContainer from "@/components/ui/Toast";
import "../global.css";

// ============================================================
// Auth Guard — Redirect berdasarkan status login & role
// ============================================================

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const { showToast } = useToast();
  const segments = useSegments();
  const router = useRouter();
  const segmentsRef = useRef(segments);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const hasRedirectedForbiddenRef = useRef(false);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    registerForbiddenCallback((message) => {
      const group = String(segmentsRef.current[0] ?? "");
      const inRestrictedGroup = group === "(gov-tabs)" || group === "(admin-tabs)";
      if (!inRestrictedGroup || !isAuthenticatedRef.current || hasRedirectedForbiddenRef.current) return;

      hasRedirectedForbiddenRef.current = true;
      showToast({
        type: "warning",
        title: "Akses Ditolak",
        message: message || "Akun Anda tidak memiliki akses.",
      });
      router.replace("/(tabs)");
      setTimeout(() => {
        hasRedirectedForbiddenRef.current = false;
      }, 1200);
    });

    return () => {
      unregisterForbiddenCallback();
    };
  }, [router, showToast]);

  useEffect(() => {
    if (isLoading) return;

    const segment0 = String(segments[0] ?? "");
    const inAuthGroup = segment0 === "(auth)";
    const inGovGroup = segment0 === "(gov-tabs)";
    const inAdminGroup = segment0 === "(admin-tabs)";
    const inUserGroup = segment0 === "(tabs)";
    const isGovRole = role === "pemerintah" || role === "admin";
    const isAdminRole = role === "admin";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (!isAuthenticated) return;

    if (inAuthGroup) {
      if (isAdminRole) {
        router.replace("/(admin-tabs)" as any);
      } else if (role === "pemerintah") {
        router.replace("/(gov-tabs)");
      } else {
        router.replace("/(tabs)");
      }
      return;
    }

    if (inAdminGroup && !isAdminRole) {
      showToast({
        type: "warning",
        title: "Akses Ditolak",
        message: "Halaman ini hanya untuk admin",
      });
      router.replace(isGovRole ? "/(gov-tabs)" : "/(tabs)");
      return;
    }

    if (inGovGroup && !isGovRole) {
      showToast({
        type: "warning",
        title: "Akses Ditolak",
        message: "Akun Anda bukan pemerintah",
      });
      router.replace("/(tabs)");
      return;
    }

    if (inUserGroup && isGovRole) {
      if (isAdminRole) {
        router.replace("/(admin-tabs)" as any);
      } else {
        router.replace("/(gov-tabs)");
      }
    }
  }, [isAuthenticated, isLoading, role, router, segments, showToast]);

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
    <ToastProvider>
      <AuthProvider>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(gov-tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin-tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="report-detail"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="action-detail"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="info-detail"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="edit-profil"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="riwayat-aktivitas"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="pengaturan"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="tentang"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="bantuan"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="feedback"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="notifikasi"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="edit-profil-gov"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="pengaturan-sistem"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="akses-keamanan"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="ganti-password"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
          </Stack>
          <StatusBar style="dark" />
          <ToastContainer />
        </AuthGuard>
      </AuthProvider>
    </ToastProvider>
  );
}
