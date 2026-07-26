import { ExternalLink } from 'lucide-react';
import { useSponsorBanners } from '../hooks/useSponsorBanners';

export default function FooterSponsorBanner() {
  const { banners, loading } = useSponsorBanners();

  if (loading || banners.length === 0) return null;

  return (
    <div className="border-t border-red-600 bg-red-800/80">
      <div className="max-w-screen-xl mx-auto px-4 py-5 sm:py-6">
        <p className="text-red-200 text-[10px] sm:text-xs uppercase tracking-widest text-center mb-4 font-medium">
          Didukung Oleh
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {banners.map((banner) => {
            const content = (
              <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow w-[140px] sm:w-[160px] h-12 sm:h-14">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {banner.link_url && (
                  <span className="absolute top-1 right-1 bg-black/40 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            );

            if (banner.link_url) {
              return (
                <a
                  key={banner.id}
                  href={banner.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={banner.title}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={banner.id} title={banner.title}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
