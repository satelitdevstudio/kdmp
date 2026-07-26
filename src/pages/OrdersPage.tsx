import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchOrders, getDemoBuyerId } from '../lib/orders';
import { formatPrice } from '../data/mockProducts';
import { ORDER_STATUS_LABELS, type Order } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { useOrderRealtime } from '../hooks/useOrderRealtime';

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const newOrderId = (location.state as { newOrderId?: string } | null)?.newOrderId;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buyerId = user?.id ?? getDemoBuyerId();

  const loadOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { orders: data, error: fetchError } = await fetchOrders(buyerId);
    setOrders(data);
    setError(fetchError);
    if (showLoading) setLoading(false);
  }, [buyerId]);

  useEffect(() => {
    void loadOrders(true);
  }, [loadOrders]);

  useOrderRealtime({
    role: 'buyer',
    userId: user?.id,
    enabled: Boolean(user?.id && isSupabaseConfigured),
    onUpdate: () => loadOrders(false),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat pesanan...
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pesanan Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Riwayat pesanan produk, kuliner, dan jasa Anda</p>
      </div>

      {newOrderId && (
        <div className="mb-4 flex items-start gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Pesanan berhasil dibuat!</p>
            <p className="text-green-700 text-xs mt-0.5">ID: {newOrderId.slice(0, 8)}...</p>
          </div>
        </div>
      )}

      {!isSupabaseConfigured && (
        <p className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Mode demo: pesanan disimpan di perangkat ini saja.
        </p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {orders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-800">Belum ada pesanan</p>
          <p className="text-sm text-gray-500 mt-1">Belanja produk desa dan buat pesanan pertama Anda</p>
          <Link
            to="/produk"
            className="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Lihat Produk Desa
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id ?? item.product_id} className="flex gap-3">
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {item.item_type === 'kuliner' && (
                        <span className="text-orange-600 text-xs mr-1">[Kuliner]</span>
                      )}
                      {item.item_type === 'jasa' && (
                        <span className="text-blue-600 text-xs mr-1">[Jasa]</span>
                      )}
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-gray-500 truncate max-w-md">
                {order.shipping_address}
              </p>
              <p className="font-bold text-red-600">{formatPrice(order.total)}</p>
            </div>

            {order.seller_confirmations && order.seller_confirmations.length > 1 && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-600 pt-3 mb-2">Status per penjual</p>
                <div className="space-y-1.5">
                  {order.seller_confirmations.map((confirmation, index) => (
                    <div
                      key={confirmation.seller_id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-600">Penjual {index + 1}</span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full ${statusColors[confirmation.status]}`}
                      >
                        {ORDER_STATUS_LABELS[confirmation.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
