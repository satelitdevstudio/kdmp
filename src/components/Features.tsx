import { Bike, ShieldCheck, CreditCard, Store, Headphones } from 'lucide-react';

const features = [
  { icon: Bike, title: 'Kurir Desa', desc: 'Antar cepat oleh warga setempat', color: 'text-red-600', bg: 'bg-red-50' },
  { icon: ShieldCheck, title: 'Aman & Terpercaya', desc: 'Transaksi aman, produk berkualitas', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: CreditCard, title: 'Pembayaran Mudah', desc: 'Transfer, COD, e-wallet, QRIS', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Store, title: 'Dukung UMKM Lokal', desc: 'Setiap transaksi untuk desa kita', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Headphones, title: 'Layanan 24 Jam', desc: 'Kami siap membantu Anda', color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function Features() {
  return (
    <section className="bg-white py-5 border-y border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Mobile: 2-col grid + last item centered */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-center gap-2.5 sm:gap-3">
                <div className={`${f.bg} ${f.color} w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">{f.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
