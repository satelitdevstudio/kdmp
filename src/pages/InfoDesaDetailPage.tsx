import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Loader2 } from 'lucide-react';
import { fetchVillageNewsById, formatNewsDate } from '../lib/villageNews';
import { VILLAGE_NEWS_CATEGORY_LABELS, type VillageNews } from '../types';

const categoryColors: Record<VillageNews['category'], string> = {
  berita: 'bg-blue-100 text-blue-700',
  pengumuman: 'bg-amber-100 text-amber-700',
  kegiatan: 'bg-green-100 text-green-700',
  'cerita-umkm': 'bg-purple-100 text-purple-700',
};

export default function InfoDesaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<VillageNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { item: data, error: fetchError } = await fetchVillageNewsById(id);
      setItem(data);
      setError(fetchError);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat artikel...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">{error ?? 'Artikel tidak ditemukan'}</p>
        <Link to="/info-desa" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke Info Desa
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/info-desa"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Info Desa
      </Link>

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-48 sm:h-64 md:h-80 overflow-hidden">
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        </div>

        <div className="p-5 sm:p-8">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[item.category]}`}>
            {VILLAGE_NEWS_CATEGORY_LABELS[item.category]}
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-3 leading-tight">{item.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatNewsDate(item.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {item.village}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {item.author}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-4 font-medium leading-relaxed border-l-4 border-red-600 pl-4">
            {item.excerpt}
          </p>

          <div className="mt-6 text-sm text-gray-700 leading-relaxed space-y-4">
            {item.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
