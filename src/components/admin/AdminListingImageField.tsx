import { Loader2 } from 'lucide-react';
import ListingImageUploadField from '../ListingImageUploadField';
import { useUploaderId } from '../../hooks/useUploaderId';
import { FormField, TextInput } from './AdminFormModal';

interface Props {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  isEdit: boolean;
}

export default function AdminListingImageField({
  label = 'Gambar',
  value,
  onChange,
  isEdit,
}: Props) {
  const { uploaderId, loading } = useUploaderId();

  if (isEdit) {
    return (
      <FormField label="URL Gambar">
        <TextInput value={value} onChange={onChange} type="url" placeholder="https://..." />
      </FormField>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat...
      </div>
    );
  }

  if (!uploaderId) {
    return <p className="text-sm text-red-600">Sesi tidak valid. Muat ulang halaman.</p>;
  }

  return (
    <ListingImageUploadField
      label={label}
      value={value}
      onChange={onChange}
      uploaderId={uploaderId}
    />
  );
}
