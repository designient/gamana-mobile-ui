import { ArrowLeft } from 'lucide-react';
import { useWishlistedExperiences } from '../../hooks/useWishlistedExperiences';
import ExperienceBookCard from '../experiences/ExperienceBookCard';
import StatusBar from '../layout/StatusBar';

interface WishlistScreenProps {
  onBack: () => void;
  onOpenExperience: (slug: string) => void;
  onBookExperience: (slug: string) => void;
  onExplore: () => void;
}

export default function WishlistScreen({
  onBack,
  onOpenExperience,
  onBookExperience,
  onExplore,
}: WishlistScreenProps) {
  const { items, isLoading } = useWishlistedExperiences();

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gamana-500/10">
          <ArrowLeft size={20} className="text-heading" />
        </button>
        <h1 className="text-base font-semibold text-heading">Wishlist</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm text-muted leading-relaxed mb-4">
              No saved experiences yet. Tap the heart on any tour or activity to add it here.
            </p>
            <button
              type="button"
              onClick={onExplore}
              className="px-5 py-2.5 rounded-xl bg-gamana-500 text-white text-sm font-semibold"
            >
              Explore experiences
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <ExperienceBookCard
                key={item.id}
                item={item}
                layout="feed"
                onOpen={() => onOpenExperience(item.slug)}
                onBook={() => onBookExperience(item.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
