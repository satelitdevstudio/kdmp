import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { formatPrice } from '../data/mockProducts';
import { createOrder, getDemoBuyerId } from '../lib/orders';
import { isSupabaseConfigured } from '../lib/supabase';
import { getCartItemId, getCartItemName, getCartItemImage, getCartItemPrice } from '../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.address) setAddress(profile.address);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [profile]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Keranjang kosong</p>
        <Link to="/produk" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Mulai belanja
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Alamat pengiriman wajib diisi');
      return;
    }

    const buyerId = user?.id ?? getDemoBuyerId();
    const shippingAddress = phone.trim()
      ? `${address.trim()} (Telp: ${phone.trim()})`
      : address.trim();

    setLoading(true);
    const { order, error: orderError } = await createOrder(buyerId, items, shippingAddress);
    setLoading(false);

    if (orderError || !order) {
      setError(orderError ?? 'Gagal membuat pesanan');
      return;
    }

    clearCart();
    navigate('/pesanan', { state: { newOrderId: order.id } });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/keranjang"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Keranjang
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      {!isSupabaseConfigured && (
        <p className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Mode demo: pesanan disimpan di perangkat Anda. Hubungkan Supabase untuk sinkronisasi akun.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              Alamat Pengiriman
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat lengkap
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. ..., RT/RW, Desa, Kecamatan"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon (opsional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3">Metode Pembayaran</h2>
            <p className="text-sm text-gray-500">
              Bayar saat barang diterima (COD). Integrasi transfer & QRIS segera hadir.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Memproses...' : 'Buat Pesanan'}
          </button>
        </form>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-36">
            <h2 className="font-bold text-gray-800 mb-4">Ringkasan ({itemCount} item)</h2>
            <ul className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => {
                const itemId = getCartItemId(item);
                return (
                  <li key={`${item.type}-${itemId}`} className="flex gap-3 text-sm">
                    <img
                      src={getCartItemImage(item)}
                      alt={getCartItemName(item)}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.type === 'kuliner' && (
                          <span className="text-orange-600 text-xs mr-1">[Kuliner]</span>
                        )}
                        {item.type === 'jasa' && (
                          <span className="text-blue-600 text-xs mr-1">[Jasa]</span>
                        )}
                        {getCartItemName(item)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {item.quantity} x {formatPrice(getCartItemPrice(item))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkos kirim</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-1">
                <span>Total</span>
                <span className="text-red-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
