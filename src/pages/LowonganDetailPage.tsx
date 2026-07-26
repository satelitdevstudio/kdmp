import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Phone, Loader2 } from 'lucide-react';
import { useLowonganItem } from '../hooks/useLowongan';
import { formatDateId, waLink } from '../lib/contact';
import { EMPLOYMENT_TYPE_LABELS } from '../types';

export default function LowonganDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { item, loading, error } = useLowonganItem(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat lowongan...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Lowongan tidak ditemukan</p>
        <Link to="/lowongan" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke Lowongan Kerja
        </Link>
      </div>
    );
  }

  const waMessage = `Halo, saya tertarik melamar posisi "${item.title}" di ${item.company} melalui ArgasariHub.`;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/lowongan"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Lowongan Kerja
      </Link>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-8">
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            {EMPLOYMENT_TYPE_LABELS[item.employment_type]}
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-3">{item.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{item.company}</p>

          <p className="text-lg font-bold text-red-600 mt-4">{item.salary_range}</p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {item.village}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Batas lamaran: {formatDateId(item.deadline)}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Deskripsi Pekerjaan</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          {item.requirements.length > 0 && (
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Persyaratan</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {item.requirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={waLink(item.contact_phone, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              Lamar via WhatsApp
            </a>
            <a
              href={`tel:${item.contact_phone}`}
              className="flex items-center justify-center gap-2 border border-gray-300 hover:border-red-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Phone className="w-5 h-5" />
              {item.contact_phone}
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
