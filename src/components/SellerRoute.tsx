import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Loader2, Store } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { isSupabaseConfigured } from '../lib/supabase';

interface SellerRouteProps {
  children: ReactNode;
}

export default function SellerRoute({ children }: SellerRouteProps) {
  const { isSeller, loading, profile } = useProfile();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat...
      </div>
    );
  }

  if (isSupabaseConfigured && !profile) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isSeller) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Akses Penjual Diperlukan</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Daftarkan diri sebagai penjual UMKM di halaman profil untuk mengelola produk.
        </p>
        <Link
          to="/profil"
          className="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Ke Halaman Profil
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
