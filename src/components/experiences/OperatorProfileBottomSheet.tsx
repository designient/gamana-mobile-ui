import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Star, BadgeCheck, ChevronRight } from 'lucide-react';
import { experienceSeedData } from '../../lib/experience-seed-data';
import { toListItemView } from '../../lib/experience-mappers';
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

export interface OperatorProfileBottomSheetProps {
  isOpen: boolean;
  vendorId: string;
  operatorName: string;
  onClose: () => void;
  onOpenExperience: (slug: string) => void;
  onBrowseAll?: () => void;
}

export default function OperatorProfileBottomSheet({
  isOpen,
  vendorId,
  operatorName,
  onClose,
  onOpenExperience,
  onBrowseAll,
}: OperatorProfileBottomSheetProps) {
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

  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setDragY(0);
    }
  }, [isOpen]);

  function handleDragStart(clientY: number) {
    isDragging.current = true;
    dragStartY.current = clientY;
  }

  function handleDragMove(clientY: number) {
    if (!isDragging.current) return;
    setDragY(Math.max(0, clientY - dragStartY.current));
  }

  function handleDragEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragY > 100) handleClose();
    else setDragY(0);
  }

  if (!isOpen && !isClosing) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={dragY > 0 && !isClosing ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        <div
          className="flex justify-center pt-3 pb-1 touch-none"
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => isDragging.current && handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
        >
          <div className="w-10 h-1 rounded-full bg-gamana-200" />
        </div>

        <div className="flex items-center justify-between px-5 pb-2">
          <h2 className="text-base font-semibold text-heading">Operator</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gamana-500/10"
            aria-label="Close"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-8">
          <div className="px-5 pt-2 pb-5 text-center">
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

          <div className="px-5">
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
                    onClick={() => {
                      handleClose();
                      onOpenExperience(item.slug);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {onBrowseAll && (
            <div className="px-5 mt-6">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onBrowseAll();
                }}
                className="w-full flex items-center justify-center gap-1 py-3.5 rounded-xl border border-gamana-200 text-gamana-600 font-semibold text-sm"
              >
                Browse all experiences
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
