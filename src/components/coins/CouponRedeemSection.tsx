import { useState, useCallback, useEffect } from 'react';
import { Ticket, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CouponRedeemSectionProps {
  isRedeeming: boolean;
  lastResult: {
    success: boolean;
    error?: string;
    coins_awarded?: number;
    coupon_code?: string;
  } | null;
  onRedeem: (code: string) => void;
  onClearResult: () => void;
}

export default function CouponRedeemSection({
  isRedeeming,
  lastResult,
  onRedeem,
  onClearResult,
}: CouponRedeemSectionProps) {
  const [code, setCode] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (lastResult) {
      setShowResult(true);
      if (lastResult.success) setCode('');
      const timer = setTimeout(() => {
        setShowResult(false);
        onClearResult();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastResult, onClearResult]);

  const handleSubmit = useCallback(() => {
    const trimmed = code.trim();
    if (!trimmed || isRedeeming) return;
    onRedeem(trimmed);
  }, [code, isRedeeming, onRedeem]);

  return (
    <div className="px-5 pt-6">
      <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Ticket size={14} className="text-gamana-500" />
            <h3 className="text-sm font-semibold text-heading">Redeem a Coupon</h3>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            Have a promo code? Enter it below to get free coins.
          </p>
        </div>

        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter code"
                maxLength={20}
                disabled={isRedeeming}
                className="w-full px-4 py-3 rounded-xl bg-canvas border border-sand-200 text-sm text-heading font-mono tracking-wider placeholder-muted focus:outline-none focus:border-gamana-400 focus:ring-1 focus:ring-gamana-400 transition-colors uppercase disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!code.trim() || isRedeeming}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-gamana-500 text-white transition-all hover:bg-gamana-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRedeeming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          </div>

          {showResult && lastResult && (
            <div
              className={`mt-3 flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all animate-fade-in ${
                lastResult.success
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {lastResult.success ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-emerald-800">
                      +{lastResult.coins_awarded} coins added!
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Coupon {lastResult.coupon_code} redeemed successfully
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-[13px] font-medium text-red-700">
                    {lastResult.error}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
