# September 2026 update

- Added the 29 August visit to Autistic Thai Foundation (มูลนิธิออทิสติกไทย), with four supplied photos, bilingual captions, donation details and staff feedback.
- Updated the Bangkok map and reach summary to show both recipient foundations.
- Preserved multiple child profiles per adult account, separate cloud histories, all scenario images, reports, CSV export and the floating profile menu.
- Guest profiles now use a persistent random browser UUID. The existing storage key and history format remain compatible, so previous guest progress is retained.
- Added publicMetrics/uniqueBrowsers alongside the existing publicMetrics/siteVisits counter. UUID registration and its +1 increment are atomic; duplicate UUID registration, including from concurrent tabs, is rejected by Firestore rules.
- Public clients cannot read browser registrations or counters, alter existing registrations, delete metrics, or use these rules to access another adult's child data. Project administrators can inspect them in Firebase Console.
- Added stale-request protection when switching/signing out of adult accounts. Guest save failures are reported instead of claiming the activity was saved.
- Updated privacy wording in both languages to explain browser IDs and retention.

The unique-browser total begins with this release. It is not a verified people count and does not distinguish guests from signed-in visitors. This public client counter is not bot-proof. Browser data remains separate from cloud account data.

Publish the included firestore.rules before the website update. See UPLOAD-INSTRUCTIONS.txt.

Firebase documentation: https://firebase.google.com/docs/firestore/manage-data/transactions
Firebase rules deployment: https://firebase.google.com/docs/firestore/security/get-started

## Validation

Passed: clean dependency installation, production static build and TypeScript checks; exported homepage/activity/privacy routes; all four donation image files and all 12 existing scenario images; UUID persistence and registration acknowledgement; legacy guest-history migration; deletion isolation and blocked browser-storage handling.

Firebase emulator integration tests could not run because the available Java runtime is version 17 and the emulator requires Java 21+. Live Firebase counting, account flows and the new rules must be checked after deployment. No live Firebase data or website was modified during this update. Browser visual testing was not run.

## Donation directory redesign

Replaced the standalone foundation section with a reusable bilingual donation directory, numbered clickable map recipients, search and province filters. The directory shows at most four foundations per page. Each foundation opens in an accessible native dialog with its own story and optional photos. The landscape donation photograph occupies one full row; three portrait photos keep their original proportions below it, with no letterboxing. Mobile presents the photos in a single column. Earlier guest UUID and account functionality is unchanged.

To add a future foundation: add one record to app/donations.ts, using the province ID from @svg-maps/thailand and bilingual names/descriptions. Put its photos in public/donations/<record-id>/ and list their filenames, captions and orientation in the record. The directory filters, pagination, recipient numbering and highlighted map provinces derive from these records. Dates and photos can be omitted when unavailable; do not substitute photos from a different visit.
