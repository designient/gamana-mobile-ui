import { Check, X } from 'lucide-react';

interface ExperienceInclusionsBlockProps {
  inclusions: string[];
  exclusions: string[];
}

export default function ExperienceInclusionsBlock({
  inclusions,
  exclusions,
}: ExperienceInclusionsBlockProps) {
  if (!inclusions.length && !exclusions.length) return null;

  return (
    <div className="space-y-5">
      {inclusions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-emerald-700 mb-2">Includes</h3>
          <ul className="space-y-2">
            {inclusions.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-heading leading-snug">
                <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {exclusions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted mb-2">Not included</h3>
          <ul className="space-y-2">
            {exclusions.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted leading-snug">
                <X size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
