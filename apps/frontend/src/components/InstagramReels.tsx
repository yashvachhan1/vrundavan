"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Clapperboard, Heart, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface ReelItem {
  id: string;
  videoSrc: string;
  poster: string;
  likes: string;
  comments: string;
  caption: string;
}

export function InstagramReels() {
  const reels: ReelItem[] = [
    {
      id: "1",
      videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_400,q_auto,f_auto/logo.mp4",
      poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_400,q_auto,f_auto/DSC06545.JPG.jpeg",
      likes: "18.4K",
      comments: "420",
      caption: "A royal palace union wrapped in timeless cinematic aesthetics. ✨ #udaipur #destinationwedding",
    },
    {
      id: "2",
      videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_400,q_auto,f_auto/logo.mp4",
      poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_400,q_auto,f_auto/DSC06608.JPG.jpeg",
      likes: "24.1K",
      comments: "680",
      caption: "Walking into the golden hour sunset. Pure, unscripted love stories. 🌅 #prewedding #loveinmotion",
    },
    {
      id: "3",
      videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_400,q_auto,f_auto/logo.mp4",
      poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_400,q_auto,f_auto/DSC06643.JPG.jpeg",
      likes: "12.8K",
      comments: "310",
      caption: "A regal bride capturing raw emotions. Cultural heritage in every frame. 👑 #bridalportrait #candid",
    },
    {
      id: "4",
      videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_400,q_auto,f_auto/logo.mp4",
      poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_400,q_auto,f_auto/DSC06846.JPG.jpeg",
      likes: "15.9K",
      comments: "290",
      caption: "Sparks flying at the royal wedding reception waltz. 💫 #weddingfilm #foreverbeginshere",
    },
    {
      id: "5",
      videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_400,q_auto,f_auto/logo.mp4",
      poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_400,q_auto,f_auto/DSC06629.JPG.jpeg",
      likes: "21.5K",
      comments: "510",
      caption: "Dance performance highlights from the Sangeet starry night. 🕺💃 #sangeetnight #weddingdance",
    },
    {
      id: "6",
      videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_400,q_auto,f_auto/logo.mp4",
      poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_400,q_auto,f_auto/DSC06650.JPG.jpeg",
      likes: "19.2K",
      comments: "480",
      caption: "Haldi golden moments and flower showers. Pure joy captured. 🌸💛 #haldiceremony #weddings",
    },
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  // Helper to dynamically calculate card width + gap for pixel-perfect snapping
  const getStepWidth = () => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstElementChild as HTMLElement;
      if (firstChild) {
        // card offset width + gap-6 (24px)
        return firstChild.offsetWidth + 24;
      }
    }
    return 344;
  };

  // How many cards fit in the viewport at once. Feeds the dot count so we
  // never render dots for scroll positions the browser can't actually reach
  // (when N cards are visible there are only reels.length - N + 1 reachable
  // starting positions).
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
      // Cap at dotCount - 1 so the active dot never lands on a position that
      // isn't rendered (would leave every dot in the inactive state).
      setActiveIndex(Math.max(0, Math.min(index, dotCount - 1)));
    }
  };

  useEffect(() => {
    // Only play reels when they are visible in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="w-full py-14 md:py-20 bg-surface text-foreground relative overflow-hidden select-none">
      
      {/* Hide native scrollbar on all browser viewports */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto w-full px-6 relative z-10">
        <SectionHeader
          icon={Clapperboard}
          eyebrow="Social Canvas"
          title="Instagram"
          accent="Reels"
          aside={
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-serif font-bold tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-gold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                <span>Follow @vrundavan_studio</span>
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

      {/*
        Carousel bounded by the same 1440px container as every other section, so
        the first card lines up with the header. Cards use flex-basis that
        subtracts the gap so exactly N fit per viewport with no partial cards
        peeking on the edges: 1 up on mobile, 2 on sm, 3 on md, 4 on lg.
      */}
      <div className="max-w-[1440px] mx-auto w-full px-6 relative z-10">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-6 pt-6 pb-10 -mt-6 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {reels.map((reel) => (
            <a
              key={reel.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] md:flex-[0_0_calc(33.333%-16px)] lg:flex-[0_0_calc(20%-19.2px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.015] transition-all duration-500 bg-[#080808] snap-start"
            >
              {/* Reels video loop element */}
              <video
                ref={(el) => {
                  videoRefs.current[reel.id] = el;
                }}
                src={reel.videoSrc}
                poster={reel.poster}
                loop
                muted
                preload="none"
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
              />

              {/* Exact Instagram Camera Icon Overlay with Branded Color Gradient */}
              <div className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-white/40 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#insta-grad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4.5 h-4.5"
                >
                  <defs>
                    <linearGradient id="insta-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f58529" />
                      <stop offset="25%" stopColor="#dd2a7b" />
                      <stop offset="50%" stopColor="#8134af" />
                      <stop offset="100%" stopColor="#515bd4" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>

              {/* Gradient Mask for text details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none z-10" />

              {/* Reels Meta details overlay (Likes, comments, caption) */}
              <div className="absolute bottom-6 inset-x-6 text-left text-white flex flex-col gap-3.5 z-20">
                
                {/* Metrics Row (Likes & Comments) */}
                <div className="flex items-center gap-4 text-xs font-mono font-bold text-white/90">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>{reel.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>{reel.comments}</span>
                  </div>
                </div>

                {/* Caption Details */}
                <p className="text-[11px] text-slate-200 leading-relaxed font-sans line-clamp-2">
                  {reel.caption}
                </p>

              </div>
            </a>
          ))}
        </div>

        {/* 
          Progress Indicator Line Dashing:
          Aesthetic tracking dashes at the bottom indicating current slide scroll state.
        */}
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
