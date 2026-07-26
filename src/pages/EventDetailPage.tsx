import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { useEventItem } from '../hooks/useEvents';
import { formatEventSchedule } from '../lib/contact';
import { EVENT_CATEGORY_LABELS } from '../types';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { item, loading, error } = useEventItem(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat event...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Event tidak ditemukan</p>
        <Link to="/event" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke Event Desa
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/event"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Event Desa
      </Link>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-48 sm:h-64 md:h-80 overflow-hidden">
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        </div>

        <div className="p-5 sm:p-8">
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            {EVENT_CATEGORY_LABELS[item.category]}
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-3 leading-tight">{item.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatEventSchedule(item.event_date, item.end_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {item.location}, {item.village}
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <Users className="w-4 h-4" />
              Didukung {item.sponsors_count} Sponsor
            </span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mt-6">{item.description}</p>
        </div>
      </article>
    </div>
  );
}
