interface ExperienceHighlightsProps {
  highlights: string[];
}

export default function ExperienceHighlights({ highlights }: ExperienceHighlightsProps) {
  if (!highlights.length) return null;

  return (
    <ul className="space-y-2.5">
      {highlights.map((h) => (
        <li key={h} className="flex gap-2.5 text-sm text-heading leading-relaxed">
          <span className="text-gamana-500 font-bold flex-shrink-0">•</span>
          <span>{h}</span>
        </li>
      ))}
    </ul>
  );
}
