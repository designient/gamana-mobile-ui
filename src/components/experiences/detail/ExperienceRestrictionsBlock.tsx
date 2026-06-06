import { AlertTriangle, Backpack } from 'lucide-react';

interface ExperienceRestrictionsBlockProps {
  notSuitableFor?: string[];
  whatToBring?: string[];
}

export default function ExperienceRestrictionsBlock({
  notSuitableFor = [],
  whatToBring = [],
}: ExperienceRestrictionsBlockProps) {
  if (!notSuitableFor.length && !whatToBring.length) return null;

  return (
    <div className="space-y-5">
      {notSuitableFor.length > 0 && (
        <div className="px-4 py-5 border-b border-gamana-100/70">
          <h2 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            Not suitable for
          </h2>
          <ul className="space-y-1.5">
            {notSuitableFor.map((item) => (
              <li key={item} className="text-sm text-muted leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {whatToBring.length > 0 && (
        <div className="px-4 py-5 border-b border-gamana-100/70">
          <h2 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
            <Backpack size={16} className="text-gamana-500" />
            What to bring
          </h2>
          <ul className="space-y-1.5">
            {whatToBring.map((item) => (
              <li key={item} className="text-sm text-muted leading-relaxed flex gap-2">
                <span className="text-gamana-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
