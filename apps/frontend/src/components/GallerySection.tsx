"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Play, X, Volume2, VolumeX, Images, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface FilmItem {
  id: number;
  src: string;
  category: "all" | "weddings" | "pre-weddings" | "films";
  title: string;       // Used for the calligraphy script title
  gridClass: string;
}

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "weddings" | "pre-weddings" | "films">("all");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (activeImage) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [activeImage]);

  const films: FilmItem[] = [
    {
      id: 1,
      src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC00362.JPG",
      category: "weddings",
      title: "Royal Union",
      gridClass: "col-span-1 md:col-span-2 h-[450px]",
    },
    {
      id: 2,
      src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC00101.JPG",
      category: "pre-weddings",
      title: "My Home",
      gridClass: "col-span-1 md:col-span-2 h-[450px]",
    },
    {
      id: 3,
      src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC07552.jpg",
      category: "pre-weddings",
      title: "Golden Hour",
      gridClass: "col-span-1 md:col-span-2 h-[350px]",
    },
    {
      id: 4,
      src: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC06391.jpg",
      category: "films",
      title: "Love Waltz",
      gridClass: "col-span-1 md:col-span-2 h-[350px]",
    },
  ];

  const filteredFilms = activeCategory === "all"
    ? films
    : films.filter((f) => f.category === activeCategory);

  const currentIndex = filteredFilms.findIndex(f => f.src === activeImage);
  const hasNext = currentIndex < filteredFilms.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNext) setActiveImage(filteredFilms[currentIndex + 1].src);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrev) setActiveImage(filteredFilms[currentIndex - 1].src);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeImage) return;
    try {
      const response = await fetch(activeImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = activeImage.split("/").pop() || "vrundavan-image.jpg";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <section id="gallery" className="w-full py-20 md:py-28 bg-surface text-foreground relative overflow-hidden select-none">
      
      <div className="max-w-[1440px] mx-auto w-full px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-16 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Images className="w-4 h-4 text-gold-deep" />
              <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
                Exhibition
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-foreground">
              Bespoke Film <span className="italic font-light text-primary">Gallery</span>
            </h2>
            <div className="w-12 h-[2px] bg-primary/20 mt-2" />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 font-serif text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase border-b border-slate-200/50 pb-2">
            {(["all", "weddings", "pre-weddings", "films"] as const).map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`hover:text-primary transition-colors cursor-pointer relative pb-1 ${
                    isActive ? "text-primary" : ""
                  }`}
                >
                  {cat.replace("-", " ")}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary" />
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
              onClick={() => setActiveImage(film.src)}
              className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-500 cursor-pointer bg-[#080808] ${film.gridClass}`}
            >
              {/* Cover Image Plate */}
              <Image
                unoptimized
                src={film.src}
                alt={film.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-103"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {/* Subtle dark layout contrast vignette */}
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors duration-500" />

              {/* Unified Signature Calligraphy Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-left z-20 pointer-events-none">
                <div className="flex flex-col gap-0 items-start text-white">
                  <span className="font-script text-5xl sm:text-6xl text-white drop-shadow-md select-none leading-none">
                    {film.title}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 
        Fullscreen Image Lightbox Player Modal (Rendered via Portal to escape overflow-hidden)
      */}
      {activeImage && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setActiveImage(null)}
          data-lenis-prevent="true"
        >
          {/* Main Image Container Frame */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            />

            {/* Custom Control Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-3 z-30">
              <button
                onClick={handleDownload}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                aria-label="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveImage(null)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Arrows */}
            {hasPrev && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer z-30"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer z-30"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
