import { Home, Grid, UtensilsCrossed, Users, Calendar, MapPin, Briefcase, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Beranda', shortLabel: 'Beranda', icon: Home, to: '/' },
  { label: 'Produk Desa', shortLabel: 'Produk', icon: Grid, to: '/produk' },
  { label: 'Kuliner', shortLabel: 'Kuliner', icon: UtensilsCrossed, to: '/kuliner' },
  { label: 'Jasa Warga', shortLabel: 'Jasa', icon: Users, to: '/jasa' },
  { label: 'Event & Channel Desa', shortLabel: 'Event', icon: Calendar, to: '/event' },
  { label: 'Wisata & Homestay', shortLabel: 'Wisata', icon: MapPin, to: '/wisata' },
  { label: 'Lowongan Kerja', shortLabel: 'Lowongan', icon: Briefcase, to: '/lowongan' },
  { label: 'Info Desa', shortLabel: 'Info', icon: Info, to: '/info-desa' },
];

export default function Nav() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-[68px] sm:top-[68px] z-40 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-3 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    isActive
                      ? 'border-red-600 text-red-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-red-600 hover:border-red-200'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
