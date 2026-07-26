import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, MapPin, Users, Loader2, Play, Tv } from 'lucide-react';
import { useEvents, useChannelVideos } from '../hooks/useEvents';
import { formatEventSchedule } from '../lib/contact';
import { EVENT_CATEGORY_LABELS, type EventCategory } from '../types';

const eventCategories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  ...Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as EventCategory,
    label,
  })),
];

const categoryColors: Record<EventCategory, string> = {
  olahraga: 'bg-red-600',
  agama: 'bg-emerald-600',
  budaya: 'bg-purple-600',
  sosial: 'bg-blue-600',
  pelatihan: 'bg-amber-600',
};

export default function EventPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'tv' ? 'tv' : 'event';

  const [category, setCategory] = useState<EventCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { items: events, loading: eventsLoading, error: eventsError } = useEvents({ category, search });
  const { items: videos, loading: videosLoading, error: videosError } = useChannelVideos();

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearch(q);
      setSearchInput(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const setTab = (newTab: 'event' | 'tv') => {
    const params = new URLSearchParams(searchParams);
    if (newTab === 'tv') {
      params.set('tab', 'tv');
    } else {
      params.delete('tab');
    }
    setSearchParams(params);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Event & Channel Desa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lihat event desa mendatang dan streaming Channel Desa TV
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('event')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'event' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Event Desa
        </button>
        <button
          onClick={() => setTab('tv')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'tv' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
          }`}
        >
          <Tv className="w-4 h-4" />
          Channel Desa TV
        </button>
      </div>

      {tab === 'event' && (
        <>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1 max-w-md">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari event atau lokasi..."
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-2">
            {eventCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  category === cat.value
                    ? 'bg-red-600 text-white font-medium'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {eventsLoading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Memuat event...
            </div>
          )}

          {eventsError && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
              {eventsError} — menampilkan data demo.
            </p>
          )}

          {!eventsLoading && events.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="font-medium">Event tidak ditemukan</p>
            </div>
          )}

          {!eventsLoading && events.length > 0 && (
            <div className="flex flex-col gap-3">
              {events.map((event) => {
                const date = new Date(event.event_date);
                const day = date.getDate().toString().padStart(2, '0');
                const month = date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();

                return (
                  <Link
                    key={event.id}
                    to={`/event/${event.id}`}
                    className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 flex gap-3 sm:gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className={`${categoryColors[event.category]} text-white rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center flex-shrink-0`}>
                      <span className="text-lg sm:text-xl font-bold leading-none">{day}</span>
                      <span className="text-[9px] sm:text-[10px] font-medium">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium text-gray-500">{EVENT_CATEGORY_LABELS[event.category]}</span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight mt-0.5">{event.title}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-0.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{formatEventSchedule(event.event_date, event.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 text-[10px] sm:text-xs font-medium mt-1">
                        <Users className="w-3 h-3" />
                        <span>Didukung {event.sponsors_count} Sponsor</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'tv' && (
        <>
          {videosLoading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Memuat video...
            </div>
          )}

          {videosError && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
              {videosError} — menampilkan data demo.
            </p>
          )}

          {!videosLoading && videos.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="font-medium">Belum ada video tersedia</p>
              <p className="text-sm mt-1">Channel Desa TV akan segera menayangkan siaran dari desa-desa</p>
            </div>
          )}

          {!videosLoading && videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  to={`/event/video/${video.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={video.image_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    {video.is_live && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        LIVE
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{video.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{video.village}</p>
                    {video.is_live && video.viewer_count && (
                      <p className="text-xs text-red-600 mt-1">{video.viewer_count.toLocaleString('id-ID')} menonton</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
