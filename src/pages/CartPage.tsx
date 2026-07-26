import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../data/mockProducts';
import {
  getCartItemId,
  getCartItemName,
  getCartItemImage,
  getCartItemPrice,
} from '../types';

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Keranjang Kosong</h1>
        <p className="text-sm text-gray-500 mt-2">Belum ada item di keranjang Anda</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            to="/produk"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Belanja Produk
          </Link>
          <Link
            to="/kuliner"
            className="border border-red-600 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Pesan Kuliner
          </Link>
          <Link
            to="/jasa"
            className="border border-red-600 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Pesan Jasa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Keranjang Belanja</h1>
          <p className="text-sm text-gray-500 mt-1">{itemCount} item</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:underline"
        >
          Kosongkan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const itemId = getCartItemId(item);
            const name = getCartItemName(item);
            const image = getCartItemImage(item);
            const price = getCartItemPrice(item);
            const detailPath =
              item.type === 'product'
                ? `/produk/${itemId}`
                : item.type === 'kuliner'
                  ? `/kuliner/${itemId}`
                  : `/jasa/${itemId}`;
            const subtitle =
              item.type === 'product'
                ? item.product.village
                : item.type === 'kuliner'
                  ? `${item.kuliner.seller_name} · ${item.kuliner.village}`
                  : `${item.jasa.provider_name} · ${item.jasa.village}`;

            return (
              <div
                key={`${item.type}-${itemId}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4"
              >
                <Link to={detailPath} className="flex-shrink-0">
                  <img
                    src={image}
                    alt={name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={detailPath}>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base hover:text-red-600 transition-colors">
                      {name}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-400">
                    {item.type === 'kuliner' && (
                      <span className="text-orange-600 font-medium mr-1">Kuliner ·</span>
                    )}
                    {item.type === 'jasa' && (
                      <span className="text-blue-600 font-medium mr-1">Jasa ·</span>
                    )}
                    {subtitle}
                  </p>
                  <p className="text-red-600 font-bold text-sm mt-1">
                    {formatPrice(price)}
                    {item.type === 'jasa' && (
                      <span className="text-xs font-normal text-gray-500"> / {item.jasa.price_unit}</span>
                    )}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50"
                        aria-label="Kurangi"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50"
                        aria-label="Tambah"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(itemId)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-800 text-sm">
                    {formatPrice(price * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-36">
            <h2 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} item)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkos kirim</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-red-600">{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full mt-5 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors text-center"
            >
              Lanjut ke Checkout
            </Link>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Pembayaran COD — bayar saat barang diterima
            </p>
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <Link to="/produk" className="text-red-600 hover:underline">
                Belanja produk
              </Link>
              <Link to="/kuliner" className="text-red-600 hover:underline">
                Pesan kuliner
              </Link>
              <Link to="/jasa" className="text-red-600 hover:underline">
                Pesan jasa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
