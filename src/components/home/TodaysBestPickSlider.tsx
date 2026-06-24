import { Sparkles, MapPinned, Ticket, Info } from 'lucide-react';
import type { CityPack, Story } from '../../types';
import type { Experience } from '../../types/experience';

interface TodaysBestPickSliderProps {
  story: Story | null;
  tour: CityPack | null;
  experience: Experience | null;
  onOpenStory: (storyId: string) => void;
  onOpenTour: (tourId: string) => void;
  onOpenExperience: (slug: string) => void;
  onOpenIntro: () => void;
}

function Card({
  title,
  subtitle,
  icon: Icon,
  imageUrl,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: typeof Sparkles;
  imageUrl?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-none w-[260px] rounded-2xl overflow-hidden border border-gamana-100 bg-surface shadow-card text-left snap-start"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-28 object-cover" />
      ) : (
        <div className="w-full h-28 bg-gamana-500/10" />
      )}
      <div className="p-3">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gamana-500/10 text-gamana-600 text-[10px] font-semibold">
          <Icon size={12} />
          Today&apos;s Pick
        </div>
        <p className="text-sm font-semibold text-heading mt-2 line-clamp-1">{title}</p>
        <p className="text-xs text-muted mt-1 line-clamp-2">{subtitle}</p>
      </div>
    </button>
  );
}

export default function TodaysBestPickSlider({
  story,
  tour,
  experience,
  onOpenStory,
  onOpenTour,
  onOpenExperience,
  onOpenIntro,
}: TodaysBestPickSliderProps) {
  return (
    <section className="mt-4">
      <div className="px-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-heading">Today&apos;s Best Pick</h3>
      </div>
      <div className="mt-3 flex overflow-x-auto gap-3 px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
        {story && (
          <Card
            title={story.title}
            subtitle={story.subtitle}
            icon={Sparkles}
            imageUrl={story.image_url}
            onClick={() => onOpenStory(story.id)}
          />
        )}
        {tour && (
          <Card
            title={tour.title}
            subtitle={tour.subtitle}
            icon={MapPinned}
            imageUrl={tour.image_url}
            onClick={() => onOpenTour(tour.id)}
          />
        )}
        {experience && (
          <Card
            title={experience.title}
            subtitle={experience.shortDescription}
            icon={Ticket}
            imageUrl={experience.heroImageUrl}
            onClick={() => onOpenExperience(experience.slug)}
          />
        )}
        <button
          type="button"
          onClick={onOpenIntro}
          className="flex-none w-[260px] rounded-2xl border border-gamana-200 bg-gradient-to-br from-gamana-500/10 to-gamana-500/20 p-4 text-left snap-start"
        >
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 text-gamana-700 text-[10px] font-semibold">
            <Info size={12} />
            Intro
          </div>
          <p className="text-lg font-bold text-heading mt-3">Intro to Gamana</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Learn how stories, walking tours and bookable experiences work together.
          </p>
        </button>
      </div>
    </section>
  );
}

