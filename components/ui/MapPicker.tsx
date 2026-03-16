import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, Crosshair } from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

interface MapPickerProps {
    visible: boolean;
    initialLat: number;
    initialLng: number;
    onConfirm: (lat: number, lng: number) => void;
    onClose: () => void;
}

export default function MapPicker({ visible, initialLat, initialLng, onConfirm, onClose }: MapPickerProps) {
    const insets = useSafeAreaInsets();
    const latRef = useRef(initialLat);
    const lngRef = useRef(initialLng);

    const handleMessage = useCallback((event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'moveend') {
                latRef.current = data.lat;
                lngRef.current = data.lng;
            }
        } catch { /* ignore parse errors */ }
    }, []);

    const handleConfirm = useCallback(() => {
        onConfirm(latRef.current, lngRef.current);
    }, [onConfirm]);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 100%; height: 100%; overflow: hidden; }
            #map { width: 100%; height: 100%; }
            .leaflet-control-attribution { font-size: 8px !important; }
            .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; border-radius: 12px !important; overflow: hidden; }
            .leaflet-control-zoom a { width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 18px !important; color: #082a4c !important; background: white !important; border: none !important; }
            /* Fixed crosshair in center */
            .center-pin {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -100%);
                z-index: 1000;
                pointer-events: none;
                filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
            }
            .center-pin .pin-body {
                width: 36px; height: 36px;
                background: #e74c3c;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex; align-items: center; justify-content: center;
                border: 3px solid white;
            }
            .center-pin .pin-dot {
                width: 10px; height: 10px;
                background: white;
                border-radius: 50%;
                transform: rotate(45deg);
            }
            .center-pin .pin-shadow {
                width: 14px; height: 6px;
                background: rgba(0,0,0,0.2);
                border-radius: 50%;
                margin: 2px auto 0;
            }
            .center-label {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, 12px);
                z-index: 1000;
                pointer-events: none;
                background: rgba(0,0,0,0.7);
                color: white;
                font-size: 11px;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 8px;
                white-space: nowrap;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div class="center-pin">
            <div class="pin-body"><div class="pin-dot"></div></div>
            <div class="pin-shadow"></div>
        </div>
        <div class="center-label">Geser peta untuk memilih lokasi</div>
        <script>
            var map = L.map('map', {
                center: [${initialLat}, ${initialLng}],
                zoom: 17,
                zoomControl: true,
                attributionControl: true
            });

            // Hindari tile server OSM publik langsung di WebView/mobile app.
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 19,
                subdomains: 'abcd',
            }).addTo(map);

            // Send center coordinates to React Native when map moves
            map.on('moveend', function() {
                var center = map.getCenter();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'moveend',
                    lat: center.lat,
                    lng: center.lng
                }));
            });

            // Send initial position
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'moveend',
                lat: ${initialLat},
                lng: ${initialLng}
            }));
        </script>
    </body>
    </html>
    `;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
                {/* Header */}
                <View className="px-5 py-3 bg-white border-b border-slate-100 flex-row items-center justify-between" style={{ elevation: 2 }}>
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
                    >
                        <X size={18} color={SiagaColors.primary} weight="bold" />
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-1.5">
                        <Crosshair size={16} color={SiagaColors.primary} weight="duotone" />
                        <Text className="text-[15px] font-bold text-primary">Pilih Lokasi</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        className="px-4 py-2 rounded-full flex-row items-center gap-1.5"
                        style={{ backgroundColor: SiagaColors.primary }}
                    >
                        <Check size={14} color="#fff" weight="bold" />
                        <Text className="text-[13px] font-bold text-white">Konfirmasi</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions */}
                <View className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex-row items-center gap-2">
                    <Crosshair size={14} color={SiagaColors.info} weight="duotone" />
                    <Text className="text-[11px] text-primary/70 flex-1">
                        Geser peta untuk menempatkan pin di lokasi kejadian. Gunakan <Text className="font-bold">zoom</Text> untuk akurasi lebih tinggi.
                    </Text>
                </View>

                {/* Map */}
                <View className="flex-1">
                    <WebView
                        source={{ html }}
                        style={{ flex: 1 }}
                        javaScriptEnabled
                        domStorageEnabled
                        onMessage={handleMessage}
                        startInLoadingState
                        renderLoading={() => (
                            <View style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ActivityIndicator size="small" color={SiagaColors.primary} />
                                <Text style={{ fontSize: 10, color: SiagaColors.secondary, marginTop: 8 }}>Memuat peta...</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}
