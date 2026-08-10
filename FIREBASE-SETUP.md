# Emotion Sync Online — Firebase setup

The website is already connected to the Project Little Bridge Firebase web app.
Firebase Authentication stores the adult account, and Cloud Firestore stores
nickname-based child profiles, signed-in activity history, and an aggregate
website-visit count. Guest activity history stays in the visitor's browser.

## 1. Authentication providers

In Firebase Console, open **Authentication → Sign-in method** and keep these
providers enabled:

- Google
- Email/Password

The website supports Google sign-in, email/password sign-in, new account
creation, and password reset.

## 2. Authorized domains

In **Authentication → Settings → Authorized domains**, add each domain that
will display Emotion Sync Online:

- `projectlittlebridge.org`
- `www.projectlittlebridge.org`
- Your Netlify subdomain, if it is used directly
- `emotion-sync-online.timmyboy.chatgpt.site` while reviewing this build

Do not add `https://` or a path. Google sign-in will show an
`auth/unauthorized-domain` error until the current website domain is listed.

## 3. Publish the Firestore rules

Open **Firestore Database → Rules**, replace the editor contents with the
contents of `firestore.rules`, and click **Publish**.

The included rules allow a signed-in adult to read and write only data below
their own Firebase user ID, and allow any website visitor to increment only the
aggregate visit counter by exactly one:

```text
users/{adultUid}/children/{childId}
users/{adultUid}/children/{childId}/events/{eventId}
publicMetrics/siteVisits
```

Do not use test-mode rules. The checked-in rules also limit child profiles and
activity documents to the fields used by Emotion Sync Online.

## 4. Test cross-device saving

1. Sign in as an adult.
2. Create a child profile using a nickname.
3. Complete at least one activity.
4. Open the website in another browser or device.
5. Sign in with the same adult account and select the same child profile.
6. Open **Progress & history** and confirm the activity appears.

Signed-in activities are written directly to the selected child profile in
Firestore. Guest mode uses one browser-only Guest profile and stores its full
activity history in that browser. Guest history does not sync across devices
and may disappear if the browser's site data is cleared. It can be downloaded
as CSV or removed with **Delete browser data**.

Each full website load increments `publicMetrics/siteVisits` once. Moving
between pages inside the site does not increment it again until the site is
loaded again.

## 5. App Check (recommended before a public pilot)

After the final domain is live, register the web app under **Build → App Check**
with a reCAPTCHA provider. Add the public site key to Netlify as
`NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`, redeploy, confirm valid requests in
Firebase metrics, and only then enable enforcement for Firestore and
Authentication. Do not enable enforcement before testing the production site.

## 6. Before the public launch

- Keep child profiles nickname-only; do not collect full names, diagnoses,
  schools, addresses, or dates of birth.
- Confirm the included adult consent, privacy, bilingual data export, and
  permanent cloud-profile and guest-browser deletion flows on the production
  domain.
- Enable Firebase App Check after the production domain is final and tested.
- Review Authentication usage and Firestore usage in Firebase Console during
  the pilot.

The Firebase web configuration in this repository is a public client
identifier. Never commit a service-account JSON file, private key, password, or
Firebase CLI login token.
