import type { BatteryMode } from '../../lib/localDb';

const OPTIONS: { value: BatteryMode; label: string; hint: string }[] = [
  { value: 'high_accuracy', label: 'High Accuracy', hint: 'Best for tours' },
  { value: 'balanced', label: 'Balanced', hint: 'Recommended' },
  { value: 'battery_saver', label: 'Battery Saver', hint: 'Minimal GPS' },
];

interface BatteryModeSelectorProps {
  value: BatteryMode;
  onChange: (mode: BatteryMode) => void;
  disabled?: boolean;
}

export default function BatteryModeSelector({ value, onChange, disabled }: BatteryModeSelectorProps) {
  return (
    <div
      className={`flex rounded-xl bg-surface-muted p-1 gap-1 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
              active
                ? 'bg-surface shadow-sm'
                : 'hover:bg-surface-alt'
            }`}
          >
            <span
              className={`text-[11px] font-semibold leading-tight ${
                active ? 'text-body' : 'text-secondary'
              }`}
            >
              {opt.label}
            </span>
            <span
              className={`text-[9px] leading-tight mt-0.5 ${
                active ? 'text-gamana-500' : 'text-muted'
              }`}
            >
              {opt.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
