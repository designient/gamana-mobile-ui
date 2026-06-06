import { ChevronRight } from 'lucide-react';
import { useRecommendedExperiences } from '../../hooks/useExperiences';
import ExperienceBookCard from './ExperienceBookCard';

interface ExperiencesToBookSectionProps {
  city?: string;
  onSeeAll: () => void;
  onOpenExperience: (slug: string) => void;
}

export default function ExperiencesToBookSection({
  city = 'Bengaluru',
  onSeeAll,
  onOpenExperience,
}: ExperiencesToBookSectionProps) {
  const { items, isLoading } = useRecommendedExperiences(city, 6);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="mt-5 mb-2">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-sm font-semibold text-heading">Experiences To Book</h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-gamana-500"
        >
          See all
          <ChevronRight size={14} />
        </button>
      </div>
      {isLoading ? (
        <div className="flex gap-4 px-4 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="flex-none w-[280px] h-64 rounded-2xl bg-gamana-500/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x snap-mandatory">
          <div className="flex-none w-4" aria-hidden />
          {items.map((item) => (
            <ExperienceBookCard
              key={item.id}
              item={item}
              onOpen={() => onOpenExperience(item.slug)}
              onBook={() => onOpenExperience(item.slug)}
            />
          ))}
          <div className="flex-none w-4" aria-hidden />
        </div>
      )}
    </div>
  );
}
