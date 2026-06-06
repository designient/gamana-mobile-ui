import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { ConnectivityState } from '../types';

export interface ConnectivityContextValue extends ConnectivityState {
  hasDownloads: boolean;
  setHasDownloads: (v: boolean) => void;
}

export const ConnectivityContext = createContext<ConnectivityContextValue>({
  isOnline: true,
  isWeak: false,
  lastOnlineAt: null,
  hasDownloads: false,
  setHasDownloads: () => {},
});

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectivityState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isWeak: false,
    lastOnlineAt: null,
  });
  const [hasDownloads, setHasDownloads] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setState((s) => ({ ...s, isOnline: true, lastOnlineAt: new Date().toISOString() }));
    };
    const handleOffline = () => {
      setState((s) => ({ ...s, isOnline: false }));
      console.info('offline_banner_shown', { screen: 'global', has_downloads: hasDownloads });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    if (conn) {
      const checkSpeed = () => {
        const type = conn.effectiveType;
        setState((s) => ({ ...s, isWeak: type === 'slow-2g' || type === '2g' }));
      };
      checkSpeed();
      (conn as EventTarget).addEventListener('change', checkSpeed);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        (conn as EventTarget).removeEventListener('change', checkSpeed);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasDownloads]);

  return (
    <ConnectivityContext.Provider value={{ ...state, hasDownloads, setHasDownloads }}>
      {children}
    </ConnectivityContext.Provider>
  );
}
