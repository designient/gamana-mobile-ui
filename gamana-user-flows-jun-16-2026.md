# Gamana User Flows Built on Jun 16, 2026

This document summarizes the end-user flows implemented today (Prompt A through Prompt H), in execution order, with the current expected behavior.

## 0) Experience Card System Refresh (Prompt A)

### Where users feel this
- Explore feed cards
- Horizontal/bookable cards
- Search experience rows

### What changed in card UX
- Cards now use richer visual hierarchy with:
  - format chip (e.g., guided/audio/ticket style label)
  - vibe pill
  - compact meta line + micro badges
  - cleaner image-first composition
- Shared reusable meta components were introduced so card metadata is consistent across surfaces.

### Data/model impact exposed to UI
- Experience records now include additional optional display fields used for trust and conversion cues, such as:
  - group size
  - private/format hints
  - bookings trend
  - cancellation indicators
- Mapper/seed logic now derives standardized `format` + `vibe` labels used by cards.

### Layout tuning
- Horizontal carousel card width standardized to `254px` for consistent scroll rhythm.

---

## 1) Booking Flow Simplification (Prompt B)

### Primary flow
`Experience Detail` -> `DatePaxSheet` -> `Booking Questions` -> `Order Summary` -> `Booking WebView`

### Step behavior
- `DatePaxSheet` now includes:
  - Step 1: date + pax
  - Step 2: time selection (inside same sheet, slide transition)
- `Booking Questions` now includes:
  - traveler questions
  - pickup/meeting selection (merged from old pickup screen)

### Skip rules
- On-request experiences skip time selection and go straight from date/pax to questions.
- Pass/ticket-style experiences skip time selection and go straight from date/pax to questions.

### Back behavior
- From `Booking Questions`, back goes to `Experience Detail`.

### Removed routes/screens
- `booking_timeslot` (removed)
- `booking_pickup` (removed)

---

## 2) Cancellation Consolidation (Prompt C)

### New flow
`Booking Detail (confirmed)` -> `Cancel Booking` -> (confirm cancel) -> back to `Booking Detail (cancelled state)`

### What user sees after cancel
- Toast: `Booking cancelled · ₹X refund initiated`
- `Booking Detail` shows:
  - Cancelled status card
  - Inline collapsible `RefundStepper` (collapsed by default)
  - CTA: `Find similar experiences`

### RefundStepper states
- Cancellation Confirmed (done)
- Refund Initiated (done)
- Processing with Bank (active)
- Refund Received (pending)

### Removed routes/screens
- `cancellation_confirmed` (removed)
- `refund_status` (removed)

---

## 3) Post-Experience Merge (Prompt D)

### New flow
`Booking Detail (completed)` -> `Experience Completed` (celebration + inline rating) -> back to `Booking Detail`

### Rating behavior
- Rating is now embedded in `ExperienceCompletedScreen`:
  - stars
  - review text
  - aspect chips
  - submit / maybe later
- Submit:
  - shows thank-you toast
  - writes rating to booking mock
  - returns to booking detail
- Maybe later:
  - marks `ratingDeferred: true`
  - returns to booking detail

### Booking Detail completed states
- If rated: shows read-only rated state (`You rated this X/5`).
- If deferred: shows reminder card (`Rate your experience ->`) unless dismissed.
- If first-time completed (no rating/defer): shows celebrate CTA.

### Removed route/screen
- `rate_review` (removed; content merged)

---

## 4) On-Request Consolidation (Prompt E)

### OnRequestStatus screen scope
- `OnRequestStatusScreen` now handles only:
  - `pending`
  - `confirmed`

### Rejected/Expired handling moved
Rejected and expired are now rendered in `BookingDetailScreen` as banners.

### Rejected banner flow
`Booking Detail (rejected)` shows:
- Declined message
- 3 alternative experiences (same category pattern)
- CTA: `Request a different date` (opens date/pax sheet for same experience)

### Expired banner flow
`Booking Detail (expired)` shows:
- Timed out message
- refund note text
- 3 alternatives
- CTA: `Browse similar experiences`

### Action-row override
- For rejected/expired states, normal upcoming action row is replaced by the banner + alternatives UX.

---

## 5) Meeting Point + Operator Profile as Bottom Sheets (Prompt F)

### Meeting Point
Replaced route-based screen with reusable bottom sheet.

Triggers:
- `Booking Detail` -> Meeting Point button
- `Pre Experience Brief` -> "Tap to open map"
- `Home` day-of card map action

### Operator Profile
Replaced route-based screen with reusable bottom sheet.

Triggers:
- `Experience Detail` -> operator name in header

### Sheet behavior pattern
- Backdrop tap closes
- Close X closes
- Drag-down closes
- Max height aligned with existing sheet pattern

### Removed routes/screens
- `meeting_point` route removed
- `operator_profile` route removed
- Old standalone `MeetingPointScreen` deleted
- Old standalone `OperatorProfileScreen` deleted

---

## 6) Discovery/Action Reframe Additions (Prompt G)

### Story -> Experience cross-link
In `Story Detail`, if linked experience exists:
- Show bottom card with booking label
- Tap opens linked `Experience Detail`

### Experience sharing
Added native share + clipboard fallback:
- `ExperienceCard` share button
- `ExperienceDetailScreen` share button
- Clipboard fallback shows `Link copied!` toast

### Activities quick filter
Added `Available Tomorrow` quick chip in explore filter bar (Activities tab).

### Time of Day filtering
Added Time of Day options to filter sheet:
- Morning
- Afternoon
- Evening

Filter behavior checks slot buckets and integrates with existing sheet filters.

### Notification N-10
Added new mock notification:
- Type: `weekend_planner`
- Label/action: weekend planning discovery trigger card

---

## 7) Personalized Tours Default Segment (Prompt H)

### New signal hook
`useUserSegmentSignal()`:
- Default with current seed data: `action`
- URL override supported:
  - `?segment=discovery`
  - `?segment=action`

### Tours segmented control behavior
In `ExperiencesExploreScreen` (Tours tab):
- Segments shown: `All / Gamana Audio / Guided`
- Initial default:
  - `Guided` for action signal
  - `All` for discovery signal
- User can still freely switch segments.

### Optional hint
- If defaulted to guided due to signal, shows dismissible hint:
  - "Showing bookable experiences first, based on your activity."

---

## Route Reduction Snapshot

Routes removed via today's simplification:
- `booking_timeslot`
- `booking_pickup`
- `cancellation_confirmed`
- `refund_status`
- `rate_review`
- `meeting_point`
- `operator_profile`

Net effect: route count reduced from the expanded pre-simplification set toward the target simplified architecture.

