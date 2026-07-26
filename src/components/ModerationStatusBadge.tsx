import type { ModerationStatus } from '../types';

const MODERATION_BADGE_CLASSES: Record<ModerationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

interface Props {
  status: ModerationStatus;
  note?: string;
  compact?: boolean;
}

export default function ModerationStatusBadge({ status, note, compact }: Props) {
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span
        className={`inline-block font-medium rounded-full ${
          compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
        } ${MODERATION_BADGE_CLASSES[status]}`}
      >
        {status === 'pending' && 'Menunggu Review'}
        {status === 'approved' && 'Disetujui'}
        {status === 'rejected' && 'Ditolak'}
      </span>
      {status === 'rejected' && note && (
        <span className="text-[10px] text-red-600 leading-snug max-w-xs">{note}</span>
      )}
    </span>
  );
}
