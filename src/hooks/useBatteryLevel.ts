import { useState, useEffect } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
  supported: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export function useBatteryLevel(): BatteryState {
  const [state, setState] = useState<BatteryState>({
    level: 100,
    charging: false,
    supported: false,
  });

  useEffect(() => {
    let battery: BatteryManager | null = null;

    const update = () => {
      if (!battery) return;
      setState({
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        supported: true,
      });
    };

    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (typeof nav.getBattery === 'function') {
      nav.getBattery().then((bm) => {
        battery = bm;
        update();
        bm.addEventListener('levelchange', update);
        bm.addEventListener('chargingchange', update);
      });
    }

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      }
    };
  }, []);

  return state;
}
