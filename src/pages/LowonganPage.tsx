import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useLowongan } from '../hooks/useLowongan';
import { formatDateId } from '../lib/contact';
import { EMPLOYMENT_TYPE_LABELS, type EmploymentType } from '../types';

const employmentTypes: { value: EmploymentType | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  ...Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({
    value: value as EmploymentType,
    label,
  })),
];

const typeColors: Record<EmploymentType, string> = {
  'penuh-waktu': 'bg-blue-100 text-blue-700',
  'paruh-waktu': 'bg-green-100 text-green-700',
  freelance: 'bg-purple-100 text-purple-700',
  magang: 'bg-amber-100 text-amber-700',
};

export default function LowonganPage() {
  const [employmentType, setEmploymentType] = useState<EmploymentType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { items, loading, error } = useLowongan({ employmentType, search });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Lowongan Kerja</h1>
        <p className="text-sm text-gray-500 mt-1">
          Temukan peluang kerja di desa dan sekitarnya — UMKM, koperasi, dan usaha lokal
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari posisi atau perusahaan..."
            className="flex-1 px-3 py-2 text-sm outline-none"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-2">
        {employmentTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => setEmploymentType(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors ${
              employmentType === t.value
                ? 'bg-red-600 text-white font-medium'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Memuat lowongan...
        </div>
      )}

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error} — menampilkan data demo.
        </p>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="font-medium">Lowongan tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci atau tipe lain</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/lowongan/${item.id}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:ring-2 hover:ring-red-50 transition flex gap-4"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
                <img src={item.image_url} alt={item.company} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.company}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${typeColors[item.employment_type]}`}>
                    {EMPLOYMENT_TYPE_LABELS[item.employment_type]}
                  </span>
                </div>
                <p className="text-sm font-medium text-red-600 mt-2">{item.salary_range}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.village}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Batas: {formatDateId(item.deadline)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
