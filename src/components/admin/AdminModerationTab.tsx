import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Package, UtensilsCrossed, X } from 'lucide-react';
import {
  fetchPendingSellerListings,
  moderateKuliner,
  moderateProduct,
} from '../../lib/moderationAdmin';
import { fetchAllProfiles } from '../../lib/admin';
import { formatPrice } from '../../data/mockProducts';
import { getModerationStatus, type Kuliner, type Product } from '../../types';
import AdminFormModal, { FormField, TextArea } from './AdminFormModal';

type RejectTarget =
  | { type: 'product'; item: Product }
  | { type: 'kuliner'; item: Kuliner };

interface Props {
  onError: (msg: string | null) => void;
  onChange?: () => void;
}

export default function AdminModerationTab({ onError, onChange }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [kuliner, setKuliner] = useState<Kuliner[]>([]);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [listingsRes, profilesRes] = await Promise.all([
      fetchPendingSellerListings(),
      fetchAllProfiles(),
    ]);

    setProducts(listingsRes.products);
    setKuliner(listingsRes.kuliner);

    const names: Record<string, string> = {};
    for (const profile of profilesRes.profiles) {
      names[profile.id] = profile.full_name || 'Penjual';
    }
    setSellerNames(names);

    onError(listingsRes.error ?? profilesRes.error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const totalPending = products.length + kuliner.length;

  const sortedItems = useMemo(
    () =>
      [
        ...products.map((item) => ({ type: 'product' as const, item, createdAt: item.created_at ?? '' })),
        ...kuliner.map((item) => ({ type: 'kuliner' as const, item, createdAt: item.created_at ?? '' })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [products, kuliner]
  );

  const handleApprove = async (type: 'product' | 'kuliner', id: string) => {
    setActingId(id);
    const result =
      type === 'product'
        ? await moderateProduct(id, { status: 'approved' })
        : await moderateKuliner(id, { status: 'approved' });

    if (result.error) onError(result.error);
    else {
      onError(null);
      await load();
      onChange?.();
    }
    setActingId(null);
  };

  const openReject = (target: RejectTarget) => {
    setRejectTarget(target);
    setRejectNote('');
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;

    setRejecting(true);
    const result =
      rejectTarget.type === 'product'
        ? await moderateProduct(rejectTarget.item.id, {
            status: 'rejected',
            note: rejectNote,
          })
        : await moderateKuliner(rejectTarget.item.id, {
            status: 'rejected',
            note: rejectNote,
          });

    setRejecting(false);

    if (result.error) onError(result.error);
    else {
      onError(null);
      setRejectTarget(null);
      await load();
      onChange?.();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat antrian moderasi...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Tinjau postingan penjual UMKM sebelum tampil di marketplace publik.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {totalPending === 0
            ? 'Tidak ada postingan menunggu review.'
            : `${totalPending} postingan menunggu review.`}
        </p>
      </div>

      {totalPending === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Check className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <p className="font-medium text-gray-800">Semua postingan sudah ditinjau</p>
          <p className="text-sm text-gray-500 mt-1">
            Postingan penjual baru akan muncul di sini untuk moderasi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedItems.map(({ type, item }) => {
            const sellerId = item.seller_id ?? '';
            const sellerName = sellerNames[sellerId] ?? 'Penjual UMKM';
            const isActing = actingId === item.id;

            return (
              <div
                key={`${type}-${item.id}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          type === 'product'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {type === 'product' ? (
                          <Package className="w-3 h-3" />
                        ) : (
                          <UtensilsCrossed className="w-3 h-3" />
                        )}
                        {type === 'product' ? 'Produk' : 'Kuliner'}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {getModerationStatus(item) === 'pending' ? 'Menunggu Review' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sellerName} · {item.village} · {formatPrice(item.price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                    {item.created_at && (
                      <p className="text-[10px] text-gray-400 mt-2">
                        Diajukan{' '}
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handleApprove(type, item.id)}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isActing ? 'Memproses...' : 'Setujui'}
                  </button>
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() =>
                      openReject(type === 'product' ? { type: 'product', item } : { type: 'kuliner', item })
                    }
                    className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <X className="w-3.5 h-3.5" />
                    Tolak
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminFormModal
        open={!!rejectTarget}
        title="Tolak Postingan Penjual"
        onClose={() => setRejectTarget(null)}
        onSubmit={handleReject}
        saving={rejecting}
        submitLabel="Tolak Postingan"
      >
        <p className="text-sm text-gray-600">
          Beri alasan penolakan agar penjual dapat memperbaiki postingan.
        </p>
        <FormField label="Alasan penolakan">
          <TextArea
            value={rejectNote}
            onChange={setRejectNote}
            rows={3}
            placeholder="Contoh: Gambar tidak jelas, deskripsi kurang lengkap, atau harga tidak wajar."
            required
          />
        </FormField>
      </AdminFormModal>
    </div>
  );
}
