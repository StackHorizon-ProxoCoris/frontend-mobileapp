// ============================================================
// Onboarding Context — Manajemen state onboarding & tutorial
// hasSeenOnboarding: global per device
// hasSeenHomeTutorial: per user account (userId)
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './auth';

// ============================================================
// Storage Keys
// ============================================================

const ONBOARDING_KEY = 'siaga_onboarding_done';
const TUTORIAL_KEY_PREFIX = 'siaga_tutorial_done:';

// ============================================================
// Types
// ============================================================

interface OnboardingContextType {
  /** Apakah user sudah melewati onboarding (global per device) */
  hasSeenOnboarding: boolean;
  /** Loading state saat baca onboarding flag dari storage */
  isOnboardingLoading: boolean;
  /** Tandai onboarding selesai */
  completeOnboarding: () => Promise<void>;

  /** Apakah user aktif sudah melewati tutorial home */
  hasSeenHomeTutorial: boolean;
  /** Loading state saat baca tutorial flag dari storage */
  isHomeTutorialLoading: boolean;
  /** Tandai tutorial home selesai untuk user aktif */
  completeHomeTutorial: () => Promise<void>;
}

// ============================================================
// Context & Provider
// ============================================================

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // --- Onboarding (global per device) ---
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(true);

  // --- Home Tutorial (per user) ---
  const [hasSeenHomeTutorial, setHasSeenHomeTutorial] = useState(true); // default true agar tidak flash
  const [isHomeTutorialLoading, setIsHomeTutorialLoading] = useState(true);

  // ----------------------------------------------------------
  // Baca onboarding flag saat mount (sekali)
  // ----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
        setHasSeenOnboarding(value === 'true');
      } catch {
        // Jika gagal baca, anggap belum pernah onboarding
        setHasSeenOnboarding(false);
      } finally {
        setIsOnboardingLoading(false);
      }
    })();
  }, []);

  // ----------------------------------------------------------
  // Baca tutorial flag saat user berubah
  // ----------------------------------------------------------
  useEffect(() => {
    if (!user?.id) {
      // Belum login — reset ke default (true = jangan tampilkan)
      setHasSeenHomeTutorial(true);
      setIsHomeTutorialLoading(false);
      return;
    }

    setIsHomeTutorialLoading(true);
    (async () => {
      try {
        const key = `${TUTORIAL_KEY_PREFIX}${user.id}`;
        const value = await SecureStore.getItemAsync(key);
        setHasSeenHomeTutorial(value === 'true');
      } catch {
        setHasSeenHomeTutorial(false);
      } finally {
        setIsHomeTutorialLoading(false);
      }
    })();
  }, [user?.id]);

  // ----------------------------------------------------------
  // Tandai onboarding selesai
  // ----------------------------------------------------------
  const completeOnboarding = useCallback(async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    } catch {
      // Non-blocking
    }
    setHasSeenOnboarding(true);
  }, []);

  // ----------------------------------------------------------
  // Tandai tutorial home selesai untuk user aktif
  // ----------------------------------------------------------
  const completeHomeTutorial = useCallback(async () => {
    if (!user?.id) return;
    try {
      const key = `${TUTORIAL_KEY_PREFIX}${user.id}`;
      await SecureStore.setItemAsync(key, 'true');
    } catch {
      // Non-blocking
    }
    setHasSeenHomeTutorial(true);
  }, [user?.id]);

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  const value: OnboardingContextType = {
    hasSeenOnboarding,
    isOnboardingLoading,
    completeOnboarding,
    hasSeenHomeTutorial,
    isHomeTutorialLoading,
    completeHomeTutorial,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding harus digunakan di dalam <OnboardingProvider>');
  }
  return context;
}
