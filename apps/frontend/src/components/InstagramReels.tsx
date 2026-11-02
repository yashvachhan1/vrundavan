"use client";

import React, { useState, useEffect, useRef } from 'react';

import { Clapperboard, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface ReelItem {
  id: string;
  url: string;
  sort_order?: number;
}

export type { ReelItem as ExportedReelItem };

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const getCleanUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    urlObj.search = ''; // clear query params
    return urlObj.toString();
  } catch {
    return url;
  }
};

const ReelCard = React.memo(({ reel }: { reel: ReelItem }) => {
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        attempts++;
        if (attempts >= 10) clearInterval(interval); // Try processing for up to 5 seconds
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="group relative flex-[0_0_326px] flex flex-col rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 bg-white snap-center border border-gray-100">
      {/* 
         min-height: 600px ensures it's visible to IntersectionObserver before loading.
         margin-bottom: -170px flawlessly guillotines EVERYTHING below the video 
         (native view more, icons, likes, comments), sacrificing ~5px of the video edge to be safe!
      */}
      <div 
        className="w-full relative"
        style={{ marginBottom: '-170px' }}
        dangerouslySetInnerHTML={{
          __html: `<blockquote 
            class="instagram-media" 
            data-instgrm-permalink="${getCleanUrl(reel.url)}" 
            data-instgrm-version="14" 
            style="background: white; border: 0; margin: 0; padding: 0; width: 326px; min-width: 326px; min-height: 600px;"
          ></blockquote>`
        }}
      />
      
      {/* CUSTOM NATIVE-LOOKING VIEW MORE LINK */}
      <a 
        href={reel.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative w-full py-4 bg-white flex items-center justify-center border-t border-black/5 hover:bg-gray-50 transition-colors z-20"
      >
        <span className="text-black font-semibold text-sm tracking-wide">View more on Instagram</span>
      </a>
    </div>
  );
});
ReelCard.displayName = 'ReelCard';

export function InstagramReels() {
  const [reels, setReels] = useState<ReelItem[]>([]);

  useEffect(() => {
    const fetchReels = async () => {
      const fallback: ReelItem[] = [];
      
      try {
        const res = await fetch('/api/reels');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setReels(data.sort((a: ReelItem, b: ReelItem) => (a.sort_order || 0) - (b.sort_order || 0)));
            return;
          }
        }
        setReels(fallback);
      } catch (e) {
        setReels(fallback);
      }
    };
    
    fetchReels();
  }, []);

  // Load Instagram embed script safely
  useEffect(() => {
    if (reels.length === 0) return;

    if (!window.instgrm && !document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [reels]);


  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const getStepWidth = () => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstElementChild as HTMLElement;
      if (firstChild) {
        return firstChild.offsetWidth + 24;
      }
    }
    return 344;
  };

  useEffect(() => {
    const measure = () => {
      const container = carouselRef.current;
      const first = container?.firstElementChild as HTMLElement | null;
      if (!container || !first) return;
      const gap = 24;
      const count = Math.max(
        1,
        Math.round((container.clientWidth + gap) / (first.offsetWidth + gap))
      );
      setVisibleCount(Math.min(count, reels.length));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reels.length]);

  const dotCount = Math.max(1, reels.length - visibleCount + 1);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -getStepWidth(), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: getStepWidth(), behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const stepWidth = getStepWidth();
      const index = Math.round(scrollLeft / stepWidth);
      setActiveIndex(Math.max(0, Math.min(index, dotCount - 1)));
    }
  };

  return (
    <section className="w-full py-14 md:py-20 bg-surface text-foreground relative overflow-hidden select-none">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-8 relative z-10">
        <SectionHeader
          icon={Clapperboard}
          eyebrow="Social Canvas"
          title="Instagram"
          accent="Reels"
          aside={
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href="https://www.instagram.com/vrundavan_studio_junagadh?mdxt=MXNqbDgxbGp0aXU1Nw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-serif font-bold tracking-wider border border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                <span>Follow @vrundavan_studio_junagadh</span>
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={scrollLeft}
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous Reels"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next Reels"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          }
        />
      </div>

      <div className="w-full mx-auto relative z-10">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-6 pt-6 pb-12 -mt-6 px-4 lg:px-8 no-scrollbar snap-x snap-mandatory scroll-smooth items-start"
        >
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>

        <div className="flex justify-center gap-2.5 mt-8 z-20 relative">
          {Array.from({ length: dotCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (carouselRef.current) {
                  const stepWidth = getStepWidth();
                  carouselRef.current.scrollTo({ left: idx * stepWidth, behavior: "smooth" });
                }
              }}
              className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx ? "w-8 bg-primary" : "w-3.5 bg-primary/20"
              }`}
              aria-label={`Go to reel slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
