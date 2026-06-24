# Gamana × Bókun — Simplification & Enhancement Prompts
# Execute in order A → H. Each modifies existing code from the 10-arc build.
# Re-read every listed file fresh before editing — files have changed since the original build.

---

# PROMPT A — Card Redesign System

## Read these files first
- `src/components/experiences/ExperienceCard.tsx`
- `src/components/experiences/ExperienceBookCard.tsx`
- `src/components/experiences/ExperienceFilterBar.tsx` (or `ExperienceFilterSheet.tsx`)
- `src/types/experience.ts`
- `src/lib/experience-seed-data.ts`
- `src/lib/experience-mappers.ts`

## What to build

### 1. New fields on `Experience` type (`src/types/experience.ts`)
Add as optional fields:
```ts
experienceFormat?: ExperienceFormat;
vibeTag?: VibeTag;
groupSizeMax?: number;       // default 12 if absent
isPrivate?: boolean;          // default false if absent
bookingsThisWeek?: number;    // default 0 if absent
freeCancellation?: boolean;   // derived from cancellationPolicy if absent

export type ExperienceFormat =
  | 'walking_tour' | 'food_drink' | 'attraction' | 'day_trip'
  | 'workshop' | 'nature_wildlife' | 'cruise_boat' | 'adventure'
  | 'cultural_show' | 'social_nightlife';

export type VibeTag =
  | 'chill' | 'social' | 'active' | 'deep_dive' | 'date_worthy'
  | 'hidden_gem' | 'iconic' | 'morning' | 'sunset' | 'solo_friendly';
```

### 2. `deriveExperienceFormat(experience)` in `src/lib/experience-mappers.ts`
Pure function, no side effects. Returns `experienceFormat` if already set, else applies this ruleset in order (first match wins):

```ts
export function deriveExperienceFormat(exp: Experience): ExperienceFormat {
  if (exp.experienceFormat) return exp.experienceFormat;

  const cat = exp.category?.toLowerCase() ?? '';
  const dur = exp.durationMinutes ?? 0;

  if (exp.experienceType === 'Attraction Ticket') return 'attraction';
  if (dur >= 240) return 'day_trip';
  if (cat.includes('food') || cat.includes('drink')) return 'food_drink';
  if (cat.includes('workshop') || cat.includes('craft')) return 'workshop';
  if (cat.includes('nature') || cat.includes('wildlife') || cat.includes('park')) return 'nature_wildlife';
  if (cat.includes('adventure') || cat.includes('trek')) return 'adventure';
  if (cat.includes('nightlife') || cat.includes('bar')) return 'social_nightlife';
  if (cat.includes('cruise') || cat.includes('boat') || cat.includes('backwater')) return 'cruise_boat';
  if (cat.includes('spiritual') || cat.includes('temple') || cat.includes('ritual')) return 'cultural_show';
  if (cat.includes('walking') || cat.includes('heritage')) return 'walking_tour';

  // Fallback by duration
  if (dur > 0 && dur <= 120) return 'walking_tour';
  return 'attraction';
}
```

### 3. `deriveVibeTag(experience)` in `src/lib/experience-mappers.ts`
```ts
export function deriveVibeTag(exp: Experience): VibeTag {
  if (exp.vibeTag) return exp.vibeTag;

  if (exp.isPrivate) return 'date_worthy';
  if ((exp.groupSizeMax ?? 12) <= 4) return 'solo_friendly';
  if (exp.durationMinutes && exp.durationMinutes >= 240) return 'deep_dive';
  if ((exp.bookingsThisWeek ?? 0) >= 10) return 'iconic';
  if ((exp.bookingsThisWeek ?? 0) <= 2) return 'hidden_gem';

  const format = deriveExperienceFormat(exp);
  if (format === 'food_drink' || format === 'social_nightlife') return 'social';
  if (format === 'adventure' || format === 'nature_wildlife') return 'active';
  if (format === 'walking_tour' || format === 'attraction') return 'chill';

  return 'chill';
}
```

### 4. Format → icon/label map (export from `experience-mappers.ts`)
```ts
export const FORMAT_LABELS: Record<ExperienceFormat, { icon: string; label: string }> = {
  walking_tour:    { icon: '🚶', label: 'Walking Tour' },
  food_drink:      { icon: '🍽', label: 'Food & Drink' },
  attraction:      { icon: '🏛', label: 'Attraction' },
  day_trip:        { icon: '🌅', label: 'Day Trip' },
  workshop:        { icon: '🧘', label: 'Workshop' },
  nature_wildlife: { icon: '🌿', label: 'Nature & Wildlife' },
  cruise_boat:     { icon: '🚤', label: 'Cruise / Boat' },
  adventure:       { icon: '🏕', label: 'Adventure' },
  cultural_show:   { icon: '🎭', label: 'Cultural Show' },
  social_nightlife:{ icon: '🎉', label: 'Social / Nightlife' },
};

export const VIBE_LABELS: Record<VibeTag, string> = {
  chill: 'Chill', social: 'Social', active: 'Active', deep_dive: 'Deep Dive',
  date_worthy: 'Date-worthy', hidden_gem: 'Hidden Gem', iconic: 'Iconic',
  morning: 'Morning', sunset: 'Sunset', solo_friendly: 'Solo-friendly',
};
```

### 5. Seed data updates (`src/lib/experience-seed-data.ts`)
Do NOT hand-author `experienceFormat`/`vibeTag` per experience. Instead, add to each of the 16 experiences only the three new raw fields, using these rules:
- `groupSizeMax`: if the experience is a private/premium type (silk weaving workshop, any "private" in title) → `4`. Otherwise → `12`.
- `isPrivate`: `true` only for `silk-weaving-workshop` and any experience with "private" in the title. Else `false`.
- `bookingsThisWeek`: Heritage/Food category → random integer 8–18. Workshop/Spiritual/Niche → random integer 0–5. Everything else → random integer 4–10. Use a seeded/deterministic value (e.g. based on `id` hash), not `Math.random()`, so values are stable across reloads.
- `freeCancellation`: `true` if `cancellationPolicy` string contains "free" (case-insensitive) or "24h" or "48h". Else `false`.

Write a small helper `seedExtraFields(exp: Partial<Experience>): Partial<Experience>` in `experience-seed-helpers.ts` that computes these four fields from existing data, and apply it to all 16 experiences via `.map()` at the bottom of `experience-seed-data.ts`. Do not hardcode per-experience — compute programmatically so it stays correct if seed data changes.

### 6. Redesign `ExperienceCard.tsx` and `ExperienceBookCard.tsx`

**Image overlay zones (absolute positioned over the hero image):**

| Zone | Content |
| --- | --- |
| Top-right | Price badge (unchanged) |
| Top-left | Format chip: `{icon} {label}` from `FORMAT_LABELS[deriveExperienceFormat(exp)]`. Small pill, `bg-black/50 text-white`. |
| Bottom-left | Vibe tag: `VIBE_LABELS[deriveVibeTag(exp)]`. Small pill, `bg-gamana-500/80 text-white`. |
| Bottom-right | Icon-only micro-badges, stacked horizontally, each in a small circular `bg-black/40` chip: (1) ⚡ if `instantConfirmation`, 🕐 if not (2) ✕ if `freeCancellation` (3) 👥 if `groupSizeMax <= 8`, 🔒 if `isPrivate` |

**Content area meta line — replace "Guided" text:**
```tsx
<div className="flex items-center gap-2 text-[10px] text-muted">
  <span>⭐ {exp.ratingValue?.toFixed(1) ?? '4.5'}</span>
  <span>·</span>
  <span>{durationLabel}</span>
  {(exp.bookingsThisWeek ?? 0) >= 3 && (
    <>
      <span>·</span>
      <span>Booked {exp.bookingsThisWeek}x this week</span>
    </>
  )}
</div>
```
If `bookingsThisWeek < 3`, omit that segment entirely — do not show "Booked 0 times" or "Booked 1 time".

### 7. Apply to `ExperienceTileWidget` pattern too
If there's a shared tile component used in Tours/Activities/Search lists (check `ExperienceFilterBar.tsx` imports for the tile component name), apply the same format chip + vibe tag treatment in a horizontal-tile layout: format icon + vibe tag as small inline pills before the title, micro-badges as a row after the meta line.

## Requirements
1. `deriveExperienceFormat` and `deriveVibeTag` must be pure functions — same input always produces same output.
2. Social proof line never shows for `bookingsThisWeek < 3`.
3. Micro-badges are icon-only, no text labels, max 3 per card.
4. All new Tailwind classes must use existing colour tokens (`gamana-500`, etc).

## Do NOT
- Do not hand-write `experienceFormat`/`vibeTag` values into seed data — compute via the derive functions.
- Do not break existing card click handlers or layout dimensions (254×245 for home cards).

---

# PROMPT B — Booking Flow Consolidation (5 steps → 2)

## Read these files first
- `src/components/experiences/booking/DatePaxSheet.tsx`
- `src/components/experiences/booking/TimeSlotScreen.tsx`
- `src/components/experiences/booking/PickupSelectionScreen.tsx`
- `src/components/experiences/booking/BookingQuestionsScreen.tsx`
- `src/components/experiences/booking/OrderSummaryScreen.tsx`
- `src/lib/experience-booking-flow.ts`
- `src/components/experiences/ExperienceDetailScreen.tsx`
- `src/App.tsx`
- `src/types/index.ts`

## New flow
```
ExperienceDetailScreen
  └─ DatePaxSheet (date + pax + time, single sheet, two internal steps)
        └─ BookingQuestionsScreen (questions + pickup, if applicable)
              └─ OrderSummaryScreen
                    └─ BookingWebViewScreen
```

`booking_timeslot` and `booking_pickup` routes are removed entirely.

## What to build

### 1. `DatePaxSheet.tsx` — add internal time-slot step
The sheet gets an internal `step` state: `'date_pax' | 'time'`.

**Step `date_pax`** (existing UI, unchanged): calendar chips + pax controls. "Continue" button:
- If `experience.instantConfirmation === false` (on-request) OR `experience.experienceType === 'Attraction Ticket'` (pass type, no slots) → skip time step, call `onContinue({ ...state, selectedTime: null })` directly, closing the sheet.
- Else → transition `step` to `'time'` (slide content, same sheet, do not close).

**Step `time`**: import slot-grid rendering logic from `TimeSlotScreen.tsx` and render inline within the sheet — date recap chip at top (now showing the selected date from step 1), 2-column slot grid using `getMockSlots(selectedDate)`, back chevron to return to `date_pax` step. "Confirm time →" button calls `onContinue({ ...state, selectedTime })` and closes the sheet.

Sheet height should grow to accommodate the slot grid — use `max-h-[85vh]` with internal scroll if needed.

Updated `onContinue` signature:
```ts
onContinue: (state: {
  selectedDate: string;
  selectedTime: string | null;
  adults: number;
  children: number;
  seniors: number;
  totalPrice: number;
}) => void;
```

### 2. `BookingQuestionsScreen.tsx` — absorb pickup selection
Read `PickupSelectionScreen.tsx` for the existing pickup UI patterns (toggle, grouped list, search).

For experiences where `meetingType === 'pick_up' || meetingType === 'meet_or_pickup'`, prepend a pickup question block to the questions list, rendered with the same visual treatment as other question blocks:

- Section heading: "Where should we pick you up?"
- If `meetingType === 'meet_or_pickup'`: `ToggleButtons`-equivalent — "Meet at location" / "Hotel pickup"
- If "Hotel pickup" selected (or `meetingType === 'pick_up'` forces this): render the grouped pickup location list (Hotels / Metro / Landmarks) from `PICKUP_LOCATIONS`, same as the old `PickupSelectionScreen`
- Selection stored in local state, included in `onContinue` payload

Updated `onContinue` signature:
```ts
onContinue: (payload: {
  answers: Record<string, string | string[]>;
  pickupLocationId: string | null;
}) => void;
```

Required-field validation now also covers pickup selection when applicable (if `meetingType === 'pick_up'`, a pickup location must be selected to enable Continue).

### 3. Delete unused files
Delete `src/components/experiences/booking/TimeSlotScreen.tsx` and `src/components/experiences/booking/PickupSelectionScreen.tsx` after extracting their logic per steps 1–2. If deletion causes import errors elsewhere, fix the imports rather than leaving dead files.

### 4. `src/types/index.ts`
Remove:
```ts
| { screen: 'booking_timeslot'; ... }
| { screen: 'booking_pickup'; ... }
```

`booking_questions` route params simplify to:
```ts
| { screen: 'booking_questions'; experienceId: string; slug: string; selectedDate: string; selectedTime: string | null; adults: number; children: number; seniors: number; totalPrice: number }
```

### 5. `src/App.tsx`
Remove `handleNavigateToBookingTimeslot` and `handleNavigateToBookingPickup` and their `renderScreen()` cases.

Update `ExperienceDetailScreen`'s `DatePaxSheet` `onContinue` to navigate directly to `booking_questions` with the full state (including `selectedTime`).

Update `BookingQuestionsScreen`'s case to pass `pickupLocationId` through to `booking_review`'s `flowState`.

### 6. Progress indicator
Update step-dot indicators across `BookingQuestionsScreen` and `OrderSummaryScreen` from "4-5 dots" to "2 dots" (Details → Review).

## Requirements
1. `DatePaxSheet` never closes between `date_pax` and `time` steps — same sheet, internal transition, slide animation (`translate-x`, 200ms).
2. On-request and pass-type experiences skip the `time` step automatically — verify with `silk-weaving-workshop` (on-request) and the museum/attraction-ticket experience.
3. Pickup-required experiences (`iskcon-temple-spiritual-tour` or similar) must show the pickup block in `BookingQuestionsScreen` and block Continue until selected.

## Do NOT
- Do not create new route files. This prompt only consolidates existing ones.
- Do not change `OrderSummaryScreen`'s external props beyond what's needed to receive `pickupLocationId` from the merged flow.

---

# PROMPT C — Cancellation Consolidation (3 routes → 1)

## Read these files first
- `src/components/experiences/bookings/CancelBookingScreen.tsx`
- `src/components/experiences/bookings/CancellationConfirmedScreen.tsx`
- `src/components/experiences/bookings/RefundStatusScreen.tsx`
- `src/components/experiences/bookings/BookingDetailScreen.tsx`
- `src/lib/experience-bookings-mock.ts`
- `src/App.tsx`
- `src/types/index.ts`

## New flow
```
BookingDetailScreen (upcoming, confirmed)
  └─ CancelBookingScreen
        └─ onConfirm → mutate booking status to 'cancelled' in mock store
                     → toast "Booking cancelled · ₹X refund initiated"
                     → navigate back to BookingDetailScreen
                          (now renders cancelled state with inline RefundStepper)
```

`cancellation_confirmed` and `refund_status` routes are removed.

## What to build

### 1. New component `src/components/experiences/bookings/RefundStepper.tsx`
Extract the 4-step vertical stepper from `RefundStatusScreen.tsx` into a standalone, reusable, collapsible component.

```ts
interface RefundStepperProps {
  refundAmount: number;
  cancelledAt: string; // ISO date
  operatorName: string;
  defaultExpanded?: boolean;
}
```

Renders: collapsed = single row "Refund of ₹{amount} · Processing →" with chevron. Expanded = full 4-step stepper (Cancellation Confirmed ✓ → Refund Initiated ✓ → Processing with Bank ◷ pulsing → Refund Received ○) + expected-by date + contact card. Tap row to toggle.

### 2. `src/lib/experience-bookings-mock.ts`
Add a mutation helper (in-memory, no persistence):
```ts
export function cancelBooking(bookingId: string, reason?: string): BookingRecord {
  const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');
  booking.status = 'cancelled';
  booking.cancelledAt = new Date().toISOString();
  booking.refundAmount = booking.totalPrice; // or computed via existing refund logic
  return booking;
}
```

### 3. `CancelBookingScreen.tsx`
Keep all existing UI (refund calc card, reason pills, two CTAs). Change `onConfirm` behavior:
- Call `cancelBooking(bookingId, reason)`
- Show a toast (reuse the `OverlayEntry`/toast pattern from `BookingDetailScreen`'s copy-to-clipboard toast): "Booking cancelled · ₹{refundAmount} refund initiated"
- After 1.5s, call `onBack()` to return to `BookingDetailScreen` (which will now read the updated `MOCK_BOOKINGS` and render cancelled state)

Updated props — remove the separate confirmed-navigation handler:
```ts
interface CancelBookingScreenProps {
  bookingId: string;
  onBack: () => void; // also used as "done" — returns to BookingDetailScreen
  onCancelled: () => void; // triggers re-render of BookingDetailScreen with fresh data
}
```

### 4. `BookingDetailScreen.tsx` — cancelled state
For bookings with `status === 'cancelled'`:
- "Cancelled on {cancelledAt}" grey status card (existing)
- Below it: `<RefundStepper refundAmount={booking.refundAmount} cancelledAt={booking.cancelledAt} operatorName={booking.operatorName} defaultExpanded={false} />`
- "Find similar experiences →" CTA (existing, keep)

### 5. `src/types/index.ts`
Remove:
```ts
| { screen: 'cancellation_confirmed'; ... }
| { screen: 'refund_status'; ... }
```

### 6. `src/App.tsx`
Remove `handleNavigateToCancellationConfirmed` and `handleNavigateToRefundStatus` and their cases. `cancel_booking` case's `onCancelled` should trigger a state refresh so `BookingDetailScreen` re-reads `MOCK_BOOKINGS` (e.g. force re-render via a `key` prop bump or local re-fetch in `BookingDetailScreen`'s effect).

## Requirements
1. `RefundStepper` defaults to collapsed when shown on `BookingDetailScreen`.
2. Toast uses identical styling to the existing copy-to-clipboard toast (`bg-gamana-900 text-white rounded-full px-4 py-2 text-sm`).
3. `cancelBooking()` mutation is in-memory only — acceptable for prototype, do not add persistence.

## Do NOT
- Do not delete `RefundStatusScreen.tsx` content wholesale — extract it into `RefundStepper.tsx` first, then the standalone screen file can be deleted.
- Do not change the refund calculation logic from `CancelBookingScreen.tsx`.

---

# PROMPT D — Post-Experience Merge (2 → 1)

## Read these files first
- `src/components/experiences/post/ExperienceCompletedScreen.tsx`
- `src/components/experiences/post/RateReviewScreen.tsx`
- `src/components/experiences/bookings/BookingDetailScreen.tsx`
- `src/App.tsx`
- `src/types/index.ts`

## New flow
```
BookingDetailScreen (completed, not yet rated)
  └─ ExperienceCompletedScreen
        ├─ celebration (confetti, checkmark, badge) — unchanged
        └─ inline rating block (stars + text + chips, from RateReviewScreen)
              ├─ "Submit Review" → toast "Thanks!" → onBack() → BookingDetailScreen (now rated)
              └─ "Maybe later" → onBack() → BookingDetailScreen shows a
                                  "Rate your experience" reminder card
```

`rate_review` route is removed.

## What to build

### 1. `ExperienceCompletedScreen.tsx` — append inline rating section
Below the existing two action cards (linked story + rate prompt), replace the "rate prompt" card with the full inline rating UI lifted from `RateReviewScreen.tsx`:
- 5-star row (tap to rate, hover preview)
- Rating label text (changes per rating value)
- Textarea "What made it memorable?" (min 10 chars, 500 limit, live counter)
- Aspect chips multi-select
- Photo upload placeholder (unchanged, non-functional)
- Two buttons: "Submit Review" (primary, disabled until rating + text valid) and "Maybe later" (text link)

`onSubmit` behavior: show 2s "Thanks for the feedback!" toast, then call `onBack()`.
`onMaybeLater` behavior: call a new prop `onDeferRating()` which marks the booking as `ratingDeferred: true` in `MOCK_BOOKINGS`, then `onBack()`.

Updated props:
```ts
interface ExperienceCompletedScreenProps {
  bookingId: string;
  onBack: () => void;
  onNavigateToStory?: (storyId: string) => void;
  onSubmitRating: (rating: number, text: string, aspects: string[]) => void;
  onDeferRating: () => void;
}
```

### 2. `src/lib/experience-bookings-mock.ts`
Add optional fields to `BookingRecord`:
```ts
rating?: number;
ratingDeferred?: boolean;
```

### 3. `BookingDetailScreen.tsx` — completed state
- If `booking.rating` is set: show "You rated this {rating}/5 ⭐" read-only.
- Else if `booking.ratingDeferred === true`: show a dismissible "Rate your experience →" reminder card that opens `ExperienceCompletedScreen` again (or a lightweight inline rating prompt — reuse the star row + submit from step 1, without the confetti/celebration chrome).
- Else (first visit after completion): "Celebrate" CTA → `ExperienceCompletedScreen`.

### 4. `src/types/index.ts`
Remove:
```ts
| { screen: 'rate_review'; ... }
```

### 5. `src/App.tsx`
Remove `handleNavigateToRateReview` and its case. Update `ExperienceCompletedScreen`'s case to wire `onSubmitRating` (mutates `MOCK_BOOKINGS`, sets `booking.rating`) and `onDeferRating`.

## Requirements
1. Confetti/checkmark animation plays only on first visit (when `rating` and `ratingDeferred` are both unset) — once rated or deferred, re-visits show a calmer state without confetti.
2. Star rating UI must match the original `RateReviewScreen` styling exactly.

## Do NOT
- Do not keep `RateReviewScreen.tsx` as a separate route — its content moves into `ExperienceCompletedScreen.tsx`. Delete the file once merged.

---

# PROMPT E — On-Request Consolidation (4 states → 2)

## Read these files first
- `src/components/experiences/booking/OnRequestStatusScreen.tsx`
- `src/components/experiences/bookings/BookingDetailScreen.tsx`
- `src/components/experiences/booking/BookingFailedScreen.tsx` (for alternatives pattern)
- `src/lib/experience-seed-data.ts`
- `src/App.tsx`
- `src/types/index.ts`

## What changes
`OnRequestStatusScreen` keeps only `'pending'` and `'confirmed'`. `'rejected'` and `'expired'` move to `BookingDetailScreen` as status banners.

## What to build

### 1. `OnRequestStatusScreen.tsx`
Remove the `'rejected'` and `'expired'` branches and their JSX. `status` prop type becomes:
```ts
status: 'pending' | 'confirmed';
```
`'confirmed'` continues to reuse `BookingConfirmedScreen` styling as before. Remove the now-unused demo toggle buttons for Rejected/Expired (keep Pending/Confirmed toggle).

### 2. `BookingDetailScreen.tsx` — new banner states
Add handling for `booking.status === 'rejected'` and `booking.status === 'expired'`:

**Rejected banner:**
- Red-tinted `Container`: "Request Declined" + "{operatorName} couldn't confirm this booking. You haven't been charged."
- 3 alternative experience tiles (same category, `experienceSeedData.filter(e => e.category === experience.category && e.id !== experience.id).slice(0,3)`) — reuse the horizontal mini-tile pattern from `BookingFailedScreen.tsx`
- "Request a different date" CTA → re-opens `DatePaxSheet` for the same experience

**Expired banner:**
- Grey-tinted `Container`: "Request Timed Out" + "The operator didn't respond in time. Automatically cancelled."
- Refund note if applicable: "Any deposit will be refunded within 5–7 business days."
- Same 3 alternatives + "Browse similar experiences" CTA

Both banners replace the normal action-button row (What to Bring / Meeting Point / Cancel) — these don't apply to a rejected/expired booking.

### 3. `src/lib/experience-bookings-mock.ts`
Ensure `BookingRecord['status']` includes `'rejected' | 'expired'` (should already be part of the union from earlier arcs — verify).

### 4. `src/App.tsx`
`on_request_status` route case: only passes `status: 'pending' | 'confirmed'`. If a booking's status is `rejected` or `expired`, navigation should go to `booking_detail` instead, where the new banners render.

## Requirements
1. `OnRequestStatusScreen`'s pending state still includes the 3-step tracker, countdown, and "Cancel this request" link — unchanged.
2. Alternatives logic in `BookingDetailScreen` reuses the exact filter/slice pattern from `BookingFailedScreen` for consistency.

## Do NOT
- Do not delete `OnRequestStatusScreen.tsx` — it remains for pending/confirmed.
- Do not change `BookingConfirmedScreen.tsx`.

---

# PROMPT F — MeetingPoint & OperatorProfile → Bottom Sheets

## Read these files first
- `src/components/experiences/confidence/MeetingPointScreen.tsx`
- `src/components/experiences/OperatorProfileScreen.tsx`
- `src/components/experiences/confidence/PreExperienceBriefScreen.tsx`
- `src/components/experiences/confidence/DayOfExperienceCard.tsx`
- `src/components/experiences/bookings/BookingDetailScreen.tsx`
- `src/components/experiences/ExperienceDetailScreen.tsx`
- `src/App.tsx`
- `src/types/index.ts`

## What to build

### 1. `src/components/experiences/confidence/MeetingPointBottomSheet.tsx`
New file. Same visual content as `MeetingPointScreen.tsx` (map placeholder, address, directions button, walking time, save offline toggle, operator contact) but as a `showModalBottomSheet`-style overlay (`fixed inset-0` backdrop + slide-up panel, `max-h-[85vh]`, drag handle + close X instead of back arrow).

```ts
export function showMeetingPointBottomSheet({
  bookingId,
  onClose,
}: { bookingId: string; onClose: () => void }): JSX.Element
```
Or as a component rendered conditionally:
```tsx
<MeetingPointBottomSheet isOpen={...} bookingId={...} onClose={...} />
```
Pick whichever pattern matches how `DatePaxSheet` is implemented (check that file for the established overlay convention) and follow it exactly for consistency.

### 2. `src/components/experiences/OperatorProfileBottomSheet.tsx`
New file. Same content as `OperatorProfileScreen.tsx` (operator avatar, verified badge, rating, bio, horizontal scroll of their experiences, "Browse all" CTA) as a bottom sheet overlay, same pattern as above.

```ts
interface OperatorProfileBottomSheetProps {
  isOpen: boolean;
  vendorId: string;
  operatorName: string;
  onClose: () => void;
  onOpenExperience: (slug: string) => void;
}
```

### 3. Update callers

**`ExperienceDetailScreen.tsx`** — tapping operator name opens `OperatorProfileBottomSheet` (local `useState` for open/close) instead of navigating to `operator_profile` route.

**`PreExperienceBriefScreen.tsx`** — "Tap to open map" in the "Meeting your guide" section opens `MeetingPointBottomSheet` instead of navigating to `meeting_point` route.

**`BookingDetailScreen.tsx`** — "Meeting Point" action button opens `MeetingPointBottomSheet` instead of navigating.

**`DayOfExperienceCard.tsx`** — the MapPin icon button opens `MeetingPointBottomSheet` instead of navigating. This requires `DayOfExperienceCard` (rendered in `HomeScreen`) to manage local sheet-open state, or bubble an `onOpenMeetingPoint` callback up to `HomeScreen` which renders the sheet at the `HomeScreen` level. Prefer rendering the sheet at `HomeScreen` level since the card itself shouldn't own screen-level overlay state.

### 4. `src/types/index.ts`
Remove:
```ts
| { screen: 'meeting_point'; ... }
| { screen: 'operator_profile'; ... }
```

### 5. `src/App.tsx`
Remove `handleNavigateToMeetingPoint`, `handleNavigateToOperatorProfile`, and their `renderScreen()` cases.

### 6. Delete files
Delete `src/components/experiences/confidence/MeetingPointScreen.tsx` and `src/components/experiences/OperatorProfileScreen.tsx` once their content has been moved into the new bottom sheet components.

## Requirements
1. Both bottom sheets use the same backdrop/slide-up/drag-handle pattern as `DatePaxSheet` — visual consistency across all overlays.
2. Each sheet is closable via: tap backdrop, tap close X, or drag down.
3. Sheets must work when triggered from multiple different parent screens without prop-drilling through unrelated components — use local state at the screen that renders the trigger, not global state.

## Do NOT
- Do not turn these into routes with a different name — they must be overlays, not navigable screens.
- Do not change `DatePaxSheet.tsx` itself — only reference its pattern.

---

# PROMPT G — Segments: Discovery/Action Reframe + New Segments

## Read these files first
- `src/types/experience.ts`
- `src/types/index.ts` (Story type, if defined separately check `src/components/story/`)
- `src/components/story/StoryDetailScreen.tsx`
- `src/components/experiences/ExperienceDetailScreen.tsx`
- `src/lib/experience-seed-data.ts`
- `src/lib/seed-data.ts` (story seed data)
- `src/lib/notification-mock-data.ts`
- `src/components/experiences/ExperienceFilterSheet.tsx`
- `src/components/experiences/ExperiencesExploreScreen.tsx`
- `src/components/experiences/ExperienceCard.tsx`

## What to build

### 1. Story → Experience cross-link
Find the Story type definition (likely in `src/types/index.ts` or a dedicated story types file). Add:
```ts
linkedBookableExperienceId?: string;
linkedBookableExperienceLabel?: string; // e.g. "Book the guided Heritage Walk"
```

In `StoryDetailScreen.tsx`, if `story.linkedBookableExperienceId` is set, add a card near the bottom (similar visual treatment to the existing teal "linked story" card pattern in `ExperienceDetailScreen.tsx`, but inverted — teal card with a ticket/calendar icon):
```
"📅 {linkedBookableExperienceLabel}" → onNavigateToExperienceDetail(slug)
```

In `src/lib/seed-data.ts`, add `linkedBookableExperienceId` to 2-3 stories that correspond to experiences already marked `hasLinkedStory: true` in `experience-seed-data.ts` (bidirectional link — find those experiences, cross-reference their `linkedStoryId`, and add the reverse pointer on the story side).

### 2. Share action — "Send to group"
Add a share button to `ExperienceCard.tsx` and `ExperienceDetailScreen.tsx` (small icon button, `Share2` from lucide-react, top-right of card or near the booking bar on detail screen).

```ts
async function handleShare(experience: Experience) {
  const shareData = {
    title: experience.title,
    text: `Check out ${experience.title} on Gamana — ${formatPriceLabel(experience.priceFrom, experience.priceCurrency)}`,
    url: `https://gamana.app/experience/${experience.slug}`, // placeholder URL
  };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* user cancelled, ignore */ }
  } else {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    // show toast "Link copied!"
  }
}
```
Use the existing toast pattern for the clipboard fallback.

### 3. "Available Tomorrow" quick filter — Activities tab
In `ExperiencesExploreScreen.tsx`, on the Activities tab, add a quick-filter chip "Available Tomorrow" alongside the existing category chips (All / Food & Drink / Adventure / etc). When active, filter the experience list to those where `getMockSlots(tomorrowDateString)` returns at least one slot with `spotsLeft !== 0`.

```ts
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];
```

### 4. Time of Day filter dimension
In `ExperienceFilterSheet.tsx`, add a new filter section: "Time of Day" with `ChoiceChip`-style options: Morning / Afternoon / Evening (single-select, can be null/All).

Extend `ExperienceFilters` interface:
```ts
timeOfDay: 'morning' | 'afternoon' | 'evening' | null;
```

Derive an experience's available time-of-day buckets from `getMockSlots()`: slots before 12:00 → morning, 12:00–17:00 → afternoon, after 17:00 → evening. Filter logic: an experience matches if ANY of its slots (for any date) fall in the selected bucket. For simplicity, check against `getMockSlots(today)` and `getMockSlots(tomorrow)`.

### 5. N-10 notification
In `src/lib/notification-mock-data.ts`, add a 10th notification type:
```ts
| 'weekend_planner'
```
```ts
{
  type: 'weekend_planner',
  title: "Weekend's open",
  body: "3 activities are bookable near you tomorrow — from cooking classes to sunset walks.",
  timestamp: "Fri, 5:30 PM",
  experienceId: 'exp-001', // or pick any
  iconType: 'info',
  actionLabel: 'See What\'s On',
  deepLinkScreen: 'experiences_explore',
}
```

In `NotificationPreviewScreen.tsx`, add this card to the "Smart Triggers" section (alongside N-08, N-09), and update the section's notification count references if any are hardcoded.

## Requirements
1. Share uses native `navigator.share` with clipboard fallback — no third-party share library.
2. "Available Tomorrow" filter and category chips are combinable (AND logic, not mutually exclusive).
3. Time of Day filter integrates into the existing `ExperienceFilters` state alongside category/duration/etc — same apply/reset behavior.
4. Story↔Experience cross-links are bidirectional for at least 2 experiences — verify both directions render correctly.

## Do NOT
- Do not add a backend notification scheduler — N-10 is a design-reference card only, same as N-01 through N-09.
- Do not install a share library (`react-share`, etc) — native Web Share API only.

---

# PROMPT H — Personalized Tab Default (Tours segmented control)

## Read these files first
- `src/components/experiences/ExperiencesExploreScreen.tsx`
- `src/lib/experience-bookings-mock.ts`
- `src/hooks/useExperiences.ts`
- `src/App.tsx`

## What to build

### 1. `src/hooks/useUserSegmentSignal.ts`
New hook. For the prototype, derive a simple signal from `MOCK_BOOKINGS`:

```ts
export type SegmentSignal = 'discovery' | 'action';

export function useUserSegmentSignal(): SegmentSignal {
  // If the user has any bookings (confirmed, on-request, or completed),
  // treat them as "action" mode — they've engaged with bookable experiences.
  // Otherwise "discovery" — show audio-first content.
  const { allUpcoming } = useUpcomingBookings(); // from Arc 7
  const hasAnyBookingHistory = MOCK_BOOKINGS.length > 0; // prototype: always true since seed data is pre-populated

  // For demo purposes, make this configurable via a query param so it's
  // demonstrable without needing real user history:
  const params = new URLSearchParams(window.location.search);
  const override = params.get('segment');
  if (override === 'discovery' || override === 'action') return override;

  return hasAnyBookingHistory ? 'action' : 'discovery';
}
```

### 2. `ExperiencesExploreScreen.tsx` — Tours tab default
On the Tours tab, the segmented control (`All / Gamana Audio / Guided`) currently defaults to `All`. Change the initial state:

```ts
const segmentSignal = useUserSegmentSignal();
const [activeSegment, setActiveSegment] = useState<'all' | 'audio' | 'guided'>(
  segmentSignal === 'action' ? 'guided' : 'all'
);
```

This only affects the *initial* value — user taps still freely switch segments as before. Do not lock or hide any segment option.

### 3. Visual indicator (optional but recommended)
If the initial segment was set to `guided` due to the signal (not user choice), show a small dismissible hint chip above the segmented control on first render: "Showing bookable experiences first, based on your activity." Dismiss permanently for the session via local state.

## Requirements
1. `?segment=discovery` or `?segment=action` in the URL must override the derived signal — needed for demoing both states without seeding different data.
2. Default behavior with no override and current seed data (`MOCK_BOOKINGS.length > 0`) should land on `guided`.
3. This is a default-state change only — no new routes, no new screens.

## Do NOT
- Do not persist segment signal to localStorage.
- Do not change the segmented control's visual design — only its initial selected value.

---

# Execution Order & Conflict Notes

**Order: A → B → C → D → E → F → G → H**

- **A** touches `ExperienceCard`/`ExperienceBookCard`/seed-data/mappers — isolated, do first.
- **B** touches the booking flow files — isolated from A.
- **C, D, E, F all modify `BookingDetailScreen.tsx`.** Execute strictly in this order (C then D then E then F) and re-read `BookingDetailScreen.tsx` fresh before each prompt — each adds a different section (cancelled refund stepper / rating card / rejected-expired banners / meeting point sheet trigger) and they must layer cleanly.
- **G** is mostly additive (new fields, new filter, new notification) — low conflict risk, but touches `ExperienceFilterSheet.tsx` which A's tile updates also reference. Run after A.
- **H** is a small isolated default-state change — last, lowest risk.

After each prompt: `npm run typecheck`, then manually click through the affected flow before moving to the next prompt.

---

# Net Screen-Count Reduction Summary

| Before | After | Removed |
| --- | --- | --- |
| `booking_timeslot` | merged into `DatePaxSheet` | route removed |
| `booking_pickup` | merged into `BookingQuestionsScreen` | route removed |
| `cancellation_confirmed` | toast + `BookingDetailScreen` | route removed |
| `refund_status` | `RefundStepper` inline on `BookingDetailScreen` | route removed |
| `rate_review` | merged into `ExperienceCompletedScreen` | route removed |
| `on_request_status` (rejected/expired) | banners on `BookingDetailScreen` | 2 states removed (route stays for pending/confirmed) |
| `meeting_point` | `MeetingPointBottomSheet` | route removed |
| `operator_profile` | `OperatorProfileBottomSheet` | route removed |

**19 routes → 12 routes.** `notification_preview` remains but is a dev-reference artifact, not counted as a user-facing screen.
