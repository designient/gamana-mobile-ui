import { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchResults } from '../types';
import { searchAll } from '../lib/localDb';
import { searchExperiences } from '../lib/experience-mock-api';

const RECENT_KEY = 'gamana_recent_searches';
const MAX_RECENT = 8;
const DEBOUNCE_MS = 200;

const EMPTY_RESULTS: SearchResults = {
  stories: [],
  topics: [],
  narrators: [],
  cities: [],
  experiences: [],
  total: 0,
};

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(items: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY_RESULTS);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const base = searchAll(query);
      const experiences = searchExperiences(query, 'Bengaluru');
      setResults({
        ...base,
        experiences,
        total: base.total + experiences.length,
      });
      setIsSearching(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  const commitSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  return { query, setQuery, results, isSearching, recentSearches, commitSearch, clearRecent };
}
