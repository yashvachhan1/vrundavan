"use client";

import * as React from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Request Animation Frame loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Add Lenis CSS styles globally on mount to enable smooth scrolling
    const style = document.createElement("style");
    style.id = "lenis-css";
    style.textContent = `
      html.lenis, html.lenis body {
        height: auto;
      }
      .lenis.lenis-smooth {
        scroll-behavior: auto !important;
      }
      .lenis.lenis-smooth [data-lenis-prevent] {
        overflow: clip;
      }
      .lenis.lenis-stopped {
        overflow: hidden;
      }
      .lenis.lenis-smooth iframe {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      const injectedStyle = document.getElementById("lenis-css");
      if (injectedStyle) {
        injectedStyle.remove();
      }
    };
  }, []);

  return <>{children}</>;
}
