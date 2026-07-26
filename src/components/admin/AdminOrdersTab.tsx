import { useState } from 'react';
import { Package, UtensilsCrossed, Wrench, Inbox, MessageCircle, Phone } from 'lucide-react';
import { formatPrice } from '../../data/mockProducts';
import SalesReportDownload from '../SalesReportDownload';
import {
  buildOrderContactMessage,
  getBuyerPhoneForOrder,
  waLink,
} from '../../lib/contact';
import {
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUS_FILTERS,
  ORDER_STATUS_LABELS,
  orderMatchesCategory,
  orderMatchesStatus,
  countOrdersByCategory,
  countOrdersByStatus,
  type Order,
  type OrderCategoryFilter,
  type OrderItemRecord,
  type OrderItemType,
  type OrderStatus,
  type OrderStatusFilter,
} from '../../types';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

const itemTypeBadge: Record<OrderItemType, string> = {
  product: 'bg-green-100 text-green-700',
  kuliner: 'bg-orange-100 text-orange-700',
  jasa: 'bg-blue-100 text-blue-700',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

const categoryFilters: {
  id: OrderCategoryFilter;
  label: string;
  icon: typeof Package;
  activeClass: string;
}[] = [
  { id: 'all', label: 'Semua', icon: Inbox, activeClass: 'bg-gray-800 text-white' },
  { id: 'product', label: 'Produk', icon: Package, activeClass: 'bg-green-600 text-white' },
  { id: 'kuliner', label: 'Kuliner', icon: UtensilsCrossed, activeClass: 'bg-orange-600 text-white' },
  { id: 'jasa', label: 'Jasa', icon: Wrench, activeClass: 'bg-blue-600 text-white' },
];

const statusActiveClasses: Record<OrderStatusFilter, string> = {
  all: 'border-gray-800 text-gray-800',
  pending: 'border-amber-500 text-amber-700',
  confirmed: 'border-blue-500 text-blue-700',
  shipped: 'border-purple-500 text-purple-700',
  delivered: 'border-green-500 text-green-700',
  cancelled: 'border-gray-400 text-gray-600',
};

const statusCountClasses: Record<OrderStatusFilter, string> = {
  all: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export interface OrderSellerGroup {
  sellerId: string;
  name: string;
  status: OrderStatus;
  items: OrderItemRecord[];
}

interface Props {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void | Promise<void>;
  onSellerStatusChange?: (orderId: string, sellerId: string, status: OrderStatus) => void | Promise<void>;
  unseenOrderIds?: Set<string>;
  getSellerGroups?: (order: Order) => OrderSellerGroup[];
  statusFilter?: OrderStatusFilter;
  onStatusFilterChange?: (filter: OrderStatusFilter) => void;
  buyerNameById?: Record<string, string>;
  sellerNameById?: Record<string, string>;
  profilePhoneById?: Record<string, string>;
  itemToSellerId?: Record<string, string>;
}

function OrderContactButton({
  phone,
  label,
  message,
}: {
  phone: string | null;
  label: string;
  message: string;
}) {
  if (!phone) {
    return (
      <span
        title="Nomor telepon belum tersedia"
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
      >
        <Phone className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }

  return (
    <a
      href={waLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 font-medium transition-colors"
    >
      <MessageCircle className="w-3.5 h-3.5" />
      {label}
    </a>
  );
}

const statusButtonOutline: Record<OrderStatus, string> = {
  pending: 'border-amber-200 text-amber-700 hover:bg-amber-50',
  confirmed: 'border-blue-200 text-blue-700 hover:bg-blue-50',
  shipped: 'border-purple-200 text-purple-700 hover:bg-purple-50',
  delivered: 'border-green-200 text-green-700 hover:bg-green-50',
  cancelled: 'border-red-200 text-red-600 hover:bg-red-50',
};

export default function AdminOrdersTab({
  orders,
  onStatusChange,
  onSellerStatusChange,
  unseenOrderIds,
  getSellerGroups,
  statusFilter: controlledStatusFilter,
  onStatusFilterChange,
  buyerNameById,
  sellerNameById,
  profilePhoneById,
  itemToSellerId,
}: Props) {
  const [category, setCategory] = useState<OrderCategoryFilter>('all');
  const [internalStatusFilter, setInternalStatusFilter] = useState<OrderStatusFilter>('all');
  const statusFilter = controlledStatusFilter ?? internalStatusFilter;
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const setStatusFilter = (filter: OrderStatusFilter) => {
    if (onStatusFilterChange) onStatusFilterChange(filter);
    else setInternalStatusFilter(filter);
  };

  const handleBulkStatusClick = async (orderId: string, status: OrderStatus) => {
    setUpdatingKey(`${orderId}:all`);
    try {
      await onStatusChange(orderId, status);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleSellerStatusClick = async (
    orderId: string,
    sellerId: string,
    status: OrderStatus
  ) => {
    if (!onSellerStatusChange) return;
    setUpdatingKey(`${orderId}:${sellerId}`);
    try {
      await onSellerStatusChange(orderId, sellerId, status);
    } finally {
      setUpdatingKey(null);
    }
  };

  const filteredOrders = orders.filter(
    (order) => orderMatchesCategory(order, category) && orderMatchesStatus(order, statusFilter)
  );
  const pendingCount = countOrdersByCategory(orders, category, 'pending');

  const categoryLabel = categoryFilters.find((f) => f.id === category)?.label ?? 'Semua';
  const statusLabel =
    ORDER_STATUS_FILTERS.find((f) => f.id === statusFilter)?.label ?? 'Semua';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-800">Kotak Masuk Pesanan</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Konfirmasi per penjual — pesanan campuran dapat dikelola terpisah untuk setiap penjual
        </p>
      </div>

      <SalesReportDownload
        orders={filteredOrders}
        reportTitle={`Laporan Penjualan ArgasariHub — ${categoryLabel} / ${statusLabel}`}
        reportOptions={{
          buyerNameById,
          sellerNameById,
          itemToSellerId,
        }}
      />

      <div className="bg-gray-100 rounded-xl p-3 space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori Pesanan</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const total = countOrdersByCategory(orders, filter.id);
            const pending = countOrdersByCategory(orders, filter.id, 'pending');
            const isActive = category === filter.id;

            return (
              <button
                key={filter.id}
                onClick={() => {
                  setCategory(filter.id);
                  setStatusFilter('all');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                  isActive
                    ? `${filter.activeClass} border-transparent shadow-sm`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-inherit' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {total}
                </span>
                {pending > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                    {pending} baru
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Pesanan</p>
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100">
          {ORDER_STATUS_FILTERS.map((filter) => {
            const count = countOrdersByStatus(orders, category, filter.id);
            const isActive = statusFilter === filter.id;

            return (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  isActive
                    ? `${statusActiveClasses[filter.id]} bg-transparent`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                {filter.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? statusCountClasses[filter.id] : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {pendingCount > 0 && statusFilter === 'all' && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
          {pendingCount} pesanan {category === 'all' ? '' : ORDER_ITEM_TYPE_LABELS[category].toLowerCase()}{' '}
          menunggu konfirmasi
        </p>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">
            {statusFilter !== 'all'
              ? `Tidak ada pesanan ${ORDER_STATUS_FILTERS.find((f) => f.id === statusFilter)?.label.toLowerCase()}`
              : category === 'all'
                ? 'Belum ada pesanan masuk'
                : `Belum ada pesanan ${ORDER_ITEM_TYPE_LABELS[category].toLowerCase()}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {statusFilter !== 'all'
              ? 'Coba pilih tab status lain atau ubah kategori'
              : 'Pesanan baru akan muncul di kategori yang sesuai'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const orderTypes = [...new Set(order.items.map((item) => item.item_type))];
            const isNew = unseenOrderIds?.has(order.id) ?? false;
            const sellerGroups = getSellerGroups?.(order) ?? [];
            const isMultiSeller = sellerGroups.length > 1;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                  isNew ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-100'
                }`}
              >
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 ${
                    isNew ? 'bg-red-50' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-800">#{order.id.slice(0, 8)}</p>
                      {isNew && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                          Baru
                        </span>
                      )}
                      {isMultiSeller && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          Pesanan Campuran
                        </span>
                      )}
                      {orderTypes.map((type) => (
                        <span
                          key={type}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${itemTypeBadge[type]}`}
                        >
                          {ORDER_ITEM_TYPE_LABELS[type]}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  {order.items
                    .filter((item) => category === 'all' || item.item_type === category)
                    .map((item) => (
                      <div key={item.id ?? item.product_id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          <span
                            className={`text-[10px] font-semibold px-1 py-0.5 rounded mr-1.5 ${itemTypeBadge[item.item_type]}`}
                          >
                            {ORDER_ITEM_TYPE_LABELS[item.item_type]}
                          </span>
                          {item.product_name} x{item.quantity}
                        </span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  {category !== 'all' &&
                    order.items.some((item) => item.item_type !== category) && (
                      <p className="text-xs text-gray-400 italic">
                        + {order.items.filter((item) => item.item_type !== category).length} item lain
                        di pesanan campuran
                      </p>
                    )}
                  <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                    {order.shipping_address}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <OrderContactButton
                      phone={getBuyerPhoneForOrder(
                        order.buyer_id,
                        order.shipping_address,
                        profilePhoneById
                      )}
                      label="Hubungi Pembeli"
                      message={buildOrderContactMessage('buyer', order.id)}
                    />
                    {sellerGroups.length === 0 ? (
                      <span
                        title="Pesanan ini hanya berisi produk koperasi"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Tanpa penjual UMKM
                      </span>
                    ) : sellerGroups.length === 1 ? (
                      <OrderContactButton
                        phone={profilePhoneById?.[sellerGroups[0].sellerId] ?? null}
                        label="Hubungi Penjual"
                        message={buildOrderContactMessage(
                          'seller',
                          order.id,
                          sellerGroups[0].name
                        )}
                      />
                    ) : (
                      sellerGroups.map((group) => (
                        <OrderContactButton
                          key={group.sellerId}
                          phone={profilePhoneById?.[group.sellerId] ?? null}
                          label={`Hubungi ${group.name}`}
                          message={buildOrderContactMessage('seller', order.id, group.name)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {sellerGroups.length > 0 && (
                  <div className="px-4 pb-3 space-y-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Konfirmasi Per Penjual
                    </p>
                    {sellerGroups.map((group) => {
                      const nextStatus = NEXT_STATUS[group.status];
                      const isUpdating = updatingKey === `${order.id}:${group.sellerId}`;

                      return (
                        <div
                          key={group.sellerId}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-800">{group.name}</p>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[group.status]}`}
                            >
                              {ORDER_STATUS_LABELS[group.status]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {group.items.map((item) => `${item.product_name} x${item.quantity}`).join(', ')}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.status === 'pending' && onSellerStatusChange && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleSellerStatusClick(order.id, group.sellerId, 'confirmed')
                                }
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                              >
                                {isUpdating ? '...' : 'Konfirmasi'}
                              </button>
                            )}
                            {nextStatus && onSellerStatusChange && group.status !== 'cancelled' && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleSellerStatusClick(order.id, group.sellerId, nextStatus)
                                }
                                className="border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-60 px-3 py-1.5 rounded-lg text-xs font-medium"
                              >
                                → {ORDER_STATUS_LABELS[nextStatus]}
                              </button>
                            )}
                            {onSellerStatusChange &&
                              group.status !== 'cancelled' &&
                              group.status !== 'delivered' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleSellerStatusClick(order.id, group.sellerId, 'cancelled')
                                  }
                                  className="border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 px-3 py-1.5 rounded-lg text-xs"
                                >
                                  Batalkan
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <p className="font-bold text-red-600">{formatPrice(order.total)}</p>
                  <div className="flex flex-col items-start sm:items-end gap-1.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Ubah Status Semua Penjual
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(
                        ([status, label]) => {
                          const isCurrent = order.status === status;
                          const isUpdating = updatingKey === `${order.id}:all`;

                          return (
                            <button
                              key={status}
                              type="button"
                              disabled={isCurrent || isUpdating}
                              onClick={() => handleBulkStatusClick(order.id, status)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors disabled:cursor-default ${
                                isCurrent
                                  ? statusColors[status]
                                  : `${statusButtonOutline[status]} disabled:opacity-50`
                              }`}
                            >
                              {isUpdating && !isCurrent ? '...' : label}
                            </button>
                          );
                        }
                      )}
                    </div>
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
