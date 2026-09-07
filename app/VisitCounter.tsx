"use client";

import { useEffect } from "react";
import { incrementSiteVisit, registerUniqueBrowser } from "./firebase-client";

let countedThisLoad = false;

export default function VisitCounter() {
  useEffect(() => {
    // Survives React effect replays and client navigation, resets on a full load.
    if (countedThisLoad) return;
    countedThisLoad = true;
    void incrementSiteVisit().catch(() => {});
    void registerUniqueBrowser().catch(() => {
      // Never block activities. A failed registration is retried next load.
    });
  }, []);

  return null;
}
