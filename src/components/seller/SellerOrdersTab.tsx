import { useCallback, useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { fetchSellerOrders, updateSellerOrderStatus, getSellerCatalogItemIds, filterOrderItemsForSeller } from '../../lib/sellerOrders';
import { getSellerConfirmationStatus } from '../../lib/orderSellerConfirmations';
import SalesReportDownload from '../SalesReportDownload';
import { formatPrice } from '../../data/mockProducts';
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useOrderRealtime } from '../../hooks/useOrderRealtime';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

interface Props {
  userId: string;
}

export default function SellerOrdersTab({ userId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerItemIds, setSellerItemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const [catalogIds, ordersRes] = await Promise.all([
      getSellerCatalogItemIds(userId),
      fetchSellerOrders(userId),
    ]);
    setSellerItemIds(catalogIds);
    setOrders(ordersRes.orders);
    setError(ordersRes.error);
    if (showLoading) setLoading(false);
  }, [userId]);

  useEffect(() => {
    void loadOrders(true);
  }, [loadOrders]);

  useOrderRealtime({
    role: 'seller',
    userId,
    enabled: isSupabaseConfigured,
    onUpdate: () => loadOrders(false),
  });

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    const { error: updateError } = await updateSellerOrderStatus(orderId, userId, status);
    if (updateError) setError(updateError);
    else await loadOrders();
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat pesanan...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <SalesReportDownload
          orders={orders}
          reportTitle="Laporan Penjualan — Dashboard Penjual"
          reportOptions={{
            sellerId: userId,
            sellerItemIds,
          }}
        />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="font-medium text-gray-800">Belum ada pesanan masuk</p>
          <p className="text-sm text-gray-500 mt-1">Pesanan dari pembeli akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const sellerStatus = getSellerConfirmationStatus(order, userId);
            const nextStatus = NEXT_STATUS[sellerStatus];
            const isMixedOrder = (order.seller_confirmations?.length ?? 0) > 1;
            const myItems = filterOrderItemsForSeller(order, sellerItemIds);
            const mySubtotal = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                    {isMixedOrder && (
                      <p className="text-[10px] text-indigo-600 mt-0.5">
                        Pesanan campuran — kelola bagian Anda saja
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[sellerStatus]}`}>
                      {ORDER_STATUS_LABELS[sellerStatus]}
                    </span>
                    {isMixedOrder && sellerStatus !== order.status && (
                      <span className="text-[10px] text-gray-400">
                        Keseluruhan: {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {myItems.map((item) => (
                    <div key={item.id ?? item.product_id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.item_type === 'kuliner' && (
                          <span className="text-orange-600 text-xs mr-1">[Kuliner]</span>
                        )}
                        {item.item_type === 'jasa' && (
                          <span className="text-blue-600 text-xs mr-1">[Jasa]</span>
                        )}
                        {item.product_name} x{item.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                    {order.shipping_address}
                  </p>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-red-600">{formatPrice(mySubtotal)}</p>
                    {isMixedOrder && (
                      <p className="text-[10px] text-gray-400">
                        Subtotal bagian Anda · Total pesanan {formatPrice(order.total)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {nextStatus && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={updatingId === order.id}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        {updatingId === order.id ? '...' : `→ ${ORDER_STATUS_LABELS[nextStatus]}`}
                      </button>
                    )}
                    {sellerStatus !== 'cancelled' && sellerStatus !== 'delivered' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        disabled={updatingId === order.id}
                        className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
