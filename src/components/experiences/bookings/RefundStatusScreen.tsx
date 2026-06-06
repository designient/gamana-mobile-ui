import { ArrowLeft, Check, Clock, Circle } from 'lucide-react';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import { addDays } from '../../../lib/experience-cancellation';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';

interface RefundStatusScreenProps {
  bookingId: string;
  onBack: () => void;
}

const OPERATOR_PHONE = '+91 98765 43210';

export default function RefundStatusScreen({ bookingId, onBack }: RefundStatusScreenProps) {
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);

  if (!booking || booking.status !== 'cancelled') {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm text-muted mt-8 text-center">Refund status not found.</p>
        </div>
      </div>
    );
  }

  const refundAmount = booking.refundAmount ?? 0;
  const cancelledAt = booking.cancelledAt ?? new Date().toISOString();
  const cancelledDate = formatDisplayDate(cancelledAt.slice(0, 10));
  const expectedBy = formatDisplayDate(addDays(cancelledAt.slice(0, 10), 10));

  const steps = [
    {
      label: 'Cancellation Confirmed',
      date: cancelledDate,
      status: 'done' as const,
    },
    {
      label: 'Refund Initiated',
      date: cancelledDate,
      status: 'done' as const,
    },
    {
      label: 'Processing with Bank',
      date: null,
      status: 'active' as const,
    },
    {
      label: 'Refund Received',
      date: null,
      status: 'pending' as const,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Refund status</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-5 pb-8 space-y-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-gamana-600">
            ₹{refundAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-muted mt-1">Expected by {expectedBy}</p>
        </div>

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
                {step.date && (
                  <p className="text-xs text-muted mt-0.5">{step.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl border border-gamana-100 bg-surface">
          <p className="text-sm font-semibold text-heading">Need help?</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Contact {booking.operatorName} if your refund hasn&apos;t arrived by {expectedBy}.
          </p>
          <a
            href={`tel:${OPERATOR_PHONE.replace(/\s/g, '')}`}
            className="text-sm font-semibold text-gamana-600 mt-2 block"
          >
            {OPERATOR_PHONE}
          </a>
          <p className="text-[11px] text-muted mt-1">{booking.referenceCode}</p>
        </div>
      </div>
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
