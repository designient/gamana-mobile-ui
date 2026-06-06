import { useState, useCallback } from 'react';
import type { UnlockResult } from '../types';
import { unlockContent } from '../lib/localDb';

export function useUnlockContent() {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const unlock = useCallback(async (
    itemType: 'story' | 'pack',
    itemId: string,
    cost: number
  ): Promise<UnlockResult> => {
    setIsUnlocking(true);
    const result = unlockContent(itemType, itemId, cost);
    setIsUnlocking(false);
    return result;
  }, []);

  return { unlock, isUnlocking };
}
