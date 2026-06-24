import type { HomeAlert } from '../../lib/home-alerts';

interface HomeAlertCardProps {
  alert: HomeAlert;
  onOpenAlerts: () => void;
}

export default function HomeAlertCard({ alert, onOpenAlerts }: HomeAlertCardProps) {
  return (
    <div className="px-4 pt-3">
      <button
        type="button"
        onClick={onOpenAlerts}
        className="w-full rounded-2xl border border-[#E7C979] bg-[#F9F4E5] p-3 flex items-center gap-3 text-left"
      >
        {alert.imageUrl ? (
          <img
            src={alert.imageUrl}
            alt={alert.title}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gamana-100 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <span className="inline-flex px-2 py-0.5 rounded-full bg-[#E4C35E] text-[10px] font-bold text-[#6B5606] uppercase tracking-wide">
            Tomorrow
          </span>
          <p className="text-[22px] leading-tight font-bold text-heading mt-1 line-clamp-1">
            {alert.title}
          </p>
          <p className="text-sm text-muted mt-0.5">{alert.subtitle}</p>
          <p className="text-sm text-[#CC6C1D] font-semibold mt-1.5">{alert.statusText}</p>
        </div>
      </button>
    </div>
  );
}

