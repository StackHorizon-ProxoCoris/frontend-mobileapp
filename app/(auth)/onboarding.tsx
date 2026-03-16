// ============================================================
// Onboarding Screen — 3-slide pengantar untuk pengguna baru
// Muncul hanya saat pertama kali install app di device
// ============================================================

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  StyleSheet,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  Megaphone,
  MapTrifold,
  ArrowRight,
  CaretRight,
} from 'phosphor-react-native';
import { useOnboarding } from '@/context/onboarding';



// ============================================================
// Slide Data
// ============================================================

interface SlideData {
  id: string;
  icon: React.ReactNode;
  bgColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  description: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    icon: <ShieldCheck size={80} color="#fff" weight="duotone" />,
    bgColor: '#082a4c',
    accentColor: '#3498db',
    title: 'Selamat Datang\ndi SIAGA',
    subtitle: 'Siap Informasi & Aksi untuk Gawat Alam',
    description:
      'Platform warga untuk melaporkan, memantau, dan merespons masalah lingkungan di sekitar Anda secara real-time.',
  },
  {
    id: '2',
    icon: <Megaphone size={80} color="#fff" weight="duotone" />,
    bgColor: '#0d3a6b',
    accentColor: '#f39c12',
    title: 'Laporkan\nMasalah',
    subtitle: 'Suara Anda Penting',
    description:
      'Laporkan banjir, jalan rusak, sampah menumpuk, dan masalah lainnya langsung dari HP Anda. Semua laporan terverifikasi secara transparan.',
  },
  {
    id: '3',
    icon: <MapTrifold size={80} color="#fff" weight="duotone" />,
    bgColor: '#1a5276',
    accentColor: '#27ae60',
    title: 'Pantau\nLingkungan',
    subtitle: 'Informasi Terpercaya',
    description:
      'Pantau kondisi area sekitar secara real-time. Lihat status keamanan, peringatan dini, dan aksi pemerintah dari satu aplikasi.',
  },
];

// ============================================================
// Slide Component
// ============================================================

function OnboardingSlide({ item, screenWidth }: { item: SlideData; screenWidth: number }) {
  return (
    <View style={[styles.slide, { width: screenWidth, backgroundColor: item.bgColor }]}>
      {/* Decorative circles */}
      <View style={[styles.decoCircle, styles.decoCircle1, { backgroundColor: item.accentColor + '12' }]} />
      <View style={[styles.decoCircle, styles.decoCircle2, { backgroundColor: item.accentColor + '08' }]} />

      {/* Icon Container */}
      <View style={styles.iconContainer}>
        <View style={[styles.iconRing, { borderColor: item.accentColor + '20' }]}>
          <View style={[styles.iconInner, { backgroundColor: item.accentColor + '25' }]}>
            {item.icon}
          </View>
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <View style={[styles.subtitleBadge, { backgroundColor: item.accentColor + '20' }]}>
          <Text style={[styles.slideSubtitle, { color: item.accentColor }]}>{item.subtitle}</Text>
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );
}

// ============================================================
// Main Screen
// ============================================================

export default function OnboardingScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === slides.length - 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }, [activeIndex]);

  const handleFinish = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  }, [completeOnboarding, router]);

  const handleSkip = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  }, [completeOnboarding, router]);

  return (
    <View style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <OnboardingSlide item={item} screenWidth={screenWidth} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />

      {/* Bottom Controls */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {!isLastSlide ? (
            <>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Lewati</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextText}>Selanjutnya</Text>
                <CaretRight size={18} color="#fff" weight="bold" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.startText}>Mulai Sekarang</Text>
              <ArrowRight size={20} color="#fff" weight="bold" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#082a4c',
  },

  // --- Slide ---
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },

  // --- Decorative circles ---
  decoCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  decoCircle1: {
    width: 400,
    height: 400,
    top: -80,
    right: -100,
  },
  decoCircle2: {
    width: 300,
    height: 300,
    bottom: -60,
    left: -80,
  },

  // --- Icon ---
  iconContainer: {
    marginBottom: 48,
  },
  iconRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Text ---
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  subtitleBadge: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  // --- Bottom Container ---
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // --- Pagination ---
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    borderRadius: 999,
  },
  dotActive: {
    width: 28,
    height: 8,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // --- Buttons ---
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 52,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#3498db',
    minHeight: 56,
    elevation: 4,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
});
