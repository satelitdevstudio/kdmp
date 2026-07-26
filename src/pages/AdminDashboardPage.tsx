import { useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchAllOrders, updateOrderStatus, updateSellerOrderStatus } from '../lib/sellerOrders';
import {
  fetchAllProfiles,
  fetchAllProducts,
  fetchAllKuliner,
  setUserRole,
} from '../lib/admin';
import {
  fetchAllEventsAdmin,
  fetchAllVideosAdmin,
  fetchAllJasaAdmin,
  fetchAllWisataAdmin,
  fetchAllLowonganAdmin,
} from '../lib/adminContent';
import { fetchAllVillageNewsAdmin } from '../lib/villageNews';
import {
  ORDER_ITEM_TYPE_LABELS,
  countOrdersByCategory,
  type Order,
  type OrderStatus,
  type OrderStatusFilter,
  type Product,
  type Kuliner,
  type Profile,
  type Jasa,
} from '../types';
import AdminNewsTab from '../components/admin/AdminNewsTab';
import AdminOrdersTab, { type OrderSellerGroup } from '../components/admin/AdminOrdersTab';
import AdminEventsTab from '../components/admin/AdminEventsTab';
import AdminVideosTab from '../components/admin/AdminVideosTab';
import AdminJasaTab from '../components/admin/AdminJasaTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminKulinerTab from '../components/admin/AdminKulinerTab';
import AdminWisataTab from '../components/admin/AdminWisataTab';
import AdminLowonganTab from '../components/admin/AdminLowonganTab';
import AdminSponsorTab from '../components/admin/AdminSponsorTab';
import AdminCategoriesTab from '../components/admin/AdminCategoriesTab';
import AdminFeaturedProductsTab from '../components/admin/AdminFeaturedProductsTab';
import AdminModerationTab from '../components/admin/AdminModerationTab';
import AdminUsersTab from '../components/admin/AdminUsersTab';
import AdminTemplateSettingsTab from '../components/admin/AdminTemplateSettingsTab';
import AdminNav from '../components/admin/AdminNav';
import { CONTENT_TABS, getAdminTabLabel, type AdminTab } from '../components/admin/adminNavConfig';
import { useAdminOrderNotifications } from '../hooks/useAdminOrderNotifications';
import { useOrderRealtime } from '../hooks/useOrderRealtime';
import { countPendingSellerListings } from '../lib/moderationAdmin';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<AdminTab>('ringkasan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [kuliner, setKuliner] = useState<Kuliner[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [jasaItems, setJasaItems] = useState<Jasa[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>('all');
  const [pendingModerationCount, setPendingModerationCount] = useState(0);
  const [stats, setStats] = useState({
    news: 0,
    events: 0,
    videos: 0,
    jasa: 0,
    wisata: 0,
    lowongan: 0,
  });

  const loadOrders = useCallback(async () => {
    const { orders: data } = await fetchAllOrders();
    setOrders(data);
  }, []);

  const { newOrderCount, unseenOrderIds, markAllSeen } = useAdminOrderNotifications(orders);

  const loadAll = async () => {
    setLoading(true);
    const [ordersRes, productsRes, kulinerRes, profilesRes, newsRes, eventsRes, videosRes, jasaRes, wisataRes, lowonganRes, pendingCount] =
      await Promise.all([
        fetchAllOrders(),
        fetchAllProducts(),
        fetchAllKuliner(),
        fetchAllProfiles(),
        fetchAllVillageNewsAdmin(),
        fetchAllEventsAdmin(),
        fetchAllVideosAdmin(),
        fetchAllJasaAdmin(),
        fetchAllWisataAdmin(),
        fetchAllLowonganAdmin(),
        countPendingSellerListings(),
      ]);
    setOrders(ordersRes.orders);
    setProducts(productsRes.products);
    setKuliner(kulinerRes.items);
    setProfiles(profilesRes.profiles);
    setJasaItems(jasaRes.items);
    setPendingModerationCount(pendingCount);
    setStats({
      news: newsRes.items.length,
      events: eventsRes.items.length,
      videos: videosRes.items.length,
      jasa: jasaRes.items.length,
      wisata: wisataRes.items.length,
      lowongan: lowonganRes.items.length,
    });
    setError(
      ordersRes.error ??
        productsRes.error ??
        kulinerRes.error ??
        profilesRes.error ??
        newsRes.error ??
        eventsRes.error ??
        videosRes.error ??
        jasaRes.error ??
        wisataRes.error ??
        lowonganRes.error
    );
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useOrderRealtime({
    role: 'admin',
    enabled: isSupabaseConfigured,
    onUpdate: loadOrders,
  });

  const handleTabChange = (nextTab: AdminTab, pendingOnly = false) => {
    if (nextTab === 'pesanan') {
      markAllSeen();
      if (pendingOnly) setOrderStatusFilter('pending');
    }
    setTab(nextTab);
  };

  const sellerNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const profile of profiles) {
      map[profile.id] = profile.full_name || 'Penjual';
    }
    return map;
  }, [profiles]);

  const buyerNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const profile of profiles) {
      map[profile.id] = profile.full_name || 'Pembeli';
    }
    return map;
  }, [profiles]);

  const profilePhoneById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const profile of profiles) {
      if (profile.phone?.trim()) map[profile.id] = profile.phone.trim();
    }
    return map;
  }, [profiles]);

  const itemToSellerId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const product of products) {
      if (product.seller_id) map[`product:${product.id}`] = product.seller_id;
    }
    for (const item of kuliner) {
      if (item.seller_id) map[`kuliner:${item.id}`] = item.seller_id;
    }
    for (const item of jasaItems) {
      if (item.seller_id) map[`jasa:${item.id}`] = item.seller_id;
    }
    return map;
  }, [products, kuliner, jasaItems]);

  const getSellerGroups = useCallback(
    (order: Order): OrderSellerGroup[] => {
      const groups = new Map<string, Order['items']>();
      for (const item of order.items) {
        const sellerId = itemToSellerId[`${item.item_type}:${item.product_id}`];
        if (!sellerId) continue;
        const list = groups.get(sellerId) ?? [];
        list.push(item);
        groups.set(sellerId, list);
      }

      return [...groups.entries()].map(([sellerId, items]) => ({
        sellerId,
        name: sellerNameById[sellerId] || 'Penjual',
        status:
          order.seller_confirmations?.find((c) => c.seller_id === sellerId)?.status ?? order.status,
        items,
      }));
    },
    [itemToSellerId, sellerNameById]
  );

  const handleOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error: err } = await updateOrderStatus(orderId, status);
    if (err) setError(err);
    else loadAll();
  };

  const handleSellerOrderStatus = async (
    orderId: string,
    sellerId: string,
    status: OrderStatus
  ) => {
    const { error: err } = await updateSellerOrderStatus(orderId, sellerId, status);
    if (err) setError(err);
    else loadAll();
  };

  const handleRoleChange = async (userId: string, role: Profile['role']) => {
    const { error: err } = await setUserRole(userId, role);
    if (err) setError(err);
    else loadAll();
  };

  if (loading && tab === 'ringkasan') {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat data admin...
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pesanan, marketplace, konten desa, dan pengguna
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col lg:flex-row lg:gap-6 lg:items-start">
        <AdminNav
          activeTab={tab}
          onTabChange={(nextTab) => handleTabChange(nextTab)}
          newOrderCount={newOrderCount}
          pendingModerationCount={pendingModerationCount}
        />

        <div className="flex-1 min-w-0">
          <div className="hidden lg:flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">{getAdminTabLabel(tab)}</h2>
            {tab === 'pesanan' && newOrderCount > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                {newOrderCount} pesanan baru
              </span>
            )}
            {tab === 'moderasi' && pendingModerationCount > 0 && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                {pendingModerationCount} menunggu review
              </span>
            )}
          </div>

          {tab === 'ringkasan' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { label: 'Total Pesanan', value: orders.length, color: 'text-blue-600', target: 'pesanan' as AdminTab },
                { label: 'Total Produk', value: products.length, color: 'text-green-600', target: 'produk' as AdminTab },
                { label: 'Total Kuliner', value: kuliner.length, color: 'text-orange-600', target: 'kuliner' as AdminTab },
                { label: 'Moderasi Pending', value: pendingModerationCount, color: 'text-amber-600', target: 'moderasi' as AdminTab },
                { label: 'Artikel Info Desa', value: stats.news, color: 'text-indigo-600', target: 'berita' as AdminTab },
                { label: 'Event Desa', value: stats.events, color: 'text-red-600', target: 'event' as AdminTab },
                { label: 'Video Channel TV', value: stats.videos, color: 'text-purple-600', target: 'video' as AdminTab },
                { label: 'Jasa Warga', value: stats.jasa, color: 'text-cyan-600', target: 'jasa' as AdminTab },
                { label: 'Wisata & Homestay', value: stats.wisata, color: 'text-emerald-600', target: 'wisata' as AdminTab },
                { label: 'Lowongan Kerja', value: stats.lowongan, color: 'text-amber-600', target: 'lowongan' as AdminTab },
                { label: 'Total Pengguna', value: profiles.length, color: 'text-gray-700', target: 'pengguna' as AdminTab },
              ].map((stat) => (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => handleTabChange(stat.target)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:border-red-200 hover:shadow-md transition-all"
                >
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </button>
              ))}
              <div className="col-span-2 sm:col-span-3 xl:col-span-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-800 mb-3">Pesanan Menunggu Konfirmasi</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { id: 'all' as const, label: 'Semua', color: 'text-amber-600' },
                      { id: 'product' as const, label: ORDER_ITEM_TYPE_LABELS.product, color: 'text-green-600' },
                      { id: 'kuliner' as const, label: ORDER_ITEM_TYPE_LABELS.kuliner, color: 'text-orange-600' },
                      { id: 'jasa' as const, label: ORDER_ITEM_TYPE_LABELS.jasa, color: 'text-blue-600' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabChange('pesanan', true)}
                      className="text-left rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className={`text-2xl font-bold mt-0.5 ${item.color}`}>
                        {countOrdersByCategory(orders, item.id, 'pending')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'pesanan' && (
            <AdminOrdersTab
              orders={orders}
              onStatusChange={handleOrderStatus}
              onSellerStatusChange={handleSellerOrderStatus}
              getSellerGroups={getSellerGroups}
              statusFilter={orderStatusFilter}
              onStatusFilterChange={setOrderStatusFilter}
              unseenOrderIds={unseenOrderIds}
              buyerNameById={buyerNameById}
              sellerNameById={sellerNameById}
              profilePhoneById={profilePhoneById}
              itemToSellerId={itemToSellerId}
            />
          )}

          {tab === 'produk' && <AdminProductsTab onError={setError} onChange={loadAll} />}

          {tab === 'moderasi' && <AdminModerationTab onError={setError} onChange={loadAll} />}

          {tab === 'kategori' && <AdminCategoriesTab onError={setError} />}

          {tab === 'produk-pilihan' && <AdminFeaturedProductsTab onError={setError} />}

          {tab === 'kuliner' && <AdminKulinerTab onError={setError} onChange={loadAll} />}

          {tab === 'berita' && <AdminNewsTab onError={setError} />}
          {tab === 'event' && <AdminEventsTab onError={setError} />}
          {tab === 'video' && <AdminVideosTab onError={setError} />}
          {tab === 'jasa' && <AdminJasaTab onError={setError} />}
          {tab === 'wisata' && <AdminWisataTab onError={setError} />}
          {tab === 'lowongan' && <AdminLowonganTab onError={setError} />}
          {tab === 'sponsor' && <AdminSponsorTab onError={setError} />}

          {tab === 'pengguna' && (
            <AdminUsersTab profiles={profiles} onRoleChange={handleRoleChange} />
          )}

          {tab === 'pengaturan' && <AdminTemplateSettingsTab onError={setError} />}

          {CONTENT_TABS.includes(tab) && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              Perubahan konten langsung tampil di halaman publik setelah disimpan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
