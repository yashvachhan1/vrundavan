"use client";

import * as React from "react";
import Image from "next/image";

export function StatsBanner() {
  const avatars = [
    "https://res.cloudinary.com/ujwz0e7r/image/upload/w_200,q_auto,f_auto/DSC06545.JPG.jpeg",
    "https://res.cloudinary.com/ujwz0e7r/image/upload/w_200,q_auto,f_auto/DSC06585.JPG.jpeg",
    "https://res.cloudinary.com/ujwz0e7r/image/upload/w_200,q_auto,f_auto/DSC06608.JPG.jpeg",
    "https://res.cloudinary.com/ujwz0e7r/image/upload/w_200,q_auto,f_auto/DSC06623.JPG.jpeg",
  ];

  return (
    <section className="w-full px-4 md:px-8 py-14 md:py-16 bg-surface text-foreground flex flex-col justify-center items-center overflow-hidden">
      {/* Decorative shine and rotation animations */}
      <style jsx global>{`
        @keyframes shineSweep {
          0% { transform: translateX(-100%) rotate(15deg); }
          15% { transform: translateX(100%) rotate(15deg); }
          100% { transform: translateX(100%) rotate(15deg); }
        }
        .shine-light::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shineSweep 9s infinite ease-in-out;
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 15s linear infinite;
        }
      `}</style>

      {/* Subheading in tracked luxury font */}
      <div className="flex flex-col items-center gap-2 mb-10 text-center">
        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
          The Studio Legacy
        </span>
        <div className="w-8 h-[1px] bg-primary/20" />
      </div>

      {/* 
        Responsive Floating Pill Banner:
        Changed rounded-full to rounded-[2rem] on mobile and md:rounded-full on desktop.
        This prevents vertical stacking from breaking/overflowing on smaller mobile screen widths.
      */}
      <div className="shine-light relative w-full max-w-5xl rounded-[2rem] md:rounded-full bg-white border border-primary/10 p-6 md:p-6 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 px-6 md:px-14 overflow-hidden">
        
        {/* Left: 200+ Stories */}
        <div className="flex items-center gap-5 group/stat cursor-pointer z-10 w-full md:w-auto justify-center md:justify-start">
          <div className="relative flex items-center justify-center">
            {/* Spinning decorative accent ring */}
            <div className="absolute w-14 h-14 rounded-full border border-dashed border-gold-deep/70 animate-spin-slow" />
            <div className="absolute w-12 h-12 rounded-full border border-gold/30 -left-1 transition-transform duration-500 group-hover/stat:scale-110" />
            <span className="relative text-3xl md:text-4xl font-serif text-foreground font-normal z-10 pl-2">
              200+
            </span>
          </div>
          <div className="flex flex-col text-left max-w-[130px]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight transition-colors duration-300 group-hover/stat:text-primary">
              Handcrafted wedding stories told.
            </span>
          </div>
        </div>

        {/* Divider 1 */}
        <div className="hidden md:flex items-center justify-center h-10 relative">
          <div className="h-10 w-[1px] bg-primary/10" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/25" />
        </div>

        {/* Center: 11+ Years Tagline */}
        <div className="text-center py-2 md:py-0 z-10 group/mid cursor-pointer w-full md:w-auto">
          <p className="text-lg md:text-2xl font-serif text-foreground font-normal tracking-tight transition-transform duration-500 group-hover/mid:scale-[1.01] leading-tight">
            11+ Years of <span className="italic font-light text-primary">Capturing Raw Emotions</span>
          </p>
        </div>

        {/* Divider 2 */}
        <div className="hidden md:flex items-center justify-center h-10 relative">
          <div className="h-10 w-[1px] bg-primary/10" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/25" />
        </div>

        {/* Right: Avatars & Rating */}
        <div className="flex items-center gap-5 group/rating cursor-pointer z-10 w-full md:w-auto justify-center md:justify-start">
          {/* Overlapping avatars */}
          <div className="flex -space-x-3 transition-transform duration-500 group-hover/rating:-translate-x-1">
            {avatars.map((src, i) => (
              <div
                key={i}
                className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:z-20 cursor-pointer"
              >
                <Image
                  unoptimized
                  src={src}
                  alt={`Couple Avatar ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col text-left">
            <span className="text-sm text-gold font-bold tracking-widest transition-transform duration-300 group-hover/rating:scale-105 origin-left">
              ★★★★★
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 transition-colors duration-300 group-hover/rating:text-primary">
              4.9 with 320+ ratings
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
