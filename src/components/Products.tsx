import { ChevronLeft, ChevronRight, Star, ShoppingCart, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useKuliner } from '../hooks/useKuliner';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';
import { formatPrice } from '../data/mockProducts';
import type { Product } from '../types';
import { isSellerProduct } from '../types';
import StoreStatusBadge from './StoreStatusBadge';

export default function Products() {
  const [umkmOffset, setUmkmOffset] = useState(0);
  const { addItem } = useCart();
  const { products, loading: productsLoading } = useProducts();
  const { items: kulinerItems, loading: kulinerLoading } = useKuliner();
  const { items: featuredProducts, loading: featuredLoading } = useFeaturedProducts();
  const umkmProducts = products.filter(isSellerProduct).slice(0, 5);
  const featuredKuliner = kulinerItems.slice(0, 3);
  const visibleCount = 4;

  return (
    <section className="py-6 sm:py-8 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Produk UMKM Terlaris</h2>
            <Link to="/produk" className="text-red-600 text-xs sm:text-sm font-medium hover:underline flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {productsLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Memuat produk...</span>
            </div>
          )}

          {!productsLoading && umkmProducts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">Belum ada produk tersedia</p>
          )}

          {!productsLoading && umkmProducts.length > 0 && (
          <>
          <div className="hidden sm:block relative">
            <div className="overflow-hidden">
              <div
                className="flex gap-3 transition-transform duration-300"
                style={{ transform: `translateX(-${umkmOffset * (100 / visibleCount)}%)` }}
              >
                {umkmProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={addItem} />
                ))}
              </div>
            </div>
            {umkmOffset > 0 && (
              <button
                onClick={() => setUmkmOffset(Math.max(0, umkmOffset - 1))}
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 z-10"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {umkmOffset < umkmProducts.length - visibleCount && (
              <button
                onClick={() => setUmkmOffset(Math.min(umkmProducts.length - visibleCount, umkmOffset + 1))}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 z-10"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          <div className="sm:hidden flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {umkmProducts.map((p) => (
                <div
                  key={p.id}
                  className="min-w-[140px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 border border-gray-100 flex-shrink-0 transition"
                >
                <Link to={`/produk/${p.id}`}>
                  <div className="h-28 overflow-hidden">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="p-2">
                  <Link to={`/produk/${p.id}`}>
                    <p className="text-[11px] font-semibold text-gray-800 leading-tight mb-0.5">{p.name}</p>
                  </Link>
                  <p className="text-[9px] text-gray-400 mb-1">{p.village}</p>
                  <p className="text-red-600 font-bold text-xs mb-1.5">{formatPrice(p.price)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] text-gray-600">{p.rating}</span>
                    </div>
                    <button
                      onClick={() => addItem(p)}
                      className="bg-red-600 text-white p-1 rounded-lg"
                    >
                      <ShoppingCart className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Kuliner Desa Favorit</h2>
            <Link to="/kuliner" className="text-red-600 text-xs sm:text-sm font-medium hover:underline flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {kulinerLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Memuat kuliner...</span>
            </div>
          )}

          {!kulinerLoading && featuredKuliner.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">Belum ada kuliner tersedia</p>
          )}

          {!kulinerLoading && featuredKuliner.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featuredKuliner.map((k) => (
              <div
                key={k.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex sm:flex-col"
              >
                <Link to={`/kuliner/${k.id}`} className="w-28 sm:w-full h-24 sm:h-36 overflow-hidden flex-shrink-0 block">
                  <img
                    src={k.image_url}
                    alt={k.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/kuliner/${k.id}`}>
                      <p className="text-sm font-semibold text-gray-800 hover:text-red-600">{k.name}</p>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">{k.seller_name}</p>
                      <StoreStatusBadge
                        openingTime={k.opening_time}
                        closingTime={k.closing_time}
                        isAvailable={k.is_available}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-red-600 font-bold text-sm">{formatPrice(k.price)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] text-gray-600">{k.rating}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px]">{k.delivery_time}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/kuliner/${k.id}`}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Pesan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Produk Pilihan</h2>
            <Link to="/produk" className="text-red-600 text-xs sm:text-sm font-medium hover:underline flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Memuat produk pilihan...</span>
            </div>
          )}

          {!featuredLoading && featuredProducts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">Belum ada produk pilihan</p>
          )}

          {!featuredLoading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredProducts.map(({ product }) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition group"
                >
                  <Link to={`/produk/${product.id}`}>
                    <div className="h-28 sm:h-32 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-2.5">
                    <Link to={`/produk/${product.id}`}>
                      <p className="text-xs font-semibold text-gray-800 leading-tight mb-0.5 hover:text-red-600 line-clamp-2">
                        {product.name}
                      </p>
                    </Link>
                    <p className="text-[10px] text-gray-400 mb-1">{product.village}</p>
                    <p className="text-red-600 font-bold text-sm mb-2">{formatPrice(product.price)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-600">{product.rating}</span>
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
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return (
    <div className="min-w-[calc(25%-9px)] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition border border-gray-100 group">
      <Link to={`/produk/${product.id}`}>
        <div className="h-32 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-2.5">
        <Link to={`/produk/${product.id}`}>
          <p className="text-xs font-semibold text-gray-800 leading-tight mb-0.5 hover:text-red-600">{product.name}</p>
        </Link>
        <p className="text-[10px] text-gray-400 mb-1">{product.village}</p>
        <p className="text-red-600 font-bold text-sm mb-2">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] text-gray-600">{product.rating}</span>
          </div>
          <button
            onClick={() => onAdd(product)}
            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
