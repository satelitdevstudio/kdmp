import type { Kuliner } from '../types';

export const DEFAULT_OPENING_TIME = '08:00';
export const DEFAULT_CLOSING_TIME = '21:00';

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function getWibMinutes(now: Date): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

export function getStoreHours(kuliner: Pick<Kuliner, 'opening_time' | 'closing_time'>) {
  return {
    opening: kuliner.opening_time ?? DEFAULT_OPENING_TIME,
    closing: kuliner.closing_time ?? DEFAULT_CLOSING_TIME,
  };
}

export function isStoreOpen(
  openingTime: string = DEFAULT_OPENING_TIME,
  closingTime: string = DEFAULT_CLOSING_TIME,
  now: Date = new Date()
): boolean {
  const openMinutes = parseTimeToMinutes(openingTime);
  const closeMinutes = parseTimeToMinutes(closingTime);
  if (openMinutes === null || closeMinutes === null) return true;

  const currentMinutes = getWibMinutes(now);

  if (openMinutes === closeMinutes) return true;

  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}

export function isKulinerStoreOpen(
  kuliner: Pick<Kuliner, 'opening_time' | 'closing_time'>,
  now?: Date
): boolean {
  const { opening, closing } = getStoreHours(kuliner);
  return isStoreOpen(opening, closing, now);
}

export function canOrderKuliner(
  kuliner: Pick<Kuliner, 'is_available' | 'opening_time' | 'closing_time'>
): boolean {
  return kuliner.is_available && isKulinerStoreOpen(kuliner);
}

export function formatStoreHours(
  openingTime: string = DEFAULT_OPENING_TIME,
  closingTime: string = DEFAULT_CLOSING_TIME
): string {
  return `${openingTime}–${closingTime} WIB`;
}
