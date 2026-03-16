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
const TUTORIAL_ELIGIBLE_KEY_PREFIX = 'siaga_tutorial_eligible:';

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
  /** Apakah user aktif memenuhi syarat menampilkan tutorial sekali saja */
  shouldShowHomeTutorial: boolean;
  /** Loading state saat baca tutorial flag dari storage */
  isHomeTutorialLoading: boolean;
  /** Tandai tutorial home sudah pernah ditampilkan untuk user aktif */
  markHomeTutorialSeen: () => Promise<void>;
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
  const [shouldShowHomeTutorial, setShouldShowHomeTutorial] = useState(false);
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
      setShouldShowHomeTutorial(false);
      setIsHomeTutorialLoading(false);
      return;
    }

    setIsHomeTutorialLoading(true);
    let isCancelled = false;

    const syncTutorialState = async () => {
      try {
        const tutorialKey = `${TUTORIAL_KEY_PREFIX}${user.id}`;
        const eligibleKey = `${TUTORIAL_ELIGIBLE_KEY_PREFIX}${user.id}`;
        const [tutorialValue, eligibleValue] = await Promise.all([
          SecureStore.getItemAsync(tutorialKey),
          SecureStore.getItemAsync(eligibleKey),
        ]);

        const hasSeenTutorial = tutorialValue === 'true';
        const isEligibleUser = eligibleValue === 'true';

        if (isCancelled) return;
        setHasSeenHomeTutorial(hasSeenTutorial);
        setShouldShowHomeTutorial(isEligibleUser && !hasSeenTutorial);
      } catch {
        if (isCancelled) return;
        setHasSeenHomeTutorial(false);
        setShouldShowHomeTutorial(false);
      } finally {
        if (isCancelled) return;
        setIsHomeTutorialLoading(false);
      }
    };

    void syncTutorialState();

    // Register -> hydrate profile -> mount home bisa saling berkejaran.
    // Re-check singkat ini menangkap eligibility key yang baru selesai ditulis.
    const retryTimer = setTimeout(() => {
      void syncTutorialState();
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(retryTimer);
    };
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

  const markHomeTutorialSeen = useCallback(async () => {
    if (!user?.id) return;
    try {
      const tutorialKey = `${TUTORIAL_KEY_PREFIX}${user.id}`;
      const eligibleKey = `${TUTORIAL_ELIGIBLE_KEY_PREFIX}${user.id}`;
      await Promise.all([
        SecureStore.setItemAsync(tutorialKey, 'true'),
        SecureStore.deleteItemAsync(eligibleKey),
      ]);
    } catch {
      // Non-blocking
    }
    setHasSeenHomeTutorial(true);
    setShouldShowHomeTutorial(false);
  }, [user?.id]);

  // ----------------------------------------------------------
  // Tandai tutorial home selesai untuk user aktif
  // ----------------------------------------------------------
  const completeHomeTutorial = useCallback(async () => {
    if (!user?.id) return;
    try {
      const tutorialKey = `${TUTORIAL_KEY_PREFIX}${user.id}`;
      const eligibleKey = `${TUTORIAL_ELIGIBLE_KEY_PREFIX}${user.id}`;
      await Promise.all([
        SecureStore.setItemAsync(tutorialKey, 'true'),
        SecureStore.deleteItemAsync(eligibleKey),
      ]);
    } catch {
      // Non-blocking
    }
    setHasSeenHomeTutorial(true);
    setShouldShowHomeTutorial(false);
  }, [user?.id]);

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  const value: OnboardingContextType = {
    hasSeenOnboarding,
    isOnboardingLoading,
    completeOnboarding,
    hasSeenHomeTutorial,
    shouldShowHomeTutorial,
    isHomeTutorialLoading,
    markHomeTutorialSeen,
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
