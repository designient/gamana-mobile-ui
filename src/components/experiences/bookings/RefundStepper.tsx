import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Circle, Clock } from 'lucide-react';
import { addDays } from '../../../lib/experience-cancellation';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';

const OPERATOR_PHONE = '+91 98765 43210';

export interface RefundStepperProps {
  refundAmount: number;
  cancelledAt: string;
  operatorName: string;
  referenceCode?: string;
  defaultExpanded?: boolean;
}

export default function RefundStepper({
  refundAmount,
  cancelledAt,
  operatorName,
  referenceCode,
  defaultExpanded = false,
}: RefundStepperProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const cancelledDate = formatDisplayDate(cancelledAt.slice(0, 10));
  const expectedBy = formatDisplayDate(addDays(cancelledAt.slice(0, 10), 10));

  const steps = [
    { label: 'Cancellation Confirmed', date: cancelledDate, status: 'done' as const },
    { label: 'Refund Initiated', date: cancelledDate, status: 'done' as const },
    { label: 'Processing with Bank', date: null, status: 'active' as const },
    { label: 'Refund Received', date: null, status: 'pending' as const },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-3.5 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading">
            Refund of ₹{refundAmount.toLocaleString('en-IN')} · Processing
          </p>
          <p className="text-xs text-muted mt-0.5">Expected by {expectedBy}</p>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-muted flex-shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-muted flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3.5 pb-4 border-t border-slate-200 pt-4 space-y-4">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon status={step.status} />
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 min-h-[32px] ${
                        step.status === 'done' ? 'bg-green-300' : 'bg-gamana-100'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        step.status === 'done'
                          ? 'text-green-700'
                          : step.status === 'active'
                            ? 'text-amber-700'
                            : 'text-muted'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.status === 'active' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  {step.date && <p className="text-xs text-muted mt-0.5">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl border border-gamana-100 bg-surface">
            <p className="text-sm font-semibold text-heading">Need help?</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Contact {operatorName} if your refund hasn&apos;t arrived by {expectedBy}.
            </p>
            <a
              href={`tel:${OPERATOR_PHONE.replace(/\s/g, '')}`}
              className="text-sm font-semibold text-gamana-600 mt-2 block"
            >
              {OPERATOR_PHONE}
            </a>
            {referenceCode && (
              <p className="text-[11px] text-muted mt-1">{referenceCode}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepIcon({ status }: { status: 'done' | 'active' | 'pending' }) {
  if (status === 'done') {
    return (
      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <Check size={14} className="text-green-600" />
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Clock size={14} className="text-amber-600" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
      <Circle size={14} className="text-slate-400" />
    </div>
  );
}
