import { Globe, Search, MessageSquarePlus, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onExploreCities: () => void;
  onSearch: () => void;
  onRequestStory: () => void;
}

const actions = [
  { icon: Globe, label: 'Explore cities', description: 'Browse available cities', key: 'explore' },
  { icon: Search, label: 'Search stories', description: 'Find stories by keyword', key: 'search' },
  { icon: MessageSquarePlus, label: 'Request a story', description: "Tell us what you'd like to hear", key: 'request' },
] as const;

export default function EmptyState({ onExploreCities, onSearch, onRequestStory }: EmptyStateProps) {
  const handlers: Record<string, () => void> = {
    explore: onExploreCities,
    search: onSearch,
    request: onRequestStory,
  };

  return (
    <div className="mx-4 mt-3 rounded-3xl bg-surface shadow-card overflow-hidden">
      <div className="px-5 pt-6 pb-5 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center">
          <Globe size={28} className="text-gamana-400" />
        </div>
        <h2 className="text-lg font-semibold text-heading mb-1">Nothing nearby yet</h2>
        <p className="text-sm text-muted leading-relaxed mb-5">
          Explore cities, search stories, or request this location
        </p>
        <div className="flex flex-col gap-2">
          {actions.map(({ icon: Icon, label, description, key }) => (
            <button
              key={key}
              onClick={handlers[key]}
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl bg-canvas text-left transition-colors hover:bg-gamana-50 dark:hover:bg-gamana-900/20 active:scale-[0.97]"
            >
              <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-gamana-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-body">{label}</h4>
                <p className="text-[11px] text-muted">{description}</p>
              </div>
              <ArrowRight size={14} className="text-faint flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
