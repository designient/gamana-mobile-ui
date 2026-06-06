import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ExperienceOnRequestBadgeProps {
  deadline?: string;
  className?: string;
}

export default function ExperienceOnRequestBadge({
  deadline = 'Operator confirms within 24h',
  className = '',
}: ExperienceOnRequestBadgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className={`mx-4 mb-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gamana-200 bg-gamana-500/5 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      <Clock size={16} className="text-gamana-500 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-heading">On Request</p>
        <p className="text-[11px] text-muted mt-0.5">{deadline}</p>
      </div>
    </div>
  );
}
