import React, { useRef, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, Animated, ScrollView,
    Dimensions, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    MapTrifold, X, ArrowRight,
    Clock, MapPin, Users, WarningDiamond, ArrowClockwise,
    Stack, ChartBar, CaretDown, CaretUp,
} from 'phosphor-react-native';
import { SiagaColors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type SeverityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
type CategoryKey = 'Banjir' | 'Longsor' | 'Jalan Rusak' | 'Kebakaran' | 'Sampah' | 'Lainnya';

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

const REPORT_MARKERS = [
    { id: '#1045', title: 'Banjir Jl. Merdeka', category: 'Banjir' as CategoryKey, severity: 'Kritis' as SeverityLevel, lat: -6.9218, lng: 107.6070, area: 'Kec. Dayeuhkolot', cluster: 15, time: '10 menit lalu', desc: 'Ketinggian air mencapai 60cm, warga kesulitan beraktivitas.' },
    { id: '#1044', title: 'Longsor Tebing Jl. Dago', category: 'Longsor' as CategoryKey, severity: 'Kritis' as SeverityLevel, lat: -6.8869, lng: 107.6101, area: 'Kec. Cibeunying', cluster: 5, time: '30 menit lalu', desc: 'Material longsor menutup sebagian badan jalan.' },
    { id: '#1043', title: 'Kebakaran Warung Jl. ABC', category: 'Kebakaran' as CategoryKey, severity: 'Tinggi' as SeverityLevel, lat: -6.9330, lng: 107.6018, area: 'Kec. Regol', cluster: 2, time: '1 jam lalu', desc: 'Api sudah terkendalikan, butuh pembersihan lokasi.' },
    { id: '#1042', title: 'Jalan Berlubang Jl. Sudirman', category: 'Jalan Rusak' as CategoryKey, severity: 'Sedang' as SeverityLevel, lat: -6.9050, lng: 107.6150, area: 'Kec. Coblong', cluster: 3, time: '2 jam lalu', desc: 'Lubang besar berdiameter ±80cm, berbahaya untuk kendaraan.' },
    { id: '#1041', title: 'Tumpukan Sampah Gg. Melati', category: 'Sampah' as CategoryKey, severity: 'Rendah' as SeverityLevel, lat: -6.9080, lng: 107.6200, area: 'Kec. Coblong', cluster: 8, time: '3 jam lalu', desc: 'Sampah menumpuk selama 4 hari, menimbulkan bau tidak sedap.' },
    { id: '#1039', title: 'Banjir Kec. Antapani', category: 'Banjir' as CategoryKey, severity: 'Tinggi' as SeverityLevel, lat: -6.9153, lng: 107.6545, area: 'Kec. Antapani', cluster: 10, time: '4 jam lalu', desc: 'Drainase tersumbat menyebabkan genangan di pemukiman.' },
    { id: '#1038', title: 'Longsor Jl. Ciumbuleuit', category: 'Longsor' as CategoryKey, severity: 'Sedang' as SeverityLevel, lat: -6.8720, lng: 107.5950, area: 'Kec. Cidadap', cluster: 4, time: '5 jam lalu', desc: 'Lereng longsor pasca hujan deras, 1 rumah terdampak.' },
    { id: '#1037', title: 'Sampah Jl. Pasteur', category: 'Sampah' as CategoryKey, severity: 'Rendah' as SeverityLevel, lat: -6.8940, lng: 107.5880, area: 'Kec. Sukajadi', cluster: 6, time: '6 jam lalu', desc: 'Tumpukan sampah di pinggir jalan utama belum diangkut.' },
    { id: '#1036', title: 'Jalan Rusak Jl. Purnawarman', category: 'Jalan Rusak' as CategoryKey, severity: 'Sedang' as SeverityLevel, lat: -6.9210, lng: 107.6095, area: 'Kec. Sumur Bandung', cluster: 7, time: '7 jam lalu', desc: 'Aspal terkelupas sepanjang 200m, membahayakan pengendara.' },
    { id: '#1035', title: 'Banjir Jl. Soekarno-Hatta', category: 'Banjir' as CategoryKey, severity: 'Tinggi' as SeverityLevel, lat: -6.9432, lng: 107.6381, area: 'Kec. Batununggal', cluster: 12, time: '8 jam lalu', desc: 'Titik banjir langganan, dibutuhkan perbaikan drainase permanen.' },
];

// Hotspot zones: areas with high density
const HOTSPOTS = [
    { lat: -6.9218, lng: 107.6070, radius: 600, count: 18, label: 'Dayeuhkolot' },
    { lat: -6.9080, lng: 107.6180, radius: 500, count: 14, label: 'Coblong' },
    { lat: -6.9432, lng: 107.6381, radius: 450, count: 12, label: 'Batununggal' },
    { lat: -6.9153, lng: 107.6545, radius: 400, count: 10, label: 'Antapani' },
];

const FILTER_CATEGORIES: (CategoryKey | 'Semua')[] = ['Semua', 'Banjir', 'Longsor', 'Jalan Rusak', 'Kebakaran', 'Sampah'];

// ─── Map HTML Generator ───────────────────────────────────────────────────────
function buildMapHtml(activeFilter: string, showHotspot: boolean) {
    const filtered = activeFilter === 'Semua'
        ? REPORT_MARKERS
        : REPORT_MARKERS.filter(r => r.category === activeFilter);

    const markersJS = filtered.map((m, i) => {
        const cat = CATEGORY_MAP[m.category];
        const sevColor = SEVERITY_COLOR[m.severity];
        const isPulse = m.severity === 'Kritis';
        const ringColor = sevColor;
        return `
            var div${i} = L.divIcon({
                className: '',
                html: \`<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
                    ${isPulse ? `<div style="position:absolute;inset:0;border-radius:50%;background:${ringColor};opacity:0.25;animation:pulse 1.5s infinite;"></div>` : ''}
                    <div style="width:32px;height:32px;border-radius:50%;background:${cat.color};border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;">${cat.emoji}</div>
                    <div style="position:absolute;top:-6px;right:-6px;background:${sevColor};color:white;border-radius:8px;padding:1px 5px;font-size:8px;font-weight:700;border:1.5px solid white;">${m.cluster}</div>
                </div>\`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -20]
            });
            var m${i} = L.marker([${m.lat}, ${m.lng}], {icon: div${i}}).addTo(map);
            m${i}.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({type:'marker', id:'${m.id}'}));
            });
        `;
    }).join('\n');

    const hotspotsJS = showHotspot ? HOTSPOTS.map((h, i) => `
        var heat${i} = L.circle([${h.lat}, ${h.lng}], {
            radius: ${h.radius},
            color: 'rgba(239,68,68,0.6)',
            fillColor: 'rgba(239,68,68,0.12)',
            fillOpacity: 1,
            weight: 1.5,
        }).addTo(map);
        heat${i}.bindTooltip('<b>🔴 ${h.label}</b><br>${h.count} laporan', {permanent: false, direction: 'top'});
    `).join('\n') : '';

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
            attribution: '© OpenStreetMap',
            maxZoom: 19,
        }).addTo(map);

        ${hotspotsJS}
        ${markersJS}

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
function LegendChip({ cat, active, onPress }: { cat: CategoryKey | 'Semua'; active: boolean; onPress: () => void }) {
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
    report: typeof REPORT_MARKERS[0] | null;
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
    const webviewRef = useRef<WebView>(null);

    const [activeFilter, setActiveFilter] = useState<CategoryKey | 'Semua'>('Semua');
    const [showHotspot, setShowHotspot] = useState(true);
    const [showLegend, setShowLegend] = useState(false);
    const [selectedReport, setSelectedReport] = useState<typeof REPORT_MARKERS[0] | null>(null);
    const [mapKey, setMapKey] = useState(0); // force reload on filter change
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(false);

    const sheetAnim = useRef(new Animated.Value(0)).current;

    const openSheet = useCallback((report: typeof REPORT_MARKERS[0]) => {
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
                const report = REPORT_MARKERS.find(r => r.id === data.id);
                if (report) openSheet(report);
            } else if (data.type === 'dismiss') {
                closeSheet();
            }
        } catch (_) { }
    }, [openSheet, closeSheet]);

    const handleFilterChange = (cat: CategoryKey | 'Semua') => {
        setActiveFilter(cat);
        setMapKey(k => k + 1);
        closeSheet();
    };

    const toggleHotspot = () => {
        setShowHotspot(h => !h);
        setMapKey(k => k + 1);
    };

    const criticalCount = REPORT_MARKERS.filter(r => r.severity === 'Kritis').length;
    const filteredCount = activeFilter === 'Semua' ? REPORT_MARKERS.length : REPORT_MARKERS.filter(r => r.category === activeFilter).length;

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
                                onPress={() => { setMapKey(k => k + 1); setLoading(true); }}
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
                        { label: 'Total', value: REPORT_MARKERS.length, color: SiagaColors.primary, bg: '#f4f7fb' },
                        { label: 'Kritis', value: REPORT_MARKERS.filter(r => r.severity === 'Kritis').length, color: '#ef4444', bg: '#fef2f2' },
                        { label: 'Banjir', value: REPORT_MARKERS.filter(r => r.category === 'Banjir').length, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Hotspot', value: HOTSPOTS.length, color: '#f97316', bg: '#fff7ed' },
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
                    key={mapKey}
                    ref={webviewRef}
                    source={{ html: buildMapHtml(activeFilter, showHotspot) }}
                    style={{ flex: 1 }}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    onLoadEnd={() => setLoading(false)}
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
                        closeSheet();
                        setTimeout(() => router.push('/report-detail'), 200);
                    }}
                />
            </Animated.View>
        </View>
    );
}
