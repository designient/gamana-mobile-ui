import { AlertTriangle, Backpack, Info } from 'lucide-react';

interface ExperienceKnowBeforeYouGoBlockProps {
  knowBeforeYouGo?: string;
  importantInformation?: string;
  whatToBring?: string[];
}

function parseKnowBeforeYouGo(text: string): string[] {
  return text
    .split(/[;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ExperienceKnowBeforeYouGoBlock({
  knowBeforeYouGo,
  importantInformation,
  whatToBring = [],
}: ExperienceKnowBeforeYouGoBlockProps) {
  const kbygItems = knowBeforeYouGo ? parseKnowBeforeYouGo(knowBeforeYouGo) : [];
  const hasContent = kbygItems.length > 0 || !!importantInformation || whatToBring.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-4">
      {kbygItems.length > 0 && (
        <div className="bg-gamana-500/5 border border-gamana-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-heading mb-2 flex items-center gap-2">
            <Info size={16} className="text-gamana-500" />
            Know before you go
          </h3>
          <ul className="space-y-1.5">
            {kbygItems.map((item) => (
              <li key={item} className="text-xs text-muted leading-relaxed flex gap-2">
                <span className="text-gamana-500 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {importantInformation && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            Important information
          </h3>
          <p className="text-xs text-amber-900/80 leading-relaxed">{importantInformation}</p>
        </div>
      )}

      {whatToBring.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-heading mb-2 flex items-center gap-2">
            <Backpack size={16} className="text-gamana-500" />
            What to bring
          </h3>
          <ul className="space-y-1.5">
            {whatToBring.map((item) => (
              <li key={item} className="text-xs text-muted leading-relaxed flex gap-2">
                <span className="text-gamana-500 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
