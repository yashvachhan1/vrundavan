import type { Metadata } from "next";
import { Geist_Mono, Great_Vibes, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "../components/SmoothScroll";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vrundavan Studio | Premium Wedding Photography & Cinematography",
  description: "Vrundavan Studio offers state-of-the-art wedding photography, pre-wedding shoots, cinematic films, events, and commercial creative visual productions.",
  keywords: ["Wedding Photography", "Cinematography", "Pre-wedding shoot", "Candid Photography", "Premium Wedding Photographer", "Best Wedding Photographer"],
  openGraph: {
    title: "Vrundavan Studio | Premium Wedding Photography",
    description: "State-of-the-art wedding photography, cinematic films, and premium events.",
    url: "https://vrundavanstudio.com",
    siteName: "Vrundavan Studio",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} ${greatVibes.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Wrap App tree in Lenis SmoothScroll for momentum inertia scrolling */}
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
