import { MapPin, ShoppingBag, UtensilsCrossed, Wrench, CalendarDays } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { defaultSiteSettings } from '../data/defaultSiteSettings';

const quickActions = [
  { icon: ShoppingBag, label: 'Belanja Produk', bg: 'bg-red-100', color: 'text-red-600', to: '/produk' },
  { icon: UtensilsCrossed, label: 'Pesan Kuliner', bg: 'bg-orange-100', color: 'text-orange-600', to: '/kuliner' },
  { icon: Wrench, label: 'Booking Jasa', bg: 'bg-blue-100', color: 'text-blue-600', to: '/jasa' },
  { icon: CalendarDays, label: 'Lihat Event', bg: 'bg-green-100', color: 'text-green-600', to: '/event' },
];

const couriers = [
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
];

function splitHeroTitle(title: string): [string, string] {
  const idx = title.indexOf(',');
  if (idx === -1) return [title, ''];
  return [title.slice(0, idx).trim(), title.slice(idx + 1).trim()];
}

function DeliveryCard({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  const goToKuliner = () => {
    const params = address.trim() ? `?alamat=${encodeURIComponent(address.trim())}` : '';
    navigate(`/kuliner${params}`);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🛵</span>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">Pesan Kuliner Antar</h3>
          <p className="text-gray-500 text-xs">Dikirim oleh kurir warga setempat.</p>
        </div>
      </div>
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && goToKuliner()}
          placeholder="Masukkan alamat antar"
          className="flex-1 px-3 py-2 text-sm outline-none text-gray-600"
        />
        <button type="button" onClick={goToKuliner} className="px-2 py-2 text-red-600" aria-label="Lihat kuliner">
          <MapPin className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={goToKuliner}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mb-4"
      >
        Lihat Kuliner
      </button>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {couriers.map((url, i) => (
            <img key={i} src={url} alt="courier" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-800">Kurir Warga Tersedia</div>
          <div className="text-[10px] text-green-600">12 kurir online</div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const [mobileAddress, setMobileAddress] = useState('');
  const { settings } = useSiteSettings();

  const heroBg = settings.hero_background_url ?? defaultSiteSettings.hero_background_url ?? '/assets/bg-desafx.jpg';
  const heroTitle = settings.hero_title ?? defaultSiteSettings.hero_title ?? '';
  const heroSubtitle = settings.hero_subtitle ?? defaultSiteSettings.hero_subtitle ?? '';
  const [heroLine1, heroLine2] = splitHeroTitle(heroTitle);

  const goToKulinerMobile = () => {
    const params = mobileAddress.trim() ? `?alamat=${encodeURIComponent(mobileAddress.trim())}` : '';
    navigate(`/kuliner${params}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[320px] sm:h-[360px] lg:h-[400px]">
        <img
          src={heroBg}
          alt="Pasar desa dan festival lokal"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/10" />

        <div className="relative max-w-screen-xl mx-auto px-4 h-full flex items-center">
          <div className="flex-1 text-black max-w-md lg:max-w-lg bg-white/50 rounded-3xl p-6 shadow-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2">
              <span className="block text-black">{heroLine1}{heroLine2 ? ',' : ''}</span>
              {heroLine2 && <span className="block text-red-600">{heroLine2}</span>}
            </h1>
            {heroSubtitle && (
              <p className="text-black text-base sm:text-lg mb-5 hidden sm:block font-bold">
                {heroSubtitle}
              </p>
            )}
            <div className="flex gap-3 sm:gap-5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} to={action.to} className="flex flex-col items-center gap-1.5 group">
                    <div className={`${action.bg} ${action.color} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-black text-[9px] sm:text-xs font-medium text-center leading-tight max-w-[56px]">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <DeliveryCard className="hidden lg:block ml-auto w-64 xl:w-72 bg-white rounded-2xl p-4 xl:p-5 shadow-2xl" />
        </div>
      </div>

      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🛵</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Pesan Kuliner Antar</h3>
            <p className="text-gray-500 text-xs">Dikirim oleh kurir warga setempat.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1">
            <input
              type="text"
              value={mobileAddress}
              onChange={(e) => setMobileAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goToKulinerMobile()}
              placeholder="Masukkan alamat antar"
              className="flex-1 px-3 py-2 text-sm outline-none text-gray-600"
            />
            <button type="button" onClick={goToKulinerMobile} className="px-2 py-2 text-red-600" aria-label="Lihat kuliner">
              <MapPin className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={goToKulinerMobile}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Lihat Kuliner
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex -space-x-2">
            {couriers.map((url, i) => (
              <img key={i} src={url} alt="courier" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
          <div className="text-xs font-semibold text-gray-800">Kurir Warga Tersedia &mdash; <span className="text-green-600 font-normal">12 kurir online</span></div>
        </div>
      </div>
    </section>
  );
}
