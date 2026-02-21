// ============================================================
// DUMMY DATA — Ganti dengan API calls saat backend tersedia
// ============================================================

export const dummyUser = {
  id: 'user_001',
  name: 'Diyon Kobi',
  initials: 'DK',
  phone: '+6281234567890',
  location: {
    district: 'Kec. Coblong',
    city: 'Kota Bandung',
    province: 'Jawa Barat',
    lat: -6.8917,
    lng: 107.6107,
  },
  ecoPoints: 285,
  pointsToNextBadge: 15,
  nextBadgeThreshold: 300,
  currentBadge: 'Warga Peduli',
  nextBadge: 'Pahlawan Komunitas',
  notifCount: 3,
};

export const dummyAreaStatus = {
  level: 'WASPADA' as 'AMAN' | 'WASPADA' | 'SIAGA' | 'AWAS',
  activeReports: 12,
  responseRate: 87,
  avgResponseHours: 4.2,
  warningMessage: '5 laporan banjir dalam radius 2 KM dari Anda',
  warningType: 'Banjir',
};

export interface Report {
  id: string;
  type: string;
  gradient: string;
  badge: 'Kritis' | 'Sedang' | 'Rendah';
  badgeBg: string;
  badgeColor: string;
  title: string;
  desc: string;
  distance: string;
  votes: number;
  photos: number;
  time: string;
  urgency: number;
  urgencyColor: string;
  supported: boolean;
}

export interface ReportDetail extends Report {
  reporter: {
    name: string;
    initials: string;
    badge: string;
    reportsCount: number;
  };
  location: {
    address: string;
    district: string;
    city: string;
    lat: number;
    lng: number;
  };
  description: string;
  category: string;
  status: 'Menunggu' | 'Diverifikasi' | 'Ditangani' | 'Selesai';
  statusColor: string;
  statusBg: string;
  createdAt: string;
  updatedAt: string;
  photoUrls: string[];
  comments: {
    id: string;
    user: string;
    initials: string;
    text: string;
    time: string;
    likes: number;
  }[];
  timeline: {
    id: string;
    title: string;
    desc: string;
    time: string;
    status: 'done' | 'active' | 'pending';
  }[];
  respondedBy: string | null;
  estimatedCompletion: string | null;
  verifiedCount: number;
}

export const dummyReports: Report[] = [
  {
    id: 'rep_001',
    type: 'Waves',
    gradient: '#3b82f6',
    badge: 'Kritis',
    badgeBg: '#fee2e2',
    badgeColor: '#dc2626',
    title: 'Banjir Jl. Merdeka',
    desc: 'Air naik 50cm, kendaraan tidak bisa lewat',
    distance: '1.2 KM',
    votes: 24,
    photos: 3,
    time: '10 mnt lalu',
    urgency: 145,
    urgencyColor: '#dc2626',
    supported: false,
  },
  {
    id: 'rep_002',
    type: 'RoadHorizon',
    gradient: '#f59e0b',
    badge: 'Sedang',
    badgeBg: '#fef9c3',
    badgeColor: '#a16207',
    title: 'Jalan Berlubang Jl. Sudirman',
    desc: 'Lubang besar, motor saya jatuh kemarin',
    distance: '800 M',
    votes: 8,
    photos: 5,
    time: '2 jam lalu',
    urgency: 70,
    urgencyColor: '#a16207',
    supported: false,
  },
  {
    id: 'rep_003',
    type: 'Trash',
    gradient: '#10b981',
    badge: 'Rendah',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
    title: 'Sampah Menumpuk Gang Melati',
    desc: 'Belum diangkut selama 1 minggu',
    distance: '300 M',
    votes: 3,
    photos: 2,
    time: '5 jam lalu',
    urgency: 35,
    urgencyColor: '#15803d',
    supported: false,
  },
];

export interface PositiveAction {
  id: string;
  type: string;
  bg: string;
  title: string;
  time: string;
  points: number;
}

export interface ActionDetail extends PositiveAction {
  gradient: string;
  description: string;
  category: string;
  status: 'Terjadwal' | 'Berlangsung' | 'Selesai';
  statusColor: string;
  statusBg: string;
  date: string;
  duration: string;
  location: {
    address: string;
    district: string;
    city: string;
  };
  organizer: {
    name: string;
    initials: string;
    badge: string;
    actionsCount: number;
  };
  participants: {
    id: string;
    name: string;
    initials: string;
  }[];
  totalParticipants: number;
  maxParticipants: number;
  photoUrls: string[];
  impact: {
    label: string;
    value: string;
    type: string;
  }[];
  milestones: {
    id: string;
    title: string;
    desc: string;
    time: string;
    status: 'done' | 'active' | 'pending';
  }[];
  ecoPointsBreakdown: {
    label: string;
    points: number;
  }[];
  comments: {
    id: string;
    user: string;
    initials: string;
    text: string;
    time: string;
    likes: number;
  }[];
  verified: boolean;
  verifiedBy: string;
}

export const dummyPositiveActions: PositiveAction[] = [
  {
    id: 'act_001',
    type: 'Plant',
    bg: '#d1fae5',
    title: 'Bersih-bersih Sungai Cikapundung',
    time: '2 jam lalu',
    points: 50,
  },
  {
    id: 'act_002',
    type: 'RoadHorizon',
    bg: '#dbeafe',
    title: 'Perbaikan Jalan Warga RT 05',
    time: '5 jam lalu',
    points: 30,
  },
  {
    id: 'act_003',
    type: 'Tree',
    bg: '#fef3c7',
    title: 'Tanam Pohon di Taman Kota',
    time: '1 hari lalu',
    points: 40,
  },
];

// ============================================================
// DETAIL AKSI POSITIF
// ============================================================

export const dummyActionDetails: Record<string, ActionDetail> = {
  act_001: {
    id: 'act_001',
    type: 'Plant',
    bg: '#d1fae5',
    gradient: '#059669',
    title: 'Bersih-bersih Sungai Cikapundung',
    time: '2 jam lalu',
    points: 50,
    description: 'Kegiatan gotong royong membersihkan Sungai Cikapundung dari sampah plastik dan limbah rumah tangga. Aksi ini melibatkan warga sekitar, komunitas lingkungan, dan mahasiswa relawan. Sepanjang 500 meter sungai berhasil dibersihkan dari berbagai jenis sampah. Hasilnya, aliran air menjadi lebih lancar dan lingkungan sungai terlihat jauh lebih bersih.',
    category: 'Lingkungan',
    status: 'Selesai',
    statusColor: '#059669',
    statusBg: '#d1fae5',
    date: '21 Feb 2026',
    duration: '3 jam (07:00 - 10:00)',
    location: {
      address: 'Bantaran Sungai Cikapundung, Jl. Siliwangi',
      district: 'Kec. Coblong',
      city: 'Kota Bandung',
    },
    organizer: {
      name: 'Komunitas Bandung Bersih',
      initials: 'KB',
      badge: 'Organisator Aktif',
      actionsCount: 42,
    },
    participants: [
      { id: 'p1', name: 'Ahmad Fauzi', initials: 'AF' },
      { id: 'p2', name: 'Rina Sari', initials: 'RS' },
      { id: 'p3', name: 'Budi Santoso', initials: 'BS' },
      { id: 'p4', name: 'Dewi Lestari', initials: 'DL' },
      { id: 'p5', name: 'Joko Prasetyo', initials: 'JP' },
    ],
    totalParticipants: 28,
    maxParticipants: 30,
    photoUrls: [
      'https://placehold.co/400x300/059669/fff?text=Sungai+Before',
      'https://placehold.co/400x300/059669/fff?text=Proses+Bersih',
      'https://placehold.co/400x300/059669/fff?text=Sungai+After',
      'https://placehold.co/400x300/059669/fff?text=Tim+Relawan',
    ],
    impact: [
      { label: 'Sampah Diangkut', value: '120 kg', type: 'Trash' },
      { label: 'Area Bersih', value: '500 m', type: 'MapPin' },
      { label: 'Relawan', value: '28', type: 'Users' },
      { label: 'Durasi', value: '3 jam', type: 'Clock' },
    ],
    milestones: [
      { id: 'm1', title: 'Perencanaan & Koordinasi', desc: 'Rapat dengan warga dan komunitas', time: '18 Feb', status: 'done' },
      { id: 'm2', title: 'Pengumpulan Alat', desc: 'Sarung tangan, karung, sekop', time: '20 Feb', status: 'done' },
      { id: 'm3', title: 'Pelaksanaan Aksi', desc: 'Gotong royong bersih-bersih sungai', time: '21 Feb', status: 'done' },
      { id: 'm4', title: 'Dokumentasi & Laporan', desc: 'Foto before-after, laporan dampak', time: '21 Feb', status: 'active' },
      { id: 'm5', title: 'Evaluasi & Perawatan', desc: 'Monitoring berkelanjutan', time: '28 Feb', status: 'pending' },
    ],
    ecoPointsBreakdown: [
      { label: 'Partisipasi Aksi', points: 20 },
      { label: 'Dampak Lingkungan', points: 15 },
      { label: 'Dokumentasi', points: 5 },
      { label: 'Bonus Komunitas', points: 10 },
    ],
    comments: [
      { id: 'ca1', user: 'Rina Sari', initials: 'RS', text: 'Sungainya sudah jauh lebih bersih! Semoga rutin diadakan setiap bulan.', time: '1 jam lalu', likes: 12 },
      { id: 'ca2', user: 'Pak Darmawan', initials: 'PD', text: 'Salut untuk semua relawan yang sudah berpartisipasi. Terasa sekali perubahannya.', time: '1 jam lalu', likes: 8 },
      { id: 'ca3', user: 'Dewi Lestari', initials: 'DL', text: 'Senang bisa ikut berkontribusi! Area sungai depan rumah saya jadi bersih.', time: '30 mnt lalu', likes: 5 },
    ],
    verified: true,
    verifiedBy: 'Dinas Lingkungan Hidup Kota Bandung',
  },
  act_002: {
    id: 'act_002',
    type: 'RoadHorizon',
    bg: '#dbeafe',
    gradient: '#2563eb',
    title: 'Perbaikan Jalan Warga RT 05',
    time: '5 jam lalu',
    points: 30,
    description: 'Perbaikan jalan lingkungan di RT 05 yang rusak akibat hujan lebat minggu lalu. Warga bergotong royong mengisi lubang jalan dengan material yang disediakan oleh Kelurahan. Sekitar 10 lubang berhasil ditambal dan 50 meter jalan lingkungan diperbaiki. Hasil kerja dinilai baik oleh petugas kelurahan yang memantau.',
    category: 'Infrastruktur',
    status: 'Berlangsung',
    statusColor: '#2563eb',
    statusBg: '#dbeafe',
    date: '21 Feb 2026',
    duration: '4 jam (08:00 - 12:00)',
    location: {
      address: 'Jl. Gang Dahlia RT 05/RW 03',
      district: 'Kec. Coblong',
      city: 'Kota Bandung',
    },
    organizer: {
      name: 'Ketua RT 05 - Pak Hendra',
      initials: 'PH',
      badge: 'Warga Peduli',
      actionsCount: 12,
    },
    participants: [
      { id: 'p6', name: 'Hendra Wijaya', initials: 'HW' },
      { id: 'p7', name: 'Supriyadi', initials: 'SU' },
      { id: 'p8', name: 'Yanto', initials: 'YT' },
      { id: 'p9', name: 'Agus Salim', initials: 'AS' },
    ],
    totalParticipants: 15,
    maxParticipants: 20,
    photoUrls: [
      'https://placehold.co/400x300/2563eb/fff?text=Jalan+Rusak',
      'https://placehold.co/400x300/2563eb/fff?text=Proses+Perbaikan',
      'https://placehold.co/400x300/2563eb/fff?text=Gotong+Royong',
    ],
    impact: [
      { label: 'Lubang Ditambal', value: '10', type: 'RoadHorizon' },
      { label: 'Jalan Diperbaiki', value: '50 m', type: 'MapPin' },
      { label: 'Relawan', value: '15', type: 'Users' },
      { label: 'Durasi', value: '4 jam', type: 'Clock' },
    ],
    milestones: [
      { id: 'm1', title: 'Survei Kerusakan', desc: 'Pendataan titik jalan rusak', time: '19 Feb', status: 'done' },
      { id: 'm2', title: 'Material Tiba', desc: 'Pasir, batu, semen dari Kelurahan', time: '20 Feb', status: 'done' },
      { id: 'm3', title: 'Perbaikan Dimulai', desc: 'Gotong royong warga RT 05', time: '21 Feb', status: 'active' },
      { id: 'm4', title: 'Finishing & Pengeringan', desc: 'Tunggu semen kering 24 jam', time: '22 Feb', status: 'pending' },
      { id: 'm5', title: 'Evaluasi Kualitas', desc: 'Pengecekan oleh petugas', time: '23 Feb', status: 'pending' },
    ],
    ecoPointsBreakdown: [
      { label: 'Partisipasi Aksi', points: 15 },
      { label: 'Dampak Infrastruktur', points: 10 },
      { label: 'Koordinasi Warga', points: 5 },
    ],
    comments: [
      { id: 'ca4', user: 'Supriyadi', initials: 'SU', text: 'Akhirnya jalan depan rumah diperbaiki. Terima kasih semua!', time: '3 jam lalu', likes: 7 },
      { id: 'ca5', user: 'Ibu Kartini', initials: 'IK', text: 'Bagus sekali, hasilnya rapi. Semoga tahan lama.', time: '4 jam lalu', likes: 4 },
    ],
    verified: true,
    verifiedBy: 'Kelurahan Dago',
  },
  act_003: {
    id: 'act_003',
    type: 'Tree',
    bg: '#fef3c7',
    gradient: '#d97706',
    title: 'Tanam Pohon di Taman Kota',
    time: '1 hari lalu',
    points: 40,
    description: 'Program penanaman pohon di Taman Kota Bandung bersama komunitas hijau dan pelajar SMA. Total 25 bibit pohon ditanam termasuk mahoni, trembesi, dan tabebuya. Kegiatan ini merupakan bagian dari program penghijauan kota yang dicanangkan Pemkot Bandung untuk meningkatkan ruang terbuka hijau di kawasan perkotaan.',
    category: 'Penghijauan',
    status: 'Selesai',
    statusColor: '#059669',
    statusBg: '#d1fae5',
    date: '20 Feb 2026',
    duration: '2 jam (08:00 - 10:00)',
    location: {
      address: 'Taman Kota Bandung, Jl. Aceh',
      district: 'Kec. Bandung Wetan',
      city: 'Kota Bandung',
    },
    organizer: {
      name: 'Komunitas Hijau Bandung',
      initials: 'KH',
      badge: 'Eco Warrior',
      actionsCount: 67,
    },
    participants: [
      { id: 'p10', name: 'Nadia Putri', initials: 'NP' },
      { id: 'p11', name: 'Rizky Aditya', initials: 'RA' },
      { id: 'p12', name: 'Sari Dewi', initials: 'SD' },
      { id: 'p13', name: 'Fajar Nugroho', initials: 'FN' },
      { id: 'p14', name: 'Anisa Rahma', initials: 'AR' },
      { id: 'p15', name: 'Tono Setiawan', initials: 'TS' },
    ],
    totalParticipants: 35,
    maxParticipants: 40,
    photoUrls: [
      'https://placehold.co/400x300/d97706/fff?text=Tanam+Pohon+1',
      'https://placehold.co/400x300/d97706/fff?text=Bibit+Pohon',
      'https://placehold.co/400x300/d97706/fff?text=Tim+Pelajar',
      'https://placehold.co/400x300/d97706/fff?text=Pohon+Baru',
    ],
    impact: [
      { label: 'Pohon Ditanam', value: '25', type: 'Tree' },
      { label: 'Luas RTH', value: '200 m²', type: 'MapPin' },
      { label: 'Relawan', value: '35', type: 'Users' },
      { label: 'Durasi', value: '2 jam', type: 'Clock' },
    ],
    milestones: [
      { id: 'm1', title: 'Koordinasi dengan Pemkot', desc: 'Izin dan lokasi penanaman', time: '15 Feb', status: 'done' },
      { id: 'm2', title: 'Pengadaan Bibit', desc: '25 bibit dari Dinas Pertamanan', time: '18 Feb', status: 'done' },
      { id: 'm3', title: 'Pelaksanaan Tanam', desc: 'Gotong royong penanaman pohon', time: '20 Feb', status: 'done' },
      { id: 'm4', title: 'Penyiraman Rutin', desc: 'Jadwal siram 2x sehari selama 2 minggu', time: '20 Feb - 6 Mar', status: 'active' },
      { id: 'm5', title: 'Monitoring Pertumbuhan', desc: 'Pengecekan kondisi bibit', time: '20 Mar', status: 'pending' },
    ],
    ecoPointsBreakdown: [
      { label: 'Partisipasi Aksi', points: 15 },
      { label: 'Dampak Penghijauan', points: 15 },
      { label: 'Kolaborasi Komunitas', points: 5 },
      { label: 'Bonus Program Kota', points: 5 },
    ],
    comments: [
      { id: 'ca6', user: 'Nadia Putri', initials: 'NP', text: 'Pengalaman yang luar biasa! Senang bisa ikut menanam pohon untuk kota kita.', time: '1 hari lalu', likes: 15 },
      { id: 'ca7', user: 'Rizky Aditya', initials: 'RA', text: 'Taman jadi lebih hijau dan teduh. Semoga pohon-pohonnya tumbuh besar!', time: '1 hari lalu', likes: 9 },
      { id: 'ca8', user: 'Sari Dewi', initials: 'SD', text: 'Ajak anak-anak SMA ternyata efektif sekali. Mereka antusias banget.', time: '22 jam lalu', likes: 11 },
    ],
    verified: true,
    verifiedBy: 'Dinas Pertamanan Kota Bandung',
  },
};

export interface InfoFeed {
  id: string;
  type: string;
  bg: string;
  source: string;
  title: string;
  color: string;
  category: string;
}

export interface InfoDetail extends InfoFeed {
  gradient: string;
  subtitle: string;
  content: string[];
  author: {
    name: string;
    initials: string;
    role: string;
    organization: string;
  };
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  photoUrls: string[];
  tags: string[];
  relatedLinks: {
    title: string;
    url: string;
  }[];
  tips: {
    icon: string;
    title: string;
    desc: string;
  }[];
  stats: {
    views: number;
    shares: number;
    bookmarks: number;
  };
  comments: {
    id: string;
    user: string;
    initials: string;
    text: string;
    time: string;
    likes: number;
  }[];
  verified: boolean;
  verifiedBy: string | null;
}

export const dummyInfoFeed: InfoFeed[] = [
  {
    id: 'info_001',
    type: 'CloudRain',
    bg: '#eff6ff',
    source: 'BMKG • Hari ini',
    title: 'Prakiraan Cuaca: Hujan Lebat di Bandung Selatan',
    color: '#3b82f6',
    category: 'cuaca',
  },
  {
    id: 'info_002',
    type: 'BookOpenText',
    bg: '#ecfdf5',
    source: 'Edukasi • 2 hari lalu',
    title: '5 Langkah Mitigasi Banjir untuk Warga',
    color: '#10b981',
    category: 'edukasi',
  },
  {
    id: 'info_003',
    type: 'MegaphoneSimple',
    bg: '#fffbeb',
    source: 'Pengumuman • Dinas PU',
    title: 'Perbaikan Jalan Sudirman Dimulai 20 Feb',
    color: '#f59e0b',
    category: 'pengumuman',
  },
];

// ============================================================
// DETAIL INFO & EDUKASI
// ============================================================

export const dummyInfoDetails: Record<string, InfoDetail> = {
  info_001: {
    id: 'info_001',
    type: 'CloudRain',
    bg: '#eff6ff',
    gradient: '#3b82f6',
    source: 'BMKG • Hari ini',
    title: 'Prakiraan Cuaca: Hujan Lebat di Bandung Selatan',
    subtitle: 'Waspada potensi banjir dan longsor di kawasan dataran rendah',
    color: '#3b82f6',
    category: 'cuaca',
    content: [
      'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) merilis peringatan dini cuaca untuk wilayah Bandung Selatan. Berdasarkan analisis citra satelit dan model cuaca numerik, diprediksi akan terjadi hujan lebat disertai petir dan angin kencang pada hari ini.',
      'Intensitas hujan diperkirakan mencapai 50-100 mm per hari, yang tergolong dalam kategori hujan lebat. Wilayah yang paling terdampak meliputi Kecamatan Dayeuhkolot, Baleendah, Bojongsoang, dan Margahayu.',
      'Masyarakat yang tinggal di daerah rawan banjir disarankan untuk mempersiapkan langkah-langkah antisipasi, termasuk memindahkan barang berharga ke tempat yang lebih tinggi dan menyiapkan tas darurat berisi dokumen penting.',
      'Kondisi cuaca ini diperkirakan akan berlangsung hingga 3 hari ke depan. BMKG akan terus memperbarui informasi setiap 6 jam sekali melalui aplikasi dan kanal resmi. Pantau terus perkembangan cuaca di wilayah Anda.',
    ],
    author: {
      name: 'Dr. Andi Prasetyo',
      initials: 'AP',
      role: 'Kepala Bidang Prakiraan',
      organization: 'BMKG Stasiun Bandung',
    },
    publishedAt: '21 Feb 2026, 06:00',
    updatedAt: '21 Feb 2026, 08:30',
    readTime: '3 menit',
    photoUrls: [
      'https://placehold.co/400x250/3b82f6/fff?text=Peta+Cuaca',
      'https://placehold.co/400x250/3b82f6/fff?text=Citra+Satelit',
      'https://placehold.co/400x250/3b82f6/fff?text=Prakiraan+Hujan',
    ],
    tags: ['Cuaca', 'Peringatan Dini', 'Hujan Lebat', 'Bandung Selatan'],
    relatedLinks: [
      { title: 'Website resmi BMKG', url: 'https://bmkg.go.id' },
      { title: 'Info prakiraan cuaca harian', url: 'https://cuaca.bmkg.go.id' },
    ],
    tips: [
      { icon: 'Umbrella', title: 'Bawa Payung', desc: 'Selalu siapkan payung atau jas hujan saat keluar rumah' },
      { icon: 'Warning', title: 'Hindari Genangan', desc: 'Jangan melintas di area genangan air yang dalam' },
      { icon: 'Lightning', title: 'Waspada Petir', desc: 'Jauhi pohon tinggi dan tiang listrik saat hujan petir' },
      { icon: 'House', title: 'Siapkan Darurat', desc: 'Siapkan senter, makanan, dan obat-obatan darurat' },
    ],
    stats: { views: 1240, shares: 89, bookmarks: 156 },
    comments: [
      { id: 'ci1', user: 'Ahmad Fauzi', initials: 'AF', text: 'Terima kasih infonya. Sudah siap-siap di rumah dari tadi pagi.', time: '2 jam lalu', likes: 15 },
      { id: 'ci2', user: 'Rina Sari', initials: 'RS', text: 'Di Dayeuhkolot sudah mulai gerimis sejak subuh. Semoga tidak banjir lagi.', time: '1 jam lalu', likes: 8 },
      { id: 'ci3', user: 'Budi Santoso', initials: 'BS', text: 'Tolong tambahkan info jalur evakuasi juga dong.', time: '30 mnt lalu', likes: 22 },
    ],
    verified: true,
    verifiedBy: 'BMKG Stasiun Geofisika Bandung',
  },
  info_002: {
    id: 'info_002',
    type: 'BookOpenText',
    bg: '#ecfdf5',
    gradient: '#10b981',
    source: 'Edukasi • 2 hari lalu',
    title: '5 Langkah Mitigasi Banjir untuk Warga',
    subtitle: 'Panduan praktis kesiapsiagaan banjir untuk rumah tangga',
    color: '#10b981',
    category: 'edukasi',
    content: [
      'Banjir merupakan salah satu bencana alam yang paling sering terjadi di Indonesia, terutama saat musim penghujan. Kesiapsiagaan yang baik dapat meminimalkan kerugian material dan menyelamatkan nyawa.',
      'Langkah pertama adalah mengenali tanda-tanda banjir. Perhatikan curah hujan yang tinggi secara terus-menerus, naiknya permukaan air sungai, dan peringatan dini dari BMKG. Jangan abaikan informasi dari RT/RW setempat.',
      'Langkah kedua, siapkan tas darurat (go-bag) berisi dokumen penting, obat-obatan, pakaian ganti, senter, power bank, dan makanan tahan lama minimal untuk 3 hari. Simpan di tempat yang mudah dijangkau.',
      'Langkah ketiga, pastikan saluran air di sekitar rumah tidak tersumbat. Bersihkan got, selokan, dan drainase secara berkala. Sampah yang menumpuk di saluran air adalah penyebab utama banjir lokal.',
      'Langkah keempat, tentukan titik kumpul dan jalur evakuasi bersama keluarga. Pastikan semua anggota keluarga tahu ke mana harus pergi jika banjir datang. Simpan nomor darurat yang penting.',
      'Langkah kelima, ikut serta dalam kegiatan gotong royong lingkungan. Pencegahan banjir adalah tanggung jawab bersama. Berpartisipasi dalam kerja bakti bersih-bersih sungai dan perawatan drainase.',
    ],
    author: {
      name: 'Tim Redaksi ProxoCoris',
      initials: 'PC',
      role: 'Tim Edukasi',
      organization: 'ProxoCoris',
    },
    publishedAt: '19 Feb 2026, 10:00',
    updatedAt: '19 Feb 2026, 10:00',
    readTime: '5 menit',
    photoUrls: [
      'https://placehold.co/400x250/10b981/fff?text=Mitigasi+Banjir',
      'https://placehold.co/400x250/10b981/fff?text=Tas+Darurat',
      'https://placehold.co/400x250/10b981/fff?text=Jalur+Evakuasi',
    ],
    tags: ['Edukasi', 'Mitigasi', 'Banjir', 'Kesiapsiagaan'],
    relatedLinks: [
      { title: 'Panduan BNPB tentang banjir', url: 'https://bnpb.go.id' },
      { title: 'Checklist tas darurat', url: 'https://siaga.bnpb.go.id' },
    ],
    tips: [
      { icon: 'Backpack', title: 'Siapkan Go-Bag', desc: 'Tas darurat untuk keluarga berisi kebutuhan 3 hari' },
      { icon: 'Drop', title: 'Bersihkan Drainase', desc: 'Cek dan bersihkan saluran air rumah setiap minggu' },
      { icon: 'MapTrifold', title: 'Cari Jalur Evakuasi', desc: 'Tentukan rute evakuasi dan titik kumpul keluarga' },
      { icon: 'Phone', title: 'Simpan Nomor Darurat', desc: '112 (Darurat), 113 (Pemadam), 118 (Ambulance)' },
    ],
    stats: { views: 3420, shares: 245, bookmarks: 512 },
    comments: [
      { id: 'ci4', user: 'Dewi Lestari', initials: 'DL', text: 'Sangat informatif! Saya sudah siapkan tas darurat sejak baca artikel ini.', time: '1 hari lalu', likes: 28 },
      { id: 'ci5', user: 'Pak Darmawan', initials: 'PD', text: 'Good article. Harusnya diajarkan juga di sekolah-sekolah.', time: '2 hari lalu', likes: 34 },
    ],
    verified: true,
    verifiedBy: 'BPBD Kota Bandung',
  },
  info_003: {
    id: 'info_003',
    type: 'MegaphoneSimple',
    bg: '#fffbeb',
    gradient: '#f59e0b',
    source: 'Pengumuman • Dinas PU',
    title: 'Perbaikan Jalan Sudirman Dimulai 20 Feb',
    subtitle: 'Pengalihan lalu lintas selama proses perbaikan 14 hari',
    color: '#f59e0b',
    category: 'pengumuman',
    content: [
      'Dinas Pekerjaan Umum (PU) Kota Bandung mengumumkan dimulainya proyek perbaikan Jl. Sudirman pada tanggal 20 Februari 2026. Proyek ini mencakup perbaikan aspal, penataan trotoar, dan perbaikan saluran drainase sepanjang 1.2 kilometer.',
      'Pekerjaan akan dilakukan secara bertahap, dimulai dari segmen depan Halte Dago hingga Simpang Dago. Estimasi waktu pengerjaan adalah 14 hari kerja, dengan target penyelesaian pada 10 Maret 2026.',
      'Selama masa perbaikan, akan diberlakukan pengalihan arus lalu lintas. Kendaraan dari arah utara dialihkan melalui Jl. Riau, sementara dari arah selatan melalui Jl. Diponegoro. Rambu pengalihan sudah dipasang di titik-titik strategis.',
      'Dinas PU memastikan pekerjaan akan dilakukan pada jam 08:00 – 17:00 WIB untuk meminimalkan gangguan. Pada jam sibuk pagi dan sore, sebagian jalur tetap dibuka untuk arus kendaraan. Warga dimohon kesabarannya selama proses perbaikan berlangsung.',
    ],
    author: {
      name: 'Ir. Bambang Sutopo',
      initials: 'BS',
      role: 'Kepala Bidang Bina Marga',
      organization: 'Dinas PU Kota Bandung',
    },
    publishedAt: '18 Feb 2026, 14:00',
    updatedAt: '20 Feb 2026, 09:00',
    readTime: '4 menit',
    photoUrls: [
      'https://placehold.co/400x250/f59e0b/fff?text=Peta+Pengalihan',
      'https://placehold.co/400x250/f59e0b/fff?text=Jalan+Rusak',
      'https://placehold.co/400x250/f59e0b/fff?text=Proses+Perbaikan',
    ],
    tags: ['Pengumuman', 'Infrastruktur', 'Jalan Sudirman', 'Pengalihan Lalu Lintas'],
    relatedLinks: [
      { title: 'Peta pengalihan lalu lintas', url: '#' },
      { title: 'Info proyek Dinas PU', url: '#' },
    ],
    tips: [
      { icon: 'NavigationArrow', title: 'Rute Alternatif', desc: 'Gunakan Jl. Riau atau Jl. Diponegoro sebagai alternatif' },
      { icon: 'Clock', title: 'Jam Kerja', desc: 'Pekerjaan berlangsung 08:00 - 17:00 WIB' },
      { icon: 'CalendarBlank', title: 'Durasi Proyek', desc: '20 Feb - 10 Mar 2026 (14 hari kerja)' },
      { icon: 'WarningCircle', title: 'Hati-hati', desc: 'Perhatikan rambu pengalihan dan petugas lapangan' },
    ],
    stats: { views: 2180, shares: 167, bookmarks: 298 },
    comments: [
      { id: 'ci6', user: 'Joko Widodo', initials: 'JW', text: 'Akhirnya diperbaiki juga! Sudah berbulan-bulan berlubang parah.', time: '2 hari lalu', likes: 45 },
      { id: 'ci7', user: 'Siti Nurhaliza', initials: 'SN', text: 'Tolong pastikan pengerjaannya tepat waktu ya. Jangan sampai molor.', time: '1 hari lalu', likes: 31 },
      { id: 'ci8', user: 'Andi Pratama', initials: 'AP', text: 'Info pengalihan lalu lintasnya sangat membantu, terima kasih.', time: '1 hari lalu', likes: 12 },
    ],
    verified: true,
    verifiedBy: 'Dinas PU Kota Bandung',
  },
};

export const dummyBudgetWatch = {
  id: 'budget_001',
  title: 'Perbaikan Jalan Merdeka',
  contractor: 'PT. Bangun Jaya',
  budget: 150000000,
  budgetFormatted: 'Rp 150.000.000',
  progress: 80,
  daysLeft: 5,
  rating: 3.8,
  flagCount: 1,
};

export const dummyEmergencyContacts = [
  { id: 'ec_001', name: 'Pemadam', num: '113', type: 'FireTruck', color: '#dc2626', bg: '#fef2f2' },
  { id: 'ec_002', name: 'Ambulance', num: '118', type: 'Ambulance', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'ec_003', name: 'Polisi', num: '110', type: 'PoliceCar', color: '#1e3a5f', bg: '#f8fafc' },
  { id: 'ec_004', name: 'SAR', num: '115', type: 'Binoculars', color: '#d97706', bg: '#fffbeb' },
  { id: 'ec_005', name: 'Darurat', num: '112', type: 'PhoneCall', color: '#059669', bg: '#ecfdf5' },
];

// ============================================================
// DETAIL LAPORAN
// ============================================================

export const dummyReportDetails: Record<string, ReportDetail> = {
  rep_001: {
    id: 'rep_001',
    type: 'Waves',
    gradient: '#3b82f6',
    badge: 'Kritis',
    badgeBg: '#fee2e2',
    badgeColor: '#dc2626',
    title: 'Banjir Jl. Merdeka',
    desc: 'Air naik 50cm, kendaraan tidak bisa lewat',
    description: 'Banjir setinggi 50cm merendam Jl. Merdeka mulai dari perempatan Taman Sari hingga depan Kantor Pos. Kendaraan roda dua dan empat tidak bisa melintas. Beberapa warga sudah mengungsi ke masjid terdekat. Air berwarna keruh kecoklatan dan masih terus naik. Drainase tersumbat sampah dan tidak berfungsi.',
    distance: '1.2 KM',
    votes: 24,
    photos: 3,
    time: '10 mnt lalu',
    urgency: 145,
    urgencyColor: '#dc2626',
    supported: false,
    category: 'Bencana Alam',
    status: 'Diverifikasi',
    statusColor: '#3b82f6',
    statusBg: '#dbeafe',
    createdAt: '21 Feb 2026, 08:30',
    updatedAt: '21 Feb 2026, 08:40',
    reporter: {
      name: 'Ahmad Fauzi',
      initials: 'AF',
      badge: 'Warga Aktif',
      reportsCount: 15,
    },
    location: {
      address: 'Jl. Merdeka No. 45, RT 03/RW 05',
      district: 'Kec. Coblong',
      city: 'Kota Bandung',
      lat: -6.8917,
      lng: 107.6107,
    },
    photoUrls: [
      'https://placehold.co/400x300/3b82f6/fff?text=Banjir+1',
      'https://placehold.co/400x300/3b82f6/fff?text=Banjir+2',
      'https://placehold.co/400x300/3b82f6/fff?text=Banjir+3',
    ],
    comments: [
      { id: 'c1', user: 'Rina Sari', initials: 'RS', text: 'Di depan rumah saya juga sudah masuk. Tolong segera ditangani!', time: '5 mnt lalu', likes: 8 },
      { id: 'c2', user: 'Budi Santoso', initials: 'BS', text: 'Saya sudah hubungi RT, mereka sedang koordinasi dengan kelurahan.', time: '8 mnt lalu', likes: 12 },
      { id: 'c3', user: 'Dewi Lestari', initials: 'DL', text: 'Drainase di ujung jalan tersumbat sampah, butuh pembersihan segera.', time: '10 mnt lalu', likes: 5 },
    ],
    timeline: [
      { id: 't1', title: 'Laporan Dibuat', desc: 'Dilaporkan oleh Ahmad Fauzi', time: '08:30', status: 'done' },
      { id: 't2', title: 'Diverifikasi', desc: 'Terverifikasi oleh 3 warga lain', time: '08:35', status: 'done' },
      { id: 't3', title: 'Tim Dikirim', desc: 'BPBD Kota Bandung', time: '08:40', status: 'active' },
      { id: 't4', title: 'Penanganan', desc: 'Menunggu tim tiba di lokasi', time: '-', status: 'pending' },
      { id: 't5', title: 'Selesai', desc: 'Menunggu penanganan selesai', time: '-', status: 'pending' },
    ],
    respondedBy: 'BPBD Kota Bandung',
    estimatedCompletion: '21 Feb 2026, 12:00',
    verifiedCount: 3,
  },
  rep_002: {
    id: 'rep_002',
    type: 'RoadHorizon',
    gradient: '#f59e0b',
    badge: 'Sedang',
    badgeBg: '#fef9c3',
    badgeColor: '#a16207',
    title: 'Jalan Berlubang Jl. Sudirman',
    desc: 'Lubang besar, motor saya jatuh kemarin',
    description: 'Terdapat lubang berdiameter sekitar 60cm dan kedalaman 20cm di Jl. Sudirman tepat di depan halte bus. Lubang ini sudah menyebabkan satu pengendara motor jatuh kemarin sore. Sangat berbahaya terutama saat malam hari karena minim penerangan. Sudah melapor ke dinas PU tapi belum ada tindakan.',
    distance: '800 M',
    votes: 8,
    photos: 5,
    time: '2 jam lalu',
    urgency: 70,
    urgencyColor: '#a16207',
    supported: false,
    category: 'Infrastruktur',
    status: 'Menunggu',
    statusColor: '#f59e0b',
    statusBg: '#fef9c3',
    createdAt: '21 Feb 2026, 06:45',
    updatedAt: '21 Feb 2026, 06:45',
    reporter: {
      name: 'Siti Nurhaliza',
      initials: 'SN',
      badge: 'Pelapor Baru',
      reportsCount: 3,
    },
    location: {
      address: 'Jl. Sudirman No. 120, depan Halte Dago',
      district: 'Kec. Coblong',
      city: 'Kota Bandung',
      lat: -6.8935,
      lng: 107.6125,
    },
    photoUrls: [
      'https://placehold.co/400x300/f59e0b/fff?text=Lubang+1',
      'https://placehold.co/400x300/f59e0b/fff?text=Lubang+2',
      'https://placehold.co/400x300/f59e0b/fff?text=Lubang+3',
      'https://placehold.co/400x300/f59e0b/fff?text=Lubang+4',
      'https://placehold.co/400x300/f59e0b/fff?text=Lubang+5',
    ],
    comments: [
      { id: 'c4', user: 'Joko Widodo', initials: 'JW', text: 'Saya juga hampir jatuh di lubang ini tadi pagi.', time: '1 jam lalu', likes: 4 },
      { id: 'c5', user: 'Andi Pratama', initials: 'AP', text: 'Sudah ada peringatan ditaruh, tapi lubangnya makin besar.', time: '2 jam lalu', likes: 2 },
    ],
    timeline: [
      { id: 't1', title: 'Laporan Dibuat', desc: 'Dilaporkan oleh Siti Nurhaliza', time: '06:45', status: 'done' },
      { id: 't2', title: 'Menunggu Verifikasi', desc: '5 verifikasi diperlukan', time: '-', status: 'active' },
      { id: 't3', title: 'Diteruskan ke Dinas', desc: 'Menunggu verifikasi selesai', time: '-', status: 'pending' },
      { id: 't4', title: 'Penanganan', desc: 'Belum dijadwalkan', time: '-', status: 'pending' },
      { id: 't5', title: 'Selesai', desc: 'Menunggu penanganan', time: '-', status: 'pending' },
    ],
    respondedBy: null,
    estimatedCompletion: null,
    verifiedCount: 2,
  },
  rep_003: {
    id: 'rep_003',
    type: 'Trash',
    gradient: '#10b981',
    badge: 'Rendah',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
    title: 'Sampah Menumpuk Gang Melati',
    desc: 'Belum diangkut selama 1 minggu',
    description: 'Tumpukan sampah di Gang Melati RT 02 sudah menggunung dan menimbulkan bau tidak sedap. Sampah sudah tidak diangkut selama kurang lebih 1 minggu. Beberapa warga membuang sampah di pinggir jalan karena tempat penampungan sudah penuh. Lalat dan tikus mulai bermunculan di area ini.',
    distance: '300 M',
    votes: 3,
    photos: 2,
    time: '5 jam lalu',
    urgency: 35,
    urgencyColor: '#15803d',
    supported: false,
    category: 'Lingkungan',
    status: 'Ditangani',
    statusColor: '#27ae60',
    statusBg: '#dcfce7',
    createdAt: '21 Feb 2026, 03:15',
    updatedAt: '21 Feb 2026, 07:00',
    reporter: {
      name: 'Pak Darmawan',
      initials: 'PD',
      badge: 'Warga Peduli',
      reportsCount: 28,
    },
    location: {
      address: 'Gang Melati RT 02/RW 08',
      district: 'Kec. Coblong',
      city: 'Kota Bandung',
      lat: -6.8890,
      lng: 107.6090,
    },
    photoUrls: [
      'https://placehold.co/400x300/10b981/fff?text=Sampah+1',
      'https://placehold.co/400x300/10b981/fff?text=Sampah+2',
    ],
    comments: [
      { id: 'c6', user: 'Ibu Kartini', initials: 'IK', text: 'Akhirnya ada yang laporkan. Sudah bau sampai ke rumah saya.', time: '4 jam lalu', likes: 6 },
    ],
    timeline: [
      { id: 't1', title: 'Laporan Dibuat', desc: 'Dilaporkan oleh Pak Darmawan', time: '03:15', status: 'done' },
      { id: 't2', title: 'Diverifikasi', desc: 'Terverifikasi oleh 5 warga', time: '04:00', status: 'done' },
      { id: 't3', title: 'Diteruskan ke DLH', desc: 'Dinas Lingkungan Hidup', time: '05:30', status: 'done' },
      { id: 't4', title: 'Sedang Ditangani', desc: 'Armada kebersihan dijadwalkan', time: '07:00', status: 'active' },
      { id: 't5', title: 'Selesai', desc: 'Menunggu pengangkutan', time: '-', status: 'pending' },
    ],
    respondedBy: 'Dinas Lingkungan Hidup',
    estimatedCompletion: '21 Feb 2026, 15:00',
    verifiedCount: 5,
  },
};

// ============================================================
// PROFIL & PENGATURAN
// ============================================================

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  address: string;
  location: {
    district: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
  };
  ecoPoints: number;
  pointsToNextBadge: number;
  nextBadgeThreshold: number;
  currentBadge: string;
  nextBadge: string;
  notifCount: number;
  joinedDate: string;
  totalReports: number;
  totalActions: number;
  totalVerifications: number;
  rank: number;
  bio: string;
}

export const dummyUserProfile: UserProfile = {
  id: 'user_001',
  name: 'Diyon Kobi',
  initials: 'DK',
  email: 'diyon.kobi@email.com',
  phone: '+6281234567890',
  birthDate: '15 Maret 1998',
  gender: 'Laki-laki',
  address: 'Jl. Dago No. 45, RT 03/RW 05',
  location: {
    district: 'Kec. Coblong',
    city: 'Kota Bandung',
    province: 'Jawa Barat',
    lat: -6.8917,
    lng: 107.6107,
  },
  ecoPoints: 285,
  pointsToNextBadge: 15,
  nextBadgeThreshold: 300,
  currentBadge: 'Warga Peduli',
  nextBadge: 'Pahlawan Komunitas',
  notifCount: 3,
  joinedDate: '10 Januari 2026',
  totalReports: 24,
  totalActions: 12,
  totalVerifications: 38,
  rank: 42,
  bio: 'Warga aktif yang peduli terhadap lingkungan dan infrastruktur kota Bandung.',
};

export interface ActivityItem {
  id: string;
  type: 'report' | 'action' | 'support' | 'verify' | 'comment' | 'badge';
  icon: string;
  bgColor: string;
  color: string;
  title: string;
  desc: string;
  time: string;
  date: string;
  points: number;
  status?: string;
  statusColor?: string;
  refId?: string;
}

export const dummyActivities: ActivityItem[] = [
  { id: 'act_h01', type: 'report', icon: 'Camera', bgColor: '#eff6ff', color: '#3b82f6', title: 'Melaporkan: Banjir Jl. Merdeka', desc: 'Banjir setinggi 50cm di Jl. Merdeka', time: '10 menit lalu', date: '21 Feb 2026', points: 10, status: 'Diverifikasi', statusColor: '#3b82f6', refId: 'rep_001' },
  { id: 'act_h02', type: 'action', icon: 'Trash', bgColor: '#ecfdf5', color: '#059669', title: 'Aksi: Bersih-bersih Sungai', desc: 'Gotong royong membersihkan Sungai Cikapundung', time: '2 jam lalu', date: '21 Feb 2026', points: 50, status: 'Selesai', statusColor: '#059669', refId: 'act_001' },
  { id: 'act_h03', type: 'support', icon: 'ThumbsUp', bgColor: '#fef3c7', color: '#d97706', title: 'Dukungan: Perbaikan Jalan', desc: 'Mendukung laporan jalan berlubang Jl. Sudirman', time: '5 jam lalu', date: '21 Feb 2026', points: 5, refId: 'rep_002' },
  { id: 'act_h04', type: 'verify', icon: 'ShieldCheck', bgColor: '#f0fdf4', color: '#16a34a', title: 'Verifikasi: Sampah Gang Melati', desc: 'Memverifikasi laporan sampah menumpuk', time: '6 jam lalu', date: '21 Feb 2026', points: 5, refId: 'rep_003' },
  { id: 'act_h05', type: 'comment', icon: 'ChatCircle', bgColor: '#eff6ff', color: '#3b82f6', title: 'Komentar: Banjir Jl. Merdeka', desc: 'Mengomentari laporan banjir', time: '8 jam lalu', date: '21 Feb 2026', points: 2 },
  { id: 'act_h06', type: 'badge', icon: 'Medal', bgColor: '#fef3c7', color: '#f59e0b', title: 'Badge: Pelapor Handal', desc: 'Mendapatkan badge Pelapor Handal', time: '1 hari lalu', date: '20 Feb 2026', points: 25 },
  { id: 'act_h07', type: 'report', icon: 'Camera', bgColor: '#fff7ed', color: '#ea580c', title: 'Melaporkan: Jalan Rusak Dago', desc: 'Jalan rusak dan berlubang di Jl. Dago Atas', time: '1 hari lalu', date: '20 Feb 2026', points: 10, status: 'Menunggu', statusColor: '#f59e0b' },
  { id: 'act_h08', type: 'action', icon: 'Tree', bgColor: '#ecfdf5', color: '#059669', title: 'Aksi: Tanam Pohon', desc: 'Ikut kegiatan tanam pohon di Taman Kota', time: '2 hari lalu', date: '19 Feb 2026', points: 40, status: 'Selesai', statusColor: '#059669', refId: 'act_003' },
  { id: 'act_h09', type: 'support', icon: 'ThumbsUp', bgColor: '#fce7f3', color: '#ec4899', title: 'Dukungan: Genangan Asia-Afrika', desc: 'Mendukung laporan genangan air di Jl. Asia-Afrika', time: '3 hari lalu', date: '18 Feb 2026', points: 5 },
  { id: 'act_h10', type: 'verify', icon: 'ShieldCheck', bgColor: '#f0fdf4', color: '#16a34a', title: 'Verifikasi: Perbaikan Jalan RT 05', desc: 'Memverifikasi aksi perbaikan jalan warga', time: '4 hari lalu', date: '17 Feb 2026', points: 5, refId: 'act_002' },
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const dummyFAQ: FAQItem[] = [
  { id: 'faq_01', question: 'Bagaimana cara membuat laporan?', answer: 'Buka tab Lapor, ambil foto, isi detail lokasi dan deskripsi masalah, lalu kirim. Laporan Anda akan diverifikasi oleh warga sekitar sebelum diteruskan ke dinas terkait.', category: 'Laporan' },
  { id: 'faq_02', question: 'Apa itu Eco-Points?', answer: 'Eco-Points adalah poin reward yang didapat saat berkontribusi di SIAGA. Anda mendapat poin dari membuat laporan (+10), berpartisipasi dalam aksi (+50), mendukung laporan (+5), dan memverifikasi (+5). Poin dapat ditukar dengan badge dan hadiah.', category: 'Eco-Points' },
  { id: 'faq_03', question: 'Bagaimana cara mendapatkan badge?', answer: 'Badge didapatkan berdasarkan akumulasi Eco-Points dan aktivitas. Setiap level badge memiliki threshold poin tertentu. Contoh: Warga Peduli (100 pts), Relawan Aktif (200 pts), Pahlawan Komunitas (300 pts).', category: 'Badge' },
  { id: 'faq_04', question: 'Apakah laporan saya anonim?', answer: 'Secara default, nama pelapor ditampilkan untuk membangun kepercayaan. Namun, Anda bisa memilih opsi anonim saat membuat laporan jika diperlukan.', category: 'Privasi' },
  { id: 'faq_05', question: 'Bagaimana proses penanganan laporan?', answer: 'Setelah dibuat, laporan akan diverifikasi warga (min. 3 verifikasi), lalu diteruskan ke dinas terkait. Tim lapangan akan dikirim dan progress bisa dipantau real-time melalui halaman Pantau.', category: 'Laporan' },
  { id: 'faq_06', question: 'Apa itu fitur SOS darurat?', answer: 'Fitur SOS memungkinkan Anda mengirim sinyal darurat beserta lokasi GPS ke layanan darurat (112), pemadam (113), ambulance (118), dan polisi (110) dalam satu ketukan.', category: 'Darurat' },
  { id: 'faq_07', question: 'Bagaimana cara berpartisipasi dalam aksi positif?', answer: 'Buka halaman Beranda, scroll ke bagian Aksi Positif, dan pilih aksi yang ingin diikuti. Klik "Gabung" untuk mendaftar. Anda akan mendapat notifikasi saat acara dimulai.', category: 'Aksi Positif' },
  { id: 'faq_08', question: 'Apakah data saya aman?', answer: 'Ya, SIAGA menggunakan enkripsi end-to-end dan mematuhi standar keamanan data. Data lokasi hanya digunakan saat diperlukan. Anda dapat mengelola pengaturan privasi di menu Pengaturan.', category: 'Privasi' },
];
