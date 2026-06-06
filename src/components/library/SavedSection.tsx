import { Bookmark, Trash2 } from 'lucide-react';
import type { SavedItem } from '../../types';
import DurationBadge from '../shared/DurationBadge';
import TrustChip from '../shared/TrustChip';
import LibraryEmptyState from './LibraryEmptyState';

interface SavedSectionProps {
  items: SavedItem[];
  isLoading: boolean;
  onTapItem: (item: SavedItem) => void;
  onRemove: (itemId: string) => void;
  onEmptyAction: () => void;
}

export default function SavedSection({ items, isLoading, onTapItem, onRemove, onEmptyAction }: SavedSectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
        <p className="text-sm text-muted mt-3">Loading saved items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return <LibraryEmptyState tab="saved" onAction={onEmptyAction} />;
  }

  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Bookmark size={14} className="text-gamana-500" />
        <span className="text-xs font-medium text-gamana-600">
          {items.length} saved {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.map((item) => {
        const story = item.story;
        if (!story) {
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-surface rounded-2xl shadow-card">
              <div className="w-12 h-12 rounded-xl bg-gamana-100 flex items-center justify-center flex-shrink-0">
                <Bookmark size={18} className="text-gamana-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-muted">Saved item</span>
              </div>
              <RemoveButton onRemove={() => onRemove(item.id)} />
            </div>
          );
        }

        return (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-surface rounded-2xl shadow-card">
            <button
              onClick={() => onTapItem(item)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                {story.image_url ? (
                  <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gamana-100" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-heading truncate">{story.title}</h4>
                <p className="text-xs text-muted truncate mb-1">{story.subtitle}</p>
                <div className="flex items-center gap-2">
                  <DurationBadge seconds={story.duration_seconds} />
                  <TrustChip level={story.trust_level} />
                </div>
              </div>
            </button>
            <RemoveButton onRemove={() => onRemove(item.id)} />
          </div>
        );
      })}
    </div>
  );
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-faint hover:text-safe-danger hover:bg-red-50 transition-colors active:scale-95"
    >
      <Trash2 size={15} />
    </button>
  );
}
