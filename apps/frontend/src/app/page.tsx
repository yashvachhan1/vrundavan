import * as React from "react";

import { HeroSection } from "../components/HeroSection";
import { StatsBanner } from "../components/StatsBanner";
import { AboutSection } from "../components/AboutSection";
import { ServicesSection } from "../components/ServicesSection";
import { PackagesSection } from "../components/PackagesSection";
import { HomeClientWrapper } from "../components/HomeClientWrapper";

import { VideoShowcase } from "../components/VideoShowcase";
import { GallerySection } from "../components/GallerySection";
import { InstagramReels } from "../components/InstagramReels";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { FaqSection } from "../components/FaqSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";

export default function Home() {
  return (
    <HomeClientWrapper>
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
      <Footer />
    </HomeClientWrapper>
  );
}
