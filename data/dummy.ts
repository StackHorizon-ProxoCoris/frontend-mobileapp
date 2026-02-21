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

export const dummyInfoFeed = [
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
