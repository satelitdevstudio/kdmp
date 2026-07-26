import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export type AdminAlertType = 'success' | 'error';

interface Props {
  open: boolean;
  type: AdminAlertType;
  title: string;
  message: string;
  onClose: () => void;
}

export default function AdminAlertPopup({ open, type, title, message, onClose }: Props) {
  if (!open) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
        className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          ) : (
            <AlertCircle className="w-7 h-7 text-red-600" />
          )}
        </div>

        <h3 id="alert-title" className="font-bold text-gray-800 text-lg mb-2">
          {title}
        </h3>
        <p id="alert-message" className="text-sm text-gray-500 mb-5">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
            isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
