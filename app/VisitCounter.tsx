"use client";

import { useEffect } from "react";
import { incrementSiteVisit } from "./firebase-client";

export default function VisitCounter() {
  useEffect(() => {
    void incrementSiteVisit().catch(() => {
      // Traffic counting must never interrupt the visitor's experience.
    });
  }, []);

  return null;
}
