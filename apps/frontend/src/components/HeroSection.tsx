"use client";

import * as React from "react";
import Image from "next/image";
import { Sparkles, Calendar, Heart } from "lucide-react";

interface ImageCard {
  type: "image";
  src: string;
  h: string;
}

interface TextCard {
  type: "text";
  title: string;
  desc: string;
  h: string;
  bgColorClass: string;
  icon?: "sparkles" | "calendar" | "heart";
}

type CardItem = ImageCard | TextCard;

export function HeroSection() {
  const col1: CardItem[] = [
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC00362.JPG", h: "h-80" },
    {
      type: "text",
      title: "VRUNDAVAN",
      desc: "Preserving sacred union stories in organic cinema.",
      h: "h-56",
      bgColorClass: "bg-primary text-white",
      icon: "sparkles",
    },
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC00101.JPG", h: "h-96" },
  ];

  const col2: CardItem[] = [
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC07552.jpg", h: "h-72" },
    {
      type: "text",
      title: "4.9 ★ RATING",
      desc: "Over 320+ luxury destination weddings completed globally.",
      h: "h-64",
      bgColorClass: "bg-white text-foreground",
      icon: "heart",
    },
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC06391.jpg", h: "h-80" },
  ];

  const col3: CardItem[] = [
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC00362.JPG", h: "h-56" },
    {
      type: "text",
      title: "LOCATIONS",
      desc: "Shooting in Rajkot, Udaipur, Ahmedabad, & Dubai.",
      h: "h-56",
      bgColorClass: "bg-primary/90 text-white",
    },
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC00101.JPG", h: "h-96" },
  ];

  const col4: CardItem[] = [
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC07552.jpg", h: "h-56" },
    {
      type: "text",
      title: "BOOKINGS 2026",
      desc: "Open for bespoke destination bookings. Reserve dates.",
      h: "h-56",
      bgColorClass: "bg-white/10 backdrop-blur-md text-white border border-white/20",
      icon: "calendar",
    },
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC07552.jpg", h: "h-72" },
  ];

  const col5: CardItem[] = [
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC06391.jpg", h: "h-64" },
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC06391.jpg", h: "h-80" },
    { type: "image", src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC00362.JPG", h: "h-56" },
  ];

  const renderCard = (item: CardItem, idx: number, isDuplicate = false) => {
    // Keep duplicate cards visible (block) on all screen sizes to enable seamless scrolling loops
    const duplicateClass = "block";

    if (item.type === "image") {
      return (
        <div
          key={`${isDuplicate ? 'dup' : 'orig'}-${idx}`}
          className={`relative w-full ${item.h} rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-500 cursor-pointer group ${duplicateClass}`}
        >
          <Image
            src={item.src}
            alt="Vrundavan photo frame"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            priority={idx < 2}
            unoptimized
          />
        </div>
      );
    } else {
      return (
        <div
          key={`${isDuplicate ? 'dup' : 'orig'}-${idx}`}
          className={`relative w-full ${item.h} rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:scale-[1.03] transition-all duration-500 cursor-pointer ${item.bgColorClass} ${duplicateClass}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-75">
              Info
            </span>
            {item.icon === "sparkles" && <Sparkles className="w-4 h-4 text-sky-400" />}
            {item.icon === "heart" && <Heart className="w-4 h-4 text-rose-400" />}
            {item.icon === "calendar" && <Calendar className="w-4 h-4 text-sky-400" />}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold tracking-tight font-serif">
              {item.title}
            </h3>
            <p className="text-xs leading-relaxed opacity-90">
              {item.desc}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen w-full bg-[#030814] flex items-center justify-center overflow-hidden select-none"
    >
      {/* Re-enabled auto-scroll animations on mobile and desktop viewports */}
      <style jsx global>{`
        @keyframes scrollUpCol {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDownCol {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .col-scroll-up {
          animation: scrollUpCol 40s linear infinite;
          will-change: transform;
        }
        .col-scroll-down {
          animation: scrollDownCol 40s linear infinite;
          will-change: transform;
        }
        .col-container:hover .col-scroll-up,
        .col-container:hover .col-scroll-down {
          animation-play-state: paused;
        }
      `}</style>

      {/* Top & Bottom Gradient Overlays */}
      <div className="absolute top-0 inset-x-0 h-[30vh] bg-gradient-to-b from-[#030814] via-[#030814]/70 to-transparent z-20 pointer-events-none" />
      {/* Bottom fade blends the dark hero into the white section that follows */}
      <div className="absolute bottom-0 inset-x-0 h-[30vh] bg-gradient-to-t from-[#030814] via-[#030814]/70 to-transparent z-20 pointer-events-none" />

      {/* Tight Grid of columns - full screen width stretching to edges with px-4 matching gap-4 */}
      <div className="w-full max-w-full px-4 h-[110vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-10 relative z-10">

        {/* Column 1 - Always visible */}
        <div className="col-container relative h-full overflow-hidden">
          <div className="flex flex-col gap-4 col-scroll-up">
            {col1.map((item, idx) => renderCard(item, idx, false))}
            {col1.map((item, idx) => renderCard(item, idx, true))}
          </div>
        </div>

        {/* Column 2 - Always visible */}
        <div className="col-container relative h-full overflow-hidden">
          <div className="flex flex-col gap-4 col-scroll-down">
            {col2.map((item, idx) => renderCard(item, idx, false))}
            {col2.map((item, idx) => renderCard(item, idx, true))}
          </div>
        </div>

        {/* Column 3 - Hidden on mobile, visible on sm and up */}
        <div className="col-container relative h-full overflow-hidden hidden sm:block">
          <div className="flex flex-col gap-4 col-scroll-up">
            {col3.map((item, idx) => renderCard(item, idx, false))}
            {col3.map((item, idx) => renderCard(item, idx, true))}
          </div>
        </div>

        {/* Column 4 - Hidden on mobile/tablet, visible on md and up */}
        <div className="col-container relative h-full overflow-hidden hidden md:block">
          <div className="flex flex-col gap-4 col-scroll-down">
            {col4.map((item, idx) => renderCard(item, idx, false))}
            {col4.map((item, idx) => renderCard(item, idx, true))}
          </div>
        </div>

        {/* Column 5 - Hidden on mobile/tablet, visible on lg and up */}
        <div className="col-container relative h-full overflow-hidden hidden lg:block">
          <div className="flex flex-col gap-4 col-scroll-up">
            {col5.map((item, idx) => renderCard(item, idx, false))}
            {col5.map((item, idx) => renderCard(item, idx, true))}
          </div>
        </div>

      </div>
    </section>
  );
}
