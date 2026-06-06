import { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Search, X, Clock, ArrowRight, MapPin, Mic, Hash,
  Globe, MessageSquarePlus, Flame, Landmark, TreePine, Store,
} from 'lucide-react';
import type { Story, Narrator, Topic, City } from '../../types';
import { useSearch } from '../../hooks/useSearch';
import { useOrgContext } from '../../hooks/useOrgContext';
import { getCities, getTopics } from '../../lib/localDb';
import { BENGALURU_CITY_ID } from '../../lib/constants';
import StatusBar from '../layout/StatusBar';
import BottomTabBar from '../layout/BottomTabBar';
import MiniPlayer from '../overlays/MiniPlayer';
import PlayButton from '../shared/PlayButton';
import DurationBadge from '../shared/DurationBadge';
import TrustChip from '../shared/TrustChip';
import AudioWave from '../shared/AudioWave';
import OfflineBadge from '../shared/OfflineBadge';
import ConnectivityStrip from '../shared/ConnectivityStrip';
import { useDownloadState } from '../../hooks/useDownloadState';

// ---------------------------------------------------------------------------
// Suggested data for idle state
// ---------------------------------------------------------------------------
const POPULAR_SEARCHES = [
  'Lalbagh', 'Temples', 'Palace', 'Colonial history', 'Markets',
];

const TOPIC_ICONS: Record<string, typeof Flame> = {
  Flame, Landmark, TreePine, Store,
};

// ---------------------------------------------------------------------------
// Compact result row for stories
// ---------------------------------------------------------------------------
function StoryRow({
  story, isPlaying, onPlay, onTap,
}: {
  story: Story; isPlaying: boolean; onPlay: () => void; onTap: () => void;
}) {
  const { downloadState } = useDownloadState('story', story.id);
  const badgeStatus = downloadState.status === 'ready' ? 'ready' as const : downloadState.status === 'downloading' || downloadState.status === 'queued' ? 'downloading' as const : 'available' as const;

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all">
      <button onClick={onTap} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-gamana-50 dark:bg-gamana-900/20">
          {story.image_url ? (
            <img src={story.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin size={16} className="text-gamana-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="text-[13px] font-medium text-heading truncate">{story.title}</h4>
            {isPlaying && <AudioWave />}
          </div>
          <p className="text-[11px] text-muted truncate">{story.subtitle}</p>
          <div className="flex items-center gap-2 mt-1">
            <DurationBadge seconds={story.duration_seconds} />
            <TrustChip level={story.trust_level} />
            <OfflineBadge status={badgeStatus} compact />
          </div>
        </div>
      </button>
      <PlayButton size="sm" isPlaying={isPlaying} onClick={onPlay} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact row for topics
// ---------------------------------------------------------------------------
function TopicRow({ topic, onTap }: { topic: Topic; onTap: () => void }) {
  const Icon = TOPIC_ICONS[topic.icon_name] ?? Hash;
  return (
    <button
      onClick={onTap}
      className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all w-full text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-gamana-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-medium text-heading truncate">{topic.title}</h4>
        <p className="text-[11px] text-muted truncate">{topic.subtitle}</p>
      </div>
      <span className="text-[11px] text-faint font-medium flex-shrink-0">{topic.story_count} stories</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Compact row for narrators
// ---------------------------------------------------------------------------
function NarratorRow({ narrator }: { narrator: Narrator }) {
  const initials = narrator.name.slice(0, 1).toUpperCase();
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface shadow-card w-full text-left">
      <div className="w-9 h-9 rounded-full bg-gamana-100 flex items-center justify-center flex-shrink-0 text-gamana-600 text-sm font-semibold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-medium text-heading">{narrator.name}</h4>
        <div className="flex items-center gap-1.5">
          <Mic size={10} className="text-gamana-400" />
          <span className="text-[11px] text-muted">{narrator.style}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact row for cities
// ---------------------------------------------------------------------------
function CityRow({ city, onTap }: { city: City; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all w-full text-left"
    >
      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-gamana-50 dark:bg-gamana-900/20">
        {city.image_url ? (
          <img src={city.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe size={16} className="text-gamana-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-medium text-heading">{city.name}</h4>
        <p className="text-[11px] text-muted truncate">{city.country}</p>
      </div>
      <ArrowRight size={14} className="text-faint flex-shrink-0" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------
function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between mb-2 mt-5 first:mt-0">
      <h3 className="text-xs font-semibold text-body uppercase tracking-wide">{label}</h3>
      <span className="text-[11px] text-muted">{count}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main SearchScreen
// ---------------------------------------------------------------------------
interface SearchScreenProps {
  player: {
    currentStory: Story | null;
    isPlaying: boolean;
    progress: number;
    playStory: (story: Story, narrator: Narrator | null) => void;
    togglePlay: () => void;
  };
  currentNarrator: Narrator | null;
  onNavigateToStory: (storyId: string) => void;
  onTabChange: (tab: 'home' | 'library' | 'search' | 'profile' | 'alerts') => void;
}

export default function SearchScreen({
  player,
  currentNarrator,
  onNavigateToStory,
  onTabChange,
}: SearchScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isSearching, recentSearches, commitSearch, clearRecent } = useSearch();
  const { config: orgConfig } = useOrgContext();

  const filteredResults = useMemo(
    () =>
      orgConfig.enabledRegions.length > 0 && results
        ? {
            ...results,
            stories: results.stories.filter((s) => orgConfig.enabledRegions.includes(s.city_id)),
            cities: results.cities.filter((c) => orgConfig.enabledRegions.includes(c.id)),
            total: results.total,
          }
        : results,
    [results, orgConfig.enabledRegions],
  );

  const suggestedCities = useMemo(() => getCities(), []);
  const popularTopics = useMemo(() => getTopics(BENGALURU_CITY_ID), []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const applySearch = useCallback((term: string) => {
    setQuery(term);
    commitSearch(term);
  }, [setQuery, commitSearch]);

  const handlePlayStory = useCallback((story: Story) => {
    if (player.currentStory?.id === story.id) {
      player.togglePlay();
    } else {
      player.playStory(story, currentNarrator);
    }
  }, [player, currentNarrator]);

  const hasQuery = query.trim().length > 0;

  // ------------------------------------------------------------------
  // Idle state (no query)
  // ------------------------------------------------------------------
  function renderIdle() {
    return (
      <div className="px-4 pt-4 pb-4">
        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-semibold text-heading">Recent</h3>
              <button onClick={clearRecent} className="text-xs text-gamana-500 font-medium">Clear</button>
            </div>
            <div className="space-y-0.5">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => applySearch(term)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-surface transition-colors group"
                >
                  <Clock size={14} className="text-faint flex-shrink-0" />
                  <span className="flex-1 text-sm text-heading text-left truncate">{term}</span>
                  <ArrowRight size={14} className="text-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Popular searches */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-heading mb-2.5">Popular searches</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => applySearch(term)}
                className="px-3 py-1.5 rounded-full bg-surface border border-border-default text-[13px] text-body font-medium hover:bg-gamana-50 dark:hover:bg-gamana-900/20 hover:border-gamana-200 transition-colors active:scale-[0.97]"
              >
                {term}
              </button>
            ))}
          </div>
        </section>

        {/* Suggested cities */}
        {suggestedCities.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-heading mb-2.5">Explore cities</h3>
            <div className="space-y-2">
              {suggestedCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => applySearch(city.name)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all w-full text-left"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gamana-50 dark:bg-gamana-900/20">
                    {city.image_url ? (
                      <img src={city.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Globe size={18} className="text-gamana-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-heading">{city.name}</h4>
                    <p className="text-xs text-muted truncate">{city.description}</p>
                  </div>
                  <ArrowRight size={14} className="text-faint flex-shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Popular topics */}
        {popularTopics.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-heading mb-2.5">Popular topics</h3>
            <div className="grid grid-cols-2 gap-2">
              {popularTopics.map((topic) => {
                const Icon = TOPIC_ICONS[topic.icon_name] ?? Hash;
                return (
                  <button
                    key={topic.id}
                    onClick={() => applySearch(topic.title.split(' & ')[0])}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all text-left active:scale-[0.97]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-gamana-500" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-heading leading-tight line-clamp-1">{topic.title}</span>
                      <p className="text-[10px] text-muted mt-0.5">{topic.story_count} stories</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Empty state (query, no results)
  // ------------------------------------------------------------------
  function renderEmpty() {
    return (
      <div className="px-4 pt-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-canvas flex items-center justify-center mb-4">
          <Search size={28} className="text-faint" />
        </div>
        <h3 className="text-base font-semibold text-heading mb-1">No results for "{query}"</h3>
        <p className="text-sm text-muted leading-relaxed mb-6 max-w-[260px] mx-auto">
          We couldn't find anything matching that. Try a different term or explore below.
        </p>

        <div className="space-y-2 text-left">
          <button
            onClick={() => { setQuery(''); }}
            className="flex items-center gap-3 w-full p-3.5 rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
              <Globe size={16} className="text-gamana-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-heading">Explore cities</h4>
              <p className="text-[11px] text-muted">Browse all available cities</p>
            </div>
            <ArrowRight size={14} className="text-faint" />
          </button>

          <button className="flex items-center gap-3 w-full p-3.5 rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all">
            <div className="w-9 h-9 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
              <MessageSquarePlus size={16} className="text-gamana-500" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-sm font-medium text-heading">Request a story</h4>
              <p className="text-[11px] text-muted">Tell us what you'd like to hear</p>
            </div>
            <ArrowRight size={14} className="text-faint" />
          </button>
        </div>

        {popularTopics.length > 0 && (
          <div className="mt-6 text-left">
            <h3 className="text-sm font-semibold text-heading mb-2.5">Popular topics</h3>
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applySearch(t.title.split(' & ')[0])}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border-default text-[13px] text-body font-medium hover:bg-gamana-50 dark:hover:bg-gamana-900/20 transition-colors"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Grouped results
  // ------------------------------------------------------------------
  function renderResults() {
    const { stories, topics, narrators, cities, total } = filteredResults;

    return (
      <div className="px-4 pt-3 pb-4">
        <p className="text-[11px] text-muted font-medium mb-1">
          {total} {total === 1 ? 'result' : 'results'}
        </p>

        {/* Stories */}
        {stories.length > 0 && (
          <div>
            <SectionHeader label="Stories" count={stories.length} />
            <div className="space-y-2">
              {stories.map((story) => (
                <StoryRow
                  key={story.id}
                  story={story}
                  isPlaying={player.isPlaying && player.currentStory?.id === story.id}
                  onPlay={() => handlePlayStory(story)}
                  onTap={() => {
                    commitSearch(query);
                    onNavigateToStory(story.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <div>
            <SectionHeader label="Topics" count={topics.length} />
            <div className="space-y-2">
              {topics.map((topic) => (
                <TopicRow
                  key={topic.id}
                  topic={topic}
                  onTap={() => applySearch(topic.title.split(' & ')[0])}
                />
              ))}
            </div>
          </div>
        )}

        {/* Narrators */}
        {narrators.length > 0 && (
          <div>
            <SectionHeader label="Narrators" count={narrators.length} />
            <div className="space-y-2">
              {narrators.map((n) => (
                <NarratorRow key={n.id} narrator={n} />
              ))}
            </div>
          </div>
        )}

        {/* Cities */}
        {cities.length > 0 && (
          <div>
            <SectionHeader label="Cities" count={cities.length} />
            <div className="space-y-2">
              {cities.map((city) => (
                <CityRow
                  key={city.id}
                  city={city}
                  onTap={() => applySearch(city.name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Content router
  // ------------------------------------------------------------------
  function renderContent() {
    if (!hasQuery) return renderIdle();
    if (isSearching) {
      return (
        <div className="flex flex-col items-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
          <p className="text-sm text-muted mt-3">Searching…</p>
        </div>
      );
    }
    if (filteredResults.total === 0) return renderEmpty();
    return renderResults();
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="relative flex flex-col h-full bg-canvas">
      <StatusBar />

      {/* Search bar */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border-default/60">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-canvas border border-transparent focus-within:border-gamana-300 focus-within:bg-surface transition-all">
            <Search size={18} className="text-gamana-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitSearch(query); }}
              placeholder="Stories, places, topics, narrators…"
              className="flex-1 bg-transparent text-sm text-heading placeholder:text-muted outline-none"
            />
            {hasQuery && (
              <button
                onClick={() => setQuery('')}
                className="p-0.5 rounded-full hover:bg-surface-muted transition-colors"
              >
                <X size={16} className="text-muted" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ConnectivityStrip />

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {renderContent()}
      </div>

      {/* Mini player */}
      {player.currentStory && (
        <div className="absolute bottom-16 left-0 right-0 z-30">
          <MiniPlayer
            story={player.currentStory}
            narrator={currentNarrator}
            isPlaying={player.isPlaying}
            progress={player.progress}
            onTogglePlay={player.togglePlay}
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="sticky bottom-0 z-20">
        <BottomTabBar
          activeTab="search"
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
}
