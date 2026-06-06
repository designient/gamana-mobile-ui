import type { StoryRelatedLink, RelationshipType } from '../../types';
import DurationBadge from '../shared/DurationBadge';

interface RelatedSectionProps {
  related: StoryRelatedLink[];
  onNavigateToStory: (storyId: string) => void;
}

const relationshipStyles: Record<RelationshipType, { label: string; cls: string }> = {
  nearby: { label: 'Nearby', cls: 'bg-trust-verified/10 text-trust-verified' },
  same_era: { label: 'Same era', cls: 'bg-trust-legend/10 text-trust-legend' },
  same_theme: { label: 'Same theme', cls: 'bg-gamana-100 text-gamana-700' },
  same_route: { label: 'Same route', cls: 'bg-safe-info/10 text-safe-info' },
};

export default function RelatedSection({ related, onNavigateToStory }: RelatedSectionProps) {
  if (related.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-heading mb-3 px-5">Go Deeper</h3>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1 snap-x snap-mandatory">
        {related.map((item) => {
          const style = relationshipStyles[item.relationship];
          return (
            <button
              key={item.id}
              onClick={() => onNavigateToStory(item.related_story_id)}
              className="flex-shrink-0 w-[152px] bg-surface rounded-2xl shadow-card overflow-hidden text-left transition-all hover:shadow-elevated active:scale-[0.97] snap-start"
            >
              <div className="h-24 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gamana-50 to-gamana-100" />
                )}
              </div>
              <div className="p-3">
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mb-1.5 ${style.cls}`}>
                  {style.label}
                </span>
                <h4 className="text-xs font-medium text-heading line-clamp-2 leading-snug mb-1.5">
                  {item.title}
                </h4>
                <DurationBadge seconds={item.duration_seconds} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
