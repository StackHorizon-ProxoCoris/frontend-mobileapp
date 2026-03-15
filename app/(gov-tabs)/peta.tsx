import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
    View, Text, TouchableOpacity, Animated, ScrollView,
    Dimensions, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    MapTrifold, X, ArrowRight,
    Clock, MapPin, Users, WarningDiamond, ArrowClockwise,
    Stack, ChartBar, CaretDown, CaretUp,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';
import { getMapMarkers, type MapMarkerData } from '@/services/report.service';

const { width, height } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type SeverityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
type CategoryKey = 'Banjir' | 'Longsor' | 'Jalan Rusak' | 'Kebakaran' | 'Sampah' | 'Lainnya';
type MapMarker = {
    id: string;
    title: string;
    category: CategoryKey;
    severity: SeverityLevel;
    lat: number;
    lng: number;
    area: string;
    cluster: number;
    time: string;
    desc: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<CategoryKey, { color: string; emoji: string; iconColor: string }> = {
    'Banjir': { color: '#3b82f6', emoji: '🌊', iconColor: '#2563eb' },
    'Longsor': { color: '#f97316', emoji: '⛰️', iconColor: '#ea580c' },
    'Jalan Rusak': { color: '#f59e0b', emoji: '🛣️', iconColor: '#d97706' },
    'Kebakaran': { color: '#ef4444', emoji: '🔥', iconColor: '#dc2626' },
    'Sampah': { color: '#10b981', emoji: '🗑️', iconColor: '#059669' },
    'Lainnya': { color: '#8b5cf6', emoji: '⚠️', iconColor: '#7c3aed' },
};

const SEVERITY_COLOR: Record<SeverityLevel, string> = {
    'Kritis': '#e74c3c',
    'Tinggi': '#f97316',
    'Sedang': '#f59e0b',
    'Rendah': '#10b981',
};



type FilterKey = CategoryKey | 'Semua' | 'Darurat';
const FILTER_CATEGORIES: FilterKey[] = ['Semua', 'Darurat', 'Banjir', 'Longsor', 'Jalan Rusak', 'Kebakaran', 'Sampah'];

// ─── Map HTML Generator ───────────────────────────────────────────────────────
function buildMapHtml(markers: MapMarker[], hotspots: { lat: number; lng: number; radius: number; count: number; label: string }[], activeFilter: string, showHotspot: boolean) {
    // Build initial markers and hotspots data as JSON for reuse by JS functions
    const allMarkersJSON = JSON.stringify(markers.map(m => ({
        id: m.id, title: m.title, category: m.category, severity: m.severity,
        lat: m.lat, lng: m.lng, area: m.area, cluster: m.cluster, desc: m.desc,
    })));
    const allHotspotsJSON = JSON.stringify(hotspots);
    const categoryMapJSON = JSON.stringify(CATEGORY_MAP);
    const severityColorJSON = JSON.stringify(SEVERITY_COLOR);

    return `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { width:100%; height:100%; overflow:hidden; background:#f1f5f9; }
        #map { width:100%; height:100%; }
        .leaflet-control-zoom { border:none !important; box-shadow:0 4px 16px rgba(0,0,0,0.15) !important; border-radius:14px !important; overflow:hidden; margin-bottom:80px !important; margin-right:10px !important; }
        .leaflet-control-zoom a { width:36px !important; height:36px !important; line-height:36px !important; font-size:18px !important; color:#082a4c !important; background:white !important; border:none !important; }
        .leaflet-control-zoom a:hover { background:#f4f7fb !important; }
        .leaflet-control-attribution { font-size:7px !important; opacity:0.6; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.25} 50%{transform:scale(1.6);opacity:0.08} }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            center: [-6.9175, 107.6191],
            zoom: 13,
            zoomControl: true,
            attributionControl: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '\u00a9 OpenStreetMap',
            maxZoom: 19,
        }).addTo(map);

        // Persistent layer groups for markers and hotspots
        var markerLayerGroup = L.layerGroup().addTo(map);
        var hotspotLayerGroup = L.layerGroup().addTo(map);
        var currentMarkers = [];

        var CATEGORY_MAP = ${categoryMapJSON};
        var SEVERITY_COLOR = ${severityColorJSON};

        // ── Reusable functions for marker/hotspot updates ──
        function clearAllLayers() {
            markerLayerGroup.clearLayers();
            hotspotLayerGroup.clearLayers();
        }

        function updateMarkers(allMarkers, activeFilter) {
            currentMarkers = allMarkers || [];
            markerLayerGroup.clearLayers();
            var filtered = allMarkers;
            if (activeFilter === 'Darurat') {
                filtered = allMarkers.filter(function(r) { return r.severity === 'Kritis'; });
            } else if (activeFilter !== 'Semua') {
                filtered = allMarkers.filter(function(r) { return r.category === activeFilter; });
            }
            filtered.forEach(function(m) {
                var cat = CATEGORY_MAP[m.category] || CATEGORY_MAP['Lainnya'];
                var sevColor = SEVERITY_COLOR[m.severity] || '#10b981';
                var isPulse = m.severity === 'Kritis';
                var divIcon = L.divIcon({
                    className: '',
                    html: '<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">'
                        + (isPulse ? '<div style="position:absolute;inset:0;border-radius:50%;background:' + sevColor + ';opacity:0.25;animation:pulse 1.5s infinite;"></div>' : '')
                        + '<div style="width:32px;height:32px;border-radius:50%;background:' + cat.color + ';border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;">' + cat.emoji + '</div>'
                        + '<div style="position:absolute;top:-6px;right:-6px;background:' + sevColor + ';color:white;border-radius:8px;padding:1px 5px;font-size:8px;font-weight:700;border:1.5px solid white;">' + m.cluster + '</div>'
                        + '</div>',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                    popupAnchor: [0, -20]
                });
                var marker = L.marker([m.lat, m.lng], { icon: divIcon }).addTo(markerLayerGroup);
                marker.on('click', function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker', id: m.id }));
                });
            });
        }

        function updateHotspots(hotspots, show) {
            hotspotLayerGroup.clearLayers();
            if (!show) return;
            hotspots.forEach(function(h) {
                var circle = L.circle([h.lat, h.lng], {
                    radius: h.radius,
                    color: 'rgba(239,68,68,0.6)',
                    fillColor: 'rgba(239,68,68,0.12)',
                    fillOpacity: 1,
                    weight: 1.5,
                }).addTo(hotspotLayerGroup);
                circle.bindTooltip('<b>\ud83d\udd34 ' + h.label + '</b><br>' + h.count + ' laporan', { permanent: false, direction: 'top' });
            });
        }

        function focusMarkerById(reportId, allMarkers) {
            var markers = Array.isArray(allMarkers) && allMarkers.length ? allMarkers : currentMarkers;
            var target = markers.find(function(marker) { return marker.id === reportId; });
            if (!target) return false;

            map.flyTo([target.lat, target.lng], 17, {
                animate: true,
                duration: 0.8,
            });
            return true;
        }

        // Render initial state
        var initialMarkers = ${allMarkersJSON};
        var initialHotspots = ${allHotspotsJSON};
        updateMarkers(initialMarkers, '${activeFilter}');
        updateHotspots(initialHotspots, ${showHotspot});

        // Tap on map (empty area) to dismiss bottom sheet
        map.on('click', function(e) {
            if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.closest && e.originalEvent.target.closest('.leaflet-marker-icon')) return;
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'dismiss'}));
        });
    </script>
</body>
</html>`;
}

// ─── Category Legend Item ─────────────────────────────────────────────────────
function LegendChip({ cat, active, onPress }: { cat: FilterKey; active: boolean; onPress: () => void }) {
    if (cat === 'Darurat') {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.75}
                style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: active ? '#ef4444' : '#fff',
                    borderWidth: 1,
                    borderColor: active ? '#ef4444' : '#edf2f9',
                    elevation: active ? 3 : 1,
                    shadowColor: '#ef4444',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: active ? 0.22 : 0.04,
                    shadowRadius: 4,
                }}
            >
                <Text style={{ fontSize: 14 }}>🚨</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#fff' : '#ef4444' }}>
                    Darurat
                </Text>
            </TouchableOpacity>
        );
    }

    const cfg = cat === 'Semua' ? null : CATEGORY_MAP[cat as CategoryKey];
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                paddingHorizontal: 14, paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? (cfg?.color ?? SiagaColors.primary) : '#fff',
                borderWidth: 1,
                borderColor: active ? (cfg?.color ?? SiagaColors.primary) : '#edf2f9',
                elevation: active ? 3 : 1,
                shadowColor: cfg?.color ?? '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: active ? 0.22 : 0.04,
                shadowRadius: 4,
            }}
        >
            {cfg && <Text style={{ fontSize: 14 }}>{cfg.emoji}</Text>}
            <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#fff' : SiagaColors.secondary }}>
                {cat}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Bottom Sheet Report Card ─────────────────────────────────────────────────
function ReportBottomSheet({
    report, onClose, onNavigate,
}: {
    report: MapMarker | null;
    onClose: () => void;
    onNavigate: () => void;
}) {
    if (!report) return null;
    const cat = CATEGORY_MAP[report.category];
    const sevColor = SEVERITY_COLOR[report.severity];

    return (
        <View style={{
            position: 'absolute', left: 12, right: 12, bottom: 16,
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: 16,
            elevation: 16,
            shadowColor: '#082a4c',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
        }}>
            {/* Drag handle */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 14 }} />

            {/* Header row */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <View style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: cat.color + '20',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: SiagaColors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {report.id}
                        </Text>
                        <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: sevColor + '20' }}>
                            <Text style={{ fontSize: 9, fontWeight: '800', color: sevColor }}>{report.severity}</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: SiagaColors.primary, lineHeight: 18 }}>
                        {report.title}
                    </Text>
                </View>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7fb' }}>
                    <X size={16} color={SiagaColors.secondary} weight="bold" />
                </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={{ fontSize: 13, color: SiagaColors.secondary, lineHeight: 16, marginBottom: 12 }} numberOfLines={2}>
                {report.desc}
            </Text>

            {/* Meta chips */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f4f7fb' }}>
                    <MapPin size={13} color={SiagaColors.info} weight="duotone" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>{report.area}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f4f7fb' }}>
                    <Users size={13} color={SiagaColors.warning} weight="duotone" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>{report.cluster} serupa</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f4f7fb' }}>
                    <Clock size={13} color={SiagaColors.secondary} weight="duotone" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>{report.time}</Text>
                </View>
            </View>

            {/* Urgency bar */}
            <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: SiagaColors.secondary, fontWeight: '600' }}>Tingkat Urgensi</Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: sevColor }}>{report.severity}</Text>
                </View>
                <View style={{ height: 5, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{
                        height: '100%', borderRadius: 3, backgroundColor: sevColor,
                        width: report.severity === 'Kritis' ? '100%' : report.severity === 'Tinggi' ? '75%' : report.severity === 'Sedang' ? '50%' : '25%',
                    }} />
                </View>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        flex: 1, paddingVertical: 12, borderRadius: 14,
                        borderWidth: 1, borderColor: '#edf2f9',
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#f8fafd',
                    }}
                    onPress={onClose}
                >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.secondary }}>Tutup</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onNavigate}
                    style={{
                        flex: 2.5, paddingVertical: 12, borderRadius: 14,
                        backgroundColor: SiagaColors.primary,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                >
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Lihat Detail Laporan</Text>
                    <ArrowRight size={15} color="#fff" weight="bold" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GovPetaScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ filter?: string | string[]; reportId?: string | string[] }>();
    const filterParam = Array.isArray(params.filter) ? params.filter[0] : params.filter;
    const focusReportId = Array.isArray(params.reportId) ? params.reportId[0] : params.reportId;
    const webviewRef = useRef<WebView>(null);
    const lastFocusedReportIdRef = useRef<string | null>(null);

    const [activeFilter, setActiveFilter] = useState<FilterKey>(
        (filterParam as FilterKey) || 'Semua'
    );
    const [showHotspot, setShowHotspot] = useState(true);
    const [showLegend, setShowLegend] = useState(false);
    const [selectedReport, setSelectedReport] = useState<MapMarker | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    const [showStats, setShowStats] = useState(false);
    const [apiReports, setApiReports] = useState<MapMarkerData[]>([]);

    const sheetAnim = useRef(new Animated.Value(0)).current;

    // Ambil marker dari API (endpoint ringan)
    useEffect(() => {
        async function load() {
            setDataLoading(true);
            const result = await getMapMarkers();
            if (result.success && result.data) setApiReports(result.data);
            setDataLoading(false);
        }
        load();
    }, []);

    useEffect(() => {
        if (!filterParam) return;
        setActiveFilter(filterParam as FilterKey);
    }, [filterParam]);

    // Konversi API data ke MapMarker format (backend sudah filter null lat/lng)
    const LIVE_MARKERS = useMemo<MapMarker[]>(() => {
        return apiReports.map(r => {
            const category: CategoryKey = (['Banjir', 'Longsor', 'Jalan Rusak', 'Kebakaran', 'Sampah'].includes(r.category) ? r.category : 'Lainnya') as CategoryKey;
            const severity: SeverityLevel = r.urgency >= 80 ? 'Kritis' : r.urgency >= 60 ? 'Tinggi' : r.urgency >= 40 ? 'Sedang' : 'Rendah';
            return {
                id: r.id,
                title: r.title,
                category,
                severity,
                lat: r.lat,
                lng: r.lng,
                area: r.district || r.city || '-',
                cluster: r.votesCount,
                time: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                desc: r.description || '',
            };
        });
    }, [apiReports]);

    // Hitung hotspots dinamis dari sebaran data per area
    const DYNAMIC_HOTSPOTS = useMemo(() => {
        const areaMap: Record<string, { lats: number[]; lngs: number[]; count: number }> = {};
        LIVE_MARKERS.forEach(m => {
            if (!areaMap[m.area]) areaMap[m.area] = { lats: [], lngs: [], count: 0 };
            areaMap[m.area].lats.push(m.lat);
            areaMap[m.area].lngs.push(m.lng);
            areaMap[m.area].count++;
        });
        return Object.entries(areaMap)
            .filter(([, v]) => v.count >= 2)
            .map(([label, v]) => ({
                lat: v.lats.reduce((a, b) => a + b, 0) / v.lats.length,
                lng: v.lngs.reduce((a, b) => a + b, 0) / v.lngs.length,
                radius: Math.min(200 + v.count * 50, 800),
                count: v.count,
                label,
            }));
    }, [LIVE_MARKERS]);

    const openSheet = useCallback((report: MapMarker) => {
        setSelectedReport(report);
        Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    }, [sheetAnim]);

    const closeSheet = useCallback(() => {
        Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            setSelectedReport(null);
        });
    }, [sheetAnim]);

    const handleMessage = useCallback((event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'marker') {
                const report = LIVE_MARKERS.find(r => r.id === data.id);
                if (report) openSheet(report);
            } else if (data.type === 'dismiss') {
                closeSheet();
            }
        } catch (_) { }
    }, [LIVE_MARKERS, openSheet, closeSheet]);

    const handleFilterChange = (cat: FilterKey) => {
        setActiveFilter(cat);
        closeSheet();
    };

    const toggleHotspot = () => {
        setShowHotspot(h => !h);
    };

    // Inject JS to update markers/hotspots without remounting WebView
    useEffect(() => {
        if (!mapReady || !webviewRef.current) return;
        const markersData = LIVE_MARKERS.map(m => ({
            id: m.id, title: m.title, category: m.category, severity: m.severity,
            lat: m.lat, lng: m.lng, area: m.area, cluster: m.cluster, desc: m.desc,
        }));
        const js = `updateMarkers(${JSON.stringify(markersData)}, '${activeFilter}'); true;`;
        webviewRef.current.injectJavaScript(js);
    }, [activeFilter, LIVE_MARKERS, mapReady]);

    useEffect(() => {
        if (!mapReady || !webviewRef.current) return;
        const js = `updateHotspots(${JSON.stringify(DYNAMIC_HOTSPOTS)}, ${showHotspot}); true;`;
        webviewRef.current.injectJavaScript(js);
    }, [showHotspot, DYNAMIC_HOTSPOTS, mapReady]);

    useEffect(() => {
        if (!focusReportId) {
            lastFocusedReportIdRef.current = null;
            return;
        }
        if (!mapReady || !webviewRef.current || LIVE_MARKERS.length === 0) return;
        if (lastFocusedReportIdRef.current === focusReportId) return;

        const targetReport = LIVE_MARKERS.find(report => report.id === focusReportId);
        if (!targetReport) return;

        openSheet(targetReport);
        webviewRef.current.injectJavaScript(
            `focusMarkerById(${JSON.stringify(focusReportId)}, ${JSON.stringify(LIVE_MARKERS)}); true;`
        );
        lastFocusedReportIdRef.current = focusReportId;
    }, [LIVE_MARKERS, focusReportId, mapReady, openSheet]);

    const criticalCount = LIVE_MARKERS.filter(r => r.severity === 'Kritis').length;
    const filteredCount = activeFilter === 'Semua'
        ? LIVE_MARKERS.length
        : activeFilter === 'Darurat'
            ? LIVE_MARKERS.filter(r => r.severity === 'Kritis').length
            : LIVE_MARKERS.filter(r => r.category === activeFilter).length;

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>

            {/* ── HEADER ──────────────────────────────────────────────── */}
            <View style={{ paddingTop: insets.top, backgroundColor: SiagaColors.primary, zIndex: 10 }}>
                {/* Decorative */}
                <View style={{ position: 'absolute', right: -18, top: -18, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' }} />

                <View style={{ paddingHorizontal: 16, paddingBottom: 12, paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: SiagaColors.info, alignItems: 'center', justifyContent: 'center' }}>
                                <MapTrifold size={20} color="#fff" weight="duotone" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>Peta Laporan</Text>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                    Kota Bandung · {filteredCount} titik
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {/* Stats toggle */}
                            <TouchableOpacity
                                onPress={() => setShowStats(s => !s)}
                                activeOpacity={0.7}
                                style={{
                                    width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: showStats ? SiagaColors.info : 'rgba(255,255,255,0.1)',
                                }}
                            >
                                <ChartBar size={19} color="#fff" weight="duotone" />
                            </TouchableOpacity>
                            {/* Reload */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (webviewRef.current) {
                                        const markersData = LIVE_MARKERS.map(m => ({
                                            id: m.id, title: m.title, category: m.category, severity: m.severity,
                                            lat: m.lat, lng: m.lng, area: m.area, cluster: m.cluster, desc: m.desc,
                                        }));
                                        webviewRef.current.injectJavaScript(`updateMarkers(${JSON.stringify(markersData)}, '${activeFilter}'); updateHotspots(${JSON.stringify(DYNAMIC_HOTSPOTS)}, ${showHotspot}); true;`);
                                    }
                                }}
                                activeOpacity={0.7}
                                style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' }}
                            >
                                <ArrowClockwise size={19} color="rgba(255,255,255,0.75)" weight="duotone" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Alert bar */}
                    {criticalCount > 0 && (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={{
                                flexDirection: 'row', alignItems: 'center', gap: 8,
                                marginTop: 10, paddingHorizontal: 12, paddingVertical: 8,
                                borderRadius: 12,
                                backgroundColor: 'rgba(231,76,60,0.18)',
                                borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)',
                            }}
                        >
                            <WarningDiamond size={17} color="#ef4444" weight="fill" />
                            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#fca5a5' }}>
                                {criticalCount} titik <Text style={{ color: '#fff' }}>Kritis</Text> terdeteksi di peta
                            </Text>
                            <View style={{ backgroundColor: '#ef4444', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>DARURAT</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── STATS PANEL (collapsible) ────────────────────────── */}
            {showStats && (
                <View style={{
                    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8,
                    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
                }}>
                    {[
                        { label: 'Total', value: LIVE_MARKERS.length, color: SiagaColors.primary, bg: '#f4f7fb' },
                        { label: 'Kritis', value: LIVE_MARKERS.filter(r => r.severity === 'Kritis').length, color: '#ef4444', bg: '#fef2f2' },
                        { label: 'Banjir', value: LIVE_MARKERS.filter(r => r.category === 'Banjir').length, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Hotspot', value: DYNAMIC_HOTSPOTS.length, color: '#f97316', bg: '#fff7ed' },
                    ].map((s, i) => (
                        <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: s.bg }}>
                            <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.value}</Text>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: SiagaColors.secondary, marginTop: 1 }}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* ── FILTER LEGEND BAR ────────────────────────────────── */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.97)', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', zIndex: 9 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}
                >
                    {FILTER_CATEGORIES.map(cat => (
                        <LegendChip
                            key={cat}
                            cat={cat}
                            active={activeFilter === cat}
                            onPress={() => handleFilterChange(cat)}
                        />
                    ))}
                    {/* Divider */}
                    <View style={{ width: 1, height: 28, backgroundColor: '#edf2f9', alignSelf: 'center', marginHorizontal: 4 }} />
                    {/* Hotspot toggle */}
                    <TouchableOpacity
                        onPress={toggleHotspot}
                        activeOpacity={0.75}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 5,
                            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                            backgroundColor: showHotspot ? 'rgba(239,68,68,0.12)' : '#fff',
                            borderWidth: 1, borderColor: showHotspot ? '#ef4444' : '#edf2f9',
                        }}
                    >
                        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: showHotspot ? '#ef4444' : '#cbd5e1' }} />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: showHotspot ? '#ef4444' : SiagaColors.secondary }}>Hotspot</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* ── FULL SCREEN MAP ──────────────────────────────────── */}
            <View style={{ flex: 1, position: 'relative' }}>
                <WebView
                    ref={webviewRef}
                    source={{ html: buildMapHtml(LIVE_MARKERS, DYNAMIC_HOTSPOTS, activeFilter, showHotspot) }}
                    style={{ flex: 1 }}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    onLoadEnd={() => { setLoading(false); setMapReady(true); }}
                    onMessage={handleMessage}
                    renderLoading={() => (
                        <View style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: '#f4f7fb', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <MapTrifold size={30} color={SiagaColors.info} weight="duotone" />
                            </View>
                            <ActivityIndicator size="large" color={SiagaColors.info} style={{ marginBottom: 8 }} />
                            <Text style={{ fontSize: 13, color: SiagaColors.secondary, fontWeight: '600' }}>Memuat peta laporan...</Text>
                        </View>
                    )}
                />

                {/* ── MAP LEGEND OVERLAY ─────────────────────────── */}
                <View style={{
                    position: 'absolute', top: 12, left: 12, zIndex: 20,
                }}>
                    <TouchableOpacity
                        onPress={() => setShowLegend(l => !l)}
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 5,
                            backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 7,
                            borderRadius: 12, elevation: 4,
                            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12, shadowRadius: 6,
                        }}
                    >
                        <Stack size={16} color={SiagaColors.primary} weight="duotone" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: SiagaColors.primary }}>Legenda</Text>
                        {showLegend ? <CaretUp size={12} color={SiagaColors.secondary} weight="bold" /> : <CaretDown size={12} color={SiagaColors.secondary} weight="bold" />}
                    </TouchableOpacity>

                    {showLegend && (
                        <View style={{
                            marginTop: 6, backgroundColor: '#fff', borderRadius: 14, padding: 10, gap: 7,
                            elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12, shadowRadius: 6, minWidth: 160,
                        }}>
                            {(Object.entries(CATEGORY_MAP) as [CategoryKey, typeof CATEGORY_MAP[CategoryKey]][]).map(([name, cfg]) => (
                                <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cfg.color }} />
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>{name}</Text>
                                </View>
                            ))}
                            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 2 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.18)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' }} />
                                <Text style={{ fontSize: 12, fontWeight: '600', color: SiagaColors.primary }}>Hotspot</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ── REPORT COUNT BADGE ────────────────────────── */}
                <View style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 20,
                    backgroundColor: SiagaColors.primary, paddingHorizontal: 12, paddingVertical: 7,
                    borderRadius: 12, elevation: 4,
                    shadowColor: SiagaColors.primary, shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25, shadowRadius: 8,
                }}>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Tampil
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', lineHeight: 20 }}>
                        {filteredCount}
                    </Text>
                    <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: '600' }}>
                        titik laporan
                    </Text>
                </View>
            </View>

            {/* ── BOTTOM SHEET ─────────────────────────────────────── */}
            <Animated.View
                style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    transform: [{ translateY: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
                    paddingBottom: insets.bottom + 8,
                    zIndex: 50,
                }}
                pointerEvents={selectedReport ? 'box-none' : 'none'}
            >
                <ReportBottomSheet
                    report={selectedReport}
                    onClose={closeSheet}
                    onNavigate={() => {
                        const targetReportId = selectedReport?.id;
                        closeSheet();
                        if (!targetReportId) return;
                        setTimeout(() => {
                            router.push({ pathname: '/report-detail', params: { id: targetReportId } });
                        }, 200);
                    }}
                />
            </Animated.View>
        </View>
    );
}
