"use client";
import { ensureGuestIdentity, loadChildProfiles, loadFirebaseHistory, saveGuestProfile, saveGuestEventBatch, deleteFirebaseChild, type FirebaseChildProfile } from "./firebase-client";
export type GuestEvent = Record<string, unknown> & { id: string };
export type GuestCache = {
  uid: string; profiles: FirebaseChildProfile[]; history: Record<string, GuestEvent[]>;
  pending: Record<string, GuestEvent[]>; deleted: string[]; legacyImported: boolean;
};
const cacheKey = "plb-guest-cloud-v2";
const consentKey = "plb-guest-cloud-enabled-v2";
const legacyKey = "emotion-sync-guest-progress-v1";
export function guestCloudEnabled() { try { return localStorage.getItem(consentKey) === "yes"; } catch { return false; } }
export function readGuestCache(): GuestCache | null {
  const raw = localStorage.getItem(cacheKey);
  if (!raw) return null;
  const value = JSON.parse(raw) as GuestCache;
  if (!value.uid || !Array.isArray(value.profiles) || !value.history || !value.pending || !Array.isArray(value.deleted)) throw new Error("Invalid saved guest data; please keep this browser's data for recovery.");
  return value;
}
function write(cache: GuestCache) { localStorage.setItem(cacheKey, JSON.stringify(cache)); }
let queue: Promise<unknown> = Promise.resolve();
function locked<T>(work: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => navigator.locks ? await navigator.locks.request("plb-guest-cloud", work) : await work();
  const result = queue.then(run, run); queue = result.catch(() => undefined); return result;
}
export function mergeGuestEvents(local: GuestEvent[], cloud: GuestEvent[]) {
  return [...new Map([...cloud, ...local].map((event) => [event.id, event])).values()]
    .sort((a,b) => String(b.completedAt).localeCompare(String(a.completedAt)));
}
export function importLegacy(cache: GuestCache, raw: string | null): GuestCache {
  if (cache.legacyImported) return cache;
  if (raw) {
    const legacy = JSON.parse(raw);
    if (!Array.isArray(legacy.history)) throw new Error("Unable to read old progress; original data has been kept.");
    const id = "legacy-browser-profile";
    const events: GuestEvent[] = legacy.history.map((event: GuestEvent, index: number) => ({ ...event, id: event.id || `legacy-${index}` }));
    const profile = { id, nickname: String(legacy.profile?.nickname || "Guest").slice(0,40), createdAt: legacy.profile?.createdAt && legacy.profile.createdAt !== "browser-only" ? legacy.profile.createdAt : new Date().toISOString() };
    cache.profiles.push(profile); cache.history[id] = events; cache.pending[id] = events;
  }
  cache.legacyImported = true;
  return cache;
}
function acknowledged<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Connection timed out; local data retained")), 12000); })]).finally(() => clearTimeout(timer));
}
async function sync(cache: GuestCache) {
  if (!navigator.onLine) throw new Error("Offline; waiting to sync");
  for (const id of [...cache.deleted]) {
    await acknowledged(deleteFirebaseChild(cache.uid, id, true));
    cache.deleted = cache.deleted.filter((item) => item !== id); write(cache);
  }
  for (const profile of cache.profiles) {
    await acknowledged(saveGuestProfile(cache.uid, profile));
    const pending = cache.pending[profile.id] || [];
    for (let index = 0; index < pending.length; index += 400) {
      await acknowledged(saveGuestEventBatch(cache.uid, profile.id, pending.slice(index, index + 400)));
    }
    cache.pending[profile.id] = []; write(cache);
  }
  // Keep the old local source until all profile and event writes have been acknowledged.
  if (cache.legacyImported) localStorage.removeItem(legacyKey);
  const cloudProfiles = await acknowledged(loadChildProfiles(cache.uid, true));
  cache.profiles = cloudProfiles;
  for (const profile of cloudProfiles) {
    const events = await acknowledged(loadFirebaseHistory(cache.uid, profile.id, true)) as GuestEvent[];
    cache.history[profile.id] = mergeGuestEvents(cache.history[profile.id] || [], events);
  }
  write(cache); return cache;
}
export async function startGuestCloud(): Promise<GuestCache> {
  return locked(async () => {
    const uid = await acknowledged(ensureGuestIdentity());
    let cache = readGuestCache();
    // Never silently attach another identity's local history to a new account.
    if (cache && cache.uid !== uid) throw new Error("Guest identity changed. Keep your local data and contact support to recover it.");
    cache = importLegacy(cache || { uid, profiles: [], history: {}, pending: {}, deleted: [], legacyImported: false }, localStorage.getItem(legacyKey));
    if (!cache.profiles.length) cache.profiles.push({id: "guest-default", nickname: "Guest", createdAt: new Date().toISOString()});
    write(cache); localStorage.setItem(consentKey, "yes");
    return sync(cache);
  });
}
export function syncGuestCloud() { return locked(async () => { const cache = readGuestCache(); if (!cache) throw new Error("Guest account unavailable"); return sync(cache); }); }
export function addGuestProfile(nickname: string) { return locked(async () => {
  const cache = readGuestCache(); if (!cache) throw new Error("Guest account unavailable");
  const profile = { id: crypto.randomUUID(), nickname: nickname.trim().slice(0,40), createdAt: new Date().toISOString() };
  cache.profiles.push(profile); cache.history[profile.id] = []; write(cache);
  return cache;
}); }
export function queueGuestEvent(childId: string, event: GuestEvent) { return locked(async () => {
  const cache = readGuestCache(); if (!cache || !cache.profiles.some((p) => p.id === childId)) throw new Error("Guest profile unavailable");
  cache.history[childId] = mergeGuestEvents([event], cache.history[childId] || []);
  cache.pending[childId] = mergeGuestEvents([event], cache.pending[childId] || []);
  write(cache); return cache;
}); }
export function removeGuestProfiles(ids: string[]) { return locked(async () => {
  const cache = readGuestCache(); if (!cache) throw new Error("Guest account unavailable");
  cache.deleted = [...new Set([...cache.deleted, ...ids])];
  cache.profiles = cache.profiles.filter((p) => !ids.includes(p.id));
  for (const id of ids) { delete cache.history[id]; delete cache.pending[id]; }
  write(cache); return sync(cache);
}); }
