import { useState, useEffect, useCallback, useRef } from 'react';
import type { FamilyGroup, TrackingMode, MemberRole } from '../types';
import { isChild } from '../types';
import {
  getFamilyGroups,
  saveFamilyGroups,
  createFamilyGroup,
  removeMemberFromGroup,
  deleteGroup,
  renameGroup,
  promoteMemberToAdmin,
  demoteMemberFromAdmin,
  setMemberRole,
  simulateMemberUpdates,
  getSelfUid,
} from '../lib/familyDb';
import { useBatteryLevel } from './useBatteryLevel';

const UPDATE_INTERVAL_MS = 10000;

export function useFamilyTracking() {
  const [groups, setGroups] = useState<FamilyGroup[]>(() => getFamilyGroups());
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('off');
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const battery = useBatteryLevel();
  const watchIdRef = useRef<number | null>(null);

  const selfUid = getSelfUid();
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;
  const selfMember = activeGroup?.members.find((m) => m.isSelf) ?? null;
  const selfIsChild = selfMember ? isChild(selfMember) : false;

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
        result.addEventListener('change', () => {
          setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
        });
      });
    }
  }, []);

  const updateSelfLocation = useCallback(
    (lat: number, lng: number, accuracy: number) => {
      setGroups((prev) => {
        const next = prev.map((g) => ({
          ...g,
          members: g.members.map((m) =>
            m.isSelf
              ? {
                  ...m,
                  location: { lat, lng, accuracy, timestamp: new Date().toISOString() },
                  battery: {
                    level: battery.level,
                    charging: battery.charging,
                    timestamp: new Date().toISOString(),
                  },
                  visibility: 'visible' as const,
                  trackingMode,
                }
              : m
          ),
        }));
        saveFamilyGroups(next);
        return next;
      });
    },
    [battery.level, battery.charging, trackingMode]
  );

  const startTracking = useCallback(
    (mode: TrackingMode) => {
      if (!navigator.geolocation) return;
      setTrackingMode(mode);

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      const wid = navigator.geolocation.watchPosition(
        (pos) => {
          updateSelfLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy
          );
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
      watchIdRef.current = wid;
    },
    [updateSelfLocation]
  );

  const stopTracking = useCallback(() => {
    if (selfIsChild) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingMode('off');

    setGroups((prev) => {
      const next = prev.map((g) => ({
        ...g,
        members: g.members.map((m) =>
          m.isSelf
            ? { ...m, visibility: 'not_sharing' as const, trackingMode: 'off' as const, location: null, battery: null }
            : m
        ),
      }));
      saveFamilyGroups(next);
      return next;
    });
  }, [selfIsChild]);

  const enableTracking = useCallback(() => {
    if (locationPermission === 'denied') {
      setShowPermissionScreen(true);
      return;
    }
    if (locationPermission === 'prompt') {
      setShowPermissionScreen(true);
      return;
    }
    startTracking('foreground');
  }, [locationPermission, startTracking]);

  const handlePermissionContinue = useCallback(() => {
    setShowPermissionScreen(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission('granted');
        updateSelfLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        startTracking('foreground');
      },
      () => {
        setLocationPermission('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [startTracking, updateSelfLocation]);

  const handlePermissionDismiss = useCallback(() => {
    setShowPermissionScreen(false);
  }, []);

  useEffect(() => {
    if (trackingMode === 'off') return;
    const interval = setInterval(() => {
      setGroups((prev) => {
        const next = simulateMemberUpdates(prev);
        saveFamilyGroups(next);
        return next;
      });
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [trackingMode]);

  const handleCreateGroup = useCallback((name: string) => {
    const newGroup = createFamilyGroup(name);
    setGroups(getFamilyGroups());
    setActiveGroupId(newGroup.id);
    return newGroup;
  }, []);

  const handleRemoveMember = useCallback((groupId: string, memberId: string) => {
    const updated = removeMemberFromGroup(groupId, memberId);
    setGroups(updated);
  }, []);

  const handleDeleteGroup = useCallback((groupId: string) => {
    const updated = deleteGroup(groupId);
    setGroups(updated);
    if (activeGroupId === groupId) setActiveGroupId(null);
  }, [activeGroupId]);

  const handleRenameGroup = useCallback((groupId: string, name: string) => {
    const updated = renameGroup(groupId, name);
    setGroups(updated);
  }, []);

  const handlePromoteToAdmin = useCallback((groupId: string, memberId: string) => {
    const updated = promoteMemberToAdmin(groupId, memberId);
    setGroups(updated);
  }, []);

  const handleDemoteFromAdmin = useCallback((groupId: string, memberId: string) => {
    const updated = demoteMemberFromAdmin(groupId, memberId);
    setGroups(updated);
  }, []);

  const handleSetMemberRole = useCallback((groupId: string, memberId: string, role: MemberRole) => {
    const updated = setMemberRole(groupId, memberId, role);
    setGroups(updated);
  }, []);

  return {
    groups,
    activeGroup,
    activeGroupId,
    setActiveGroupId,
    trackingMode,
    locationPermission,
    showPermissionScreen,
    selfUid,
    selfMember,
    selfIsChild,
    enableTracking,
    stopTracking,
    handlePermissionContinue,
    handlePermissionDismiss,
    handleCreateGroup,
    handleRemoveMember,
    handleDeleteGroup,
    handleRenameGroup,
    handlePromoteToAdmin,
    handleDemoteFromAdmin,
    handleSetMemberRole,
  };
}
