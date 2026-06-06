import { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { Crosshair, Minus, Plus } from 'lucide-react';
import type { FamilyGroup, FamilyMember } from '../../types';
import { getMemberFreshness } from '../../types';
import FamilyMemberPin from './FamilyMemberPin';
import MemberDetailCard from './MemberDetailCard';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'water', stylers: [{ color: '#c9e8f4' }] },
  { featureType: 'landscape', stylers: [{ color: '#f0f0ec' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
];

function BoundsManager({ members }: { members: FamilyMember[] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (!map || hasFitted.current) return;
    const locatedMembers = members.filter(
      (m) => m.location && getMemberFreshness(m.location.timestamp) !== 'expired'
    );
    if (locatedMembers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    locatedMembers.forEach((m) => {
      if (m.location) bounds.extend({ lat: m.location.lat, lng: m.location.lng });
    });
    map.fitBounds(bounds, { top: 80, bottom: 100, left: 40, right: 40 });
    hasFitted.current = true;
  }, [map, members]);

  return null;
}

interface FamilyMapViewProps {
  group: FamilyGroup;
  onMessageMember?: (memberName: string) => void;
}

export default function FamilyMapView({ group, onMessageMember }: FamilyMapViewProps) {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const visibleMembers = group.members.filter((m) => {
    if (m.visibility === 'not_sharing' || m.visibility === 'hidden') return false;
    if (!m.location) return false;
    return getMemberFreshness(m.location.timestamp) !== 'expired';
  });

  const selfMember = group.members.find((m) => m.isSelf);
  const defaultCenter = selfMember?.location
    ? { lat: selfMember.location.lat, lng: selfMember.location.lng }
    : visibleMembers.length > 0 && visibleMembers[0].location
      ? { lat: visibleMembers[0].location!.lat, lng: visibleMembers[0].location!.lng }
      : { lat: 12.9716, lng: 77.5946 };

  const handlePinTap = useCallback((member: FamilyMember) => {
    setSelectedMember((prev) => (prev?.uid === member.uid ? null : member));
  }, []);

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={MAPS_API_KEY}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          mapId="family-tracking-map"
          style={{ width: '100%', height: '100%' }}
          styles={MAP_STYLES}
        >
          <BoundsManager members={visibleMembers} />

          {visibleMembers.map((member) => {
            if (!member.location) return null;
            const freshness = getMemberFreshness(member.location.timestamp);

            return (
              <AdvancedMarker
                key={member.uid}
                position={{ lat: member.location.lat, lng: member.location.lng }}
                zIndex={member.isSelf ? 100 : freshness === 'fresh' ? 50 : 10}
              >
                <FamilyMemberPin
                  member={member}
                  onTap={() => handlePinTap(member)}
                  showPulse={freshness === 'fresh'}
                />
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Zoom controls */}
      <div className="absolute right-3 top-20 flex flex-col gap-1 z-10">
        <MapControlButton icon={<Plus size={16} />} label="Zoom in" />
        <MapControlButton icon={<Minus size={16} />} label="Zoom out" />
        <div className="h-1" />
        <MapControlButton icon={<Crosshair size={16} />} label="Re-center" />
      </div>

      {/* Member detail card */}
      {selectedMember && (
        <MemberDetailCard
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onMessage={(name) => {
            setSelectedMember(null);
            onMessageMember?.(name);
          }}
        />
      )}
    </div>
  );
}

function MapControlButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="w-9 h-9 rounded-xl bg-surface/90 backdrop-blur-sm shadow-card flex items-center justify-center text-secondary hover:bg-surface hover:text-gamana-700 transition-colors border border-border-default/80"
    >
      {icon}
    </button>
  );
}
