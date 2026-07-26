import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { infoLinkMap, helpLinkMap } from '../data/staticPages';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import FooterSponsorBanner from './FooterSponsorBanner';

const quickLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Produk Desa', to: '/produk' },
  { label: 'Kuliner Desa', to: '/kuliner' },
  { label: 'Jasa Warga', to: '/jasa' },
  { label: 'Event Desa', to: '/event' },
  { label: 'Channel Desa TV', to: '/event?tab=tv' },
  { label: 'Wisata & Homestay', to: '/wisata' },
  { label: 'Lowongan Kerja', to: '/lowongan' },
  { label: 'Info Desa', to: '/info-desa' },
];
const infoLinks = Object.keys(infoLinkMap);
const helpLinks = Object.keys(helpLinkMap);

function DefaultFooterLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <rect width="40" height="40" rx="4" fill="white" />
      <path d="M8 32 L8 20 L20 12 L32 20 L32 32 Z" fill="#DC2626" stroke="#DC2626" strokeWidth="1" />
      <path d="M16 32 L16 24 L24 24 L24 32 Z" fill="white" />
      <circle cx="14" cy="22" r="2" fill="white" />
      <circle cx="20" cy="19" r="2" fill="white" />
      <circle cx="26" cy="22" r="2" fill="white" />
    </svg>
  );
}

function splitSiteTitle(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title.toUpperCase(), ''];
  return [words[0].toUpperCase(), words.slice(1).join(' ').toUpperCase()];
}

export default function Footer() {
  const { settings } = useSiteSettings();
  const [titleLine1, titleLine2] = splitSiteTitle(settings.site_title);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-red-700 text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-white rounded flex items-center justify-center overflow-hidden">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt={settings.site_title} className="w-full h-full object-contain" />
                ) : (
                  <DefaultFooterLogo />
                )}
              </div>
              <div>
                <div className="font-bold text-xs">{titleLine1}</div>
                {titleLine2 && <div className="font-bold text-sm -mt-0.5">{titleLine2}</div>}
              </div>
            </div>
            <p className="text-red-200 text-xs leading-relaxed mb-3 max-w-xs">
              {settings.site_description}
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-red-200 hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="text-red-200 hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="text-red-200 hover:text-white transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-xs sm:text-sm mb-3">Quick Link</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}><Link to={link.to} className="text-red-200 hover:text-white text-xs transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-xs sm:text-sm mb-3">Informasi</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {infoLinks.map((link) => (
                <li key={link}><Link to={`/halaman/${infoLinkMap[link]}`} className="text-red-200 hover:text-white text-xs transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-1">
            <h4 className="font-bold text-xs sm:text-sm mb-3">Bantuan</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {helpLinks.map((link) => (
                <li key={link}><Link to={`/halaman/${helpLinkMap[link]}`} className="text-red-200 hover:text-white text-xs transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="font-bold text-xs sm:text-sm mb-3">Kontak Kami</h4>
            <ul className="space-y-2 mb-4">
              <li className="flex gap-2 text-red-200 text-xs">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{settings.contact_address}</span>
              </li>
              {settings.contact_phone && (
                <li className="flex gap-2 text-red-200 text-xs items-center">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{settings.contact_phone}</span>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex gap-2 text-red-200 text-xs items-center">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{settings.contact_email}</span>
                </li>
              )}
            </ul>
            <h4 className="font-bold text-xs sm:text-sm mb-2">Download Aplikasi</h4>
            <div className="flex sm:flex-col gap-2">
              {['Google Play', 'App Store'].map((store) => (
                <a
                  key={store}
                  href="#"
                  className="bg-black hover:bg-gray-900 rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors w-fit sm:w-full"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">{store[0]}</span>
                  </div>
                  <div>
                    <div className="text-white text-[7px] leading-none opacity-70">Download on</div>
                    <div className="text-white text-[10px] font-bold leading-tight">{store}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FooterSponsorBanner />

      <div className="border-t border-red-600">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="text-red-200 text-[10px] sm:text-xs">
            © {year} {settings.site_title}. All rights reserved.
          </p>
          <p className="text-red-200 text-[10px] sm:text-xs flex items-center gap-1">
            Dibuat dengan <span className="text-red-300">♥</span> untuk Desa Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
