import { Grid, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProductCategories } from '../hooks/useProductCategories';

export default function Categories() {
  const { categories, loading } = useProductCategories();

  return (
    <section className="bg-white py-4 border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide pb-1">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 py-4 px-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Memuat kategori...</span>
            </div>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/produk?category=${cat.slug}`}
                className="flex flex-col items-center gap-1.5 min-w-[80px] sm:min-w-[100px] group flex-shrink-0 bg-white shadow-sm rounded-xl hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition"
              >
                <div className="w-[80px] h-[60px] sm:w-[100px] sm:h-[72px] rounded-xl overflow-hidden border border-gray-100 group-hover:border-red-300 transition-colors">
                  <img
                    src={cat.image_url}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-700 font-medium text-center leading-tight">
                  {cat.label}
                </span>
              </Link>
            ))
          )}
          <Link
            to="/produk"
            className="flex flex-col items-center gap-1.5 min-w-[80px] sm:min-w-[100px] group flex-shrink-0 bg-white shadow-sm rounded-xl hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition"
          >
            <div className="w-[80px] h-[60px] sm:w-[100px] sm:h-[72px] rounded-xl border border-gray-200 flex items-center justify-center group-hover:border-red-300 transition-colors bg-gray-50">
              <Grid className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700 font-medium">Lihat Semua</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
