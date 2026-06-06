import { useState } from 'react';
import {
  Clock,
  Globe,
  MapPin,
  RefreshCw,
  Users,
  Zap,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import type { Experience } from '../../../types/experience';
import { formatDurationLabel } from '../../../lib/experience-mappers';

interface FactRowProps {
  icon: typeof Clock;
  title: string;
  detail: string;
}

function FactRow({ icon: Icon, title, detail }: FactRowProps) {
  return (
    <div className="flex gap-3 py-3 px-4">
      <Icon size={16} className="text-gamana-500 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-heading">{title}</p>
        <p className="text-xs text-muted mt-1 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

const GROUP_LABELS: Record<string, string> = {
  private: 'Private group',
  small_group: 'Small group',
  shared: 'Shared experience',
};

const PREVIEW_COUNT = 4;

interface ExperienceActivityFactsProps {
  experience: Experience;
}

export default function ExperienceActivityFacts({ experience }: ExperienceActivityFactsProps) {
  const [expanded, setExpanded] = useState(false);
  const facts: FactRowProps[] = [];

  if (experience.freeCancellationHours != null) {
    facts.push({
      icon: RefreshCw,
      title: 'Free cancellation',
      detail: `Cancel up to ${experience.freeCancellationHours} hours before for a full refund`,
    });
  } else if (experience.cancellationPolicy) {
    facts.push({
      icon: RefreshCw,
      title: 'Cancellation',
      detail: experience.cancellationPolicy,
    });
  }

  if (experience.reserveNowPayLater) {
    facts.push({
      icon: CreditCard,
      title: 'Reserve now & pay later',
      detail: 'Book now and pay nothing today',
    });
  }

  if (experience.durationMinutes) {
    facts.push({
      icon: Clock,
      title: 'Duration',
      detail: `${formatDurationLabel(experience.durationMinutes)} — see Dates for start times`,
    });
  }

  if (experience.languages.length > 0) {
    facts.push({
      icon: Globe,
      title: 'Languages',
      detail: experience.languages.join(', '),
    });
  }

  if (experience.pickupAvailable) {
    facts.push({
      icon: MapPin,
      title: 'Pickup included',
      detail: 'Check availability for pickup areas',
    });
  } else if (experience.meetingPointText) {
    facts.push({
      icon: MapPin,
      title: 'Meeting point',
      detail: experience.meetingPointText,
    });
  }

  if (experience.groupType) {
    facts.push({
      icon: Users,
      title: GROUP_LABELS[experience.groupType] ?? 'Group',
      detail:
        experience.groupType === 'private'
          ? 'Reserved for your party'
          : 'Join other travellers',
    });
  }

  if (experience.instantConfirmation) {
    facts.push({
      icon: Zap,
      title: 'Instant confirmation',
      detail: 'Confirmed right after booking',
    });
  }

  if (facts.length === 0) return null;

  const visible = expanded ? facts : facts.slice(0, PREVIEW_COUNT);
  const hasMore = facts.length > PREVIEW_COUNT;

  return (
    <div className="divide-y divide-gamana-100/80 rounded-xl border border-gamana-100 bg-surface overflow-hidden">
      {visible.map((f) => (
        <FactRow key={f.title} {...f} />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-center gap-1 py-2.5 px-4 text-xs font-semibold text-gamana-500 hover:bg-gamana-500/5"
        >
          {expanded ? 'Show less' : `Show ${facts.length - PREVIEW_COUNT} more`}
          <ChevronDown size={14} className={expanded ? 'rotate-180' : ''} />
        </button>
      )}
    </div>
  );
}
