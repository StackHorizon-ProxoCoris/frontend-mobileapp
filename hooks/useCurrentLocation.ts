import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface CurrentLocationState {
  lat: number | null;
  lng: number | null;
  address: string;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({
    lat: null,
    lng: null,
    address: '',
    accuracy: null,
    loading: true,
    error: null,
  });

  const fetchLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Izin lokasi ditolak. Aktifkan di pengaturan perangkat untuk menentukan titik laporan.',
        }));
        return;
      }

      // 2. Get current position with high accuracy
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = position.coords;

      // 3. Reverse geocode to get address string
      let address = '';
      try {
        const geocodeResults = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocodeResults.length > 0) {
          const geo = geocodeResults[0];
          // Build address string from available fields
          const parts: string[] = [];
          if (geo.street) parts.push(geo.street);
          if (geo.streetNumber) parts[parts.length - 1] += ` No. ${geo.streetNumber}`;
          if (geo.subregion) parts.push(geo.subregion);
          if (geo.city) parts.push(geo.city);
          if (geo.region) parts.push(geo.region);
          address = parts.filter(Boolean).join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
      } catch {
        // Reverse geocode failed — fallback to coordinate string
        address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      setState({
        lat: latitude,
        lng: longitude,
        address,
        accuracy: accuracy ?? null,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mendapatkan lokasi perangkat.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    ...state,
    refresh: fetchLocation,
  };
}
