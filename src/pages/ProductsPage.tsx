import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, ShoppingCart, Loader2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useProductCategories } from '../hooks/useProductCategories';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../data/mockProducts';
import { isPlatformProduct, isSellerProduct, type Product, type ProductCategory } from '../types';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { products, loading, error } = useProducts({ category, search });
  const { categories: productCategories } = useProductCategories();
  const { addItem } = useCart();

  const categories = useMemo(
    () => [
      { value: 'all' as const, label: 'Semua' },
      ...productCategories.map((c) => ({ value: c.slug, label: c.label })),
    ],
    [productCategories]
  );

  const platformProducts = products.filter(isPlatformProduct);
  const sellerProducts = products.filter(isSellerProduct);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearch(q);
      setSearchInput(q);
    }
    const cat = searchParams.get('category');
    if (cat && categories.some((c) => c.value === cat)) {
      setCategory(cat);
    }
  }, [searchParams, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produk Desa</h1>
        <p className="text-sm text-gray-500 mt-1">Dukung UMKM lokal dari berbagai desa</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari produk atau desa..."
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
          Memuat produk...
        </div>
      )}

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error} — menampilkan data demo.
        </p>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="font-medium">Produk tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci atau kategori lain</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="space-y-8">
          {platformProducts.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                Produk Koperasi Argasari
              </h2>
              <p className="text-xs text-gray-500 mb-3">Produk resmi dari koperasi desa hub</p>
              <ProductGrid products={platformProducts} addItem={addItem} badge="Koperasi" />
            </section>
          )}

          {sellerProducts.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                Produk UMKM Penjual
              </h2>
              <p className="text-xs text-gray-500 mb-3">Produk dari penjual UMKM lokal</p>
              <ProductGrid products={sellerProducts} addItem={addItem} badge="UMKM" />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ProductGrid({
  products,
  addItem,
  badge,
}: {
  products: Product[];
  addItem: (product: Product) => void;
  badge: 'Koperasi' | 'UMKM';
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:ring-2 hover:ring-red-100 transition group"
        >
          <Link to={`/produk/${product.id}`}>
            <div className="h-32 sm:h-40 overflow-hidden relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span
                className={`absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  badge === 'Koperasi' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
                }`}
              >
                {badge}
              </span>
            </div>
          </Link>
          <div className="p-3">
            <Link to={`/produk/${product.id}`}>
              <p className="text-sm font-semibold text-gray-800 leading-tight hover:text-red-600 transition-colors line-clamp-2">
                {product.name}
              </p>
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">{product.village}</p>
            <p className="text-red-600 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{product.rating}</span>
              </div>
              <button
                onClick={() => addItem(product)}
                className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-colors"
                aria-label={`Tambah ${product.name} ke keranjang`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
