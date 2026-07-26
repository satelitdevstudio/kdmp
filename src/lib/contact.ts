export function waLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const num = cleaned.startsWith('0') ? `62${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function extractPhoneFromShippingAddress(address: string): string | null {
  const match = address.match(/\(Telp:\s*([^)]+)\)/i);
  return match?.[1]?.trim() ?? null;
}

export function getBuyerPhoneForOrder(
  buyerId: string,
  shippingAddress: string,
  profilePhoneById?: Record<string, string>
): string | null {
  return profilePhoneById?.[buyerId] ?? extractPhoneFromShippingAddress(shippingAddress);
}

export function buildOrderContactMessage(
  role: 'buyer' | 'seller',
  orderId: string,
  contactName?: string
): string {
  const shortId = orderId.slice(0, 8);
  if (role === 'buyer') {
    return `Halo, saya admin ArgasariHub. Menghubungi terkait pesanan #${shortId}. Apakah ada yang bisa kami bantu?`;
  }
  return `Halo${contactName ? ` ${contactName}` : ''}, saya admin ArgasariHub terkait pesanan #${shortId}. Mohon bantu konfirmasi pesanan ini ya.`;
}

export function formatDateId(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventSchedule(eventDate: string, endDate?: string): string {
  const start = formatDateId(eventDate);
  if (!endDate || endDate === eventDate) return start;
  return `${start} – ${formatDateId(endDate)}`;
}
