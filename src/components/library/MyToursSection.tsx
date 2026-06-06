import { Plus, Route, Share2, Calendar, Trash2 } from 'lucide-react';
import type { UserTour } from '../../types';

interface MyToursSectionProps {
  tours: UserTour[];
  isLoading: boolean;
  onCreateTour: () => void;
  onTapTour: (tour: UserTour) => void;
  onDeleteTour: (tourId: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function MyToursSection({
  tours,
  isLoading,
  onCreateTour,
  onTapTour,
  onDeleteTour,
}: MyToursSectionProps) {
  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-body uppercase tracking-wider px-1">
        My Tours
      </h3>

      <button
        onClick={onCreateTour}
        className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gamana-200 hover:border-gamana-400 hover:bg-gamana-50/50 transition-all active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-xl bg-gamana-100 group-hover:bg-gamana-200 flex items-center justify-center transition-colors">
          <Plus size={20} className="text-gamana-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-heading">Create your own tour</p>
          <p className="text-xs text-muted mt-0.5">Add stories and pin locations to plan your walk</p>
        </div>
      </button>

      {isLoading && tours.length === 0 && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
        </div>
      )}

      {tours.map((tour) => (
        <div
          key={tour.id}
          className="group relative bg-surface rounded-2xl shadow-card hover:shadow-elevated transition-all"
        >
          <button
            onClick={() => onTapTour(tour)}
            className="w-full text-left p-4 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
              <Route size={18} className="text-gamana-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-heading truncate">{tour.title}</h4>
                {tour.is_shared && (
                  <Share2 size={12} className="text-gamana-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Route size={10} />
                  {tour.stop_count ?? 0} {(tour.stop_count ?? 0) === 1 ? 'stop' : 'stops'}
                </span>
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(tour.created_at)}
                </span>
              </div>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTour(tour.id);
            }}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
}
