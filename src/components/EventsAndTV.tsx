import { MapPin, Calendar, Users, ChevronRight, Play, Tv, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEvents, useChannelVideos } from '../hooks/useEvents';
import { formatEventSchedule } from '../lib/contact';

const categoryColors: Record<string, string> = {
  olahraga: 'bg-red-600',
  agama: 'bg-emerald-600',
  budaya: 'bg-purple-600',
  sosial: 'bg-blue-600',
  pelatihan: 'bg-amber-600',
};

export default function EventsAndTV() {
  const { items: events, loading: eventsLoading } = useEvents();
  const { items: tvVideos, loading: videosLoading } = useChannelVideos();
  const upcomingEvents = events.slice(0, 3);

  return (
    <section className="py-6 sm:py-8 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Event Desa Mendatang</h2>
              <Link to="/event" className="text-red-600 text-xs sm:text-sm font-medium hover:underline flex items-center gap-0.5">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {eventsLoading && (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Memuat event...</span>
              </div>
            )}

            {!eventsLoading && upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Belum ada event mendatang</p>
            )}

            <div className="flex flex-col gap-3">
              {upcomingEvents.map((e) => {
                const date = new Date(e.event_date);
                const day = date.getDate().toString().padStart(2, '0');
                const month = date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();

                return (
                  <Link
                    key={e.id}
                    to={`/event/${e.id}`}
                    className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 flex gap-3 sm:gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className={`${categoryColors[e.category] ?? 'bg-red-600'} text-white rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center flex-shrink-0`}>
                      <span className="text-lg sm:text-xl font-bold leading-none">{day}</span>
                      <span className="text-[9px] sm:text-[10px] font-medium">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight mb-1">{e.title}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mb-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{e.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mb-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{formatEventSchedule(e.event_date, e.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 text-[10px] sm:text-xs font-medium">
                        <Users className="w-3 h-3" />
                        <span>Didukung {e.sponsors_count} Sponsor</span>
                      </div>
                    </div>
                    <span className="text-xs border border-gray-300 text-gray-600 px-2.5 sm:px-3 py-1.5 rounded-lg self-center font-medium whitespace-nowrap flex-shrink-0">
                      Detail
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Channel Desa TV</h2>
              <Link to="/event?tab=tv" className="text-red-600 text-xs sm:text-sm font-medium hover:underline flex items-center gap-0.5">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {videosLoading && (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Memuat video...</span>
              </div>
            )}

            {!videosLoading && tvVideos[0] && (
              <Link
                to={`/event/video/${tvVideos[0].id}`}
                className="relative rounded-xl overflow-hidden h-[180px] sm:h-[200px] mb-3 group cursor-pointer shadow-sm block"
              >
                <img
                  src={tvVideos[0].image_url}
                  alt={tvVideos[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-1" />
                  </div>
                </div>
                {tvVideos[0].is_live && (
                  <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-semibold">{tvVideos[0].title}</p>
                  {tvVideos[0].is_live && tvVideos[0].viewer_count && (
                    <p className="text-gray-300 text-[10px]">Sedang Live • {tvVideos[0].viewer_count.toLocaleString('id-ID')} menonton</p>
                  )}
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-2">
              {tvVideos.slice(1, 4).map((v) => (
                <Link
                  key={v.id}
                  to={`/event/video/${v.id}`}
                  className="flex gap-2 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="relative w-20 sm:w-24 h-14 flex-shrink-0">
                    <img
                      src={v.image_url}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {v.is_live && (
                      <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">LIVE</span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">{v.duration}</span>
                  </div>
                  <div className="p-2 flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-gray-800 leading-tight line-clamp-2">{v.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/event?tab=tv"
              className="mt-3 w-full border border-red-600 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              Buka Channel Desa TV
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
