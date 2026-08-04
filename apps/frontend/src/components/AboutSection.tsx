"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, Compass, Camera, Sparkles } from "lucide-react";

export function AboutSection() {
  const pillars = [
    {
      id: "01",
      icon: Compass,
      title: "Natural & Ambient Light",
      desc: "We paint with organic rays and ambient shadows, preserving the real atmosphere of your venue.",
    },
    {
      id: "02",
      icon: Sparkles,
      title: "Candid Narratives",
      desc: "Zero forced posing. We document unprompted smiles, raw glances, and emotional reactions.",
    },
    {
      id: "03",
      icon: Camera,
      title: "Signature Warm Tone",
      desc: "Our unique color science uses organic warm tones to give your memories a timeless, cinematic finish.",
    },
  ];

  return (
    // Shares the tint with StatsBanner above it: the two read as one
    // introductory block rather than two separate bands.
    <section id="about" className="w-full py-20 md:py-28 bg-surface overflow-hidden relative select-none">
      
      {/* 
        User SVGs used as subtle luxury watermarks.
        Removed rotate-180 to position the vintage camera graphic right side up!
      */}
      <div className="absolute -top-12 -left-12 w-[350px] h-[350px] opacity-[0.08] mix-blend-multiply pointer-events-none select-none z-0">
        <Image
          unoptimized
          src="/image-from-rawpixel-id-6482040-svg.svg"
          alt="Ornate corner frame"
          fill
          className="object-contain"
        />
      </div>

      <div className="absolute -bottom-16 -right-16 w-[400px] h-[400px] opacity-[0.08] mix-blend-multiply pointer-events-none select-none z-0">
        <Image
          src="/image-from-rawpixel-id-6556892-svg.svg"
          alt="Ornate corner leaves"
          fill
          className="object-contain"
        />
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left Side: Staggered Dynamic Image Collage with elegant shadows & frames */}
        <div className="lg:col-span-5 relative w-full h-[580px] flex items-center justify-center">
          
          {/* Main Large Vertical Image Frame */}
          <div className="relative w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white transition-transform duration-500 hover:scale-[1.01] hover:shadow-2xl z-10">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                unoptimized
                src="https://res.cloudinary.com/ujwz0e7r/image/upload/w_600,q_auto,f_auto/about_main.png"
                alt="Director's visual choice"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
          </div>

          {/* Overlapping Small Offset Image Frame */}
          <div className="absolute bottom-6 right-4 sm:right-6 z-20 w-[180px] h-[240px] sm:w-[210px] sm:h-[280px] rounded-xl overflow-hidden shadow-lg border-4 border-white bg-white rotate-3 transition-all duration-500 hover:scale-[1.03] hover:rotate-0 hover:-translate-y-2">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image
                unoptimized
                src="https://res.cloudinary.com/ujwz0e7r/image/upload/w_600,q_auto,f_auto/about_candid.png"
                alt="Candid moment frame"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 20vw"
              />
            </div>
          </div>

          {/* Luxury Circular Studio Seal */}
          <div className="absolute top-10 left-2 sm:left-4 z-20 w-24 h-24 rounded-full bg-white/80 backdrop-blur-md border border-primary/10 flex flex-col items-center justify-center p-2 text-center shadow-lg -rotate-6 pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-dashed border-primary/20 flex flex-col items-center justify-center">
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary leading-none mb-1">
                VRUNDAVAN
              </span>
              <span className="text-[9px] font-serif italic text-rose-500 font-bold leading-none">
                Est. 2015
              </span>
              <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-primary mt-1">
                JUNAGADH
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Editorial Philosophy Text & 3 Key Pillars */}
        <div className="lg:col-span-7 flex flex-col justify-center gap-8 text-left relative z-10">
          
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              The Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-foreground">
              We capture the <br />
              <span className="italic font-light text-primary">unscripted, pure & eternal</span> moments.
            </h2>
            <div className="w-12 h-[2px] bg-primary/20 mt-2" />
          </div>

          {/* 3 Pillars */}
          <div className="flex flex-col gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.id} className="flex gap-4 items-start group/pillar cursor-pointer">
                  <span className="text-xs font-mono font-bold text-primary/40 group-hover/pillar:text-rose-500 transition-colors duration-300 pt-1">
                    {pillar.id}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 group-hover/pillar:text-primary transition-colors duration-300">
                      <Icon className="w-4 h-4 text-rose-400 group-hover/pillar:scale-115 transition-transform duration-300" />
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-lg">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signature and CTA Details */}
          <div className="flex items-center justify-between gap-6 border-t border-primary/10 pt-6 mt-2 max-w-lg">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                Vrundavan Studio
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#777777]">
                Junagadh, Gujarat
              </span>
            </div>
            
            <a
              href="#gallery"
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors"
            >
              Explore Gallery
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
