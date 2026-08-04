"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, Aperture, Compass, Eye, Film, User } from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      id: "01",
      title: "Destination Weddings",
      scriptLabel: "Vivah Stories",
      lens: "85mm f/1.4",
      desc: "Bespoke architectural wedding narratives documented across global heritage destinations.",
      img: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_600,q_auto,f_auto/services_destination.png",
      icon: Compass,
      href: "#contact",
    },
    {
      id: "02",
      title: "Pre-Wedding Stories",
      scriptLabel: "Love in Motion",
      lens: "35mm f/1.2",
      desc: "Poetic, unscripted coupling stories captured in organic natural golden lighting.",
      img: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_600,q_auto,f_auto/services_pre_wedding.png",
      icon: Eye,
      href: "#contact",
    },
    {
      id: "03",
      title: "Cinematic Wedding Films",
      scriptLabel: "Theatrical Cuts",
      lens: "24mm f/1.4",
      desc: "Directorial wedding showreels with custom soundtracks, color grading and dialogues.",
      img: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_600,q_auto,f_auto/services_cinematic.png",
      icon: Film,
      href: "#contact",
    },
    {
      id: "04",
      title: "Fine-Art Portraiture",
      scriptLabel: "Heritage Canvas",
      lens: "50mm f/1.2",
      desc: "Luxury studio lighting and classic staging emphasizing the royalty of character profiles.",
      img: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_600,q_auto,f_auto/services_portrait.png",
      icon: User,
      href: "#contact",
    },
  ];

  return (
    /* 
      Clean pure white background matching the header background.
      Completely borderless layout philosophy.
    */
    <section id="services" className="w-full py-20 md:py-28 bg-background text-foreground relative overflow-hidden select-none">
      
      {/* Subtle background decorative accents */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Ornate Background watermark (mix-blend-multiply blends cleanly on white background) */}
      <div className="absolute -top-6 -right-16 w-[450px] h-[450px] opacity-[0.06] pointer-events-none select-none z-0 mix-blend-multiply">
        <Image
          unoptimized
          src="/image-from-rawpixel-id-6482040-svg.svg"
          alt="Vintage camera background ornament"
          fill
          className="object-contain"
        />
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-10 md:mb-16 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Aperture className="w-4 h-4 text-gold-deep" />
            <span className="text-xs font-bold uppercase tracking-[0.35em]">
              Creative Fields
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-foreground">
            Our Service <span className="italic font-light text-primary">Categories</span>
          </h2>
          <div className="w-12 h-[2px] bg-primary/20 mt-2" />
        </div>

        {/* 
          Borderless Fine-Art Photography Grid:
          Completely removes cards, borders, and margins around images.
          Photos stretch full-bleed to their aspect ratios, acting as real gallery frames
          sitting on a clean white canvas. Text overlays cleanly inside the images.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <a
                key={srv.id}
                href={srv.href}
                className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.015] transition-all duration-500 cursor-pointer flex flex-col justify-end p-6 text-white"
              >
                {/* Full-bleed Photo Background */}
                <div className="absolute inset-0 z-0">
                  <Image
                    unoptimized
                    src={srv.img}
                    alt={srv.title}
                    fill
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Luxury dynamic gradient mask: gets darker on hover to prioritize text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent group-hover:from-black/90 transition-all duration-500" />
                </div>

                {/* Corner floating spec tag */}
                <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[8px] font-mono tracking-widest text-gold-soft">
                  <span>{srv.lens}</span>
                </div>

                {/* Details Overlay sitting directly on bottom of photo */}
                <div className="relative z-10 flex flex-col gap-2 w-full text-left">
                  
                  {/* Category Index & Icon Row */}
                  <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      <Icon className="w-3.5 h-3.5 text-gold-soft" />
                    </div>
                    <span className="text-[9px] font-mono text-white/50 tracking-wider">
                      {srv.id}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-gold-soft" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold-soft">
                      {srv.scriptLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-serif font-normal tracking-wide text-white leading-tight">
                    {srv.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-[11px] text-slate-200 leading-relaxed max-w-xs opacity-90">
                    {srv.desc}
                  </p>

                  {/* View Details CTA */}
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gold-soft pt-1 group-hover:text-white transition-colors duration-300">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5 duration-300" />
                  </div>

                </div>

              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
