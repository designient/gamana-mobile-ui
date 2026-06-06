const SECTIONS = [
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-itinerary', label: 'Itinerary' },
  { id: 'section-includes', label: 'Includes' },
  { id: 'section-reviews', label: 'Reviews' },
  { id: 'section-availability', label: 'Dates' },
] as const;

interface ExperienceSectionNavProps {
  visibleIds: string[];
}

export default function ExperienceSectionNav({ visibleIds }: ExperienceSectionNavProps) {
  const tabs = SECTIONS.filter((s) => visibleIds.includes(s.id));
  if (tabs.length < 2) return null;

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="sticky top-0 z-10 bg-canvas/96 backdrop-blur-md border-b border-gamana-100/80">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 py-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollTo(tab.id)}
            className="flex-none px-3.5 py-1.5 rounded-full text-xs font-semibold text-gamana-600 border border-gamana-200/80 bg-surface hover:bg-gamana-500/8 transition-colors"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
