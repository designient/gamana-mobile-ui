import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { getUserProfile } from '../lib/localDb';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(() => {
    setProfile(getUserProfile());
    setIsLoading(false);
  }, []);

  const updateBalance = useCallback((newBalance: number) => {
    setProfile((prev) => prev ? { ...prev, coin_balance: newBalance } : prev);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    balance: profile?.coin_balance ?? 0,
    isLoading,
    refresh: fetchProfile,
    updateBalance,
  };
}
