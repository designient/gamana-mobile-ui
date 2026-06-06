import { useState, useCallback } from 'react';
import { ArrowLeft, Coins, Sparkles, Headphones, Calendar, Info } from 'lucide-react';
import type { CoinPack } from '../../types';
import { useNearbyStories } from '../../hooks/useNearbyStories';
import { useCoinPacks } from '../../hooks/useCoinPacks';
import { useCoinTransactions } from '../../hooks/useCoinTransactions';
import { useCouponRedemption } from '../../hooks/useCouponRedemption';
import { useLocation } from '../../hooks/useLocation';
import { purchaseCoins } from '../../lib/localDb';
import { STORY_COIN_COST } from '../../lib/constants';
import StatusBar from '../layout/StatusBar';
import CoinPacksList from './CoinPacksList';
import CouponRedeemSection from './CouponRedeemSection';
import TransactionHistory from './TransactionHistory';
import NearbyUnlocks from './NearbyUnlocks';

interface CoinsScreenProps {
  balance: number;
  onBack: () => void;
  onNavigateToStory: (storyId: string) => void;
  onBalanceChange: (newBalance: number) => void;
}

export default function CoinsScreen({
  balance,
  onBack,
  onNavigateToStory,
  onBalanceChange,
}: CoinsScreenProps) {
  const location = useLocation();
  const { stories } = useNearbyStories(location.lat, location.lng);
  const { packs: coinPacks } = useCoinPacks();
  const { transactions, refresh: refreshTransactions } = useCoinTransactions();
  const { redeem, isRedeeming, lastResult, clearResult } = useCouponRedemption();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const storiesAffordable = Math.floor(balance / STORY_COIN_COST);

  const handleCouponRedeem = useCallback(async (code: string) => {
    const result = await redeem(code);
    if (result.success && result.new_balance != null) {
      onBalanceChange(result.new_balance);
      refreshTransactions();
    }
  }, [redeem, onBalanceChange, refreshTransactions]);

  const handlePurchase = useCallback(async (pack: CoinPack): Promise<boolean> => {
    setIsPurchasing(true);

    const result = purchaseCoins(pack);
    if (!result.success) {
      setIsPurchasing(false);
      return false;
    }

    onBalanceChange(result.newBalance);
    refreshTransactions();
    setIsPurchasing(false);
    return true;
  }, [onBalanceChange, refreshTransactions]);

  return (
    <div className="relative flex flex-col h-full bg-canvas">
      <StatusBar />

      <header className="flex items-center gap-3 px-5 py-3 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={16} className="text-secondary" />
        </button>
        <h1 className="text-base font-semibold text-heading">Your Coins</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-16">
        <div className="px-5 pt-6 pb-5">
          <div className="bg-surface rounded-3xl p-6 shadow-card text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <Coins size={28} className="text-amber-500" />
            </div>
            <div className="text-4xl font-bold text-heading mb-1">{balance}</div>
            <p className="text-sm text-muted">Gamana Coins</p>
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border-default">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Headphones size={12} className="text-gamana-500" />
                  <span className="text-sm font-semibold text-heading">{storiesAffordable}</span>
                </div>
                <p className="text-[10px] text-muted mt-0.5">stories</p>
              </div>
              <div className="w-px h-6 bg-surface-muted" />
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Calendar size={12} className="text-gamana-500" />
                  <span className="text-sm font-semibold text-heading">30</span>
                </div>
                <p className="text-[10px] text-muted mt-0.5">day access</p>
              </div>
            </div>
          </div>
        </div>

        <NearbyUnlocks stories={stories} onTapStory={onNavigateToStory} />

        <CoinPacksList
          packs={coinPacks}
          onPurchase={handlePurchase}
          isPurchasing={isPurchasing}
        />

        <CouponRedeemSection
          isRedeeming={isRedeeming}
          lastResult={lastResult}
          onRedeem={handleCouponRedeem}
          onClearResult={clearResult}
        />

        <div className="px-5 pt-6 pb-4">
          <div className="bg-surface rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-gamana-500" />
              <span className="text-xs font-medium text-body uppercase tracking-wider">How it works</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <HowItWorksRow text="Unlock stories and tours for 30-day access" />
              <HowItWorksRow text="Listen anytime, even offline after download" />
              <HowItWorksRow text="Your coins never expire" />
              <HowItWorksRow text="Redeem coupons to get free coins" />
            </div>
          </div>
        </div>

        <TransactionHistory transactions={transactions} />

        <div className="h-8" />
      </div>
    </div>
  );
}

function HowItWorksRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Sparkles size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
      <p className="text-[13px] text-heading leading-relaxed">{text}</p>
    </div>
  );
}
