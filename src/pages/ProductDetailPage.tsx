import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../data/mockProducts';
import { getProductCategoryLabel } from '../types';
import { useProductCategories } from '../hooks/useProductCategories';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id);
  const { categories } = useProductCategories();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Produk tidak ditemukan</p>
        <Link to="/produk" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/produk"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Produk Desa
      </Link>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 sm:h-80 md:h-96 object-cover"
          />
        </div>

        <div>
          <span className="inline-block text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full mb-2">
            {getProductCategoryLabel(product.category, categories)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{product.village}</p>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Stok: {product.stock}</span>
          </div>

          <p className="text-2xl font-bold text-red-600 mt-4">{formatPrice(product.price)}</p>

          <p className="text-sm text-gray-600 leading-relaxed mt-4">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-gray-600">Jumlah:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-gray-50 transition-colors"
                aria-label="Kurangi jumlah"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="p-2 hover:bg-gray-50 transition-colors"
                aria-label="Tambah jumlah"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
