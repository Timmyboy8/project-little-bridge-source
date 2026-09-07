// A random browser identifier, never a name, email, fingerprint or child record.
const browserIdKey = "plb-browser-uuid-v1";
const registeredKey = "plb-browser-counted-v1";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
let memoryId: string | null = null;

export function getOrCreateBrowserId(): string {
  try {
    const stored = window.localStorage.getItem(browserIdKey);
    if (stored && uuidPattern.test(stored)) return stored;
  } catch { /* Activities still work when browser storage is unavailable. */ }
  if (!memoryId) memoryId = crypto.randomUUID();
  try { window.localStorage.setItem(browserIdKey, memoryId); } catch { /* Memory fallback. */ }
  return memoryId;
}

export function browserNeedsRegistration(id: string): boolean {
  try {
    // Do not call a temporary in-memory identity a persistent unique browser.
    return window.localStorage.getItem(browserIdKey) === id
      && window.localStorage.getItem(registeredKey) !== id;
  } catch { return false; }
}

export function markBrowserRegistered(id: string) {
  try { window.localStorage.setItem(registeredKey, id); } catch { /* Safe to retry. */ }
}
