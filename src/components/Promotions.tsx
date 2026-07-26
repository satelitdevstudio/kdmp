import { Link } from 'react-router-dom';

const promotions = [
  {
    title: 'Pasang Banner di Event Desa',
    desc: 'Promosikan produk/jasa Anda di ribuan acara desa',
    cta: 'Pasang Sekarang',
    to: '/event',
    img: 'https://images.pexels.com/photos/2291599/pexels-photo-2291599.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
    overlay: 'bg-gradient-to-r from-red-700/90 to-red-500/60',
    ctaClass: 'bg-white text-red-600 hover:bg-red-50',
  },
  {
    title: 'Sewa Booth di Event Desa',
    desc: 'Jangkau lebih banyak pelanggan dengan booth menarik',
    cta: 'Sewa Booth',
    to: '/event',
    img: 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
    overlay: 'bg-gradient-to-r from-violet-700/90 to-violet-500/60',
    ctaClass: 'bg-white text-violet-700 hover:bg-violet-50',
  },
  {
    title: 'Jadi Sponsor Event Desa',
    desc: 'Tingkatkan brand Anda dan dukung kegiatan positif desa',
    cta: 'Lihat Paket Sponsor',
    to: '/event',
    img: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
    overlay: 'bg-gradient-to-r from-emerald-700/90 to-emerald-500/60',
    ctaClass: 'bg-white text-emerald-700 hover:bg-emerald-50',
  },
];

export default function Promotions() {
  return (
    <section className="py-6 sm:py-8 bg-white border-y border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 text-center">
          Dukung Event & Promosikan Usaha Anda
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {promotions.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="relative rounded-2xl overflow-hidden h-32 sm:h-36 group cursor-pointer shadow-sm hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition block"
            >
              <img
                src={p.img}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className={`absolute inset-0 ${p.overlay}`} />
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">{p.title}</h3>
                  <p className="text-white/80 text-xs mt-0.5">{p.desc}</p>
                </div>
                <span className={`${p.ctaClass} text-xs font-bold px-4 py-1.5 rounded-lg w-fit transition-colors`}>
                  {p.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
