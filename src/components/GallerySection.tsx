"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X, Volume2, VolumeX, Sparkles } from "lucide-react";

interface FilmItem {
  id: number;
  src: string;
  videoSrc: string;
  category: "all" | "weddings" | "pre-weddings" | "films";
  title: string;       // Used for the calligraphy script title
  subtitle: string;    // Used for couple names inside the gold pill badge
  gridClass: string;
}

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "weddings" | "pre-weddings" | "films">("all");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const films: FilmItem[] = [
    {
      id: 1,
      src: "/DSC06545.JPG.jpeg",
      videoSrc: "/logo.mp4",
      category: "weddings",
      title: "Royal Union",
      subtitle: "Dev ♥ Priya",
      gridClass: "col-span-1 h-[450px]",
    },
    {
      id: 2,
      src: "/DSC06608.JPG.jpeg",
      videoSrc: "/logo.mp4",
      category: "pre-weddings",
      title: "My Home",
      subtitle: "Akash ♥ Divyaa",
      gridClass: "col-span-1 md:col-span-2 h-[450px]",
    },
    {
      id: 3,
      src: "/DSC06643.JPG.jpeg",
      videoSrc: "/logo.mp4",
      category: "films",
      title: "Forever",
      subtitle: "Kabir ♥ Kiara",
      gridClass: "col-span-1 h-[450px]",
    },
    {
      id: 4,
      src: "/DSC06650.JPG.jpeg",
      videoSrc: "/logo.mp4",
      category: "pre-weddings",
      title: "Golden Hour",
      subtitle: "Akshay ♥ Ruchi",
      gridClass: "col-span-1 md:col-span-2 h-[350px]",
    },
    {
      id: 5,
      src: "/DSC06629.JPG.jpeg",
      videoSrc: "/logo.mp4",
      category: "films",
      title: "Love Waltz",
      subtitle: "Rohan ♥ Riya",
      gridClass: "col-span-1 h-[350px]",
    },
    {
      id: 6,
      src: "/DSC06846.JPG.jpeg",
      videoSrc: "/logo.mp4",
      category: "weddings",
      title: "The Reception",
      subtitle: "Sid ♥ Kiara",
      gridClass: "col-span-1 h-[350px]",
    },
  ];

  const filteredFilms = activeCategory === "all"
    ? films
    : films.filter((f) => f.category === activeCategory);

  return (
    <section id="gallery" className="w-full py-28 bg-[#ffffff] text-[#1a1a1a] relative overflow-hidden select-none border-t border-slate-200">
      
      <div className="max-w-[92vw] mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#003366]">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
                Exhibition
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-[#1a1a1a]">
              Bespoke Film <span className="italic font-light text-[#003366]">Gallery</span>
            </h2>
            <div className="w-12 h-[2px] bg-[#003366]/20 mt-2" />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 font-serif text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase border-b border-slate-200/50 pb-2">
            {(["all", "weddings", "pre-weddings", "films"] as const).map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`hover:text-[#003366] transition-colors cursor-pointer relative pb-1 ${
                    isActive ? "text-[#003366]" : ""
                  }`}
                >
                  {cat.replace("-", " ")}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#003366]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 
          Asymmetrical Cinematic Grid:
          Every card now displays the signature handwriting calligraphy script title 
          with the rounded gold name pill badge underneath, unified as requested.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {filteredFilms.map((film) => (
            <div
              key={film.id}
              onClick={() => setActiveVideo(film.videoSrc)}
              className={`group relative rounded-[2rem] overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_65px_rgba(0,51,102,0.12)] hover:scale-[1.01] transition-all duration-500 cursor-pointer bg-[#080808] ${film.gridClass}`}
            >
              {/* Cover Image Plate */}
              <Image
                src={film.src}
                alt={film.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-103"
                sizes="(max-w-768px) 100vw, 33vw"
              />
              {/* Subtle dark layout contrast vignette */}
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors duration-500" />

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-15">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/35 flex items-center justify-center text-white scale-90 group-hover:scale-105 transition-all duration-300 shadow-md">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Unified Signature Calligraphy & Rounded Pill Badge Text Overlays */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-left z-20 pointer-events-none">
                <div className="flex flex-col gap-0 items-start text-white">
                  <span className="font-script text-5xl sm:text-6xl text-white drop-shadow-md select-none leading-none">
                    {film.title}
                  </span>
                  <span className="text-[9px] font-serif tracking-[0.25em] text-amber-300 uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 mt-2 font-medium">
                    {film.subtitle}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 
        Cinema Fullscreen Video Lightbox Player Modal:
      */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          {/* Main Video Container Frame */}
          <div 
            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={activeVideo}
              autoPlay
              controls
              playsInline
              muted={isMuted}
              className="w-full h-full object-contain"
            />

            {/* Custom Control Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-3 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setActiveVideo(null)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                aria-label="Close Playback"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
