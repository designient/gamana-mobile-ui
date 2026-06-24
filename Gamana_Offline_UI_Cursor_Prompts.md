# Gamana · Offline-First UI — Cursor Build Prompts
**Run in this order. Each prompt is self-contained.**
Stack: Flutter · FastAPI backend · MongoDB · Gamana Design System

Design tokens (reference throughout):
- Primary teal: `#1A5F7A` · Dark teal: `#0B3244` · Aqua: `#57C5B6`
- Amber accent: `#FFB100` · Coral alert: `#E76161` · Ink: `#16323F`
- Muted: `#5B7682` · Background: `#FAFFFE`
- Font: `Outfit` (already loaded in app)
- Semantic success: `green-600` · Warning: `amber-700` · Error: `red-500`

---

## PROMPT 01 — Offline Cache Service (data layer, build this first)

```
Create a Flutter service called `OfflineCacheService` in `lib/services/offline_cache_service.dart`.

This service manages all local persistence for offline-first booking/trip data. Use `flutter_secure_storage` for the booking JSON blob and `hive` for structured trip data. Also use `path_provider` + `dio` for file caching (ticket PDFs, static map tiles, audio guide packages).

### Data models to define in `lib/models/offline_trip.dart`:

```dart
class OfflineTrip {
  final String bookingId;           // Bókun booking ID
  final String confirmationCode;    // e.g. SEL-12345 — used to generate QR
  final String experienceTitle;
  final String operatorName;
  final DateTime experienceDate;
  final String experienceTime;      // display string e.g. "10:00 AM"
  final int passengerCount;
  final String pricingCategory;     // e.g. "2 Adults, 1 Child"
  final String travellerName;
  final MeetingPoint meetingPoint;
  final List<String> inclusions;
  final List<String> whatToBring;
  final String cancellationPolicy;
  final OfflineSyncState syncState;
  final DateTime lastSyncedAt;
  final String? ticketPdfLocalPath;
  final String? mapTileLocalPath;
  final String? audioGuidePath;
  final BookingStatus bookingStatus; // confirmed | cancelled | amended
}

enum OfflineSyncState { synced, stale, syncing, failed, notCached }
enum BookingStatus { confirmed, cancelled, amended }

class MeetingPoint {
  final String address;
  final double lat;
  final double lng;
}
```

### Service methods to implement:

1. `Future<void> cacheTrip(OfflineTrip trip)` — persists the full trip object to Hive box `'trips'`, keyed by `bookingId`.

2. `Future<OfflineTrip?> getTrip(String bookingId)` — retrieves by ID.

3. `Future<List<OfflineTrip>> getAllTrips()` — returns all trips sorted by `experienceDate` ascending, upcoming first.

4. `Future<void> downloadTripAssets(String bookingId)` — downloads:
   - Static map tile from Mapbox Static Images API:
     `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+1A5F7A({lng},{lat})/{lng},{lat},15,0/600x300@2x?access_token={MAPBOX_TOKEN}`
     Save to app documents dir as `map_{bookingId}.png`.
   - Ticket PDF (URL from booking JSON) → save as `ticket_{bookingId}.pdf`.
   - Audio guide package (if available from Gamana CDN endpoint `GET /api/v1/experiences/{experienceId}/audio-package`) → save as `audio_{experienceId}.zip`, then unzip.
   Track download progress per asset type via a `Stream<TripDownloadProgress>`.

5. `Future<void> refreshTripStatus(String bookingId)` — calls `GET /api/v1/bookings/{bookingId}/status` (online only), updates `bookingStatus` and `lastSyncedAt`. If status is `cancelled`, set `bookingStatus = BookingStatus.cancelled` and update syncState.

6. `Future<bool> isTripStale(String bookingId, {Duration threshold = const Duration(hours: 6)})` — returns true if `lastSyncedAt` is older than threshold.

7. `Future<void> deleteTrip(String bookingId)` — removes Hive record and all associated local files.

8. `Future<TripStorageStats> getStorageStats()` — returns total MB used by trips, broken down by: bookingData, mapTiles, ticketPdfs, audioGuides.

9. `Future<void> schedulePretripSync(String bookingId, DateTime experienceDate)` — registers a background task using `workmanager` to call `refreshTripStatus` and `downloadTripAssets` at `experienceDate - 24h`. Use `Workmanager().registerOneOffTask`.

### Stale threshold:
Expose as a const: `static const Duration staleThreshold = Duration(hours: 6)`.

### Error handling:
- All download methods should catch `DioException`, `FileSystemException` and surface them as typed `OfflineCacheException` with an `OfflineCacheErrorType` enum: `networkUnavailable | downloadFailed | storageFull | notFound`.
- Never throw raw exceptions from public methods — always return a typed result or update the trip's syncState to `failed`.

### Riverpod providers to expose:
```dart
final offlineCacheServiceProvider = Provider<OfflineCacheService>((ref) => OfflineCacheService());
final allTripsProvider = FutureProvider<List<OfflineTrip>>((ref) => ref.watch(offlineCacheServiceProvider).getAllTrips());
final tripProvider = FutureProvider.family<OfflineTrip?, String>((ref, id) => ref.watch(offlineCacheServiceProvider).getTrip(id));
```

Use Riverpod for all state management (already in the project). Do not use Provider package or setState for this service.
```

---

## PROMPT 02 — Connectivity State Service + Global Banner Widget

```
Create a connectivity monitoring service and a global offline banner widget for the Gamana Flutter app.

### Service: `lib/services/connectivity_service.dart`

Use `connectivity_plus` package (already in pubspec or add it).

```dart
class ConnectivityService {
  // Stream of bool — true = online, false = offline
  Stream<bool> get onlineStream;
  bool get isOnline; // synchronous current state
}
```

Implement using `Connectivity().onConnectivityChanged`, mapping any non-`ConnectivityResult.none` result to `true`. Expose via Riverpod:

```dart
final connectivityServiceProvider = Provider<ConnectivityService>(...);
final isOnlineProvider = StreamProvider<bool>((ref) => ref.watch(connectivityServiceProvider).onlineStream);
```

### Widget: `lib/widgets/connectivity_banner.dart`

A slim animated banner (48dp tall) that sits between the app's top navigation bar and the main content. It must NOT be a dialog or overlay — it's an inline UI element that pushes content down.

States and appearance:

1. `offline` — Amber background `#FFB100` with 15% opacity, dark ink text, wifi-off icon (lucide):
   `"You're offline — showing saved content"` — left aligned, icon left.

2. `syncing` — Teal `#57C5B6` with 10% opacity, pulsing sync icon:
   `"Syncing your trips…"`

3. `sync_complete` — Green-50 background, checkmark icon:
   `"Trips updated"` — auto-dismisses after 2000ms via `Future.delayed`.

4. Hidden — when online and not syncing. Animates out with `AnimatedSize` + `FadeTransition` (duration: 250ms).

Show this banner ONLY on these screens: `MyTripsScreen`, `VoucherScreen`. Do NOT show it globally on every screen. Pass a `showOnThisScreen: bool` flag or use a screen-level widget tree placement.

Wire to `isOnlineProvider`. When transitioning from offline → online, auto-trigger `OfflineCacheService.refreshTripStatus` for all upcoming trips (via `offlineCacheServiceProvider`).

### Usage:
Wrap the body of `MyTripsScreen` and `VoucherScreen` with a `Column` containing `ConnectivityBanner()` at top, then the screen content.

No fullscreen blocking modals for offline state anywhere in this codebase. The traveller may be standing at an experience entry point — never block the QR.
```

---

## PROMPT 03 — Offline Readiness Chip (reusable component)

```
Create a reusable `OfflineReadinessChip` widget in `lib/widgets/offline_readiness_chip.dart`.

This chip appears on: My Trips cards, Voucher screen header area, Experience detail screen, and Profile offline management. It must be a single widget with variant-driven appearance.

```dart
enum OfflineReadinessState { saved, stale, notSaved, syncing, failed }

class OfflineReadinessChip extends StatelessWidget {
  final OfflineReadinessState state;
  final DateTime? lastSyncedAt;    // used when state == stale
  final VoidCallback? onTap;       // tapping notSaved → opens pre-trip sync sheet
  final bool compact;              // compact=true: icon only, no label (for tight card layouts)
}
```

Appearance per state:

- `saved` → Teal chip `#57C5B6` bg at 15% opacity, teal text `#1A5F7A`, checkmark-circle icon:
  Label: `"Saved offline"`

- `stale` → Amber `#FFB100` bg at 15% opacity, amber-700 text, clock icon:
  Label: `"Updated [X]h ago"` — calculate from `lastSyncedAt`. If < 1h: `"Updated Xm ago"`. If > 24h: `"Updated [date]"`.

- `notSaved` → Gray bg `#93A8B1` at 15% opacity, muted text `#5B7682`, cloud-download icon:
  Label: `"Save for offline"` — tappable, calls `onTap`.

- `syncing` → Teal bg at 10%, animated rotating refresh icon:
  Label: `"Saving…"`

- `failed` → Coral `#E76161` bg at 15% opacity, coral text, alert-circle icon:
  Label: `"Save failed — tap to retry"` — tappable, calls `onTap`.

Chip anatomy: 6px border radius, horizontal padding 10px, vertical padding 5px, icon size 14dp, text size 12px `Outfit` medium weight. Icon and label separated by 4px gap.

When `compact: true`, show icon only (no label text). Tooltip still shows full label on long press.

Tapping `stale` chip when online: call `onTap` to trigger refresh. Tapping `stale` chip when offline: show a `SnackBar` — `"Connect to the internet to refresh"` — do not call `onTap`.

Import and wire to `isOnlineProvider` for the offline tap guard.
```

---

## PROMPT 04 — QR Code Display Widget

```
Create a `BookingQrWidget` in `lib/widgets/booking_qr_widget.dart`.

This widget renders the traveller's booking QR code entirely client-side from a booking reference string. No server call required. This is critical — it must work with zero connectivity.

### Dependencies:
Add `qr_flutter: ^4.1.0` to pubspec.yaml if not already present.
Add `wakelock_plus` for brightness lock.
Add `screen_brightness` for brightness control.

### Widget:

```dart
class BookingQrWidget extends StatefulWidget {
  final String bookingReference;  // e.g. "SEL-12345"
  final String experienceTitle;   // shown below QR
  final double size;              // default 260.0
}
```

### Implementation:

1. Render using `QrImageView` from `qr_flutter`:
   - `data`: the `bookingReference` string directly
   - `version`: `QrVersions.auto`
   - `errorCorrectionLevel`: `QrErrorCorrectLevel.H` (highest — works even if partially obscured)
   - `backgroundColor`: `Colors.white` — always white, regardless of app theme
   - `eyeStyle`: `QrEyeStyle(eyeShape: QrEyeShape.square, color: Color(0xFF0B3244))` — dark teal squares
   - `dataModuleStyle`: `QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Color(0xFF1A5F7A))`
   - Wrap in white `Container` with 16px padding all sides, `borderRadius: 12px`, subtle shadow.

2. Below the QR: booking reference text in `Outfit` 14px medium `#5B7682`, monospace-style letter-spacing 0.08em. Add a copy icon button (lucide `Copy`) — on tap, copy `bookingReference` to clipboard via `Clipboard.setData`, show `SnackBar`: `"Reference copied"`.

3. Below that: `experienceTitle` in 12px `#93A8B1`.

4. On `initState`: call `WakelockPlus.enable()` and set screen brightness to 1.0 via `ScreenBrightness().setScreenBrightness(1.0)`.

5. On `dispose`: call `WakelockPlus.disable()` and `ScreenBrightness().resetScreenBrightness()`.

6. Accessibility: wrap `QrImageView` with `Semantics(label: 'QR code for booking \$bookingReference. Show this to the operator at check-in.')`.

7. Long-press on the QR widget itself: copy `bookingReference` to clipboard + haptic feedback `HapticFeedback.mediumImpact()`.

Do NOT load any QR data from a network URL. The QR value is always the raw `bookingReference` string passed as a constructor parameter, which must have been previously cached by `OfflineCacheService`.
```

---

## PROMPT 05 — Static Map Tile Widget

```
Create a `CachedMeetingPointMap` widget in `lib/widgets/cached_meeting_point_map.dart`.

This renders a static pre-cached map image of a meeting point. It must render offline from a locally stored PNG. It is NOT a live interactive map widget.

### Widget:

```dart
class CachedMeetingPointMap extends StatelessWidget {
  final String bookingId;
  final MeetingPoint meetingPoint; // has address, lat, lng
  final double height;             // default 180.0
}
```

### Implementation:

1. Check if local file `map_{bookingId}.png` exists in app documents dir via `path_provider`.

2. If file exists → render with `Image.file()`. Apply `borderRadius: 12px` via `ClipRRect`. Overlay a pin marker centered on the image using a `Stack` — use a `Container` with the Gamana teal circle + white center dot (20dp). Position it at 50% x, 50% y (the map tile is centered on the meeting point).

3. If file does not exist and device is ONLINE → show a shimmer placeholder and call `OfflineCacheService.downloadTripAssets` for this booking. Once downloaded, refresh via `setState`.

4. If file does not exist and device is OFFLINE → show a placeholder `Container` (height matches, `#F0F4F5` bg, `borderRadius: 12px`) with a `Column`: map-pin icon (lucide, `#93A8B1`, 24dp) + address text centered in `Outfit` 13px `#5B7682`. No error message — just the address as fallback.

5. Below the map (outside the tile, not overlaid): address text in `Outfit` 13px `#16323F`, full address string. Then an `"Open in Maps"` `TextButton` with map icon.

6. `"Open in Maps"` button:
   - Online: opens `maps:{lat},{lng}` deep link via `url_launcher` (falls back to `https://maps.google.com/?q={lat},{lng}`).
   - Offline: button is shown but greyed out (`#93A8B1`), wrapped with `Tooltip(message: 'Available when connected')`. Do not hide the button — greying it out is better UX at an experience entry point.

Wire offline detection via `isOnlineProvider` from Riverpod.
```

---

## PROMPT 06 — Voucher / Ticket Screen

```
Create `lib/screens/voucher_screen.dart` — the primary offline-capable booking voucher screen.

This screen must render completely from cached data with zero network connectivity. It is the screen the traveller shows to the operator at check-in.

### Route:
Add to app router: `/voucher/:bookingId`

### Constructor:
```dart
class VoucherScreen extends ConsumerWidget {
  final String bookingId;
}
```

### Data:
Load via `tripProvider(bookingId)` from Riverpod. If trip is null (not cached), show an error state with a "Go back" button and message: `"This booking isn't available offline. Connect to the internet to load it."` — do NOT show a broken screen.

### Screen layout (scrollable Column):

**App bar:**
- Title: `"Your Ticket"` — `Outfit` 18px bold `#16323F`
- Leading: back arrow
- Trailing: share icon (lucide `Share2`) — share booking PDF if `ticketPdfLocalPath != null`, otherwise share booking reference as text
- No elevation. Background `#FAFFFE`.

**Below app bar: `ConnectivityBanner()`** — shows amber offline banner when offline.

**Section 1 — Status + Sync row:**
Full-width row: left side shows booking status chip, right side shows `OfflineReadinessChip`.

Booking status chip:
- `confirmed` → green-50 bg, `"Confirmed"` green-800 text, checkmark icon
- `cancelled` → red-50 bg, `"Cancelled"` red-600 text, x-circle icon
- `amended` → amber-50 bg, `"Updated"` amber-700 text, edit icon

If `bookingStatus == cancelled`: show a full-width amber warning card below the status row BEFORE the QR section:
`"This booking has been cancelled. Please contact [operatorName] or check your email for details."` — with a coral left border 4dp. Do not show the QR for a cancelled booking. Replace QR section with a grey placeholder and the text `"QR unavailable for cancelled booking"`.

**Section 2 — QR Code:**
Centered. Use `BookingQrWidget(bookingReference: trip.confirmationCode, experienceTitle: trip.experienceTitle)`.

Padding: 24px top and bottom. White card container, `borderRadius: 16px`, subtle shadow `boxShadow: [BoxShadow(color: Color(0x0F000000), blurRadius: 20, offset: Offset(0, 4))]`.

Sub-label below QR widget (inside card): `"Show this QR to your guide at check-in"` — `Outfit` 13px `#93A8B1` centered.

**Section 3 — Experience details:**
Section header: `"Your Experience"` — `Outfit` 12px `#93A8B1` uppercase letter-spacing 0.1em.

Card with rows:
- Experience title: 16px bold `#16323F`
- Date + time: calendar icon + `"Mon 23 Jun 2026 · 10:00 AM"` — 14px `#5B7682`
- Duration: clock icon + duration string — 14px `#5B7682`
- Operator: building icon + operatorName — 14px `#5B7682`
- Passengers: users icon + pricingCategory — 14px `#5B7682`

**Section 4 — Traveller:**
Section header: `"Traveller"`
- Name: person icon + travellerName — 14px `#16323F`
- Booking ref: hash icon + confirmationCode in monospace style — 14px `#5B7682`

**Section 5 — Meeting point:**
Section header: `"Where to go"`
`CachedMeetingPointMap(bookingId: bookingId, meetingPoint: trip.meetingPoint)`

**Section 6 — Inclusions:**
Section header: `"What's included"`
Render `trip.inclusions` as a list. Each row: `check` icon teal `#57C5B6` + text 14px `#16323F`. If `whatToBring` is non-empty, add sub-section `"What to bring"` with same pattern but `backpack` icon.

**Section 7 — Cancellation:**
Section header: `"Cancellations"`
`trip.cancellationPolicy` text — 13px `#5B7682`.
Below: `"Refunds are handled directly by [operatorName], not Gamana."` — 12px `#93A8B1` italic. This disclosure is mandatory per BRD 3.

**Footer — Last synced:**
`"Last synced: [formatted datetime]"` — `Outfit` 12px `#93A8B1` centered.
If online: show a `TextButton` `"Refresh now"` → calls `OfflineCacheService.refreshTripStatus(bookingId)` then `setState` equivalent via `ref.refresh(tripProvider(bookingId))`.
If offline: show `"Connect to refresh"` in same style but no button (just text).

### Analytics:
Fire `voucher_viewed` event on screen load with properties: `bookingId`, `isOnline: bool`, `syncState: string`, `bookingStatus: string`.
Fire `qr_displayed` event when QR widget renders (use `WidgetsBinding.addPostFrameCallback`).
```

---

## PROMPT 07 — My Trips Screen

```
Create `lib/screens/my_trips_screen.dart` — the booking history screen. Nested under Explore tab or accessible from Profile tab (confirm against your current nav structure and place accordingly — do NOT add a 5th bottom nav tab).

### Data:
Use `allTripsProvider` from Riverpod (returns `List<OfflineTrip>` from `OfflineCacheService`).

Split into two sections:
- `upcoming`: `experienceDate >= DateTime.now()`, sorted ascending
- `past`: `experienceDate < DateTime.now()`, sorted descending, collapsed by default (show "X past trips" with expand chevron)

### Screen layout:

**App bar:** `"My Trips"` — 18px bold `#16323F`. No elevation.

**Below app bar:** `ConnectivityBanner()`.

**Body:**

Loading state: 2 skeleton `TripCard` placeholders (shimmer).

Empty state (no trips): centered illustration area (use a simple SVG compass or map icon at 80dp, teal `#57C5B6`) + heading `"No trips yet"` 16px bold + body `"Experiences you book will appear here, ready to access offline."` 14px `#5B7682`.

Error state: `"Couldn't load your trips"` + retry button.

Loaded state:

Upcoming section: render each trip as a `TripCard` widget (see below). No section header if only one section visible.

Past section: collapsible. Header row: `"Past trips (N)"` + chevron. Tapping expands to show past `TripCard` rows in a compact variant (`compact: true`).

### `TripCard` widget (create in `lib/widgets/trip_card.dart`):

```dart
class TripCard extends StatelessWidget {
  final OfflineTrip trip;
  final bool compact;   // compact = true for past trips
  final VoidCallback onTap;
}
```

Full card (upcoming):
- White card, `borderRadius: 16px`, subtle shadow
- Hero area: teal gradient strip `#159895 → #1A5F7A` at full width, 80dp tall, with `experienceTitle` overlaid in white 16px bold. If `mapTileLocalPath` exists, use it as the background image with a dark overlay instead of gradient.
- Body: operatorName 13px `#5B7682` + formatted date+time 14px `#16323F` bold.
- Footer row: `OfflineReadinessChip(state: ..., lastSyncedAt: trip.lastSyncedAt)` left + chevron-right icon `#93A8B1` right.
- On tap: navigate to `/voucher/{bookingId}`.

Compact card (past):
- No hero area. Single row: title bold 14px left + date 13px `#93A8B1` right + small `OfflineReadinessChip` far right.
- Lighter shadow.

### Pull to refresh:
Wrap list in `RefreshIndicator`. On refresh:
- If online: call `refreshTripStatus` for all upcoming trips, then `ref.refresh(allTripsProvider)`.
- If offline: show snackbar `"Connect to the internet to refresh your trips"`. Do not throw an error.

### Analytics:
`my_trips_screen_viewed`, `trip_card_tapped (bookingId, isOnline)`.
```

---

## PROMPT 08 — Pre-Trip Sync Bottom Sheet

```
Create `lib/widgets/pre_trip_sync_sheet.dart` — a bottom sheet for downloading a full trip package offline.

This sheet is shown:
1. Immediately after booking confirmation (from the booking confirmation bottom sheet)
2. When traveller taps `OfflineReadinessChip` with state `notSaved` or `failed`
3. From a "Download for offline" button on the Experience Detail screen (if booking exists)
4. Via a push notification deep-link 24h before departure

### Show method:
```dart
static Future<void> show(BuildContext context, {required String bookingId}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => PreTripSyncSheet(bookingId: bookingId),
  );
}
```

### Widget: `PreTripSyncSheet`

Load trip data via `tripProvider(bookingId)` (if not cached yet, use a slim skeleton or load from a separate `GET /api/v1/bookings/{bookingId}` call and cache immediately).

### Layout (bottom sheet, max-height 60% of screen, drag handle at top):

**Header:**
`"Save trip offline"` — 18px bold `#16323F`.
Sub-line: `experienceTitle` + formatted date — 13px `#5B7682`.

**Asset checklist (4 rows):**
Each row: icon left + label + size estimate + status indicator right.

| Icon | Label | Condition |
|------|-------|-----------|
| ticket | Voucher & QR | Always included — `<1 MB` |
| map-pin | Meeting point map | Always included — `~0.5 MB` |
| headphones | Audio guide | Only if `audioGuideAvailable == true` — show actual size e.g. `~18 MB` |
| file-text | Experience details | Always included — `<1 MB` |

Status indicator per row:
- `pending` → grey circle
- `downloading` → `LinearProgressIndicator` (thin, teal, 4dp height) replacing the circle
- `done` → teal checkmark
- `failed` → coral X with "Retry" text button inline

**Storage note:**
`"Will use approximately [X] MB of your storage"` — 12px `#93A8B1`. Calculate from asset sizes.

**CTA button:**

Not yet downloaded:
`"Download now"` — full-width, teal `#1A5F7A` background, white text, 16px `Outfit` semibold, 56dp height, `borderRadius: 12px`.

If already fully cached:
Replace button with a success state: teal checkmark icon + `"Trip saved offline"` 16px teal text + `OfflineReadinessChip(state: saved)`. Show `"Last updated: [time]"` 12px `#93A8B1` below. Show a `TextButton` `"Refresh"` (online only).

Downloading in progress:
Button becomes `"Downloading…"` with an `CircularProgressIndicator` (white, 16dp) inside. Disable tap. Show overall progress percentage top-right of button.

Partial failure:
`"Partially saved"` in amber. List which assets failed with individual retry buttons. Do not fail the whole download if audio fails — booking data + map always save.

### On "Download now" tap:
Call `OfflineCacheService.downloadTripAssets(bookingId)`. Listen to the progress `Stream<TripDownloadProgress>` and update each asset row's state reactively.

On completion: auto-advance button to success state. Do NOT auto-close the sheet — let the traveller read the success state and close manually.

If offline when sheet opens: show an inline amber banner at top: `"You're offline. Connect to download."` and disable the CTA button.

### Analytics:
`pre_trip_sheet_opened (bookingId, trigger: 'post_booking' | 'chip_tap' | 'notification' | 'detail_screen')`
`offline_sync_triggered (bookingId, assetsRequested: [...])` 
`offline_sync_completed (bookingId, assetsDownloaded: [...], assetsFailed: [...])`
```

---

## PROMPT 09 — Booking Confirmation Bottom Sheet

```
After the Bókun checkout webview dismisses and a `booking_confirmed` event is detected, show a booking confirmation bottom sheet before returning the traveller to the app.

### Where to trigger:
In the existing webview handler (wherever `booking_confirmed` analytics event is currently fired — search for `booking_confirmed` or `bookingConfirmed` in the codebase). After firing the analytics event and creating the Booking record, call `BookingConfirmationSheet.show(context, bookingId: confirmedBookingId)`.

### Create `lib/widgets/booking_confirmation_sheet.dart`:

```dart
static Future<void> show(BuildContext context, {required String bookingId, required String experienceTitle, required DateTime experienceDate}) async {
  // First, trigger the cache immediately (don't wait for sheet interaction)
  // Call OfflineCacheService.cacheTrip in the background
  // Then show the sheet
}
```

### Sheet layout (non-dismissible on first render — require explicit action):

**Top: success animation**
A simple `AnimatedContainer` that scales in a teal circle with a white checkmark. Use `scaleIn` animation (0.4s cubic-bezier spring, matching the existing animation system). No Lottie dependency — keep it native Flutter.

**Heading:** `"You're booked!"` — `Outfit` 22px bold `#16323F` centered.

**Sub:** `experienceTitle` — 15px `#5B7682` centered.
Date chip: pill with calendar icon + formatted `experienceDate` — teal bg 10% opacity, teal text.

**Booking reference:**
`"Booking ref: SEL-12345"` — monospace style 14px `#5B7682` centered. Copy icon beside it.

**Divider**

**Offline prompt section:**
Icon: `download-cloud` (lucide) in teal `#57C5B6`, 32dp.
Heading: `"Save your trip offline"` — 16px bold `#16323F`.
Body: `"Download your voucher, meeting point, and audio guide now so they work without internet at the experience."` — 14px `#5B7682`.

**Buttons — two stacked:**

Primary: `"Save offline now"` → calls `PreTripSyncSheet.show(context, bookingId: bookingId)` then dismisses this sheet.
Full width, teal `#1A5F7A`, 56dp, `borderRadius: 12px`.

Secondary: `"View ticket"` → navigates to `/voucher/{bookingId}` and dismisses this sheet.
Full width, outlined border `#1A5F7A`, same dimensions.

**Tertiary text link:** `"I'll do this later"` — `#93A8B1` 13px, centered, dismisses sheet.

### Background caching:
When the sheet opens, immediately call `OfflineCacheService.cacheTrip` with the booking data (so the basic JSON is cached even if the traveller taps "I'll do this later" without going through PreTripSyncSheet). Asset downloads (map, audio) only happen via PreTripSyncSheet.

### Analytics:
`booking_confirmation_sheet_shown (bookingId)`
`booking_confirmation_save_offline_tapped`
`booking_confirmation_view_ticket_tapped`
`booking_confirmation_dismissed_without_save`
```

---

## PROMPT 10 — Experience Detail Screen: Offline Additions

```
Modify the existing Experience Detail screen (FR-011 in BRD 3, file likely `lib/screens/experience_detail_screen.dart` or similar — search for the screen rendering `FR-011` components: hero, title, duration, Book button, linked Stories/Tours).

Do NOT rebuild the screen. Add the following targeted additions only:

### Addition 1 — Existing booking banner (insert after hero, before description)

Check if the current traveller has a confirmed booking for this experience by calling `GET /api/v1/bookings/by-experience/{experienceId}` (or check `allTripsProvider` in Riverpod — filter by experienceId). If a booking exists and status is `confirmed`:

Show a full-width teal-wash card (`#57C5B6` at 8% opacity, `borderRadius: 12px`, border `#57C5B6` at 30%):
- Row: ticket icon `#1A5F7A` + `"You have a booking for this experience"` 14px bold `#1A5F7A` + chevron-right
- Sub-row: formatted experienceDate + `OfflineReadinessChip(state: ..., compact: true)`
- On tap: navigate to `/voucher/{bookingId}`

### Addition 2 — Save offline button in top app bar action area

In the action buttons row at top (where share/save buttons typically live): add a `download-cloud` icon button (lucide, 24dp).

Behaviour:
- If booking exists + trip is cached: icon is solid teal `#1A5F7A`, tooltip `"Saved offline"`
- If booking exists + trip not cached: icon is outline `#93A8B1`, tooltip `"Save for offline"` → on tap calls `PreTripSyncSheet.show(context, bookingId: bookingId)`
- If NO booking exists yet: do not show this button at all (it's meaningless pre-booking)

### Addition 3 — Meeting point section: offline indicator

The meeting point section already shows the address (FR-011). Add `OfflineReadinessChip` inline after the address text. If the map tile for this booking is cached: `state: saved`. If not: `state: notSaved`, tappable → PreTripSyncSheet.

Replace the static address display with `CachedMeetingPointMap` if a booking exists and map is cached. If no booking yet, keep the existing address display unchanged — don't add a live map widget to the detail screen for non-booked experiences.

### Nothing else changes.
Do not touch the Book Now button, the webview logic, the linked Stories/Tours section, the refund disclosure, or any other FR-011 component.
```

---

## PROMPT 11 — Profile Tab: Offline Download Management Extension

```
Extend the existing "Offline Download Management" section in the Profile tab (already exists per the Knowledge Base — search for it in the Profile tab widget tree).

Do NOT rebuild the section. Add a new sub-section ABOVE the existing audio content downloads.

### New sub-section: "Trip Packages"

Place at the top of the Offline Download Management screen/section, above any existing content.

**Section header row:** `"Trip Packages"` — 14px `Outfit` semibold `#16323F` + storage badge: `"[X.X] MB used"` right-aligned, 12px `#93A8B1`.

**Content:**

Load from `allTripsProvider`. Filter to trips that have at least one cached asset (`syncState != notCached`).

If none cached: `"No trip packages saved yet"` — 13px `#93A8B1`. No empty state illustration here (keep it minimal for a settings-style screen).

For each cached trip, render a `TripStorageRow`:

```
[Experience title — 14px bold]         [Saved offline chip]
[Operator · Date — 13px #5B7682]       [X.X MB — 12px #93A8B1]
[Asset breakdown pills: ✓ QR  ✓ Map  ✓ Audio]
[Delete button — text, coral, right aligned]
```

Asset breakdown pills: small chips `12px`, grey bg, showing which assets are cached (QR always ✓ if trip cached, Map ✓/✗, Audio ✓/✗).

Delete: `TextButton` `"Remove"` in `#E76161`. On tap: show a `showDialog` confirmation: `"Remove offline data for [title]? You can re-download it from My Trips."` with `"Remove"` (coral) and `"Cancel"` buttons. On confirm: call `OfflineCacheService.deleteTrip(bookingId)` and `ref.refresh(allTripsProvider)`.

**Footer of section (after all trip rows):**

Storage breakdown row: `"Trip data: [X MB]"` · `"Audio: [X MB]"` · `"Maps: [X MB]"` — horizontal, 12px `#93A8B1`, from `OfflineCacheService.getStorageStats()`.

`"Delete all trip data"` — full-width `OutlinedButton` with coral border and coral text. Confirmation dialog required: `"Delete all offline trip data? Your bookings won't be affected, but you'll need to re-download to access them offline."` Two buttons: `"Delete all"` coral + `"Cancel"`.

### Wiring:
Use Riverpod. No `setState`. Load `allTripsProvider` and `storageStatsProvider` (new provider wrapping `getStorageStats()`).

Refresh storage stats after any delete operation via `ref.refresh`.
```

---

## PROMPT 12 — Analytics Events Registration

```
Register all new offline analytics events in the existing Gamana analytics service (find it by searching for where existing events like `experience_viewed`, `book_button_clicked` are fired — likely a service or mixin in `lib/services/analytics_service.dart` or similar).

Add the following events as typed methods. Follow the exact same pattern as existing events:

```dart
// Voucher screen
void logVoucherViewed({required String bookingId, required bool isOnline, required String syncState, required String bookingStatus});
void logQrDisplayed({required String bookingId, required bool isOnline});

// Offline sync
void logOfflineSyncTriggered({required String bookingId, required String trigger, required List<String> assetsRequested});
// trigger values: 'post_booking' | 'chip_tap' | 'notification' | 'detail_screen' | 'manual_refresh'
void logOfflineSyncCompleted({required String bookingId, required List<String> assetsDownloaded, required List<String> assetsFailed});

// Pre-trip sheet
void logPreTripSheetOpened({required String bookingId, required String trigger});
void logPreTripSheetDismissed({required String bookingId, required bool syncCompleted});

// Stale/cancelled state
void logStaleVoucherWarningShown({required String bookingId, required int hoursStale});
void logCancelledBookingIntercepted({required String bookingId});

// My Trips
void logMyTripsScreenViewed({required int upcomingCount, required int cachedCount});
void logTripCardTapped({required String bookingId, required bool isOnline, required String syncState});

// Booking confirmation
void logBookingConfirmationSheetShown({required String bookingId});
void logBookingConfirmationSaveOfflineTapped({required String bookingId});
void logBookingConfirmationDismissedWithoutSave({required String bookingId});

// Storage management
void logOfflineDataDeleted({required String bookingId, required double mbFreed});
void logAllOfflineDataDeleted({required double totalMbFreed});
```

Do not change any existing event signatures. Add only. Place these in the same file/class as existing events.
```

---

## Build order summary

| # | Prompt | Depends on |
|---|--------|-----------|
| 01 | OfflineCacheService | — |
| 02 | ConnectivityService + Banner | 01 |
| 03 | OfflineReadinessChip | 01, 02 |
| 04 | BookingQrWidget | — |
| 05 | CachedMeetingPointMap | 01 |
| 06 | VoucherScreen | 01, 02, 03, 04, 05 |
| 07 | MyTripsScreen | 01, 02, 03, 06 |
| 08 | PreTripSyncSheet | 01, 02, 03 |
| 09 | BookingConfirmationSheet | 01, 08 |
| 10 | Experience Detail additions | 01, 03, 08 |
| 11 | Profile Offline Management | 01, 03 |
| 12 | Analytics events | All |

---

## pubspec.yaml additions (add before running any prompt)

```yaml
dependencies:
  qr_flutter: ^4.1.0
  connectivity_plus: ^6.0.3
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  path_provider: ^2.1.2
  dio: ^5.4.3
  wakelock_plus: ^1.2.3
  screen_brightness: ^0.2.2+1
  workmanager: ^0.5.2
  url_launcher: ^6.2.6
  shimmer: ^3.0.0

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.8
```

Run `flutter pub get` then `flutter pub run build_runner build` before starting with Prompt 01.
