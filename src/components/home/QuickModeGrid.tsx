import type { QuickMode } from '../../types';
import { QUICK_MODES } from '../../lib/constants';
import QuickModeIcon from './QuickModeIcon';

interface QuickModeGridProps {
  activeMode: QuickMode | null;
  onModeSelect: (mode: QuickMode | null) => void;
}

export default function QuickModeGrid({ activeMode, onModeSelect }: QuickModeGridProps) {
  return (
    <div className="px-4 mt-5">
      <h3 className="text-sm font-semibold text-heading mb-3 px-1">Explore Your City</h3>
      <div className="grid grid-cols-3 gap-2.5">
        {QUICK_MODES.map(({ mode, label, icon }) => (
          <QuickModeIcon
            key={mode}
            mode={mode}
            label={label}
            iconName={icon}
            isActive={activeMode === mode}
            onTap={() => onModeSelect(activeMode === mode ? null : mode)}
          />
        ))}
      </div>
    </div>
  );
}
