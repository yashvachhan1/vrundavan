"use client";

import * as React from "react";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { StatsBanner } from "../components/StatsBanner";
import { AboutSection } from "../components/AboutSection";
import { ServicesSection } from "../components/ServicesSection";
import { VideoShowcase } from "../components/VideoShowcase";
import { GallerySection } from "../components/GallerySection";
import { PackagesSection } from "../components/PackagesSection";
import { InstagramReels } from "../components/InstagramReels";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { FaqSection } from "../components/FaqSection";
import { ContactSection } from "../components/ContactSection";
import { VideoLoader } from "../components/VideoLoader";

export default function Home() {
  const [loaderMounted, setLoaderMounted] = React.useState(true);
  const [revealed, setRevealed] = React.useState(false);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Video Loader fades out to reveal the home content */}
      {loaderMounted && (
        <VideoLoader
          onStartFade={() => setRevealed(true)}
          onComplete={() => setLoaderMounted(false)}
        />
      )}
      
      {/* 
        Home page content: uses hardware-accelerated quintic ease-out curve.
        It starts slightly scaled down and translated down, then slowly floats up 
        and fades in with high fidelity (no blur lag) for 60fps buttery-smooth transition.
      */}
      {/* 
        Render Header outside of the transformed container to prevent CSS transform 
        from breaking the position: fixed sticky tracking.
      */}
      <div style={{ opacity: revealed ? 1 : 0, transition: "opacity 1200ms ease" }}>
        <Header />
      </div>

      {/* 
        Home page content: uses hardware-accelerated quintic ease-out curve.
        It starts slightly scaled down and translated down, then slowly floats up 
        and fades in with high fidelity (no blur lag) for 60fps buttery-smooth transition.
      */}
      <div
        style={{
          transition: "opacity 1600ms cubic-bezier(0.22, 1, 0.36, 1), transform 1600ms cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: revealed ? 1 : 0,
          transform: revealed 
            ? "translateY(0px) scale(1)" 
            : "translateY(16px) scale(0.985)",
        }}
      >
        <HeroSection />
        <StatsBanner />
        <AboutSection />
        <ServicesSection />
        <VideoShowcase />
        <GallerySection />
        <PackagesSection />
        <InstagramReels />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </div>
    </main>
  );
}
