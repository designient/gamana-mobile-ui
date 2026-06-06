import { MapPin, Route, Layers, Download, type LucideIcon } from 'lucide-react';
import type { LibraryTab } from '../../types';

const EMPTY_CONFIG: Record<LibraryTab, { icon: LucideIcon; title: string; body: string; action: string }> = {
  nearby: {
    icon: MapPin,
    title: 'No stories nearby',
    body: 'Move closer to a point of interest, or explore tours to discover stories further away.',
    action: 'Browse Tours',
  },
  tours: {
    icon: Route,
    title: 'No tours available yet',
    body: 'Create your own tour or check back later for curated guided walks and themed routes.',
    action: 'Explore Nearby',
  },
  topics: {
    icon: Layers,
    title: 'Topics coming soon',
    body: 'Deep dives into local themes, history, and culture are being crafted for this city.',
    action: 'Explore Nearby',
  },
  downloads: {
    icon: Download,
    title: 'No downloads yet',
    body: 'Download stories for offline listening. They will appear here.',
    action: 'Browse Stories',
  },
};

interface LibraryEmptyStateProps {
  tab: LibraryTab;
  onAction: () => void;
}

export default function LibraryEmptyState({ tab, onAction }: LibraryEmptyStateProps) {
  const config = EMPTY_CONFIG[tab];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center mb-4">
        <Icon size={24} className="text-gamana-400" />
      </div>
      <h3 className="text-sm font-semibold text-heading mb-1.5">{config.title}</h3>
      <p className="text-xs text-muted leading-relaxed max-w-[240px] mb-5">{config.body}</p>
      <button
        onClick={onAction}
        className="px-5 py-2.5 text-xs font-medium text-white bg-gamana-500 rounded-xl hover:bg-gamana-600 transition-colors active:scale-[0.97]"
      >
        {config.action}
      </button>
    </div>
  );
}
