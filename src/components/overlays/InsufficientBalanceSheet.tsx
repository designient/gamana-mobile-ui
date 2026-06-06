import { useState, useCallback } from 'react';
import { X, Coins, Sparkles } from 'lucide-react';
import type { CoinPack } from '../../types';
import { useCoinPacks } from '../../hooks/useCoinPacks';

interface InsufficientBalanceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  requiredCost: number;
  onNavigateToCoins: () => void;
}

export default function InsufficientBalanceSheet({
  isOpen,
  onClose,
  currentBalance,
  requiredCost,
  onNavigateToCoins,
}: InsufficientBalanceSheetProps) {
  const { packs } = useCoinPacks();
  const [isClosing, setIsClosing] = useState(false);
  const shortfall = requiredCost - currentBalance;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  const handlePackTap = useCallback((pack: CoinPack) => {
    console.info('coin_pack_tapped', {
      pack_id: pack.id,
      coin_amount: pack.coin_amount,
      price: pack.price_display,
      source: 'insufficient_balance',
    });
  }, []);

  const handleSeeAll = useCallback(() => {
    console.info('coins_screen_opened', { source: 'insufficient_balance' });
    handleClose();
    setTimeout(onNavigateToCoins, 250);
  }, [onNavigateToCoins, handleClose]);

  if (!isOpen && !isClosing) return null;

  const animState = isClosing ? 'closing' : 'open';

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          animState === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out ${
          animState === 'closing' ? 'translate-y-full' : 'animate-slide-up'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-surface-muted" />
        </div>

        <div className="px-5 pt-2 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-heading">
              You need {shortfall} more {shortfall === 1 ? 'coin' : 'coins'}
            </h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted hover:bg-surface-muted transition-colors"
            >
              <X size={16} className="text-secondary" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-5 px-1">
            <Coins size={14} className="text-amber-500" />
            <span className="text-sm text-secondary">
              Current balance: <span className="font-semibold text-amber-700">{currentBalance} coins</span>
            </span>
          </div>

          <div className="flex flex-col gap-2.5 mb-5">
            {packs.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handlePackTap(pack)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border-default bg-canvas hover:border-gamana-200 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Coins size={18} className="text-amber-500" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-heading">{pack.coin_amount} coins</span>
                      {pack.is_popular && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gamana-50 dark:bg-gamana-900/20 text-gamana-600">
                          <Sparkles size={9} />
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">{pack.label}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gamana-600">{pack.price_display}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSeeAll}
            className="w-full py-2.5 text-sm text-gamana-600 font-medium hover:text-gamana-700 transition-colors"
          >
            See all options
          </button>
        </div>
      </div>
    </div>
  );
}
