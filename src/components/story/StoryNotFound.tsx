import { AlertCircle } from 'lucide-react';

interface StoryNotFoundProps {
  onBack: () => void;
}

export default function StoryNotFound({ onBack }: StoryNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <AlertCircle size={48} className="text-faint mb-4" />
      <h2 className="text-base font-semibold text-heading mb-1">Story not found</h2>
      <p className="text-sm text-muted text-center mb-6">
        This story may have been removed or the link is broken.
      </p>
      <button
        onClick={onBack}
        className="px-6 py-2.5 rounded-full bg-gamana-500 text-white text-sm font-medium transition-all hover:bg-gamana-600 active:scale-95"
      >
        Go back
      </button>
    </div>
  );
}
