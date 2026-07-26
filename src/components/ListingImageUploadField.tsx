import { useRef, useState } from 'react';
import { Upload, Loader2, X, ImageIcon } from 'lucide-react';
import { uploadListingImage } from '../lib/uploadListingImage';

interface Props {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  uploaderId: string;
}

export default function ListingImageUploadField({
  label = 'Gambar',
  value,
  onChange,
  uploaderId,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    const { url, error } = await uploadListingImage(file, uploaderId);
    setUploading(false);
    if (error) setUploadError(error);
    else if (url) onChange(url);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-xs text-gray-500 mb-2">Unggah gambar (JPG, PNG, WebP, GIF — maks. 2 MB)</p>

      {value ? (
        <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          <img
            src={value}
            alt={label}
            className="w-full max-h-40 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-white/90 border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-300 shadow-sm"
            title="Hapus gambar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50/50 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <ImageIcon className="w-8 h-8" />
          )}
          <span className="text-sm font-medium">{uploading ? 'Mengunggah...' : 'Pilih gambar'}</span>
          {!uploading && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Upload className="w-3.5 h-3.5" />
              Klik untuk unggah
            </span>
          )}
        </button>
      )}

      {value && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex items-center gap-1.5 text-xs text-red-600 hover:underline disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Ganti gambar
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        required={!value}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
    </div>
  );
}
