import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Loader2 } from 'lucide-react';
import { useJasa } from '../hooks/useJasa';
import { formatPrice } from '../data/mockProducts';
import { JASA_CATEGORY_LABELS, type JasaCategory } from '../types';

const categories: { value: JasaCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  ...Object.entries(JASA_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as JasaCategory,
    label,
  })),
];

export default function JasaPage() {
  const [category, setCategory] = useState<JasaCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { items, loading, error } = useJasa({ category, search });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Jasa Warga</h1>
        <p className="text-sm text-gray-500 mt-1">
          Temukan jasa dari warga setempat — tukang, fotografer, les privat, dan lainnya
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari jasa atau penyedia..."
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
          Memuat jasa...
        </div>
      )}

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error} — menampilkan data demo.
        </p>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="font-medium">Jasa tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci atau kategori lain</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/jasa/${item.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:ring-2 hover:ring-blue-100 transition group"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {JASA_CATEGORY_LABELS[item.category]}
                </span>
                <p className="font-semibold text-gray-800 mt-2">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.provider_name} · {item.village}</p>
                <p className="text-red-600 font-bold text-sm mt-2">
                  {formatPrice(item.price)} <span className="text-gray-400 font-normal">/ {item.price_unit}</span>
                </p>
                <div className="flex items-center gap-0.5 mt-2">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{item.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
