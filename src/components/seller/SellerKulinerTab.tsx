import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, UtensilsCrossed, X } from 'lucide-react';
import {
  fetchSellerKuliner,
  updateKuliner,
  deleteKuliner,
  type KulinerInput,
} from '../../lib/sellerKuliner';
import { formatPrice } from '../../data/mockProducts';
import { getModerationStatus, KULINER_CATEGORY_LABELS, type Kuliner, type KulinerCategory } from '../../types';
import { DEFAULT_CLOSING_TIME, DEFAULT_OPENING_TIME } from '../../lib/storeHours';
import StoreStatusBadge from '../StoreStatusBadge';
import ModerationStatusBadge from '../ModerationStatusBadge';

const emptyForm: KulinerInput = {
  name: '',
  description: '',
  price: 0,
  seller_name: '',
  village: '',
  category: 'makanan-berat',
  delivery_time: '30-45 menit',
  is_available: true,
  opening_time: DEFAULT_OPENING_TIME,
  closing_time: DEFAULT_CLOSING_TIME,
  image_url: '',
};

interface Props {
  userId: string;
  sellerName: string;
  onAdd?: () => void;
  reloadTrigger?: number;
}

export default function SellerKulinerTab({ userId, sellerName, onAdd, reloadTrigger = 0 }: Props) {
  const [items, setItems] = useState<Kuliner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<KulinerInput>({ ...emptyForm, seller_name: sellerName });
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    const { items: data, error: fetchError } = await fetchSellerKuliner(userId);
    setItems(data);
    setError(fetchError);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, [userId, reloadTrigger]);

  const openCreate = () => {
    onAdd?.();
  };

  const openEdit = (item: Kuliner) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      seller_name: item.seller_name,
      village: item.village,
      category: item.category,
      delivery_time: item.delivery_time,
      is_available: item.is_available,
      opening_time: item.opening_time ?? DEFAULT_OPENING_TIME,
      closing_time: item.closing_time ?? DEFAULT_CLOSING_TIME,
      image_url: item.image_url,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (editingId) {
      const { error: updateError } = await updateKuliner(userId, editingId, form);
      if (updateError) setError(updateError);
      else closeForm();
    }

    setSaving(false);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return;
    const { error: deleteError } = await deleteKuliner(userId, id);
    if (deleteError) setError(deleteError);
    else loadItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat kuliner...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Menu
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {showForm && editingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Edit Menu</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Antar</label>
                  <input
                    required
                    value={form.delivery_time}
                    onChange={(e) => setForm({ ...form, delivery_time: e.target.value })}
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
                    value={form.seller_name}
                    onChange={(e) => setForm({ ...form, seller_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                  <input
                    required
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
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
                    value={form.opening_time}
                    onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tutup</label>
                  <input
                    required
                    type="time"
                    value={form.closing_time}
                    onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as KulinerCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                >
                  {Object.entries(KULINER_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input
                  required
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  className="rounded"
                />
                Tersedia untuk dipesan
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <UtensilsCrossed className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="font-medium text-gray-800">Belum ada menu kuliner</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Tambah Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-36 overflow-hidden relative">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  <StoreStatusBadge
                    openingTime={item.opening_time}
                    closingTime={item.closing_time}
                    isAvailable={item.is_available}
                    className="drop-shadow-sm"
                  />
                </div>
                {!item.is_available && (
                  <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded">
                    Tidak Tersedia
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                  <ModerationStatusBadge
                    status={getModerationStatus(item)}
                    note={item.moderation_note}
                    compact
                  />
                </div>
                <p className="text-xs text-gray-400">{item.seller_name}</p>
                <p className="text-red-600 font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                {getModerationStatus(item) === 'pending' && (
                  <p className="text-[10px] text-amber-700 mt-2">
                    Menu menunggu persetujuan admin sebelum tampil di marketplace.
                  </p>
                )}
                {getModerationStatus(item) === 'rejected' && (
                  <p className="text-[10px] text-red-600 mt-2">
                    Perbaiki menu lalu simpan ulang untuk diajukan review kembali.
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {getModerationStatus(item) === 'approved' && (
                    <Link to={`/kuliner/${item.id}`} className="text-xs text-gray-500 hover:text-red-600">
                      Lihat
                    </Link>
                  )}
                  <button onClick={() => openEdit(item)} className="flex items-center gap-1 text-xs text-blue-600">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-xs text-red-600">
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
