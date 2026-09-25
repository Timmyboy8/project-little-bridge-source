"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  signInAnonymously,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  increment,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { browserNeedsRegistration, getOrCreateBrowserId, markBrowserRegistered } from "./browser-identity";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC0fyoNT2tdTPELqoW0_IUp4rQ9jbndujc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "project-little-bridge.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "project-little-bridge",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "project-little-bridge.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "520000186712",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:520000186712:web:a0e7033a7c6a5875bf1d2d",
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | null = null;
let appCheckInitialized = false;
let guestAppCheckInitialized = false;

function getFirebaseApp() {
  if (!firebaseConfigured) throw new Error("Firebase is not configured");
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY;
  if (!appCheckInitialized && appCheckSiteKey && typeof window !== "undefined") {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
  }
  return app;
}

function services(guest = false) {
  const firebaseApp = guest ? (getApps().find((item) => item.name === "plb-guest") || initializeApp(firebaseConfig, "plb-guest")) : getFirebaseApp();
  const guestSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY;
  if (guest && guestSiteKey && !guestAppCheckInitialized && typeof window !== "undefined") {
    initializeAppCheck(firebaseApp, { provider: new ReCaptchaV3Provider(guestSiteKey), isTokenAutoRefreshEnabled: true });
    guestAppCheckInitialized = true;
  }
  return {
    auth: getAuth(firebaseApp),
    db: getFirestore(firebaseApp),
  };
}

export type FirebaseAdult = {
  uid: string;
  displayName: string;
  email: string;
};

export type FirebaseChildProfile = {
  id: string;
  nickname: string;
  createdAt: string;
};

export function observeAdultAccount(
  callback: (adult: FirebaseAdult | null) => void,
  onError: () => void,
) {
  if (!firebaseConfigured) {
    callback(null);
    return () => undefined;
  }
  const { auth } = services();
  auth.useDeviceLanguage();
  void setPersistence(auth, browserLocalPersistence).catch(onError);
  return onAuthStateChanged(
    auth,
    (user: User | null) => callback(user ? {
      uid: user.uid,
      displayName: user.displayName || user.email || "Adult",
      email: user.email || "",
    } : null),
    onError,
  );
}

export async function signInAdult() {
  const { auth } = services();
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
}

export async function signInAdultWithEmail(email: string, password: string) {
  const { auth } = services();
  await setPersistence(auth, browserLocalPersistence);
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function createAdultWithEmail(email: string, password: string) {
  const { auth } = services();
  await setPersistence(auth, browserLocalPersistence);
  await createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function resetAdultPassword(email: string) {
  const { auth } = services();
  auth.useDeviceLanguage();
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutAdult() {
  await signOut(services().auth);
}

export async function incrementSiteVisit() {
  if (!firebaseConfigured) return;
  const { db } = services();
  await setDoc(doc(db, "publicMetrics", "siteVisits"), {
    count: increment(1),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function registerUniqueBrowser() {
  if (!firebaseConfigured) return;
  const id = getOrCreateBrowserId();
  if (!browserNeedsRegistration(id)) return;
  const { db } = services();
  const batch = writeBatch(db);
  // Rules require both writes together and reject a UUID already registered.
  // Concurrent tabs can therefore add only one to the unique-browser total.
  batch.set(doc(db, "browserVisitors", id), { firstSeenAt: serverTimestamp() });
  batch.set(doc(db, "publicMetrics", "uniqueBrowsers"), {
    count: increment(1), lastBrowserId: id, updatedAt: serverTimestamp(),
  }, { merge: true });
  await batch.commit();
  markBrowserRegistered(id);
}

export async function loadChildProfiles(uid: string, guest = false): Promise<FirebaseChildProfile[]> {
  const { db } = services(guest);
  const snapshot = await getDocs(query(
    collection(db, "users", uid, "children"),
    orderBy("createdAt", "asc"),
  ));
  return snapshot.docs.map((item) => ({
    id: item.id,
    nickname: String(item.data().nickname || ""),
    createdAt: String(item.data().createdAt || ""),
  }));
}

export async function createFirebaseChild(uid: string, nickname: string, guest = false): Promise<FirebaseChildProfile> {
  const { db } = services(guest);
  const childRef = doc(collection(db, "users", uid, "children"));
  const profile = {
    id: childRef.id,
    nickname: nickname.trim().slice(0, 40),
    createdAt: new Date().toISOString(),
  };
  await setDoc(childRef, { nickname: profile.nickname, createdAt: profile.createdAt });
  return profile;
}

export async function deleteFirebaseChild(uid: string, childId: string, guest = false) {
  const { db } = services(guest);
  const events = await getDocs(collection(db, "users", uid, "children", childId, "events"));
  for (let start = 0; start < events.docs.length; start += 400) {
    const batch = writeBatch(db);
    events.docs.slice(start, start + 400).forEach((event) => batch.delete(event.ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, "users", uid, "children", childId));
}

export async function loadFirebaseHistory(uid: string, childId: string, guest = false): Promise<unknown[]> {
  const { db } = services(guest);
  const snapshot = await getDocs(query(
    collection(db, "users", uid, "children", childId, "events"),
    orderBy("completedAt", "desc"),
  ));
  return snapshot.docs.map((item) => item.data().payload).filter(Boolean);
}

function eventDocument(event: Record<string, unknown>) {
  const payload = JSON.parse(JSON.stringify(event)) as Record<string, unknown>;
  return {
    kind: String(payload.kind || ""),
    completedAt: String(payload.completedAt || new Date().toISOString()),
    payload,
  };
}

function fallbackEventId() {
  return globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function saveFirebaseEvent(uid: string, childId: string, event: Record<string, unknown>, guest = false) {
  const { db } = services(guest);
  const eventId = String(event.id || fallbackEventId());
  await setDoc(doc(db, "users", uid, "children", childId, "events", eventId), eventDocument(event));
}

export async function importFirebaseEvents(uid: string, childId: string, events: Record<string, unknown>[], guest = false) {
  const { db } = services(guest);
  for (let start = 0; start < events.length; start += 400) {
    const batch = writeBatch(db);
    events.slice(start, start + 400).forEach((event) => {
      const eventId = String(event.id || fallbackEventId());
      batch.set(doc(db, "users", uid, "children", childId, "events", eventId), eventDocument(event));
    });
    await batch.commit();
  }
  return loadFirebaseHistory(uid, childId, guest);
}

// A separate persisted Auth instance keeps the guest identity when an adult signs in/out.
export async function ensureGuestIdentity() {
  const { auth, db } = services(true);
  await setPersistence(auth, browserLocalPersistence);
  await auth.authStateReady();
  const user = auth.currentUser || (await signInAnonymously(auth)).user;
  if (!user.isAnonymous) throw new Error("Unexpected guest identity");
  await setDoc(doc(db, "users", user.uid), { accountType: "guest", updatedAt: serverTimestamp() }, { merge: true });
  return user.uid;
}

export async function saveGuestProfile(uid: string, profile: FirebaseChildProfile) {
  const { db } = services(true);
  await setDoc(doc(db, "users", uid, "children", profile.id), {
    nickname: profile.nickname, createdAt: profile.createdAt,
  });
}

export function saveGuestEventBatch(uid: string, childId: string, events: Record<string, unknown>[]) {
  const { db } = services(true);
  const batch = writeBatch(db);
  for (const event of events) {
    batch.set(doc(db, "users", uid, "children", childId, "events", String(event.id)), eventDocument(event));
  }
  return batch.commit();
}
