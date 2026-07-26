import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useVillageNews } from '../hooks/useVillageNews';
import { formatNewsDate } from '../lib/villageNews';
import { VILLAGE_NEWS_CATEGORY_LABELS } from '../types';

export default function NewsAndStories() {
  const { items, loading } = useVillageNews();
  const berita = items.filter((n) => n.category === 'berita' || n.category === 'pengumuman').slice(0, 3);
  const ceritaUmkm = items.find((n) => n.category === 'cerita-umkm');

  return (
    <section className="py-6 sm:py-8 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Berita & Informasi Desa</h2>
              <Link to="/info-desa" className="text-red-600 text-xs sm:text-sm font-medium hover:underline flex items-center gap-0.5">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Memuat berita...</span>
              </div>
            )}

            {!loading && berita.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Belum ada berita</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {berita.map((n) => (
                <Link
                  key={n.id}
                  to={`/info-desa/${n.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition-shadow group flex sm:flex-col"
                >
                  <div className="w-24 sm:w-full h-20 sm:h-24 overflow-hidden flex-shrink-0">
                    <img
                      src={n.image_url}
                      alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] text-gray-400 mb-1">{formatNewsDate(n.created_at)}</p>
                    <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{n.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Cerita UMKM Inspiratif</h2>
              <Link to="/info-desa?category=cerita-umkm" className="text-red-600 text-xs sm:text-sm font-medium hover:underline flex items-center gap-0.5">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Memuat cerita...</span>
              </div>
            )}

            {!loading && ceritaUmkm && (
              <Link
                to={`/info-desa/${ceritaUmkm.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition-shadow group block"
              >
                <div className="flex gap-0">
                  <div className="flex-1 p-4">
                    <span className="text-[10px] font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      {VILLAGE_NEWS_CATEGORY_LABELS['cerita-umkm']}
                    </span>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base mt-2">{ceritaUmkm.title}</h3>
                    <p className="text-xs text-red-600 font-medium mb-2">{ceritaUmkm.village}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                      {ceritaUmkm.excerpt}
                    </p>
                    <span className="text-xs border border-red-600 text-red-600 group-hover:bg-red-600 group-hover:text-white px-3 py-1.5 rounded-lg transition-colors font-medium inline-block">
                      Baca Cerita Lengkap
                    </span>
                  </div>
                  <div className="w-28 sm:w-36 h-auto flex-shrink-0">
                    <img
                      src={ceritaUmkm.image_url}
                      alt={ceritaUmkm.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
