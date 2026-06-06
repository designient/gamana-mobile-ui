import { useState, useCallback } from 'react';
import { X, Coins, Headphones, Download, Calendar, Route, Clock, CheckCircle2 } from 'lucide-react';
import type { Story, CityPack } from '../../types';
import { useUnlockContent } from '../../hooks/useUnlockContent';
import { useDownloadState } from '../../hooks/useDownloadState';
import { useOrgContext } from '../../hooks/useOrgContext';

interface UnlockSheetProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'story' | 'pack';
  story?: Story | null;
  pack?: CityPack | null;
  coinCost: number;
  userBalance: number;
  onUnlocked: (newBalance: number) => void;
  onInsufficientBalance: () => void;
}

export default function UnlockSheet({
  isOpen,
  onClose,
  itemType,
  story,
  pack,
  coinCost,
  userBalance,
  onUnlocked,
  onInsufficientBalance,
}: UnlockSheetProps) {
  const { config: orgConfig } = useOrgContext();
  const effectiveCost = orgConfig.pricingRules
    ? (itemType === 'story' ? orgConfig.pricingRules.storyCost : Math.round(coinCost * (orgConfig.pricingRules.packMultiplier ?? 1)))
    : coinCost;
  const { unlock, isUnlocking } = useUnlockContent();
  const [isClosing, setIsClosing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const itemId = itemType === 'story' ? story?.id : pack?.id;
  const { startDownload, isDownloaded, isDownloading } = useDownloadState(
    itemType,
    itemId ?? '',
  );
  const [downloadPromptDismissed, setDownloadPromptDismissed] = useState(false);

  const canAfford = userBalance >= effectiveCost;
  const title = itemType === 'story' ? story?.title : pack?.title;
  const imageUrl = itemType === 'story' ? story?.image_url : pack?.image_url;
  const durationSeconds = itemType === 'story' ? story?.duration_seconds : pack?.total_duration_seconds;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setShowSuccess(false);
      onClose();
    }, 200);
  }, [onClose]);

  const handleUnlock = useCallback(async () => {
    if (!itemId) return;

    if (!canAfford) {
      onInsufficientBalance();
      return;
    }

    console.info('unlock_confirmed', {
      item_type: itemType,
      item_id: itemId,
      cost: effectiveCost,
      balance: userBalance,
    });

    const result = await unlock(itemType, itemId, effectiveCost);

    if (result.success && result.new_balance != null) {
      setShowSuccess(true);
      onUnlocked(result.new_balance);
    }
  }, [itemId, canAfford, effectiveCost, itemType, userBalance, unlock, onUnlocked, onInsufficientBalance]);

  const handleDismiss = useCallback(() => {
    console.info('unlock_dismissed', {
      item_type: itemType,
      item_id: itemId,
      reason: 'maybe_later',
    });
    handleClose();
  }, [itemType, itemId, handleClose]);

  if (!isOpen && !isClosing) return null;

  const animState = isClosing ? 'closing' : 'open';

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          animState === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleDismiss}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out ${
          animState === 'closing' ? 'translate-y-full' : 'animate-slide-up'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-surface-muted" />
        </div>

        {showSuccess ? (
          <SuccessState
            showDownloadPrompt={!downloadPromptDismissed && !isDownloaded}
            isDownloading={isDownloading}
            onDownload={() => {
              startDownload();
              console.info('download_prompt_shown', {
                item_type: itemType,
                item_id: itemId,
                surface: 'unlock_sheet',
              });
            }}
            onDismissDownload={() => setDownloadPromptDismissed(true)}
            onClose={handleDismiss}
          />
        ) : (
          <div className="px-5 pt-2 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-heading">
                {itemType === 'story' ? 'Unlock full story' : 'Unlock full tour'}
              </h3>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted hover:bg-surface-muted transition-colors"
              >
                <X size={16} className="text-secondary" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gamana-100">
                {imageUrl && (
                  <img src={imageUrl} alt={title ?? ''} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-heading truncate">{title}</h4>
                <p className="text-xs text-muted mt-0.5">
                  {itemType === 'story' ? story?.subtitle : pack?.subtitle}
                </p>
              </div>
            </div>

            <div className="bg-canvas rounded-2xl p-4 mb-5">
              <p className="text-xs font-medium text-body mb-3 uppercase tracking-wider">What you get</p>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <Headphones size={14} className="text-gamana-500" />
                  <span className="text-[13px] text-heading">
                    {itemType === 'story'
                      ? `Full narration - ${Math.round((durationSeconds ?? 0) / 60)} min`
                      : `${pack?.story_count} stories - ${Math.round((durationSeconds ?? 0) / 60)} min total`
                    }
                  </span>
                </div>
                {itemType === 'pack' && (
                  <div className="flex items-center gap-2.5">
                    <Route size={14} className="text-gamana-500" />
                    <span className="text-[13px] text-heading">{pack?.story_count} guided stops</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Download size={14} className="text-gamana-500" />
                  <span className="text-[13px] text-heading">Offline download</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={14} className="text-gamana-500" />
                  <span className="text-[13px] text-heading">30-day access</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-heading">{effectiveCost} coins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-muted" />
                <span className="text-xs text-muted">You have {userBalance} coins</span>
              </div>
            </div>

            <button
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUnlocking ? 'Unlocking...' : canAfford ? 'Unlock now' : 'Get more coins'}
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 mt-2 text-sm text-muted font-medium hover:text-secondary transition-colors"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuccessState({
  showDownloadPrompt,
  isDownloading,
  onDownload,
  onDismissDownload,
  onClose,
}: {
  showDownloadPrompt: boolean;
  isDownloading: boolean;
  onDownload: () => void;
  onDismissDownload: () => void;
  onClose: () => void;
}) {
  return (
    <div className="px-5 pt-2 pb-8 flex flex-col items-center animate-fade-in">
      <div className="flex justify-end w-full mb-2">
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted hover:bg-surface-muted transition-colors"
          aria-label="Close"
        >
          <X size={16} className="text-secondary" />
        </button>
      </div>
      <div className="w-16 h-16 rounded-full bg-gamana-50 flex items-center justify-center mb-4">
        <CheckCircle2 size={32} className="text-gamana-500" />
      </div>
      <h3 className="text-base font-semibold text-heading mb-1">Unlocked</h3>
      <p className="text-sm text-muted mb-4">Enjoy for 30 days</p>

      {showDownloadPrompt && (
        <div className="w-full bg-canvas rounded-xl p-4">
          <p className="text-sm text-heading font-medium mb-3 text-center">Download for offline?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="flex-1 py-2.5 rounded-xl bg-gamana-500 text-white text-sm font-semibold hover:bg-gamana-600 transition-colors disabled:opacity-60"
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button
              type="button"
              onClick={onDismissDownload}
              className="flex-1 py-2.5 rounded-xl border border-border-default text-sm text-secondary font-medium hover:bg-surface-alt transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
