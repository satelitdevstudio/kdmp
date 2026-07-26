import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, MapPin, Store, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { becomeAdmin } from '../lib/admin';
import { isSupabaseConfigured } from '../lib/supabase';

const roleLabels = {
  buyer: 'Pembeli',
  seller: 'Penjual UMKM',
  admin: 'Admin',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, save, upgradeToSeller, isSeller, isAdmin } = useProfile();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [becomingAdmin, setBecomingAdmin] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone ?? '');
      setAddress(profile.address ?? '');
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat profil...
      </div>
    );
  }

  if (isSupabaseConfigured && !user) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Silakan masuk untuk melihat profil</p>
        <Link to="/login?redirect=/profil" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Masuk sekarang
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const { error: saveError } = await save({
      full_name: fullName.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });

    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setSuccess('Profil berhasil disimpan');
  };

  const handleBecomeSeller = async () => {
    setError('');
    setSuccess('');
    setUpgrading(true);

    const { error: upgradeError } = await upgradeToSeller();
    setUpgrading(false);

    if (upgradeError) {
      setError(upgradeError);
      return;
    }
    setSuccess('Anda sekarang terdaftar sebagai penjual UMKM!');
  };

  const handleBecomeAdmin = async () => {
    if (!profile) return;
    setError('');
    setSuccess('');
    setBecomingAdmin(true);

    const { error: adminError } = await becomeAdmin(profile.id);
    setBecomingAdmin(false);

    if (adminError) {
      setError(adminError);
      return;
    }
    setSuccess('Role admin diaktifkan. Muat ulang halaman untuk melihat panel admin.');
    window.location.reload();
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi akun dan alamat pengiriman</p>
      </div>

      {!isSupabaseConfigured && (
        <p className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Mode demo: profil disimpan di perangkat ini.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-red-600" />
              Informasi Pribadi
            </h2>

            <div className="space-y-3">
              {user?.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> No. Telepon
                  </span>
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

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Alamat
                  </span>
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap untuk pengiriman"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3">Status Akun</h2>
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700">
              {profile ? roleLabels[profile.role] : 'Pembeli'}
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-red-600" />
              Jual Produk UMKM
            </h2>

            {isSeller ? (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  Anda terdaftar sebagai penjual. Kelola produk di dashboard penjual.
                </p>
                <Link
                  to="/seller"
                  className="block text-center bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Dashboard Penjual
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  Daftarkan UMKM Anda dan mulai jual produk desa di ArgasariHub.
                </p>
                <button
                  onClick={handleBecomeSeller}
                  disabled={upgrading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {upgrading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {upgrading ? 'Memproses...' : 'Daftar Sebagai Penjual'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-2">Pesanan</h2>
            <Link to="/pesanan" className="text-sm text-red-600 hover:underline">
              Lihat riwayat pesanan →
            </Link>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-2">Panel Admin</h2>
              <Link
                to="/admin"
                className="block text-center bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Dashboard Admin
              </Link>
            </div>
          )}

          {!isSupabaseConfigured && !isAdmin && profile && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
              <h2 className="font-bold text-gray-800 mb-2 text-sm">Mode Demo: Jadi Admin</h2>
              <p className="text-xs text-gray-500 mb-3">Untuk menguji fitur admin di mode demo.</p>
              <button
                onClick={handleBecomeAdmin}
                disabled={becomingAdmin}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {becomingAdmin ? 'Memproses...' : 'Aktifkan Role Admin'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
