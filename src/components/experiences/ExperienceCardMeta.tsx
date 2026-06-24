import type { ExperienceListItemView } from '../../types/experience';
import { FORMAT_LABELS, VIBE_LABELS } from '../../lib/experience-mappers';
import {
  Clock3,
  Compass,
  Drama,
  LandPlot,
  Leaf,
  Lock,
  Mountain,
  Ship,
  Sunset,
  UsersRound,
  Users,
  XCircle,
  UtensilsCrossed,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const FORMAT_ICONS: Record<ExperienceListItemView['experienceFormat'], LucideIcon> = {
  walking_tour: Compass,
  food_drink: UtensilsCrossed,
  attraction: LandPlot,
  day_trip: Sunset,
  workshop: Wrench,
  nature_wildlife: Leaf,
  cruise_boat: Ship,
  adventure: Mountain,
  cultural_show: Drama,
  social_nightlife: Users,
};

export function FormatChip({ item }: { item: ExperienceListItemView }) {
  const label = FORMAT_LABELS[item.experienceFormat];
  const Icon = FORMAT_ICONS[item.experienceFormat];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-semibold text-white whitespace-nowrap">
      <Icon size={12} strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export function VibePill({ item }: { item: ExperienceListItemView }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full bg-gamana-500/80 text-[10px] font-semibold text-white whitespace-nowrap">
      {VIBE_LABELS[item.vibeTag]}
    </span>
  );
}

export function ExperiencePropertyLabels({ item }: { item: ExperienceListItemView }) {
  const labels = [
    {
      key: item.instantConfirmation ? 'instant' : 'on-request',
      label: item.instantConfirmation ? 'Instant confirmation' : 'On request',
      className: item.instantConfirmation
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-700 border-amber-200',
    },
    ...(item.freeCancellation
      ? [
          {
            key: 'free-cancellation',
            label: 'Free cancellation',
            className: 'bg-sky-50 text-sky-700 border-sky-200',
          },
        ]
      : []),
    ...(item.isPrivate
      ? [
          {
            key: 'private',
            label: 'Private experience',
            className: 'bg-violet-50 text-violet-700 border-violet-200',
          },
        ]
      : item.groupSizeMax <= 8
        ? [
            {
              key: 'small-group',
              label: 'Small group',
              className: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
            },
          ]
        : []),
  ];

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {labels.map(({ key, label, className }) => (
        <span
          key={key}
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${className}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function MicroBadges({ item }: { item: ExperienceListItemView }) {
  const badges = [
    {
      key: item.instantConfirmation ? 'instant' : 'on-request',
      icon: item.instantConfirmation ? Zap : Clock3,
      label: item.instantConfirmation ? 'Instant confirmation' : 'On request',
    },
    ...(item.freeCancellation
      ? [{ key: 'free-cancellation', icon: XCircle, label: 'Free cancellation' }]
      : []),
    ...(item.isPrivate
      ? [{ key: 'private', icon: Lock, label: 'Private experience' }]
      : item.groupSizeMax <= 8
        ? [{ key: 'small-group', icon: UsersRound, label: 'Small group' }]
        : []),
  ].slice(0, 3);

  return (
    <div className="flex items-center gap-1">
      {badges.map(({ key, icon: Icon, label }) => (
        <span
          key={key}
          className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-[11px] leading-none"
          aria-label={label}
          title={label}
        >
          <Icon size={13} className="text-white" strokeWidth={2} aria-hidden />
        </span>
      ))}
    </div>
  );
}

export function ExperienceMetaLine({ item }: { item: ExperienceListItemView }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted flex-wrap">
      <span>⭐ {item.ratingValue?.toFixed(1) ?? '4.5'}</span>
      {item.durationLabel && (
        <>
          <span>·</span>
          <span>{item.durationLabel}</span>
        </>
      )}
      {item.bookingsThisWeek >= 3 && (
        <>
          <span>·</span>
          <span>Booked {item.bookingsThisWeek}x this week</span>
        </>
      )}
    </div>
  );
}

export function InlineFormatVibePills({ item }: { item: ExperienceListItemView }) {
  const label = FORMAT_LABELS[item.experienceFormat];
  const Icon = FORMAT_ICONS[item.experienceFormat];
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-1">
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gamana-500/10 text-[9px] font-semibold text-gamana-700">
        <Icon size={11} strokeWidth={2} aria-hidden />
        <span>{label}</span>
      </span>
      <span className="px-1.5 py-0.5 rounded-full bg-gamana-500/15 text-[9px] font-semibold text-gamana-600">
        {VIBE_LABELS[item.vibeTag]}
      </span>
    </div>
  );
}
