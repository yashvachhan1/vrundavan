"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Play, X, Volume2, VolumeX, Images, ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { motion, AnimatePresence } from "framer-motion";

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
      src: "/new_images/18.jpg",
      category: "weddings",
      title: "Royal Union",
      gridClass: "col-span-1 md:col-span-2 h-[450px]",
    },
    {
      id: 2,
      src: "/new_images/19.jpg",
      category: "pre-weddings",
      title: "My Home",
      gridClass: "col-span-1 md:col-span-2 h-[450px]",
    },
    {
      id: 3,
      src: "/new_images/20.jpg",
      category: "pre-weddings",
      title: "Golden Hour",
      gridClass: "col-span-1 md:col-span-2 h-[350px]",
    },
    {
      id: 4,
      src: "/new_images/21.jpg",
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
    <section id="gallery" className="w-full py-14 md:py-20 bg-surface text-foreground relative overflow-hidden select-none">
      
      <div className="max-w-[1440px] mx-auto w-full px-6 relative z-10">
        
        <SectionHeader
          icon={Images}
          eyebrow="Exhibition"
          title="Bespoke Film"
          accent="Gallery"
          aside={
            <div className="flex flex-wrap gap-x-6 gap-y-3 font-serif text-[10px] font-bold tracking-[0.25em] text-muted-foreground uppercase border-b border-border pb-2">
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
          }
        />

        {/* 
          Asymmetrical Cinematic Grid:
          Every card now displays the signature handwriting calligraphy script title 
          with the rounded gold name pill badge underneath, unified as requested.
        */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
        >
          <AnimatePresence>
          {filteredFilms.map((film) => (
            <motion.div
              layout
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
              key={film.id}
              onClick={() => setActiveImage(film.src)}
              className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-700 cursor-pointer bg-[#080808] ${film.gridClass}`}
            >
              {/* Cover Image Plate */}
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full h-full relative"
              >
                <Image
                  unoptimized
                  src={film.src}
                  alt={film.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </motion.div>
              
              {/* Subtle dark layout contrast vignette */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-700" />

              {/* Hover Plus Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-700 ease-out">
                  <Plus className="w-8 h-8 text-white/90" />
                </div>
              </div>

              {/* Unified Signature Calligraphy Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-left z-20 pointer-events-none translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                <div className="flex flex-col gap-0 items-start text-white">
                  <span className="font-script text-5xl sm:text-6xl text-white drop-shadow-md select-none leading-none opacity-90 group-hover:opacity-100 transition-opacity duration-700">
                    {film.title}
                  </span>
                </div>
              </div>

            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>

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
