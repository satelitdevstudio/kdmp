import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export default function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Construction className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
        {description ?? 'Fitur ini sedang dalam pengembangan. Sementara, jelajahi produk desa yang sudah tersedia.'}
      </p>
      <div className="flex gap-3 justify-center mt-6">
        <Link
          to="/produk"
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Lihat Produk Desa
        </Link>
        <Link
          to="/"
          className="border border-gray-300 hover:border-red-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
