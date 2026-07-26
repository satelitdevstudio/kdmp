import { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { uploadSiteAsset, type SiteAssetFolder } from '../../lib/uploadSiteAsset';
import { TextInput } from './AdminFormModal';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: SiteAssetFolder;
  placeholder?: string;
  hint?: string;
}

function ImagePreview({ url, label }: { url: string; label: string }) {
  if (!url.trim()) return null;
  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
      <img
        src={url}
        alt={label}
        className="w-full max-h-32 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

export default function ImageUploadField({ label, value, onChange, folder, placeholder, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    const { url, error } = await uploadSiteAsset(file, folder);
    setUploading(false);
    if (error) setUploadError(error);
    else if (url) onChange(url);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}

      <div className="flex gap-2">
        <div className="flex-1">
          <TextInput
            value={value}
            onChange={onChange}
            required={false}
            type="url"
            placeholder={placeholder ?? 'https://...'}
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.ico"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 whitespace-nowrap"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          Unggah
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 border border-gray-300 rounded-lg text-gray-400 hover:text-red-600 hover:border-red-300"
            title="Hapus gambar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
      <ImagePreview url={value} label={label} />
    </div>
  );
}
