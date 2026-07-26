import { useMemo, useState } from 'react';
import { Shield, Store, ShoppingBag } from 'lucide-react';
import type { Profile } from '../../types';

type UserSection = Profile['role'];

const USER_SECTIONS: {
  id: UserSection;
  label: string;
  icon: typeof Shield;
  description: string;
}[] = [
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Pengguna dengan akses penuh ke dashboard admin.',
  },
  {
    id: 'seller',
    label: 'Penjual',
    icon: Store,
    description: 'Pengguna UMKM yang dapat mengelola produk dan pesanan di dashboard penjual.',
  },
  {
    id: 'buyer',
    label: 'Pembeli',
    icon: ShoppingBag,
    description: 'Pengguna yang berbelanja dan melacak pesanan.',
  },
];

interface Props {
  profiles: Profile[];
  onRoleChange: (userId: string, role: Profile['role']) => void | Promise<void>;
}

export default function AdminUsersTab({ profiles, onRoleChange }: Props) {
  const [section, setSection] = useState<UserSection>('admin');

  const counts = useMemo(
    () => ({
      admin: profiles.filter((p) => p.role === 'admin').length,
      seller: profiles.filter((p) => p.role === 'seller').length,
      buyer: profiles.filter((p) => p.role === 'buyer').length,
    }),
    [profiles]
  );

  const filteredProfiles = useMemo(
    () => profiles.filter((p) => p.role === section),
    [profiles, section]
  );

  const activeSection = USER_SECTIONS.find((s) => s.id === section)!;

  if (profiles.length === 0) {
    return <p className="text-center text-gray-500 py-8">Belum ada data pengguna</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {USER_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === id
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label} ({counts[id]})
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mb-3">{activeSection.description}</p>

      {filteredProfiles.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada pengguna dengan peran {activeSection.label.toLowerCase()}</p>
      ) : (
        <div className="space-y-2">
          {filteredProfiles.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{p.full_name || 'Tanpa Nama'}</p>
                <p className="text-xs text-gray-400 font-mono truncate">{p.id}</p>
                {p.phone && <p className="text-xs text-gray-500 mt-0.5">{p.phone}</p>}
              </div>
              <select
                value={p.role}
                onChange={(e) => onRoleChange(p.id, e.target.value as Profile['role'])}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 flex-shrink-0"
              >
                <option value="buyer">Pembeli</option>
                <option value="seller">Penjual</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
