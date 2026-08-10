import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emotion Sync Online | Project Little Bridge",
  description: "Bilingual emotion-learning activities with adult accounts, child profiles, cross-device progress history, and downloadable reports.",
};

export default function EmotionSyncOnlineLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
