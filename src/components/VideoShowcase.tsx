"use client";

import { useState, useRef, useEffect } from "react";

interface VideoItem {
  id: string;
  videoSrc: string;
  poster: string;
}

export function VideoShowcase() {
  const films: VideoItem[] = [
    {
      id: "01",
      videoSrc: "/01.mp4",
      poster: "/DSC06545.JPG.jpeg",
    },
    {
      id: "02",
      videoSrc: "/ENGAGEMENT TEASER.mp4",
      poster: "/DSC06608.JPG.jpeg",
    },
    {
      id: "03",
      videoSrc: "/04.mp4",
      poster: "/DSC06643.JPG.jpeg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % films.length);
  };

  // Auto play active slide video, pause others
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const idx = parseInt(key, 10);
      const video = videoRefs.current[idx];
      if (video) {
        if (idx === currentIndex) {
          video.currentTime = 0;
          // Muted autoplay works reliably on all devices
          video.muted = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  return (
    <section id="video-showcase" className="relative w-full h-[100dvh] bg-black overflow-hidden select-none">
      
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {films.map((film, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={film.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Full-Screen Auto-playing Video Background */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={film.videoSrc}
                poster={film.poster}
                muted
                playsInline
                onEnded={nextSlide}
                className="absolute inset-0 w-full h-full object-cover scale-[1.35]"
              />
              
              {/* Very subtle gradient overlay to keep it clean */}
              <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
            </div>
          );
        })}
      </div>

      {/* 
        Sleek Minimalist Navigation Indicator Lines:
        Only horizontal dash progress lines sit at the bottom center of the viewport.
        Clicking a line transitions the active slide video instantly.
      */}
      <div className="absolute bottom-12 inset-x-0 z-20 flex justify-center items-center gap-3.5">
        {films.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${
                isActive 
                  ? "w-16 bg-white shadow-sm" 
                  : "w-8 bg-white/25 hover:bg-white/50"
              }`}
              aria-label={`Switch to video ${index + 1}`}
            />
          );
        })}
      </div>

    </section>
  );
}
