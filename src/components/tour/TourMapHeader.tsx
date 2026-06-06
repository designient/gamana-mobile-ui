import { useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Navigation } from 'lucide-react';
import type { TourSessionStop } from '../../types';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface TourMapHeaderProps {
  stops: TourSessionStop[];
  currentStopIndex: number;
  userLat: number;
  userLng: number;
  distanceMeters: number;
  etaMinutes: number;
  bearingDeg: number;
}

/** Inner component that renders the walking route via Directions API */
function WalkingRoute({
  stops,
  currentStopIndex,
}: {
  stops: TourSessionStop[];
  currentStopIndex: number;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map || stops.length < 2) return;

    // Create renderer once
    if (!rendererRef.current) {
      rendererRef.current = new routesLib.DirectionsRenderer({
        map,
        suppressMarkers: true, // We render our own markers
        polylineOptions: {
          strokeColor: '#1A5F7A',
          strokeWeight: 4,
          strokeOpacity: 0.7,
        },
        preserveViewport: true,
      });
    }

    const directionsService = new routesLib.DirectionsService();

    // Build waypoints from all stops
    const origin = { lat: stops[0].lat, lng: stops[0].lng };
    const destination = { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng };
    const waypoints = stops.slice(1, -1).map((s) => ({
      location: { lat: s.lat, lng: s.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === 'OK' && result && rendererRef.current) {
          rendererRef.current.setDirections(result);
        }
      },
    );

    return () => {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
        rendererRef.current = null;
      }
    };
  }, [routesLib, map, stops, currentStopIndex]);

  return null;
}

/** Fits the map to show all stops + user location */
function MapBoundsManager({
  stops,
  userLat,
  userLng,
}: {
  stops: TourSessionStop[];
  userLat: number;
  userLng: number;
}) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (!map || hasFitted.current) return;

    const bounds = new google.maps.LatLngBounds();
    stops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
    bounds.extend({ lat: userLat, lng: userLng });
    map.fitBounds(bounds, { top: 80, bottom: 20, left: 30, right: 30 });
    hasFitted.current = true;
  }, [map, stops, userLat, userLng]);

  return null;
}

export default function TourMapHeader({
  stops,
  currentStopIndex,
  userLat,
  userLng,
  distanceMeters,
  etaMinutes,
  bearingDeg,
}: TourMapHeaderProps) {
  if (stops.length === 0) return null;

  const currentStop = stops[currentStopIndex];
  const isNearStop = distanceMeters <= 50;

  const distanceDisplay = distanceMeters > 999
    ? `${(distanceMeters / 1000).toFixed(1)} km`
    : `${distanceMeters} m`;

  const centerLat = stops.reduce((sum, s) => sum + s.lat, 0) / stops.length;
  const centerLng = stops.reduce((sum, s) => sum + s.lng, 0) / stops.length;


  return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden">
      <APIProvider apiKey={MAPS_API_KEY}>
        <Map
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          mapId="walking-tour-map"
          style={{ width: '100%', height: '100%' }}
          styles={[
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
            {
              featureType: 'water',
              stylers: [{ color: '#c9e8f4' }],
            },
            {
              featureType: 'landscape',
              stylers: [{ color: '#f0f0ec' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }],
            },
          ]}
        >
          {/* Walking route */}
          <WalkingRoute stops={stops} currentStopIndex={currentStopIndex} />

          {/* Fit map bounds on mount */}
          <MapBoundsManager stops={stops} userLat={userLat} userLng={userLng} />

          {/* Stop markers */}
          {stops.map((stop, i) => {
            const isCompleted = stop.status === 'completed';
            const isCurrent = i === currentStopIndex;

            return (
              <AdvancedMarker
                key={stop.id}
                position={{ lat: stop.lat, lng: stop.lng }}
                zIndex={isCurrent ? 10 : isCompleted ? 5 : 1}
              >
                <div className="flex flex-col items-center">
                  {/* Pulse ring for current stop */}
                  {isCurrent && (
                    <div className="absolute w-14 h-14 rounded-full bg-gamana-500/15 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ top: '-7px', left: '-7px' }} />
                  )}
                  <div
                    className={`
                      relative flex items-center justify-center rounded-full shadow-lg transition-all
                      ${isCompleted
                        ? 'w-8 h-8 bg-emerald-500 ring-2 ring-white'
                        : isCurrent
                          ? 'w-10 h-10 bg-gamana-500 ring-[3px] ring-white shadow-gamana-500/40'
                          : 'w-7 h-7 bg-gray-400 ring-2 ring-white'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className={`font-bold text-white ${isCurrent ? 'text-sm' : 'text-[10px]'}`}>
                        {i + 1}
                      </span>
                    )}
                  </div>
                  {/* Label for current and completed stops */}
                  {(isCurrent || isCompleted) && (
                    <div className={`mt-1 px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap max-w-[100px] truncate text-center ${
                      isCurrent ? 'bg-surface text-heading font-semibold' : 'bg-surface/80 text-heading/70 font-medium'
                    }`}>
                      <span className="text-[10px] leading-tight">
                        {stop.story?.title ?? stop.pinnedLabel ?? `Stop ${i + 1}`}
                      </span>
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* User location marker */}
          <AdvancedMarker
            position={{ lat: userLat, lng: userLng }}
            zIndex={20}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer glow */}
              <div className="absolute w-8 h-8 rounded-full bg-blue-500/15 animate-[pulse_2s_ease-in-out_infinite]" />
              {/* Heading indicator */}
              <div
                className="absolute w-7 h-7"
                style={{ transform: `rotate(${bearingDeg}deg)` }}
              >
                <svg viewBox="0 0 28 28" className="w-full h-full">
                  <path
                    d="M14 2 L18 14 L14 11 L10 14 Z"
                    fill="rgba(59,130,246,0.25)"
                  />
                </svg>
              </div>
              {/* Core dot */}
              <div className="relative w-5 h-5 rounded-full bg-blue-500 border-[2.5px] border-white shadow-lg shadow-blue-500/30" />
            </div>
          </AdvancedMarker>
        </Map>
      </APIProvider>

      {/* Floating distance pill — top center */}
      {currentStop && !isNearStop && currentStop.status !== 'completed' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/95 shadow-lg border border-border-default/80 backdrop-blur-sm">
            <Navigation size={11} className="text-blue-500" />
            <span className="text-[11px] font-bold text-heading">{distanceDisplay}</span>
            <span className="text-[11px] text-muted">·</span>
            <span className="text-[11px] text-secondary">{etaMinutes} min walk</span>
          </div>
        </div>
      )}
    </div>
  );
}
