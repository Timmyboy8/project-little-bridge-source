# Guest cloud saving update — 24 September 2026

This is a preview update. Your GitHub repository and projectlittlebridge.org are not changed automatically.

## Required Firebase setup before testing cloud guests

1. Firebase Console → your Project Little Bridge project → Authentication → Sign-in method → Anonymous → Enable → Save.
2. Firestore Database → Rules → paste the complete included firestore.rules → Publish.
3. If using Identity Platform, leave automatic anonymous-account cleanup disabled so guest accounts are not removed after 30 days.
4. Use the preview's Emotion Sync Online page → Continue as guest. Agree to the cloud-storage notice. For existing browser history, use Save existing progress online.

Guest identity is Firebase Authentication's UID, distinct from the older traffic-counting browser UUID. It persists in that browser. Each browser installation has its own guest identity; shared-browser profiles share that guest UID. Clearing site data may remove guest access; it does not delete cloud records.

## Where to see data

Firestore → users → [Guest UID displayed in the app]
- accountType: guest
- children → [profile ID]: nickname and createdAt
- children → [profile ID] → events → [activity ID]: activity type, completion time and complete payload (answers, timing, scenario selections, etc.)

Firebase Authentication → Users also lists each anonymous UID.

## Old progress and offline saving

Migration reads emotion-sync-guest-progress-v1 from the same browser and same website origin. Data saved on projectlittlebridge.org will migrate only when the update is deployed there and that visitor returns in the original browser. The separate preview domain cannot read that data.

The responsible adult accepts a notice before previously local-only history is uploaded. Original event IDs are reused, uploads run in batches of at most 400, and retrying does not add duplicate events. The old source remains until every upload is acknowledged. An updated browser copy is retained, and failed new results remain queued for reconnect, reload, or Retry sync. Do not clear browser data when a sync error is shown. If the browser cannot save locally, retain the open page and export CSV.

Guest and adult accounts remain separate, including during adult sign-in/sign-out. There is no automatic transfer into an adult account. Guest profile creation, switching, per-profile reports/export, and deletion are supported. Deletion removes both cloud events and the cached profile; internet is needed to complete it. Unfinished deletions are retried.

## Validation

Production build and TypeScript check; automated migration tests cover all activity kinds, retry after partial upload, multiple profiles, queued writes, deletion, identity mismatch, and malformed legacy data. Tests use a mocked Firebase service, not production or Firestore emulator. Live anonymous-auth and rules behavior still needs a check after enabling Anonymous and publishing rules. No production user data was read or changed during development.

## Visual changes

Full-screen hero and straight device retained. Practice Online and activity Start actions are bright yellow. Each guided game has a visual preview. A shared set of Happy, Sad, Angry, Calm artwork is reused in the homepage demo, guided listening, Explore Feelings, Everyday Feelings and digital-device screens.
