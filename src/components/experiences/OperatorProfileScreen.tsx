import { useMemo } from 'react';
import { ArrowLeft, Star, BadgeCheck, ChevronRight } from 'lucide-react';
import { experienceSeedData } from '../../lib/experience-seed-data';
import { toListItemView } from '../../lib/experience-mappers';
import StatusBar from '../layout/StatusBar';
import ExperienceCard from './ExperienceCard';

const DUMMY_OPERATORS: Record<
  string,
  { name: string; city: string; bio: string; rating: number }
> = {
  'vendor-karnataka-heritage': {
    name: 'Karnataka Heritage Walks',
    city: 'Bengaluru',
    bio: 'Curating heritage walks across Karnataka since 2015. Licensed guides, small groups, culturally grounded.',
    rating: 4.8,
  },
  'vendor-blr-food': {
    name: 'Bengaluru Food Trails',
    city: 'Bengaluru',
    bio: 'Street food, café culture, and market bites with hygiene-conscious, story-first guides.',
    rating: 4.9,
  },
  'vendor-blr-nature': {
    name: 'Urban Nature Bengaluru',
    city: 'Bengaluru',
    bio: 'Naturalist-led birding and park walks.',
    rating: 4.6,
  },
  'vendor-blr-spiritual': {
    name: 'Spiritual Bengaluru',
    city: 'Bengaluru',
    bio: 'Temple visits and devotional experiences led by practising cultural hosts.',
    rating: 4.7,
  },
};

const AVATAR_COLORS = [
  'bg-gamana-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function avatarColor(vendorId: string): string {
  let hash = 0;
  for (let i = 0; i < vendorId.length; i += 1) {
    hash = vendorId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface OperatorProfileScreenProps {
  vendorId: string;
  operatorName: string;
  onBack: () => void;
  onOpenExperience: (slug: string) => void;
  onBrowseAll: () => void;
}

export default function OperatorProfileScreen({
  vendorId,
  operatorName,
  onBack,
  onOpenExperience,
  onBrowseAll,
}: OperatorProfileScreenProps) {
  const operator = DUMMY_OPERATORS[vendorId] ?? {
    name: operatorName,
    city: 'Bengaluru',
    bio: 'Curated local experiences with verified guides and hosts.',
    rating: 4.5,
  };

  const experiences = useMemo(() => {
    return experienceSeedData
      .filter(
        (exp) =>
          exp.sourceVendorId === vendorId &&
          exp.publicationStatus === 'published' &&
          exp.bookableInApp,
      )
      .map(toListItemView);
  }, [vendorId]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading truncate">Operator</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-8">
        <div className="px-4 pt-6 pb-5 text-center">
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold ${avatarColor(vendorId)}`}
          >
            {getInitials(operator.name)}
          </div>
          <h2 className="text-lg font-bold text-heading mt-4">{operator.name}</h2>
          <p className="text-sm text-muted mt-0.5">{operator.city}</p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <BadgeCheck size={14} className="text-emerald-600" />
            <span className="text-[11px] font-semibold text-emerald-700">Verified by Gamana</span>
          </div>

          <div className="flex items-center justify-center gap-1 mt-3">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-semibold text-heading">{operator.rating.toFixed(1)}</span>
          </div>

          <p className="text-sm text-muted leading-relaxed mt-4 max-w-sm mx-auto">{operator.bio}</p>
        </div>

        <div className="px-4">
          <h3 className="text-sm font-semibold text-heading mb-3">Experiences by this operator</h3>

          {experiences.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-gamana-100 bg-surface">
              <p className="text-sm text-muted">No published experiences from this operator yet.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x snap-mandatory">
              {experiences.map((item) => (
                <ExperienceCard
                  key={item.id}
                  item={item}
                  variant="horizontal"
                  onClick={() => onOpenExperience(item.slug)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 mt-6">
          <button
            type="button"
            onClick={onBrowseAll}
            className="w-full flex items-center justify-center gap-1 py-3.5 rounded-xl border border-gamana-200 text-gamana-600 font-semibold text-sm"
          >
            Browse all experiences
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
