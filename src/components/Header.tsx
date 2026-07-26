import { Search, ShoppingCart, Package, Menu, X, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { isSupabaseConfigured } from '../lib/supabase';
import NotificationBell from './NotificationBell';

function DefaultLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className ?? 'w-8 h-8'} fill="none">
      <rect width="40" height="40" rx="4" fill="#DC2626" />
      <path d="M8 32 L8 20 L20 12 L32 20 L32 32 Z" fill="white" stroke="white" strokeWidth="1" />
      <path d="M16 32 L16 24 L24 24 L24 32 Z" fill="#DC2626" />
      <circle cx="14" cy="22" r="2" fill="#DC2626" />
      <circle cx="20" cy="19" r="2" fill="#DC2626" />
      <circle cx="26" cy="22" r="2" fill="#DC2626" />
    </svg>
  );
}

function splitSiteTitle(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title.toUpperCase(), ''];
  return [words[0].toUpperCase(), words.slice(1).join(' ').toUpperCase()];
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const [titleLine1, titleLine2] = splitSiteTitle(settings.site_title);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center overflow-hidden">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_title} className="w-full h-full object-contain" />
            ) : (
              <DefaultLogo />
            )}
          </div>
          <div className="hidden sm:block">
            <div className="text-red-600 font-bold text-xs leading-tight">{titleLine1}</div>
            {titleLine2 && (
              <div className="text-red-600 font-bold text-sm leading-tight">{titleLine2}</div>
            )}
            {settings.site_tagline && (
              <div className="text-gray-500 text-[9px] leading-tight hidden md:block">{settings.site_tagline}</div>
            )}
          </div>
        </Link>

        <div className="flex-1 hidden sm:flex max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('search') as HTMLInputElement;
              navigate(`/cari?q=${encodeURIComponent(input.value)}`);
            }}
            className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-full"
          >
            <input
              name="search"
              type="text"
              placeholder="Cari produk, kuliner, jasa..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <button
            type="button"
            className="sm:hidden p-2 text-gray-600"
            onClick={() => mobileSearchRef.current?.focus()}
            aria-label="Fokus pencarian"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link to="/pesanan" className="hidden md:flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600 transition-colors">
            <Package className="w-5 h-5" />
            <span className="text-[9px]">Pesanan</span>
          </Link>

          <Link to="/keranjang" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600 transition-colors">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            <span className="text-[9px] hidden md:block">Keranjang</span>
          </Link>

          <NotificationBell />

          {(user || !isSupabaseConfigured) && (
            <Link to="/profil" className="hidden sm:flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600 transition-colors">
              <User className="w-5 h-5" />
              <span className="text-[9px]">Profil</span>
            </Link>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 border border-gray-300 hover:border-red-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap"
            >
              <span className="hidden sm:inline">Masuk / Daftar</span>
              <span className="sm:hidden">Masuk</span>
            </Link>
          )}

          <button
            className="md:hidden p-1.5 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="sm:hidden px-4 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('mobile-search') as HTMLInputElement;
            navigate(`/cari?q=${encodeURIComponent(input.value)}`);
          }}
          className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
        >
          <input
            ref={mobileSearchRef}
            name="mobile-search"
            type="text"
            placeholder="Cari produk, kuliner, jasa, atau event desa..."
            className="flex-1 px-3 py-2 text-sm outline-none"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
