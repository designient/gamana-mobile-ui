import { useState, useEffect } from 'react';
import { getModeContent } from '../lib/localDb';
import type { QuickMode, ModeContent } from '../types';

export function useModeContent(cityId: string | null, mode: QuickMode | null) {
  const [content, setContent] = useState<ModeContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cityId || !mode || mode === 'nearby') {
      setContent([]);
      return;
    }

    setIsLoading(true);
    setContent(getModeContent(cityId, mode));
    setIsLoading(false);
  }, [cityId, mode]);

  return { content, isLoading };
}
