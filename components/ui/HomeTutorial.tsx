// ============================================================
// Home Tutorial — Overlay panduan interaktif untuk pengguna baru
// Meng-highlight elemen UI utama di Home secara berurutan
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  useWindowDimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import {
  Megaphone,
  MapTrifold,
  Siren,
  Bell,
  ArrowRight,
  CheckCircle,
  HandPointing,
} from 'phosphor-react-native';

// ============================================================
// Tutorial Step Data
// ============================================================

export interface TutorialTarget {
  /** Posisi absolut elemen target relatif terhadap window */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Posisi tooltip relatif terhadap spotlight */
  tooltipPosition: 'below' | 'above';
  accentColor: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'buat-laporan',
    icon: <Megaphone size={24} color="#fff" weight="duotone" />,
    title: 'Buat Laporan',
    description: 'Ketuk tombol ini untuk melaporkan masalah lingkungan di sekitar Anda, seperti banjir, jalan rusak, atau sampah menumpuk.',
    tooltipPosition: 'below',
    accentColor: '#082a4c',
  },
  {
    id: 'pantau-area',
    icon: <MapTrifold size={24} color="#fff" weight="duotone" />,
    title: 'Pantau Area',
    description: 'Gunakan fitur ini untuk memantau kondisi lingkungan dan melihat status keamanan area di peta.',
    tooltipPosition: 'below',
    accentColor: '#3498db',
  },
  {
    id: 'sos',
    icon: <Siren size={24} color="#fff" weight="duotone" />,
    title: 'Tombol Darurat SOS',
    description: 'Dalam situasi darurat, tekan tombol SOS merah ini untuk akses cepat ke layanan darurat.',
    tooltipPosition: 'above',
    accentColor: '#e74c3c',
  },
  {
    id: 'notifikasi',
    icon: <Bell size={24} color="#fff" weight="duotone" />,
    title: 'Notifikasi',
    description: 'Lihat pemberitahuan terbaru tentang laporan, aksi pemerintah, dan peringatan dini di area Anda.',
    tooltipPosition: 'below',
    accentColor: '#f39c12',
  },
];

// ============================================================
// Props
// ============================================================

interface HomeTutorialProps {
  /** Posisi window-relative dari setiap target element (urutan sesuai tutorialSteps) */
  targets: (TutorialTarget | null)[];
  /** Callback saat tutorial selesai */
  onComplete: () => void;
  /** Apakah tutorial visible */
  visible: boolean;
}

// ============================================================
// Component
// ============================================================

export default function HomeTutorial({ targets, onComplete, visible }: HomeTutorialProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const overlayOpacity = useSharedValue(0);

  const step = tutorialSteps[currentStep];
  const target = targets[currentStep];

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      setCurrentStep(0);
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleNext = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (!visible) return null;

  const isLastStep = currentStep === tutorialSteps.length - 1;

  // Spotlight dimensions (with padding around target)
  const spotlightPadding = 8;
  const spotlightRadius = 16;

  // Jika target belum terukur, tampilkan tooltip di tengah
  const hasTarget = target && target.width > 0 && target.height > 0;

  const spotlightRect = hasTarget
    ? {
        x: target.x - spotlightPadding,
        y: target.y - spotlightPadding,
        w: target.width + spotlightPadding * 2,
        h: target.height + spotlightPadding * 2,
      }
    : null;

  // Tooltip positioning (responsive)
  const tooltipWidth = screenWidth - 48;
  const tooltipLeft = 24;

  let tooltipTop: number;
  if (spotlightRect && step.tooltipPosition === 'below') {
    tooltipTop = spotlightRect.y + spotlightRect.h + 16;
  } else if (spotlightRect && step.tooltipPosition === 'above') {
    tooltipTop = spotlightRect.y - 200;
    if (tooltipTop < 60) tooltipTop = 60;
  } else {
    tooltipTop = screenHeight / 2 - 100;
  }

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        {/*
          Full-screen touch blocker — intercepts ALL taps on the overlay.
          The spotlight "hole" is visual only; taps in the spotlight area
          are also caught here and do nothing.
        */}
        <TouchableWithoutFeedback onPress={() => { /* swallow tap */ }}>
          <View style={StyleSheet.absoluteFill}>
            {/* Dark overlay segments to create spotlight cutout */}
            {spotlightRect ? (
              <>
                {/* Top overlay */}
                <View style={[styles.overlaySegment, {
                  top: 0, left: 0, right: 0,
                  height: spotlightRect.y,
                }]} />
                {/* Bottom overlay */}
                <View style={[styles.overlaySegment, {
                  top: spotlightRect.y + spotlightRect.h, left: 0, right: 0,
                  bottom: 0,
                }]} />
                {/* Left overlay */}
                <View style={[styles.overlaySegment, {
                  top: spotlightRect.y, left: 0,
                  width: spotlightRect.x,
                  height: spotlightRect.h,
                }]} />
                {/* Right overlay */}
                <View style={[styles.overlaySegment, {
                  top: spotlightRect.y,
                  left: spotlightRect.x + spotlightRect.w,
                  right: 0,
                  height: spotlightRect.h,
                }]} />
                {/* Transparent spotlight fill — blocks taps in the hole too */}
                <View style={{
                  position: 'absolute',
                  top: spotlightRect.y,
                  left: spotlightRect.x,
                  width: spotlightRect.w,
                  height: spotlightRect.h,
                }} />

                {/* Spotlight border glow */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.spotlightBorder,
                    {
                      top: spotlightRect.y,
                      left: spotlightRect.x,
                      width: spotlightRect.w,
                      height: spotlightRect.h,
                      borderRadius: spotlightRadius,
                      borderColor: step.accentColor,
                    },
                  ]}
                />

                {/* Hand pointer indicator */}
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: spotlightRect.y + spotlightRect.h - 12,
                    left: spotlightRect.x + spotlightRect.w - 12,
                    zIndex: 10,
                  }}
                >
                  <Animated.View entering={FadeIn.delay(400)}>
                    <HandPointing size={28} color="#fff" weight="fill" />
                  </Animated.View>
                </View>
              </>
            ) : (
              <View style={[styles.overlaySegment, styles.fullOverlay]} />
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Tooltip Card — rendered on top of touch blocker */}
        <Animated.View
          key={`tooltip-${currentStep}`}
          entering={FadeIn.duration(250)}
          style={[
            styles.tooltipCard,
            {
              top: tooltipTop,
              left: tooltipLeft,
              width: tooltipWidth,
            },
          ]}
        >
          {/* Step indicator */}
          <View style={styles.stepIndicatorRow}>
            <View style={[styles.tooltipIconBadge, { backgroundColor: step.accentColor }]}>
              {step.icon}
            </View>
            <View style={styles.stepDots}>
              {tutorialSteps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stepDot,
                    i === currentStep
                      ? { backgroundColor: step.accentColor, width: 20 }
                      : { backgroundColor: 'rgba(0,0,0,0.15)', width: 8 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.stepCounter}>
              {currentStep + 1}/{tutorialSteps.length}
            </Text>
          </View>

          {/* Content */}
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Text style={styles.tooltipDescription}>{step.description}</Text>

          {/* Actions */}
          <View style={styles.tooltipActions}>
            <TouchableOpacity
              style={styles.skipTutorialButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipTutorialText}>Lewati</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextTutorialButton, { backgroundColor: step.accentColor }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              {isLastStep ? (
                <>
                  <CheckCircle size={18} color="#fff" weight="bold" />
                  <Text style={styles.nextTutorialText}>Selesai</Text>
                </>
              ) : (
                <>
                  <Text style={styles.nextTutorialText}>Selanjutnya</Text>
                  <ArrowRight size={16} color="#fff" weight="bold" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlaySegment: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  fullOverlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  spotlightBorder: {
    position: 'absolute',
    borderWidth: 2.5,
    zIndex: 5,
  },

  // --- Tooltip ---
  tooltipCard: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    zIndex: 10,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  tooltipIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDots: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },

  // --- Text ---
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#082a4c',
    marginBottom: 6,
  },
  tooltipDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 18,
  },

  // --- Actions ---
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  skipTutorialButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipTutorialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  nextTutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 44,
  },
  nextTutorialText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
