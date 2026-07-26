import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-16 sm:py-24 text-center">
      <p className="text-6xl sm:text-7xl font-bold text-red-600">404</p>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4">Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan. Coba jelajahi katalog produk desa kami.
      </p>
      <div className="flex gap-3 justify-center mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Home className="w-4 h-4" />
          Beranda
        </Link>
        <Link
          to="/cari"
          className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-red-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          Cari Produk
        </Link>
      </div>
    </div>
  );
}
