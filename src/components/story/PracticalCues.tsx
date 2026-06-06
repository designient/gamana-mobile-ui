import { useState } from 'react';
import { Heart, ShieldAlert, Globe, ChevronDown } from 'lucide-react';
import type { StoryPracticalCue, CueType } from '../../types';

interface PracticalCuesProps {
  cues: StoryPracticalCue[];
}

const cueConfig: Record<CueType, { label: string; icon: typeof Heart; bg: string; iconCls: string }> = {
  respect: { label: 'Respect', icon: Heart, bg: 'bg-rose-50 dark:bg-rose-900/20', iconCls: 'text-rose-400' },
  stay_safe: { label: 'Stay Safe', icon: ShieldAlert, bg: 'bg-amber-50 dark:bg-amber-900/20', iconCls: 'text-amber-500' },
  languages: { label: 'Language Tips', icon: Globe, bg: 'bg-sky-50 dark:bg-sky-900/20', iconCls: 'text-sky-500' },
};

export default function PracticalCues({ cues }: PracticalCuesProps) {
  if (cues.length === 0) return null;

  const grouped = cues.reduce<Record<CueType, StoryPracticalCue[]>>((acc, cue) => {
    if (!acc[cue.cue_type]) acc[cue.cue_type] = [];
    acc[cue.cue_type].push(cue);
    return acc;
  }, {} as Record<CueType, StoryPracticalCue[]>);

  const types = (Object.keys(cueConfig) as CueType[]).filter((t) => grouped[t]?.length > 0);
  if (types.length === 0) return null;

  return (
    <div className="mx-4 mt-5">
      <h3 className="text-sm font-semibold text-heading mb-3 px-1">Before You Visit</h3>
      <div className="space-y-3">
        {types.map((type) => (
          <CueGroup key={type} type={type} cues={grouped[type]} />
        ))}
      </div>
    </div>
  );
}

function CueGroup({ type, cues }: { type: CueType; cues: StoryPracticalCue[] }) {
  const [expanded, setExpanded] = useState(false);
  const config = cueConfig[type];
  const Icon = config.icon;
  const showToggle = cues.length > 2;
  const visible = expanded ? cues : cues.slice(0, 2);

  return (
    <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2.5 ${config.bg}`}>
        <Icon size={14} className={config.iconCls} />
        <span className="text-xs font-semibold text-heading">{config.label}</span>
      </div>
      <div className="p-4 space-y-3">
        {visible.map((cue) => (
          <div key={cue.id} className="flex items-start gap-2.5">
            <Icon size={12} className={`${config.iconCls} mt-0.5 flex-shrink-0 opacity-50`} />
            <div>
              <span className="text-xs font-medium text-heading">{cue.title}</span>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed">{cue.body}</p>
            </div>
          </div>
        ))}
        {showToggle && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gamana-500 font-medium hover:text-gamana-600 transition-colors"
          >
            {expanded ? 'Show less' : `Show ${cues.length - 2} more`}
            <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
