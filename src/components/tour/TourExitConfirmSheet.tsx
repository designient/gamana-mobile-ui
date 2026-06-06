import { useState } from 'react';
import { X, Pause, BookmarkCheck } from 'lucide-react';

interface TourExitConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExitTour: () => void;
  stopsCompleted: number;
  totalStops: number;
}

export default function TourExitConfirmSheet({
  isOpen,
  onClose,
  onExitTour,
  stopsCompleted,
  totalStops,
}: TourExitConfirmSheetProps) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const animState = isClosing ? 'closing' : 'open';

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleExit = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onExitTour();
    }, 200);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          animState === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out ${
          animState === 'closing' ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-surface-muted" />
        </div>

        <div className="px-5 pt-4 pb-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Pause size={24} className="text-amber-500" />
          </div>

          <h3 className="text-lg font-semibold text-heading text-center">Leave this tour?</h3>
          <p className="text-sm text-secondary text-center mt-2 leading-relaxed">
            Your progress is saved. You can resume this tour anytime from where you left off.
          </p>

          {/* Progress info */}
          <div className="flex items-center gap-2 justify-center mt-4 p-3 rounded-xl bg-canvas">
            <BookmarkCheck size={14} className="text-gamana-500" />
            <span className="text-xs font-medium text-body">
              {stopsCompleted} of {totalStops} stops completed
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 mt-6">
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] shadow-md shadow-gamana-500/20"
            >
              Continue Walking
            </button>
            <button
              onClick={handleExit}
              className="w-full py-3.5 rounded-2xl bg-surface-muted text-secondary font-semibold text-sm transition-all hover:bg-surface-muted active:scale-[0.98]"
            >
              Exit Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
