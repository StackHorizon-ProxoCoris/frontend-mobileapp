import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SiagaColors } from '@/constants/theme';
import { ArrowSquareOut } from 'phosphor-react-native';

interface MapMarker {
    lat: number;
    lng: number;
    id?: string;
    title?: string;
    color?: string;
    popup?: string;
}

interface EmbeddedMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: number;
    markers?: MapMarker[];
    borderRadius?: number;
    showOpenButton?: boolean;
    interactive?: boolean;
    onMarkerPress?: (id: string) => void;
}

export default function EmbeddedMap({
    latitude,
    longitude,
    zoom = 15,
    height = 200,
    markers = [],
    borderRadius = 16,
    showOpenButton = true,
    interactive = true,
    onMarkerPress,
}: EmbeddedMapProps) {
    const allMarkers = markers.length > 0 ? markers : [{ lat: latitude, lng: longitude, title: 'Lokasi', color: '#e74c3c' }];

    const markersJS = allMarkers.map((m, i) => {
        const iconColor = m.color || '#e74c3c';
        // Build popup HTML separately for clarity
        let popupHtml = '';
        if (m.popup) {
            popupHtml = `<div style="font-size:12px;font-weight:600;min-width:140px;text-align:center;padding:4px 0;">${m.popup}`;
            if (m.id) {
                popupHtml += `<br/><div style="margin-top:8px;"><button onclick="openDetail('${m.id}')" style="background:#082a4c;color:white;border:none;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:700;cursor:pointer;width:100%;">Lihat Detail \u2192</button></div>`;
            }
            popupHtml += `</div>`;
        }
        return `
            var icon${i} = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background:${iconColor};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:white;border-radius:50%;"></div></div>',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                popupAnchor: [0, -16]
            });
            var marker${i} = L.marker([${m.lat}, ${m.lng}], {icon: icon${i}}).addTo(map);
            ${popupHtml ? `marker${i}.bindPopup('${popupHtml.replace(/'/g, "\\'") }');` : ''}
            ${m.title ? `marker${i}.bindTooltip('${m.title}', {permanent: false, direction: 'top', offset: [0, -16]});` : ''}
        `;
    }).join('\n');

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
            .leaflet-control-zoom a { width: 32px !important; height: 32px !important; line-height: 32px !important; font-size: 16px !important; color: #082a4c !important; background: white !important; border: none !important; }
            .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .leaflet-popup-tip { display: none; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', {
                center: [${latitude}, ${longitude}],
                zoom: ${zoom},
                zoomControl: ${interactive},
                dragging: ${interactive},
                touchZoom: ${interactive},
                scrollWheelZoom: ${interactive},
                doubleClickZoom: ${interactive},
                attributionControl: true
            });
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            function openDetail(id) {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'marker_press', id: id}));
            }

            ${markersJS}

            ${allMarkers.length > 1 ? `
                var group = L.featureGroup([${allMarkers.map((_, i) => `marker${i}`).join(',')}]);
                map.fitBounds(group.getBounds().pad(0.15));
            ` : ''}
        </script>
    </body>
    </html>
    `;

    const openInMaps = () => {
        const url = Platform.select({
            ios: `maps://app?daddr=${latitude},${longitude}`,
            android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
            default: `https://www.google.com/maps?q=${latitude},${longitude}`,
        });
        if (url) Linking.openURL(url);
    };

    return (
        <View style={{ height, borderRadius, overflow: 'hidden', position: 'relative' }}>
            <WebView
                source={{ html }}
                style={{ flex: 1, backgroundColor: '#f1f5f9' }}
                scrollEnabled={false}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                onMessage={(event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === 'marker_press' && data.id && onMarkerPress) {
                            onMarkerPress(data.id);
                        }
                    } catch {}
                }}
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
            {showOpenButton && (
                <TouchableOpacity
                    onPress={openInMaps}
                    activeOpacity={0.8}
                    style={{
                        position: 'absolute', bottom: 10, right: 10,
                        backgroundColor: 'white', borderRadius: 10,
                        paddingHorizontal: 10, paddingVertical: 6,
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15, shadowRadius: 4,
                    }}
                >
                    <ArrowSquareOut size={12} color={SiagaColors.primary} weight="bold" />
                    <Text style={{ fontSize: 9, fontWeight: '700', color: SiagaColors.primary }}>Buka Maps</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
