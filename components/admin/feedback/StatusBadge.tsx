
export type BadgeStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface StatusBadgeProps {
  status: string;
  type?: BadgeStatus;
}

const statusStyles: Record<BadgeStatus, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
  neutral: 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10',
};

export function StatusBadge({ status, type = 'neutral' }: StatusBadgeProps) {
  const styles = statusStyles[type];
  const isAlertStatus = type === 'warning' || type === 'danger';
  const dotColor = type === 'warning' ? 'bg-amber-500' : 'bg-red-500';

  return (
    <span className={`inline-flex items-center gap-1.5 px-[10px] h-6 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap ${styles}`}>
      {isAlertStatus && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}></span>
        </span>
      )}
      {status}
    </span>
  );
}
