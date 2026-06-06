import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, X, MapPin, Check, Clock, AlertTriangle, Navigation, Headphones, Search, Loader2 } from 'lucide-react';
import type { Story, LocationState } from '../../types';
import StatusBar from '../layout/StatusBar';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

function PlacesAutocompleteInput({
  onPlaceSelected,
}: {
  onPlaceSelected: (place: { label: string; lat: number; lng: number }) => void;
}) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!MAPS_API_KEY) return;

    if (window.google?.maps?.places) {
      autocompleteRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      return;
    }

    const existing = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.google?.maps?.places) {
          autocompleteRef.current = new google.maps.places.AutocompleteService();
          geocoderRef.current = new google.maps.Geocoder();
        }
      });
      return;
    }

    const tag = document.createElement('script');
    tag.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
    tag.async = true;
    tag.onload = () => {
      autocompleteRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    };
    document.head.appendChild(tag);
  }, []);

  const ensureServices = useCallback(() => {
    if (!autocompleteRef.current && window.google?.maps?.places) {
      autocompleteRef.current = new google.maps.places.AutocompleteService();
    }
    if (!geocoderRef.current && window.google?.maps) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      ensureServices();
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
                description: r.description,
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
  }, [ensureServices]);

  const handleSelect = useCallback((prediction: PlacePrediction) => {
    ensureServices();
    if (!geocoderRef.current) return;

    setIsSearching(true);
    geocoderRef.current.geocode({ placeId: prediction.placeId }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        onPlaceSelected({
          label: prediction.mainText,
          lat: loc.lat(),
          lng: loc.lng(),
        });
        setQuery('');
        setPredictions([]);
        setShowDropdown(false);
      }
    });
  }, [ensureServices, onPlaceSelected]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder="Search for a place..."
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-canvas border border-sand-200 text-sm text-heading placeholder-muted focus:outline-none focus:border-gamana-400 transition-colors"
        />
        {isSearching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gamana-400 animate-spin" />
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-surface rounded-xl shadow-elevated border border-border-default overflow-hidden">
          {predictions.map((p) => (
            <button
              key={p.placeId}
              onClick={() => handleSelect(p)}
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
  );
}

interface UnlockedStoryItem {
  story: Story;
  expires_at: string;
  is_expired: boolean;
}

interface CreateTourScreenProps {
  onClose: () => void;
  unlockedItems: UnlockedStoryItem[];
  unlockedLoading: boolean;
  location: LocationState;
  onSave: (data: {
    title: string;
    description: string;
    storyIds: string[];
    pinnedStops: { label: string; lat: number; lng: number }[];
  }) => Promise<boolean>;
}

export default function CreateTourScreen({
  onClose,
  unlockedItems,
  unlockedLoading,
  location,
  onSave,
}: CreateTourScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [pinnedStops, setPinnedStops] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [pinLabel, setPinLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [storySearch, setStorySearch] = useState('');

  const activeItems = unlockedItems.filter((i) => !i.is_expired);
  const expiredItems = unlockedItems.filter((i) => i.is_expired);
  const searchLower = storySearch.trim().toLowerCase();
  const filteredActiveItems = searchLower
    ? activeItems.filter((i) => i.story.title.toLowerCase().includes(searchLower))
    : activeItems;
  const filteredExpiredItems = searchLower
    ? expiredItems.filter((i) => i.story.title.toLowerCase().includes(searchLower))
    : expiredItems;
  const totalStops = selectedStoryIds.size + pinnedStops.length;
  const canSave = title.trim().length > 0 && totalStops > 0;

  const toggleStory = useCallback((storyId: string) => {
    setSelectedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  }, []);

  const handlePinLocation = useCallback(() => {
    if (!pinLabel.trim()) return;
    setPinnedStops((prev) => [
      ...prev,
      { label: pinLabel.trim(), lat: location.lat, lng: location.lng },
    ]);
    setPinLabel('');
  }, [pinLabel, location.lat, location.lng]);

  const removePinnedStop = useCallback((index: number) => {
    setPinnedStops((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setIsSaving(true);
    const success = await onSave({
      title: title.trim(),
      description: description.trim(),
      storyIds: Array.from(selectedStoryIds),
      pinnedStops,
    });
    setIsSaving(false);
    if (success) onClose();
  }, [canSave, title, description, selectedStoryIds, pinnedStops, onSave, onClose]);

  return (
    <div className="relative flex flex-col h-full bg-surface">
      <StatusBar />

      <div className="px-4 py-3 flex items-center gap-3 border-b border-sand-100">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={20} className="text-heading" />
        </button>
        <h1 className="text-base font-semibold text-heading flex-1">Create a Tour</h1>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-muted transition-colors"
        >
          <X size={18} className="text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
        <div className="mb-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tour name"
            className="w-full px-4 py-3 rounded-xl bg-canvas border border-sand-200 text-sm text-heading placeholder-muted focus:outline-none focus:border-gamana-400 focus:ring-1 focus:ring-gamana-400 transition-colors"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full px-4 py-3 mt-2 rounded-xl bg-canvas border border-sand-200 text-sm text-heading placeholder-muted focus:outline-none focus:border-gamana-400 focus:ring-1 focus:ring-gamana-400 transition-colors resize-none"
          />
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold text-body uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Headphones size={12} />
            Add unlocked stories
          </p>
          {!unlockedLoading && (activeItems.length > 0 || expiredItems.length > 0) && (
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                placeholder="Search stories..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-canvas border border-sand-200 text-sm text-heading placeholder-muted focus:outline-none focus:border-gamana-400 transition-colors"
              />
            </div>
          )}
          {unlockedLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-7 h-7 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
            </div>
          ) : activeItems.length === 0 && expiredItems.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">
              No unlocked stories yet. Unlock stories first to add them to your tour.
            </p>
          ) : filteredActiveItems.length === 0 && filteredExpiredItems.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">
              No stories match your search.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 rounded-xl">
              {filteredActiveItems.map(({ story, expires_at }) => {
                const isSelected = selectedStoryIds.has(story.id);
                const daysLeft = Math.max(0, Math.ceil((new Date(expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                const isExpiringSoon = daysLeft <= 5;
                return (
                  <button
                    key={story.id}
                    onClick={() => toggleStory(story.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? isExpiringSoon
                          ? 'bg-amber-50 border border-amber-300'
                          : 'bg-gamana-50 dark:bg-gamana-900/20 border border-gamana-300'
                        : isExpiringSoon
                          ? 'bg-amber-50/40 border border-amber-200/60 hover:border-amber-300'
                          : 'bg-canvas border border-transparent hover:border-sand-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? isExpiringSoon ? 'bg-amber-500' : 'bg-gamana-500'
                        : 'bg-surface-muted'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gamana-100">
                      {story.image_url && (
                        <img src={story.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                      {isExpiringSoon && (
                        <div className="absolute bottom-0 left-0 right-0 bg-amber-500 py-px">
                          <p className="text-[7px] font-bold text-white text-center leading-none">!</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[13px] font-medium text-heading truncate">{story.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted flex items-center gap-0.5">
                          <Clock size={9} />
                          {Math.round(story.duration_seconds / 60)}m
                        </span>
                        {isExpiringSoon ? (
                          <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
                            <AlertTriangle size={9} />
                            {daysLeft}d left
                          </span>
                        ) : (
                          <span className="text-[11px] text-gamana-500">{daysLeft}d left</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredExpiredItems.map(({ story }) => (
                <div
                  key={story.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt opacity-50"
                >
                  <div className="w-6 h-6 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={12} className="text-muted" />
                  </div>
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-muted grayscale">
                    {story.image_url && (
                      <img src={story.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-medium text-secondary truncate">{story.title}</p>
                    <span className="text-[11px] text-red-400">Expired</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-2">
          <p className="text-xs font-semibold text-body uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin size={12} />
            Pin a location
          </p>
          {MAPS_API_KEY ? (
            <PlacesAutocompleteInput
              onPlaceSelected={(place) => {
                setPinnedStops((prev) => [...prev, place]);
              }}
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={pinLabel}
                onChange={(e) => setPinLabel(e.target.value)}
                placeholder="Place name"
                className="flex-1 px-3 py-2.5 rounded-xl bg-canvas border border-sand-200 text-sm text-heading placeholder-muted focus:outline-none focus:border-gamana-400 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handlePinLocation()}
              />
              <button
                onClick={handlePinLocation}
                disabled={!pinLabel.trim()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gamana-100 text-gamana-600 text-xs font-medium hover:bg-gamana-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Navigation size={12} />
                Pin here
              </button>
            </div>
          )}
          {pinnedStops.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2">
              {pinnedStops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-canvas">
                  <MapPin size={12} className="text-gamana-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-heading truncate block">{stop.label}</span>
                    <span className="text-[10px] text-muted">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</span>
                  </div>
                  <button
                    onClick={() => removePinnedStop(i)}
                    className="text-muted hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-3 pb-8 border-t border-sand-100 bg-surface">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted">
            {totalStops} {totalStops === 1 ? 'stop' : 'stops'} added
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Tour'}
        </button>
      </div>
    </div>
  );
}
