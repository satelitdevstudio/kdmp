export interface StaticPageContent {
  title: string;
  sections: { heading?: string; body: string }[];
}

export const staticPages: Record<string, StaticPageContent> = {
  'tentang-kami': {
    title: 'Tentang Kami',
    sections: [
      {
        body: 'ArgasariHub adalah platform digital Koperasi Merah Putih untuk ekonomi desa — marketplace UMKM, kuliner desa, jasa warga, event, wisata, dan lowongan kerja lokal.',
      },
      {
        heading: 'Visi',
        body: 'Membangun ekosistem ekonomi desa yang mandiri, terhubung, dan berdaya saing melalui teknologi digital.',
      },
      {
        heading: 'Misi',
        body: 'Menghubungkan produk dan jasa desa dengan pembeli, mendukung UMKM lokal, dan memperkuat gotong royong warga melalui koperasi.',
      },
    ],
  },
  'cara-belanja': {
    title: 'Cara Belanja',
    sections: [
      { body: 'Belanja di ArgasariHub mudah dan aman. Ikuti langkah berikut:' },
      {
        heading: '1. Jelajahi Katalog',
        body: 'Buka menu Produk Desa, Kuliner Desa, atau Jasa Warga. Gunakan fitur pencarian atau filter kategori untuk menemukan barang atau layanan yang Anda inginkan.',
      },
      {
        heading: '2. Tambah ke Keranjang',
        body: 'Klik item untuk melihat detail, tentukan jumlah, lalu tekan "Tambah ke Keranjang". Anda bisa memesan produk, kuliner, dan jasa dalam satu pesanan.',
      },
      {
        heading: '3. Checkout',
        body: 'Buka keranjang, periksa item, lalu lanjut ke checkout. Isi alamat pengiriman dan nomor telepon yang bisa dihubungi.',
      },
      {
        heading: '4. Bayar & Terima Pesanan',
        body: 'Saat ini tersedia pembayaran COD (bayar di tempat). Lacak status pesanan di halaman Pesanan Saya.',
      },
    ],
  },
  'panduan-kurir': {
    title: 'Panduan Kurir',
    sections: [
      {
        body: 'Pengiriman di ArgasariHub ditangani oleh kurir warga setempat yang terdaftar melalui koperasi desa.',
      },
      {
        heading: 'Area Layanan',
        body: 'Kurir melayani pengantaran dalam radius desa dan sekitarnya. Waktu pengiriman kuliner biasanya 30–60 menit tergantung jarak dan ketersediaan kurir.',
      },
      {
        heading: 'Biaya Ongkir',
        body: 'Ongkir dihitung berdasarkan jarak dan jenis barang. Rincian biaya akan ditampilkan saat checkout.',
      },
      {
        heading: 'Ingin Jadi Kurir?',
        body: 'Hubungi kantor Koperasi Merah Putih desa Anda atau kirim pesan melalui halaman Saran & Masukan.',
      },
    ],
  },
  'syarat-ketentuan': {
    title: 'Syarat & Ketentuan',
    sections: [
      {
        body: 'Dengan menggunakan ArgasariHub, Anda setuju dengan syarat dan ketentuan berikut.',
      },
      {
        heading: 'Akun Pengguna',
        body: 'Pengguna wajib memberikan informasi yang benar saat mendaftar. Koperasi berhak menonaktifkan akun yang melanggar ketentuan.',
      },
      {
        heading: 'Transaksi',
        body: 'Harga produk ditentukan oleh penjual UMKM. Koperasi bertindak sebagai fasilitator platform dan tidak bertanggung jawab atas kualitas produk di luar mekanisme komplain resmi.',
      },
      {
        heading: 'Pembatalan',
        body: 'Pesanan dapat dibatalkan sebelum status "Dikonfirmasi". Setelah dikonfirmasi penjual, pembatalan mengikuti kebijakan masing-masing penjual.',
      },
    ],
  },
  'kebijakan-privasi': {
    title: 'Kebijakan Privasi',
    sections: [
      {
        body: 'Koperasi Merah Putih menghargai privasi data pengguna ArgasariHub.',
      },
      {
        heading: 'Data yang Dikumpulkan',
        body: 'Kami mengumpulkan nama, email, nomor telepon, dan alamat pengiriman yang Anda berikan saat registrasi dan checkout.',
      },
      {
        heading: 'Penggunaan Data',
        body: 'Data digunakan untuk memproses pesanan, menghubungi Anda terkait transaksi, dan meningkatkan layanan platform.',
      },
      {
        heading: 'Keamanan',
        body: 'Data disimpan dengan enkripsi melalui infrastruktur Supabase. Kami tidak menjual data pribadi kepada pihak ketiga.',
      },
    ],
  },
  'pusat-bantuan': {
    title: 'Pusat Bantuan',
    sections: [
      {
        body: 'Butuh bantuan? Berikut cara menghubungi tim koperasi:',
      },
      {
        heading: 'Kontak',
        body: 'Telepon: 0812-3456-7890\nEmail: info@koperasimerahputih.id\nAlamat: Jl. Desa No. 17, Desa Sukamaju',
      },
      {
        heading: 'Jam Operasional',
        body: 'Senin–Sabtu, 08.00–17.00 WIB. Di luar jam operasional, pesan WhatsApp akan dibalas keesokan harinya.',
      },
    ],
  },
  'laporkan-masalah': {
    title: 'Laporkan Masalah',
    sections: [
      {
        body: 'Jika Anda mengalami kendala transaksi, produk tidak sesuai, atau masalah lain, silakan laporkan kepada kami.',
      },
      {
        heading: 'Informasi yang Diperlukan',
        body: 'Nomor pesanan, tanggal transaksi, deskripsi masalah, dan foto bukti (jika ada).',
      },
      {
        heading: 'Cara Melaporkan',
        body: 'Kirim email ke info@koperasimerahputih.id dengan subjek "Laporan Masalah — [Nomor Pesanan]" atau hubungi WhatsApp 0812-3456-7890.',
      },
    ],
  },
  'saran-masukan': {
    title: 'Saran & Masukan',
    sections: [
      {
        body: 'Masukan Anda membantu kami meningkatkan ArgasariHub untuk seluruh warga desa.',
      },
      {
        heading: 'Kirim Saran',
        body: 'Email: info@koperasimerahputih.id\nWhatsApp: 0812-3456-7890\nAtau datang langsung ke kantor Koperasi Merah Putih desa Anda.',
      },
    ],
  },
  faq: {
    title: 'FAQ — Pertanyaan Umum',
    sections: [
      {
        heading: 'Apakah bisa belanja tanpa akun?',
        body: 'Anda bisa menjelajahi katalog tanpa login. Untuk checkout dan melacak pesanan, akun diperlukan.',
      },
      {
        heading: 'Metode pembayaran apa yang tersedia?',
        body: 'Saat ini tersedia COD (Cash on Delivery). Integrasi transfer bank, e-wallet, dan QRIS sedang dalam pengembangan.',
      },
      {
        heading: 'Bagaimana cara jadi penjual?',
        body: 'Daftar akun, masuk ke Profil, lalu pilih "Jadi Penjual UMKM". Setelah itu kelola produk di Dashboard Penjual.',
      },
      {
        heading: 'Apakah pengiriman ke luar desa?',
        body: 'Prioritas pengiriman dalam desa dan sekitarnya. Untuk pengiriman lebih jauh, hubungi penjual langsung.',
      },
    ],
  },
};

export const infoLinkMap: Record<string, string> = {
  'Tentang Kami': 'tentang-kami',
  'Cara Belanja': 'cara-belanja',
  'Panduan Kurir': 'panduan-kurir',
  'Syarat & Ketentuan': 'syarat-ketentuan',
  'Kebijakan Privasi': 'kebijakan-privasi',
};

export const helpLinkMap: Record<string, string> = {
  'Pusat Bantuan': 'pusat-bantuan',
  'Cara Belanja': 'cara-belanja',
  'Laporkan Masalah': 'laporkan-masalah',
  'Saran & Masukan': 'saran-masukan',
  FAQ: 'faq',
};
