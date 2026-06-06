import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Loader2, Send, CheckCircle2, Crosshair } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import StatusBar from '../layout/StatusBar';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const STORAGE_KEY = 'gamana_story_requests';

interface RequestStoryScreenProps {
  onBack: () => void;
  defaultLat: number;
  defaultLng: number;
}

interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

function saveRequest(data: { lat: number; lng: number; name: string; note: string }) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  existing.push({ ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

function RequestStoryForm({ onBack, defaultLat, defaultLng }: RequestStoryScreenProps) {
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [pinLat, setPinLat] = useState(defaultLat);
  const [pinLng, setPinLng] = useState(defaultLng);
  const [submitted, setSubmitted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (placesLib) {
      autocompleteRef.current = new placesLib.AutocompleteService();
    }
  }, [placesLib]);

  useEffect(() => {
    if (geocodingLib) {
      geocoderRef.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (!autocompleteRef.current) return;

      setIsSearching(true);
      autocompleteRef.current.getPlacePredictions(
        { input: value, types: ['establishment', 'geocode'] },
        (results, status) => {
          setIsSearching(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(
              results.slice(0, 5).map((r) => ({
                placeId: r.place_id,
                mainText: r.structured_formatting.main_text,
                secondaryText: r.structured_formatting.secondary_text || '',
              })),
            );
            setShowDropdown(true);
          } else {
            setPredictions([]);
          }
        },
      );
    }, 300);
  }, []);

  const handleSelectPlace = useCallback((prediction: PlacePrediction) => {
    if (!geocoderRef.current) return;

    setIsSearching(true);
    geocoderRef.current.geocode({ placeId: prediction.placeId }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location;
        setName(prediction.mainText);
        setPinLat(loc.lat());
        setPinLng(loc.lng());
        setSearchQuery('');
        setPredictions([]);
        setShowDropdown(false);
      }
    });
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPinLat(e.latLng.lat());
      setPinLng(e.latLng.lng());
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    saveRequest({ lat: pinLat, lng: pinLng, name: name.trim(), note: note.trim() });
    setSubmitted(true);
  }, [pinLat, pinLng, name, note]);

  const canSubmit = name.trim().length > 0;

  if (submitted) {
    return (
      <>
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold text-heading mb-2">Request Submitted</h2>
          <p className="text-sm text-muted leading-relaxed mb-8 max-w-[280px]">
            Thanks for letting us know! We'll work on bringing stories to this location.
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-xl bg-gamana-500 text-white text-sm font-medium hover:bg-gamana-600 transition-colors active:scale-[0.97]"
          >
            Back to Home
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <StatusBar />

      <header className="flex items-center gap-3 px-5 py-3 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={16} className="text-secondary" />
        </button>
        <h1 className="text-base font-semibold text-heading">Request a Story</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-8">
        <div className="px-5 pt-4" ref={dropdownRef}>
          <label className="text-xs font-medium text-body mb-1.5 block">Search a place on Google</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => predictions.length > 0 && setShowDropdown(true)}
              placeholder="Search for a place..."
              className="w-full pl-9 pr-8 py-3 rounded-xl bg-surface border border-sand-200 text-sm text-heading placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-gamana-300 focus:border-transparent transition-all"
            />
            {isSearching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gamana-400 animate-spin" />
            )}
          </div>

          {showDropdown && predictions.length > 0 && (
            <div className="relative z-10 mt-1 bg-surface rounded-xl shadow-elevated border border-border-default overflow-hidden">
              {predictions.map((p) => (
                <button
                  key={p.placeId}
                  onClick={() => handleSelectPlace(p)}
                  className="flex items-start gap-2.5 w-full px-3 py-2.5 text-left hover:bg-canvas transition-colors border-b border-border-subtle last:border-b-0"
                >
                  <MapPin size={14} className="text-gamana-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-heading truncate">{p.mainText}</p>
                    <p className="text-[11px] text-muted truncate">{p.secondaryText}</p>
                  </div>
                </button>
              ))}
              <div className="px-3 py-1.5 bg-surface-alt/50">
                <p className="text-[9px] text-faint text-right">Powered by Google</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pt-4">
          <label className="text-xs font-medium text-body mb-1.5 block">Story or place name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cubbon Park, The Bangalore Fort"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-sand-200 text-sm text-heading placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-gamana-300 focus:border-transparent transition-all"
          />
        </div>

        <div className="px-5 pt-4">
          <label className="text-xs font-medium text-body mb-1.5 flex items-center gap-1.5">
            <Crosshair size={12} />
            Pin the location on the map
          </label>
          <div className="rounded-xl overflow-hidden border border-sand-200 h-52">
            <Map
              center={{ lat: pinLat, lng: pinLng }}
              zoom={14}
              gestureHandling="greedy"
              disableDefaultUI
              mapId="request-story-map"
              onClick={handleMapClick}
            >
              <AdvancedMarker position={{ lat: pinLat, lng: pinLng }}>
                <div className="w-8 h-8 rounded-full bg-gamana-500 border-2 border-white shadow-lg flex items-center justify-center">
                  <MapPin size={14} className="text-white" />
                </div>
              </AdvancedMarker>
            </Map>
          </div>
          <p className="text-[11px] text-muted mt-1.5">
            Tap the map to move the pin. Current: {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
          </p>
        </div>

        <div className="px-5 pt-4">
          <label className="text-xs font-medium text-body mb-1.5 block">
            Comments <span className="text-faint font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A story about the history of this place, a local legend, hidden gems..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-sand-200 text-sm text-heading placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-gamana-300 focus:border-transparent resize-none transition-all"
          />
        </div>

        <div className="px-5 pt-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97] ${
              canSubmit
                ? 'bg-gamana-500 text-white hover:bg-gamana-600'
                : 'bg-surface-muted text-faint cursor-not-allowed'
            }`}
          >
            <Send size={14} />
            Submit Request
          </button>
        </div>
      </div>
    </>
  );
}

export default function RequestStoryScreen(props: RequestStoryScreenProps) {
  if (!MAPS_API_KEY) {
    return (
      <div className="relative flex flex-col h-full bg-canvas">
        <StatusBar />
        <header className="flex items-center gap-3 px-5 py-3 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
          <button
            onClick={props.onBack}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center hover:bg-surface-muted transition-colors"
          >
            <ArrowLeft size={16} className="text-secondary" />
          </button>
          <h1 className="text-base font-semibold text-heading">Request a Story</h1>
        </header>
        <div className="flex-1 flex items-center justify-center px-8 text-center">
          <p className="text-sm text-muted">Google Maps API key is required for this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={MAPS_API_KEY} libraries={['places', 'geocoding']}>
      <div className="relative flex flex-col h-full bg-canvas">
        <RequestStoryForm {...props} />
      </div>
    </APIProvider>
  );
}
