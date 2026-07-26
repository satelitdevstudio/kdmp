import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { globalSearch, TYPE_LABELS, type SearchResult, type SearchResultType } from '../lib/search';
import StoreStatusBadge from '../components/StoreStatusBadge';

const typeColors: Record<SearchResultType, string> = {
  produk: 'bg-red-100 text-red-700',
  kuliner: 'bg-orange-100 text-orange-700',
  jasa: 'bg-blue-100 text-blue-700',
  event: 'bg-green-100 text-green-700',
  wisata: 'bg-emerald-100 text-emerald-700',
  lowongan: 'bg-purple-100 text-purple-700',
  info: 'bg-indigo-100 text-indigo-700',
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    globalSearch(query).then((data) => {
      if (!cancelled) {
        setResults(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const grouped = results.reduce<Record<SearchResultType, SearchResult[]>>(
    (acc, item) => {
      acc[item.type].push(item);
      return acc;
    },
    {
      produk: [],
      kuliner: [],
      jasa: [],
      event: [],
      wisata: [],
      lowongan: [],
      info: [],
    }
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pencarian</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cari produk, kuliner, jasa, event, wisata, lowongan, dan info desa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6 max-w-xl">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik kata kunci..."
            className="flex-1 px-3 py-2.5 text-sm outline-none"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Mencari...
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="font-medium">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">Coba kata kunci lain</p>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Masukkan kata kunci untuk mulai mencari</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-8">
          <p className="text-sm text-gray-500">
            {results.length} hasil untuk &ldquo;{query}&rdquo;
          </p>

          {(Object.keys(grouped) as SearchResultType[]).map((type) => {
            const items = grouped[type];
            if (items.length === 0) return null;

            return (
              <div key={type}>
                <h2 className="text-sm font-bold text-gray-800 mb-3">{TYPE_LABELS[type]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={item.to}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition flex gap-3 p-3"
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[item.type]}`}>
                          {TYPE_LABELS[item.type]}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                          {item.type === 'kuliner' && (
                            <StoreStatusBadge
                              openingTime={item.opening_time}
                              closingTime={item.closing_time}
                              isAvailable={item.is_available}
                            />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
