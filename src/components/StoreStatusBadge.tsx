import { useEffect, useState } from 'react';
import { isStoreOpen, formatStoreHours, DEFAULT_OPENING_TIME, DEFAULT_CLOSING_TIME } from '../lib/storeHours';

interface StoreStatusBadgeProps {
  openingTime?: string;
  closingTime?: string;
  isAvailable?: boolean;
  showHours?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StoreStatusBadge({
  openingTime = DEFAULT_OPENING_TIME,
  closingTime = DEFAULT_CLOSING_TIME,
  isAvailable = true,
  showHours = false,
  size = 'sm',
  className = '',
}: StoreStatusBadgeProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const open = isAvailable && isStoreOpen(openingTime, closingTime);
  const sizeClass = size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-1.5 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${
          open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}
        title={open ? 'Toko sedang buka' : 'Toko sedang tutup'}
      >
        <span
          className={`rounded-full ${size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5'} ${
            open ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}
          aria-hidden
        />
        {open ? 'Buka' : 'Tutup'}
      </span>
      {showHours && (
        <span className={`text-gray-400 ${size === 'md' ? 'text-xs' : 'text-[10px]'}`}>
          {formatStoreHours(openingTime, closingTime)}
        </span>
      )}
    </span>
  );
}
