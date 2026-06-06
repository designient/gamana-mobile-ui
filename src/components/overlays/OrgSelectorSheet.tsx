import { useState, useCallback, useEffect } from 'react';
import { X, Building2, Check, AlertCircle } from 'lucide-react';
import type { OrgMembership } from '../../types';

interface OrgSelectorSheetProps {
  memberships: OrgMembership[];
  selectedOrgId: string | null;
  isOpen: boolean;
  onSelect: (orgId: string) => void;
  onClose: () => void;
}

export default function OrgSelectorSheet({ memberships, selectedOrgId, isOpen, onSelect, onClose }: OrgSelectorSheetProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) console.info('org_selector_shown', { org_count: memberships.length });
  }, [isOpen, memberships.length]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 200);
  }, [onClose]);

  const handleSelect = useCallback((orgId: string) => { onSelect(orgId); handleClose(); }, [onSelect, handleClose]);

  if (!isOpen) return null;
  const activeOrgs = memberships.filter((m) => m.status === 'active');
  const inactiveOrgs = memberships.filter((m) => m.status !== 'active');

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className={`absolute inset-0 bg-black/40 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose} />
      <div className={`relative bg-surface rounded-t-2xl max-h-[80%] flex flex-col ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-heading">Choose organization</h2>
            <p className="text-xs text-muted mt-0.5">Select which organization to use</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-surface-muted transition-colors"><X size={18} className="text-muted" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {activeOrgs.map((org) => (
            <button key={org.orgId} onClick={() => handleSelect(org.orgId)} className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all mb-2 ${selectedOrgId === org.orgId ? 'border-gamana-300 bg-gamana-50 dark:bg-gamana-900/20' : 'border-border-default hover:border-border-default hover:bg-surface-alt'}`}>
              <div className="w-10 h-10 rounded-full bg-gamana-100 flex items-center justify-center flex-shrink-0">
                {org.orgLogo ? <img src={org.orgLogo} alt="" className="w-6 h-6 rounded-full object-cover" /> : <Building2 size={18} className="text-gamana-500" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-heading">{org.orgName}</p>
                <p className="text-xs text-muted">Active</p>
              </div>
              {selectedOrgId === org.orgId && <Check size={18} className="text-gamana-500" />}
            </button>
          ))}
          {inactiveOrgs.map((org) => (
            <div key={org.orgId} className="flex items-center gap-3 p-4 rounded-xl border border-border-default opacity-50 mb-2">
              <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-muted" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary">{org.orgName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <AlertCircle size={10} className="text-amber-500" />
                  <p className="text-xs text-amber-600">{org.status === 'expired' ? 'Expired' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          ))}
          <button onClick={handleClose} className="w-full mt-2 py-3 rounded-xl border border-border-default text-sm text-secondary font-medium hover:bg-surface-alt transition-colors">Continue without organization</button>
        </div>
      </div>
    </div>
  );
}
