import { Users, ShieldAlert, ChevronRight } from 'lucide-react';
import { getFamilyGroups } from '../../lib/familyDb';

interface FamilySafetyCardProps {
  onNavigateToFamilyTracking: () => void;
  onOpenSOS: () => void;
}

export default function FamilySafetyCard({ onNavigateToFamilyTracking, onOpenSOS }: FamilySafetyCardProps) {
  const groups = getFamilyGroups();
  const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);
  const sharingCount = groups.reduce(
    (sum, g) => sum + g.members.filter((m) => m.visibility === 'visible' && m.location).length,
    0,
  );
  const hasGroups = groups.length > 0;

  return (
    <div className="px-4 mt-5">
      <h3 className="text-sm font-semibold text-heading mb-3 px-1">Family & Safety</h3>
      <div className="flex gap-2.5">
        <button
          onClick={onNavigateToFamilyTracking}
          className="flex-1 flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-border-default shadow-card hover:border-gamana-100 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-gamana-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-heading truncate">Family Tracking</p>
            <p className="text-[11px] text-muted truncate mt-0.5">
              {hasGroups
                ? `${totalMembers} members${sharingCount > 0 ? ` \u00b7 ${sharingCount} sharing` : ''}`
                : 'Set up family safety'}
            </p>
          </div>
          <ChevronRight size={16} className="text-faint flex-shrink-0" />
        </button>

        <button
          onClick={onOpenSOS}
          className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 hover:bg-red-100 transition-all flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-600">SOS</p>
            <p className="text-[10px] text-red-400">Emergency</p>
          </div>
        </button>
      </div>
    </div>
  );
}
