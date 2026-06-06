import type { Experience } from '../../../types/experience';
import {
  formatDisplayDate,
  getBookingStepCount,
  getPickupLocation,
  getStepIndex,
  getUnitPrice,
  isOnRequestExperience,
  type BookingFlowState,
} from '../../../lib/experience-booking-flow';
import { ArrowLeft } from 'lucide-react';
import StatusBar from '../../layout/StatusBar';
import BookingProgressDots from './BookingProgressDots';

interface OrderSummaryScreenProps {
  experience: Experience;
  flowState: BookingFlowState;
  operatorName: string;
  onBack: () => void;
  onConfirm: () => void;
}

export default function OrderSummaryScreen({
  experience,
  flowState,
  operatorName,
  onBack,
  onConfirm,
}: OrderSummaryScreenProps) {
  const priceFrom = experience.priceFrom ?? 0;
  const onRequest = isOnRequestExperience(experience);
  const pickup = getPickupLocation(flowState.pickupLocationId ?? undefined);
  const stepCount = getBookingStepCount(experience);
  const currentStep = getStepIndex('review', experience);

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Review booking</h1>
      </div>

      <BookingProgressDots current={currentStep} total={stepCount} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-4">
        <div className="flex gap-3 p-3 rounded-2xl border border-gamana-100 bg-surface">
          {experience.heroImageUrl ? (
            <img
              src={experience.heroImageUrl}
              alt={experience.title}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gamana-100 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-heading line-clamp-2">{experience.title}</h2>
            <p className="text-xs text-muted mt-1">{formatDisplayDate(flowState.selectedDate)}</p>
            {flowState.selectedTime && (
              <p className="text-xs text-gamana-600 font-medium mt-0.5">{flowState.selectedTime}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gamana-100 overflow-hidden">
          <table className="w-full text-xs">
            <tbody>
              {flowState.adults > 0 && (
                <PriceRow
                  label={`Adults × ${flowState.adults}`}
                  unit={getUnitPrice('adult', priceFrom)}
                  count={flowState.adults}
                />
              )}
              {flowState.children > 0 && (
                <PriceRow
                  label={`Children × ${flowState.children}`}
                  unit={getUnitPrice('child', priceFrom)}
                  count={flowState.children}
                />
              )}
              {flowState.seniors > 0 && (
                <PriceRow
                  label={`Seniors × ${flowState.seniors}`}
                  unit={getUnitPrice('senior', priceFrom)}
                  count={flowState.seniors}
                />
              )}
              <tr className="border-t border-gamana-100 bg-gamana-500/5">
                <td className="px-3 py-2.5 font-semibold text-heading">Total</td>
                <td className="px-3 py-2.5 text-right font-bold text-gamana-600">
                  ₹{flowState.total.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {pickup && flowState.pickupMode === 'pickup' && (
          <div className="p-3.5 rounded-xl border border-gamana-100 bg-gamana-500/5">
            <p className="text-xs font-semibold text-heading">Pickup</p>
            <p className="text-sm font-medium text-heading mt-1">{pickup.name}</p>
            <p className="text-xs text-muted mt-0.5">{pickup.address}</p>
            <p className="text-[11px] text-gamana-600 font-medium mt-1">Pickup at {pickup.pickupTime}</p>
          </div>
        )}

        {flowState.pickupMode === 'meet' && (
          <div className="p-3.5 rounded-xl border border-gamana-100 bg-gamana-500/5">
            <p className="text-xs font-semibold text-heading">Meeting point</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {experience.meetingPointText ?? 'Details shared after confirmation'}
            </p>
          </div>
        )}

        {experience.cancellationPolicy && (
          <p className="text-[11px] text-muted leading-relaxed">
            {experience.cancellationPolicy}
          </p>
        )}

        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">
          Refunds handled by {operatorName}
        </p>

        {onRequest && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs font-semibold text-amber-900">
              You won&apos;t be charged until confirmed
            </p>
            <p className="text-[11px] text-amber-800/80 mt-1 leading-relaxed">
              The operator will confirm availability within 24 hours.
            </p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-gamana-100">
        <button
          type="button"
          onClick={onConfirm}
          className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-sm ${
            onRequest ? 'bg-gamana-400' : 'bg-gamana-500'
          }`}
        >
          {onRequest
            ? 'Send Request'
            : `Proceed to Pay — ₹${flowState.total.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  );
}

function PriceRow({
  label,
  unit,
  count,
}: {
  label: string;
  unit: number;
  count: number;
}) {
  return (
    <tr className="border-b border-gamana-100/70">
      <td className="px-3 py-2 text-muted">{label}</td>
      <td className="px-3 py-2 text-right font-medium text-heading">
        ₹{(unit * count).toLocaleString('en-IN')}
      </td>
    </tr>
  );
}
