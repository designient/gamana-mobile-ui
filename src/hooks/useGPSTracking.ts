import { useState, useEffect, useCallback, useRef } from 'react';
import type { TourSessionStop } from '../types';
import { getGpsWatchOptions } from '../lib/localDb';

/** Haversine distance in meters between two lat/lng points */
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Calculate bearing (0-360°) from point A to point B */
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

const ARRIVAL_RADIUS_METERS = 50;
const WALKING_SPEED_MS = 1.4; // ~5 km/h average walking

export function useGPSTracking(stops: TourSessionStop[], currentStopIndex: number, isActive: boolean) {
  // Simulated user position — default to near the first stop
  const [userLat, setUserLat] = useState(stops[0]?.lat ?? 12.9716);
  const [userLng, setUserLng] = useState(stops[0]?.lng ?? 77.5946);
  const watchIdRef = useRef<number | null>(null);

  // Try real GPS if available
  useEffect(() => {
    if (!isActive) return;

    if ('geolocation' in navigator) {
      try {
        // Force high accuracy during active tours for reliable geofencing
        const opts = getGpsWatchOptions('high_accuracy');
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLat(pos.coords.latitude);
            setUserLng(pos.coords.longitude);
          },
          () => {
            // GPS error — keep simulated position
          },
          opts,
        );
      } catch {
        // geolocation not available
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isActive]);

  const currentTarget = stops[currentStopIndex] ?? null;

  const distanceToNextStop = currentTarget
    ? haversineMeters(userLat, userLng, currentTarget.lat, currentTarget.lng)
    : 0;

  const etaMinutes = distanceToNextStop > 0
    ? Math.max(1, Math.round(distanceToNextStop / WALKING_SPEED_MS / 60))
    : 0;

  const isWithinRadius = distanceToNextStop <= ARRIVAL_RADIUS_METERS;

  // Bearing from user to next stop (0-360°, 0=North)
  const bearingToNextStop = currentTarget
    ? calculateBearing(userLat, userLng, currentTarget.lat, currentTarget.lng)
    : 0;

  // Simulate arrival for prototype — teleport user to a stop
  const simulateArrival = useCallback((stopIndex: number) => {
    const stop = stops[stopIndex];
    if (stop) {
      setUserLat(stop.lat);
      setUserLng(stop.lng);
    }
  }, [stops]);

  return {
    userLat,
    userLng,
    distanceToNextStop: Math.round(distanceToNextStop),
    etaMinutes,
    isWithinRadius,
    bearingToNextStop,
    simulateArrival,
  };
}
