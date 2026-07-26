import type { VillageNews } from '../types';

export const mockVillageNews: VillageNews[] = [
  {
    id: 'news-1',
    title: 'Panen Raya Padi, Petani Desa Sukamaju Bahagia',
    excerpt: 'Musim panen kali ini menghasilkan 15% lebih banyak dari tahun lalu berkat program bantuan benih unggul.',
    content:
      'Desa Sukamaju merayakan panen raya padi dengan hasil yang melampaui target. Koperasi Merah Putih mendampingi 120 petani dalam program benih unggul dan pupuk organik.\n\nHasil panen diharapkan menstabilkan harga beras lokal dan meningkatkan kesejahteraan warga. Kepala desa menyampaikan apresiasi kepada seluruh petani yang telah bekerja keras sepanjang musim tanam.',
    category: 'berita',
    village: 'Desa Sukamaju',
    image_url:
      'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    author: 'Admin Desa Sukamaju',
    published: true,
    created_at: '2024-05-12T08:00:00.000Z',
  },
  {
    id: 'news-2',
    title: 'Pelatihan Digital Marketing untuk UMKM Desa',
    excerpt: '30 pelaku UMKM mengikuti pelatihan pemasaran digital agar produk desa bisa dijual ke pasar yang lebih luas.',
    content:
      'Koperasi Merah Putih menggelar pelatihan digital marketing selama 3 hari di Balai Desa Wonosari. Peserta belajar membuat konten media sosial, mengelola toko online, dan memanfaatkan ArgasariHub sebagai kanal penjualan.\n\nPelatihan ini merupakan bagian dari program pemberdayaan ekonomi desa yang ditargetkan menjangkau 100 UMKM hingga akhir tahun.',
    category: 'kegiatan',
    village: 'Desa Wonosari',
    image_url:
      'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    author: 'Tim Koperasi',
    published: true,
    created_at: '2024-05-10T10:00:00.000Z',
  },
  {
    id: 'news-3',
    title: 'Koperasi Merah Putih Gelar Bazar Produk Lokal',
    excerpt: 'Bazar minggu ini menampilkan 50+ produk UMKM dari 8 desa sekitar. Gratis masuk untuk warga.',
    content:
      'Bazar produk lokal digelar di balai desa setiap akhir pekan. Pengunjung bisa langsung bertemu penjual, mencicipi kuliner desa, dan berbelanja produk unggulan.\n\nAcara ini mendukung ekonomi sirkular antar-desa dan menjadi ajang promosi bagi UMKM yang baru bergabung di ArgasariHub.',
    category: 'pengumuman',
    village: 'Desa Pucang',
    image_url:
      'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    author: 'Panitia Bazar',
    published: true,
    created_at: '2024-05-08T07:30:00.000Z',
  },
  {
    id: 'news-4',
    title: 'Dari Hobi Jadi Rezeki: Cerita Keripik Bu Siti',
    excerpt: 'Berawal dari hobi membuat keripik di rumah, kini usaha Bu Siti sudah dikenal hingga luar desa.',
    content:
      'Ibu Siti (52) memulai usaha keripik pisang dari dapur rumahnya di Desa Sukamaju. Dengan bantuan Koperasi Merah Putih, produknya kini dipasarkan melalui ArgasariHub dan sudah mempekerjakan 5 warga sekitar.\n\nOmzet bulanan naik 300% dalam setahun terakhir. Bu Siti berbagi tips: konsistensi kualitas dan pemanfaatan platform digital adalah kunci sukses UMKM desa.',
    category: 'cerita-umkm',
    village: 'Desa Sukamaju',
    image_url:
      'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    author: 'Redaksi ArgasariHub',
    published: true,
    created_at: '2024-05-05T09:00:00.000Z',
  },
  {
    id: 'news-5',
    title: 'Pengumuman: Jadwal Pelayanan Administrasi Desa',
    excerpt: 'Pelayanan administrasi kependudukan buka Senin–Jumat pukul 08.00–14.00 WIB.',
    content:
      'Diberitahukan kepada seluruh warga bahwa pelayanan administrasi kependudukan (KTP, KK, surat keterangan) buka Senin hingga Jumat pukul 08.00–14.00 WIB.\n\nUntuk layanan di luar jam operasional, silakan ajukan permohonan melalui aplikasi atau hubungi kantor desa.',
    category: 'pengumuman',
    village: 'Desa Harjosari',
    image_url:
      'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    author: 'Kantor Desa Harjosari',
    published: true,
    created_at: '2024-05-01T06:00:00.000Z',
  },
];
