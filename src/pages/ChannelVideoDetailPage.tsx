import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, MapPin } from 'lucide-react';
import { useChannelVideoItem } from '../hooks/useEvents';
import { getVideoEmbedUrl, isDirectVideoUrl } from '../lib/video';

export default function ChannelVideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { item, loading, error } = useChannelVideoItem(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat video...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Video tidak ditemukan</p>
        <Link to="/event?tab=tv" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke Channel Desa TV
        </Link>
      </div>
    );
  }

  const embedUrl = item.video_url ? getVideoEmbedUrl(item.video_url) : null;
  const isDirectVideo = embedUrl ? isDirectVideoUrl(embedUrl) : false;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/event?tab=tv"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Channel Desa TV
      </Link>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative aspect-video bg-gray-900">
          {embedUrl ? (
            isDirectVideo ? (
              <video src={embedUrl} controls className="w-full h-full" poster={item.image_url}>
                Browser Anda tidak mendukung pemutaran video.
              </video>
            ) : (
              <iframe
                src={embedUrl}
                title={item.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <>
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
                {item.is_live ? (
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    LIVE — {item.viewer_count?.toLocaleString('id-ID')} menonton
                  </span>
                ) : (
                  <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    Durasi: {item.duration}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">{item.title}</h1>
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-2">
            <MapPin className="w-4 h-4" />
            {item.village}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-4">{item.description}</p>

          {!embedUrl && (
            <p className="text-xs text-gray-400 mt-4 bg-gray-50 rounded-lg px-3 py-2">
              Tambahkan URL video (YouTube/Vimeo) melalui dashboard admin untuk menayangkan siaran langsung.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
