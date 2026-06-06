import { useState, useEffect } from 'react';
import type { LocationState } from '../types';
import { DEFAULT_CENTER } from '../lib/constants';
import { getGpsWatchOptions } from '../lib/localDb';

const WEAK_THRESHOLD = 500;

export function useLocation(enabled: boolean = true): LocationState {
  const [state, setState] = useState<LocationState>({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    accuracy: 0,
    isLoading: true,
    error: null,
    isWeak: false,
  });

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    if (!navigator.geolocation) {
      setState((s) => ({ ...s, isLoading: false, error: 'Geolocation not supported' }));
      return;
    }

    setState((s) => ({ ...s, isLoading: true }));

    const opts = getGpsWatchOptions();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isLoading: false,
          error: null,
          isWeak: pos.coords.accuracy > WEAK_THRESHOLD,
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err.message,
          isWeak: true,
        }));
      },
      { enableHighAccuracy: opts.enableHighAccuracy, timeout: opts.timeout, maximumAge: opts.maximumAge }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isLoading: false,
          error: null,
          isWeak: pos.coords.accuracy > WEAK_THRESHOLD,
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err.message,
          isWeak: true,
        }));
      },
      { enableHighAccuracy: opts.enableHighAccuracy, timeout: opts.timeout, maximumAge: opts.maximumAge }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  return state;
}
