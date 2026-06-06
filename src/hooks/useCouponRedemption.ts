import { useState, useCallback } from 'react';
import { redeemCoupon } from '../lib/localDb';

interface RedemptionResult {
  success: boolean;
  error?: string;
  new_balance?: number;
  coins_awarded?: number;
  coupon_code?: string;
}

export function useCouponRedemption() {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [lastResult, setLastResult] = useState<RedemptionResult | null>(null);

  const redeem = useCallback(async (code: string): Promise<RedemptionResult> => {
    setIsRedeeming(true);
    setLastResult(null);

    const result = redeemCoupon(code);

    setIsRedeeming(false);
    setLastResult(result);
    return result;
  }, []);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return { redeem, isRedeeming, lastResult, clearResult };
}
