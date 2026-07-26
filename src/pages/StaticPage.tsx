import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { staticPages } from '../data/staticPages';

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? staticPages[slug] : undefined;

  if (!page) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Halaman tidak ditemukan</p>
        <Link to="/" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8 max-w-3xl">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">{page.title}</h1>
        <div className="space-y-5">
          {page.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">{section.heading}</h2>
              )}
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
