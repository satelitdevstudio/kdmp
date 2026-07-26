import { useState } from 'react';
import { Plus, Package, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import SellerProductsTab from '../components/seller/SellerProductsTab';
import SellerKulinerTab from '../components/seller/SellerKulinerTab';
import SellerOrdersTab from '../components/seller/SellerOrdersTab';
import SellerAddListingModal from '../components/seller/SellerAddListingModal';

type Tab = 'produk' | 'kuliner' | 'pesanan';
type ListingType = 'produk' | 'kuliner';

const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'produk', label: 'Produk', icon: Package },
  { id: 'kuliner', label: 'Kuliner', icon: UtensilsCrossed },
  { id: 'pesanan', label: 'Pesanan', icon: ClipboardList },
];

export default function SellerDashboardPage() {
  const { userId, profile } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>('produk');
  const [addOpen, setAddOpen] = useState(false);
  const [addInitialType, setAddInitialType] = useState<ListingType | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  if (!userId) return null;

  const sellerName = profile?.full_name ?? 'Warung Saya';

  const openAdd = (type?: ListingType) => {
    setAddInitialType(type ?? null);
    setAddOpen(true);
  };

  const handleListingAdded = (type: ListingType) => {
    setReloadTrigger((n) => n + 1);
    setActiveTab(type === 'kuliner' ? 'kuliner' : 'produk');
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Penjual</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola produk, kuliner, dan pesanan UMKM Anda</p>
        </div>
        <button
          type="button"
          onClick={() => openAdd()}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'produk' && (
        <SellerProductsTab
          userId={userId}
          onAdd={() => openAdd('produk')}
          reloadTrigger={reloadTrigger}
        />
      )}
      {activeTab === 'kuliner' && (
        <SellerKulinerTab
          userId={userId}
          sellerName={sellerName}
          onAdd={() => openAdd('kuliner')}
          reloadTrigger={reloadTrigger}
        />
      )}
      {activeTab === 'pesanan' && <SellerOrdersTab userId={userId} />}

      <SellerAddListingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        userId={userId}
        sellerName={sellerName}
        initialType={addInitialType}
        onSuccess={handleListingAdded}
      />
    </div>
  );
}
