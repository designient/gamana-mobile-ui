import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ExperienceTab } from '../../types/experience';
import { getFilterMeta } from '../../lib/experience-mock-api';

export interface ExperienceSheetFilters {
  categories: string[];
  duration: string | null;
  type: 'guided' | 'audio' | 'both';
  languages: string[];
  maxPrice: number | null;
  bookingType: 'instant' | 'on_request' | 'both';
  difficulty: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | null;
}

interface ExperienceFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ExperienceSheetFilters) => void;
  initialFilters?: ExperienceSheetFilters;
  resultCount: number;
  tab: ExperienceTab;
  city: string;
}

const DURATIONS = ['< 1h', '1–3h', 'Half Day', 'Full Day'];

const TYPES: { id: ExperienceSheetFilters['type']; label: string }[] = [
  { id: 'guided', label: 'Guided' },
  { id: 'audio', label: 'Audio' },
  { id: 'both', label: 'Both' },
];

const BOOKING_TYPES: { id: ExperienceSheetFilters['bookingType']; label: string }[] = [
  { id: 'instant', label: 'Instant' },
  { id: 'on_request', label: 'On Request' },
  { id: 'both', label: 'Both' },
];

const TIME_OF_DAY = [
  { id: 'morning' as const, label: 'Morning' },
  { id: 'afternoon' as const, label: 'Afternoon' },
  { id: 'evening' as const, label: 'Evening' },
];

export const DEFAULT_SHEET_FILTERS: ExperienceSheetFilters = {
  categories: [],
  duration: null,
  type: 'both',
  languages: [],
  maxPrice: null,
  bookingType: 'both',
  difficulty: null,
  timeOfDay: null,
};

export function countActiveSheetFilters(filters: ExperienceSheetFilters): number {
  let count = 0;
  if (filters.categories.length > 0) count += filters.categories.length;
  if (filters.duration) count += 1;
  if (filters.type !== 'both') count += 1;
  if (filters.languages.length > 0) count += filters.languages.length;
  if (filters.maxPrice != null) count += 1;
  if (filters.bookingType !== 'both') count += 1;
  if (filters.difficulty) count += 1;
  if (filters.timeOfDay) count += 1;
  return count;
}

function chipClass(active: boolean) {
  return active
    ? 'bg-gamana-500 text-white'
    : 'bg-gamana-500/8 text-gamana-500 border border-gamana-200';
}

export default function ExperienceFilterSheet({
  isOpen,
  onClose,
  onApply,
  initialFilters = DEFAULT_SHEET_FILTERS,
  resultCount,
  tab,
  city,
}: ExperienceFilterSheetProps) {
  const filterMeta = useMemo(() => getFilterMeta(tab, city), [tab, city]);
  const categoryOptions = filterMeta.categories;
  const languageOptions = filterMeta.languages;
  const difficultyOptions = filterMeta.difficulties.filter(
    (difficulty) => difficulty !== 'not_specified',
  );
  const typeOptions: { id: ExperienceSheetFilters['type']; label: string }[] = useMemo(() => {
    const hasAudio = filterMeta.experienceTypes.includes('Self-Guided Audio Tour');
    return hasAudio
      ? TYPES
      : [
          { id: 'guided', label: 'Guided' },
          { id: 'both', label: 'Both' },
        ];
  }, [filterMeta.experienceTypes]);

  const [filters, setFilters] = useState<ExperienceSheetFilters>(initialFilters);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const allowedCategories = new Set(categoryOptions);
    const allowedLanguages = new Set(languageOptions);
    const allowedDifficulties = new Set(
      difficultyOptions.map((difficulty) => difficulty.toLowerCase()),
    );
    const canUseAudio = typeOptions.some((opt) => opt.id === 'audio');
    const nextType =
      !canUseAudio && initialFilters.type === 'audio' ? 'guided' : initialFilters.type;

    const sanitized: ExperienceSheetFilters = {
      ...initialFilters,
      categories: initialFilters.categories.filter((category) =>
        allowedCategories.has(category),
      ),
      languages: initialFilters.languages.filter((language) => allowedLanguages.has(language)),
      difficulty:
        initialFilters.difficulty &&
        allowedDifficulties.has(initialFilters.difficulty.toLowerCase())
          ? initialFilters.difficulty
          : null,
      type: nextType,
    };

    if (isOpen) {
      setFilters(sanitized);
      setIsClosing(false);
      setDragY(0);
    }
  }, [isOpen, initialFilters, categoryOptions, languageOptions, difficultyOptions, typeOptions]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      onClose();
    }, 300);
  }, [onClose]);

  const handleApply = () => {
    onApply(filters);
    handleClose();
  };

  const handleReset = () => {
    setFilters(DEFAULT_SHEET_FILTERS);
  };

  function toggleCategory(category: string) {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }

  function toggleLanguage(language: string) {
    setFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  }

  function handleDragStart(clientY: number) {
    isDragging.current = true;
    dragStartY.current = clientY;
  }

  function handleDragMove(clientY: number) {
    if (!isDragging.current) return;
    const delta = Math.max(0, clientY - dragStartY.current);
    setDragY(delta);
  }

  function handleDragEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragY > 100) {
      handleClose();
    } else {
      setDragY(0);
    }
  }

  if (!isOpen && !isClosing) return null;

  const translateClass = isClosing
    ? 'translate-y-full'
    : dragY > 0
      ? ''
      : 'translate-y-0';

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close filters"
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated max-h-[88%] flex flex-col transition-transform duration-300 ease-out ${translateClass}`}
        style={dragY > 0 && !isClosing ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
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

        <div className="px-5 pb-2">
          <h2 className="text-base font-semibold text-heading">Filters</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 pb-4 space-y-5">
          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${chipClass(
                    filters.categories.includes(category),
                  )}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Duration</h3>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      duration: prev.duration === duration ? null : duration,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${chipClass(
                    filters.duration === duration,
                  )}`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Type</h3>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, type: id }))}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${chipClass(
                    filters.type === id,
                  )}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Language</h3>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleLanguage(language)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${chipClass(
                    filters.languages.includes(language),
                  )}`}
                >
                  {language}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Price Range</h3>
            <div className="px-1">
              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={filters.maxPrice ?? 5000}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: Number(e.target.value) < 5000 ? Number(e.target.value) : null,
                  }))
                }
                className="w-full accent-gamana-500"
              />
              <div className="flex justify-between text-[11px] text-muted mt-1">
                <span>₹0</span>
                <span>
                  {filters.maxPrice != null
                    ? `Up to ₹${filters.maxPrice.toLocaleString('en-IN')}`
                    : 'Up to ₹5,000'}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Booking Type</h3>
            <div className="flex flex-wrap gap-2">
              {BOOKING_TYPES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, bookingType: id }))}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${chipClass(
                    filters.bookingType === id,
                  )}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Time of Day</h3>
            <div className="flex flex-wrap gap-2">
              {TIME_OF_DAY.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      timeOfDay: prev.timeOfDay === id ? null : id,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${chipClass(
                    filters.timeOfDay === id,
                  )}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-heading mb-2">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: prev.difficulty === difficulty ? null : difficulty,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${chipClass(
                    filters.difficulty === difficulty,
                  )}`}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-6 border-t border-gamana-100 bg-surface">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm shadow-sm"
          >
            Show {resultCount} {resultCount === 1 ? 'experience' : 'experiences'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full mt-2 py-2 text-xs font-semibold text-gamana-600"
          >
            Reset all
          </button>
        </div>
      </div>
    </div>
  );
}
