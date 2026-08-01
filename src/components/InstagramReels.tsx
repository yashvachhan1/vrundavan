"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Heart, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
      videoSrc: "/logo.mp4",
      poster: "/DSC06545.JPG.jpeg",
      likes: "18.4K",
      comments: "420",
      caption: "A royal palace union wrapped in timeless cinematic aesthetics. ✨ #udaipur #destinationwedding",
    },
    {
      id: "2",
      videoSrc: "/logo.mp4",
      poster: "/DSC06608.JPG.jpeg",
      likes: "24.1K",
      comments: "680",
      caption: "Walking into the golden hour sunset. Pure, unscripted love stories. 🌅 #prewedding #loveinmotion",
    },
    {
      id: "3",
      videoSrc: "/logo.mp4",
      poster: "/DSC06643.JPG.jpeg",
      likes: "12.8K",
      comments: "310",
      caption: "A regal bride capturing raw emotions. Cultural heritage in every frame. 👑 #bridalportrait #candid",
    },
    {
      id: "4",
      videoSrc: "/logo.mp4",
      poster: "/DSC06846.JPG.jpeg",
      likes: "15.9K",
      comments: "290",
      caption: "Sparks flying at the royal wedding reception waltz. 💫 #weddingfilm #foreverbeginshere",
    },
    {
      id: "5",
      videoSrc: "/logo.mp4",
      poster: "/DSC06629.JPG.jpeg",
      likes: "21.5K",
      comments: "510",
      caption: "Dance performance highlights from the Sangeet starry night. 🕺💃 #sangeetnight #weddingdance",
    },
    {
      id: "6",
      videoSrc: "/logo.mp4",
      poster: "/DSC06650.JPG.jpeg",
      likes: "19.2K",
      comments: "480",
      caption: "Haldi golden moments and flower showers. Pure joy captured. 🌸💛 #haldiceremony #weddings",
    },
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [activeIndex, setActiveIndex] = useState(0);

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
      setActiveIndex(Math.max(0, Math.min(index, reels.length - 1)));
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
    <section className="w-full py-28 bg-[#F0F7FD] text-[#1a1a1a] relative overflow-hidden select-none border-t border-slate-200">
      
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

      {/* 
        Aesthetic Section Header (Centered alignment matching other sections)
      */}
      <div className="max-w-[92vw] mx-auto w-full relative z-10 mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#003366]">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
                Social Canvas
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-[#1a1a1a]">
              Instagram <span className="italic font-light text-[#003366]">Reels</span>
            </h2>
            <div className="w-12 h-[2px] bg-[#003366]/20 mt-2" />
          </div>

          {/* Controls & Follow Badge Wrapper */}
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-serif font-bold tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
              <span>Follow @vrundavan_studio</span>
            </a>

            {/* Slider navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full border border-slate-300 hover:border-[#003366] hover:text-[#003366] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous Reels"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="w-10 h-10 rounded-full border border-slate-300 hover:border-[#003366] hover:text-[#003366] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next Reels"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Full-bleed Carousel Container:
        Moved out of the max-w-[92vw] centering div, using px-[4vw] padding.
        This aligns the first card with the header, but allows the scrolling content 
        to flow beautifully to the very edge of the viewport without clipping/cut-offs.
      */}
      <div className="w-full relative z-10">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth px-[4vw]"
        >
          {reels.map((reel) => (
            <a
              key={reel.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex-shrink-0 w-[290px] sm:w-[320px] aspect-[9/16] rounded-[2.2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(0,51,102,0.12)] hover:scale-[1.015] transition-all duration-500 bg-[#080808] snap-start"
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
          {reels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (carouselRef.current) {
                  const stepWidth = getStepWidth();
                  carouselRef.current.scrollTo({ left: idx * stepWidth, behavior: "smooth" });
                }
              }}
              className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx ? "w-8 bg-[#003366]" : "w-3.5 bg-[#003366]/20"
              }`}
              aria-label={`Go to reel slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
