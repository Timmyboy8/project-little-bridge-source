import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy & Data Use | Project Little Bridge",
  description: "How Emotion Sync Online collects, uses, protects, exports, and deletes account and child activity data.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
