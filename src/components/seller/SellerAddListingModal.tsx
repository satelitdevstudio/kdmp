import { useEffect, useState } from 'react';
import { X, Package, UtensilsCrossed } from 'lucide-react';
import { createProduct, type ProductInput } from '../../lib/sellerProducts';
import { createKuliner, type KulinerInput } from '../../lib/sellerKuliner';
import {
  KULINER_CATEGORY_LABELS,
  type ProductCategory,
  type KulinerCategory,
} from '../../types';
import { useProductCategories } from '../../hooks/useProductCategories';
import { DEFAULT_CLOSING_TIME, DEFAULT_OPENING_TIME } from '../../lib/storeHours';
import ListingImageUploadField from '../ListingImageUploadField';

type ListingType = 'produk' | 'kuliner';

const emptyProductForm: ProductInput = {
  name: '',
  description: '',
  price: 0,
  village: '',
  category: 'makanan-minuman',
  stock: 0,
  image_url: '',
};

const emptyKulinerForm = (sellerName: string): KulinerInput => ({
  name: '',
  description: '',
  price: 0,
  seller_name: sellerName,
  village: '',
  category: 'makanan-berat',
  delivery_time: '30-45 menit',
  is_available: true,
  opening_time: DEFAULT_OPENING_TIME,
  closing_time: DEFAULT_CLOSING_TIME,
  image_url: '',
});

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  sellerName: string;
  initialType?: ListingType | null;
  onSuccess?: (type: ListingType) => void;
}

export default function SellerAddListingModal({
  open,
  onClose,
  userId,
  sellerName,
  initialType = null,
  onSuccess,
}: Props) {
  const { categories: productCategories } = useProductCategories();
  const [itemType, setItemType] = useState<ListingType | null>(null);
  const [productForm, setProductForm] = useState<ProductInput>(emptyProductForm);
  const [kulinerForm, setKulinerForm] = useState<KulinerInput>(emptyKulinerForm(sellerName));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setItemType(initialType);
      setProductForm(emptyProductForm);
      setKulinerForm(emptyKulinerForm(sellerName));
      setError(null);
      setSaving(false);
    }
  }, [open, initialType, sellerName]);

  if (!open) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemType) return;

    const imageUrl = itemType === 'produk' ? productForm.image_url : kulinerForm.image_url;
    if (!imageUrl) {
      setError('Gambar wajib diunggah.');
      return;
    }

    setSaving(true);
    setError(null);

    const result =
      itemType === 'produk'
        ? await createProduct(userId, productForm)
        : await createKuliner(userId, kulinerForm);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess?.(itemType);
    handleClose();
  };

  const title = itemType === 'kuliner' ? 'Tambah Menu Kuliner' : itemType === 'produk' ? 'Tambah Produk Baru' : 'Tambah Postingan';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-800">{title}</h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {!itemType && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Postingan penjual akan ditinjau admin terlebih dahulu sebelum tampil di marketplace.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Postingan</label>
            {!itemType ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setItemType('produk')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  <Package className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-semibold text-gray-800">Produk</span>
                  <span className="text-xs text-gray-500 text-center">Barang dagangan UMKM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('kuliner')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  <UtensilsCrossed className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-semibold text-gray-800">Kuliner</span>
                  <span className="text-xs text-gray-500 text-center">Menu makanan & minuman</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  {itemType === 'produk' ? (
                    <Package className="w-4 h-4 text-red-600" />
                  ) : (
                    <UtensilsCrossed className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium text-gray-800">
                    {itemType === 'produk' ? 'Produk' : 'Kuliner'}
                  </span>
                </div>
                {!initialType && (
                  <button
                    type="button"
                    onClick={() => setItemType(null)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Ubah jenis
                  </button>
                )}
              </div>
            )}
          </div>

          {itemType === 'produk' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  required
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value as ProductCategory })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                >
                  {productCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  required
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                <input
                  required
                  value={productForm.village}
                  onChange={(e) => setProductForm({ ...productForm, village: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <ListingImageUploadField
                uploaderId={userId}
                value={productForm.image_url}
                onChange={(url) => setProductForm({ ...productForm, image_url: url })}
              />
            </>
          )}

          {itemType === 'kuliner' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  required
                  value={kulinerForm.category}
                  onChange={(e) =>
                    setKulinerForm({ ...kulinerForm, category: e.target.value as KulinerCategory })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                >
                  {Object.entries(KULINER_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
                <input
                  required
                  value={kulinerForm.name}
                  onChange={(e) => setKulinerForm({ ...kulinerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  required
                  rows={2}
                  value={kulinerForm.description}
                  onChange={(e) => setKulinerForm({ ...kulinerForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={kulinerForm.price || ''}
                    onChange={(e) => setKulinerForm({ ...kulinerForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Antar</label>
                  <input
                    required
                    value={kulinerForm.delivery_time}
                    onChange={(e) => setKulinerForm({ ...kulinerForm, delivery_time: e.target.value })}
                    placeholder="30-45 menit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Warung</label>
                  <input
                    required
                    value={kulinerForm.seller_name}
                    onChange={(e) => setKulinerForm({ ...kulinerForm, seller_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                  <input
                    required
                    value={kulinerForm.village}
                    onChange={(e) => setKulinerForm({ ...kulinerForm, village: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Buka</label>
                  <input
                    required
                    type="time"
                    value={kulinerForm.opening_time}
                    onChange={(e) => setKulinerForm({ ...kulinerForm, opening_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tutup</label>
                  <input
                    required
                    type="time"
                    value={kulinerForm.closing_time}
                    onChange={(e) => setKulinerForm({ ...kulinerForm, closing_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <ListingImageUploadField
                uploaderId={userId}
                value={kulinerForm.image_url}
                onChange={(url) => setKulinerForm({ ...kulinerForm, image_url: url })}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={kulinerForm.is_available}
                  onChange={(e) => setKulinerForm({ ...kulinerForm, is_available: e.target.checked })}
                  className="rounded"
                />
                Tersedia untuk dipesan
              </label>
            </>
          )}

          {itemType && (
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={
                  saving ||
                  (itemType === 'produk' ? !productForm.image_url : !kulinerForm.image_url)
                }
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold"
              >
                {saving ? 'Menyimpan...' : itemType === 'kuliner' ? 'Tambah Menu' : 'Tambah Produk'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
