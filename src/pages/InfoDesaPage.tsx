import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, Calendar, MapPin } from 'lucide-react';
import { useVillageNews } from '../hooks/useVillageNews';
import { formatNewsDate } from '../lib/villageNews';
import { VILLAGE_NEWS_CATEGORY_LABELS, type VillageNewsCategory } from '../types';

const categories: { value: VillageNewsCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  ...Object.entries(VILLAGE_NEWS_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as VillageNewsCategory,
    label,
  })),
];

const categoryColors: Record<VillageNewsCategory, string> = {
  berita: 'bg-blue-100 text-blue-700',
  pengumuman: 'bg-amber-100 text-amber-700',
  kegiatan: 'bg-green-100 text-green-700',
  'cerita-umkm': 'bg-purple-100 text-purple-700',
};

export default function InfoDesaPage() {
  const [category, setCategory] = useState<VillageNewsCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { items, loading, error } = useVillageNews({ category, search });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Info Desa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Berita, pengumuman, kegiatan, dan cerita inspiratif dari desa-desa sekitar
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari berita atau desa..."
            className="flex-1 px-3 py-2 text-sm outline-none"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors ${
              category === cat.value
                ? 'bg-red-600 text-white font-medium'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Memuat berita...
        </div>
      )}

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error} — menampilkan data demo.
        </p>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="font-medium">Artikel tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci atau kategori lain</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/info-desa/${item.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:ring-2 hover:ring-red-100 transition group"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
                  {VILLAGE_NEWS_CATEGORY_LABELS[item.category]}
                </span>
                <h2 className="text-sm font-semibold text-gray-800 mt-2 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{item.excerpt}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatNewsDate(item.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.village}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
