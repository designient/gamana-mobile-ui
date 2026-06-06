import { useState, useCallback } from 'react';
import { Coins, Sparkles, ShoppingCart, CheckCircle2, X, Loader2 } from 'lucide-react';
import type { CoinPack } from '../../types';

interface CoinPacksListProps {
  packs: CoinPack[];
  onPurchase: (pack: CoinPack) => Promise<boolean>;
  isPurchasing: boolean;
}

export default function CoinPacksList({ packs, onPurchase, isPurchasing }: CoinPacksListProps) {
  const [confirmPack, setConfirmPack] = useState<CoinPack | null>(null);
  const [justPurchased, setJustPurchased] = useState<string | null>(null);

  const handleTap = useCallback((pack: CoinPack) => {
    if (isPurchasing) return;
    setConfirmPack(pack);
  }, [isPurchasing]);

  const handleConfirm = useCallback(async () => {
    if (!confirmPack) return;
    const success = await onPurchase(confirmPack);
    if (success) {
      setJustPurchased(confirmPack.id);
      setTimeout(() => setJustPurchased(null), 2000);
    }
    setConfirmPack(null);
  }, [confirmPack, onPurchase]);

  if (packs.length === 0) return null;

  return (
    <>
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-heading">Get more coins</h3>
          <div className="flex items-center gap-1 text-[10px] text-muted">
            <ShoppingCart size={10} />
            <span>Tap to buy</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {packs.map((pack) => {
            const wasJustPurchased = justPurchased === pack.id;
            return (
              <button
                key={pack.id}
                onClick={() => handleTap(pack)}
                disabled={isPurchasing}
                className={`flex items-center justify-between p-4 rounded-2xl bg-surface shadow-card transition-all active:scale-[0.98] hover:shadow-elevated disabled:opacity-60 ${
                  pack.is_popular ? 'ring-2 ring-gamana-400' : ''
                } ${wasJustPurchased ? 'ring-2 ring-emerald-400' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    wasJustPurchased
                      ? 'bg-emerald-50'
                      : pack.is_popular
                        ? 'bg-gamana-50 dark:bg-gamana-900/20'
                        : 'bg-amber-50'
                  }`}>
                    {wasJustPurchased ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <Coins size={20} className={pack.is_popular ? 'text-gamana-500' : 'text-amber-500'} />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-heading">{pack.coin_amount} coins</span>
                      {pack.is_popular && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gamana-50 dark:bg-gamana-900/20 text-gamana-600">
                          <Sparkles size={9} />
                          Best value
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">{pack.label}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-body">{pack.price_display}</span>
                  <span className="text-[10px] text-muted">
                    {(pack.price_cents / pack.coin_amount).toFixed(1)}/coin
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {confirmPack && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmPack(null)} />
          <div className="relative bg-surface rounded-3xl shadow-elevated p-6 w-full max-w-sm animate-scale-in">
            <button
              onClick={() => setConfirmPack(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center hover:bg-surface-muted transition-colors"
            >
              <X size={14} className="text-secondary" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <Coins size={24} className="text-amber-500" />
              </div>
              <h4 className="text-base font-semibold text-heading">
                Get {confirmPack.coin_amount} coins
              </h4>
              <p className="text-sm text-muted mt-1">{confirmPack.label}</p>
            </div>

            <div className="bg-canvas rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-body">Amount</span>
                <span className="text-lg font-bold text-heading">{confirmPack.price_display}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand-200">
                <span className="text-xs text-muted">You receive</span>
                <span className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                  <Coins size={13} />
                  {confirmPack.coin_amount} coins
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isPurchasing}
              className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPurchasing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </button>

            <p className="text-[10px] text-muted text-center mt-3">
              Coins are added to your balance instantly
            </p>
          </div>
        </div>
      )}
    </>
  );
}
