import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["500", "600", "700", "800"],
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Changelog Radar",
  description:
    "CVE feeds lag. Changelog Radar scrapes npm and GitHub Releases through Bright Data Scraper Studio, gates rows with Zod, and self-heals collectors in place when the DOM moves.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${plex.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased [font-family:var(--font-plex),ui-sans-serif,system-ui,sans-serif]">
        {children}
      </body>
    </html>
  );
}
