import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import VisitCounter from "./VisitCounter";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
});

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "variable",
});

const thaiFont = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: "variable",
});

export const metadata: Metadata = {
icons: {
  icon: "/plb-favicon.png",
},
  title: "Project Little Bridge | Emotion Sync",
  description:
    "Project Little Bridge is a student-led initiative creating Emotion Sync, a handheld learning tool for neurodivergent children.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${thaiFont.variable} antialiased`}
      >
        <VisitCounter />
        {children}
      </body>
    </html>
  );
}
