"use client";

import * as React from "react";
import { VideoLoader } from "./VideoLoader";
import { Header } from "./Header";

interface HomeClientWrapperProps {
  children: React.ReactNode;
}

export function HomeClientWrapper({ children }: HomeClientWrapperProps) {
  const [loaderMounted, setLoaderMounted] = React.useState(true);
  const [revealed, setRevealed] = React.useState(false);

  return (
    // overflow-x-clip, not -hidden: `hidden` on one axis forces the other to
    // compute to `auto`, which turns this into a scroll container and silently
    // breaks `position: sticky` for everything inside (VideoShowcase's pinned
    // film). `clip` is exempted from that rule, so it still stops sideways
    // overflow without creating a scrollport.
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      {loaderMounted && (
        <VideoLoader
          onStartFade={() => setRevealed(true)}
          onComplete={() => setLoaderMounted(false)}
        />
      )}
      
      <Header />

      <div
        style={{
          transition: "opacity 1200ms ease",
          opacity: revealed ? 1 : 0,
        }}
      >
        {children}
      </div>
    </main>
  );
}
