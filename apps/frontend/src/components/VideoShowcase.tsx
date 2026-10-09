"use client";

import { useState, useRef, useEffect } from "react";

// Width the film starts at, as a fraction of the viewport, before the scroll
// expands it out to full bleed.
const START_SCALE = 0.08;

interface VideoItem {
  id: string;
  videoSrc: string;
  poster: string;
}

const films: VideoItem[] = [
  {
    id: "01",
    videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_800,q_auto,f_auto/01.mp4",
    poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC06545.JPG.jpeg",
  },
  {
    id: "02",
    videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_800,q_auto,f_auto/ENGAGEMENT%20TEASER.mp4",
    poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC06608.JPG.jpeg",
  },
  {
    id: "03",
    videoSrc: "https://res.cloudinary.com/ujwz0e7r/video/upload/w_800,q_auto,f_auto/04.mp4",
    poster: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_800,q_auto,f_auto/DSC06643.JPG.jpeg",
  },
];

/* ── Floating dust particles, visible only while the screen is small ── */
function Particles() {
  const [dots, setDots] = useState<
    { id: number; top: string; left: string; size: number; delay: string; dur: string; opacity: number }[]
  >([]);

  useEffect(() => {
    // Randomised on the client only, so the server markup stays deterministic.
    const handle = setTimeout(() => {
      setDots(
        Array.from({ length: 55 }, (_, i) => ({
          id: i,
          top: `${Math.random() * 85}%`,
          left: `${Math.random() * 100}%`,
          size: Math.random() * 3 + 1.5,
          delay: `${(Math.random() * 6).toFixed(2)}s`,
          dur: `${(5 + Math.random() * 6).toFixed(2)}s`,
          opacity: +(0.12 + Math.random() * 0.2).toFixed(3),
        }))
      );
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  return (
    <>
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-primary pointer-events-none"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            animation: `floatDot ${d.dur} ${d.delay} ease-in-out infinite alternate`,
          }}
        />
      ))}
    </>
  );
}

export function VideoShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const followBtnRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  const soundUnlockedRef = useRef(false);
  const headerHiddenRef = useRef(false);
  const mutedRef = useRef(true);
  const lockedRef = useRef(false);
  const brokeThroughRef = useRef(false);
  const breakDeltaRef = useRef(0);

  const activeVideo = () => videoRefs.current[currentIndex] ?? null;

  useEffect(() => {
    // Deferred with a timer rather than rAF: rAF never fires while the tab is
    // backgrounded, which would leave the particles and the cursor pill unwired
    // until the user focuses the tab.
    const handle = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(handle);
  }, []);

  /* ── Play the active film, pause the rest ── */
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const idx = parseInt(key, 10);
      const video = videoRefs.current[idx];
      if (!video) return;
      if (idx === currentIndex) {
        // We no longer auto-play when active. The user must manually click.
        video.muted = mutedRef.current;
      } else {
        video.pause();
        video.load(); // Reset video completely so the poster image reappears
        video.muted = true;
      }
    });
  }, [currentIndex]);

  /* ── Sound: unlock on the first user gesture, then follow visibility ── */
  useEffect(() => {
    let sectionVisible = false;

    const applyMuted = (next: boolean) => {
      mutedRef.current = next;
      setMuted(next);
      const v = activeVideo();
      if (v) v.muted = next;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        // Only take over the mute state once the user has actually opted in.
        if (!soundUnlockedRef.current) return;
        applyMuted(!sectionVisible);
      },
      { threshold: 0.3 }
    );
    if (wrapRef.current) observer.observe(wrapRef.current);

    // Browsers only allow unmuting inside a real user gesture, so this has to
    // happen synchronously in the event handler — not in a promise callback.
    const unlockSound = () => {
      if (soundUnlockedRef.current) return;
      soundUnlockedRef.current = true;
      setSoundUnlocked(true);
      if (sectionVisible) {
        applyMuted(false);
        activeVideo()?.play().catch(() => {});
      }
    };

    document.addEventListener("click", unlockSound);
    document.addEventListener("touchend", unlockSound);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", unlockSound);
      document.removeEventListener("touchend", unlockSound);
    };
    // currentIndex is intentionally excluded: the listeners read the live index
    // through activeVideo() and re-subscribing would drop the unlock state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Scroll-driven expansion (written straight to the DOM to avoid re-renders) ── */
  useEffect(() => {
    // How much extra scrolling it takes to break out of the fitted film. Roughly
    // four wheel notches — enough that a casual flick keeps you on the film, but
    // a deliberate push moves on.
    const BREAK_DELTA = 450;

    const lock = () => {
      if (lockedRef.current || brokeThroughRef.current) return;
      lockedRef.current = true;
      breakDeltaRef.current = 0;
      window.dispatchEvent(new CustomEvent("lenis-stop"));
    };

    const release = () => {
      if (!lockedRef.current) return;
      lockedRef.current = false;
      brokeThroughRef.current = true;
      window.dispatchEvent(new CustomEvent("lenis-start"));
    };

    const onWheel = (e: WheelEvent) => {
      if (!lockedRef.current) return;
      breakDeltaRef.current += Math.abs(e.deltaY);
      if (breakDeltaRef.current > BREAK_DELTA) release();
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!lockedRef.current || touchY === null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      breakDeltaRef.current += Math.abs(y - touchY);
      touchY = y;
      if (breakDeltaRef.current > BREAK_DELTA) release();
    };

    // A scroll lock must never trap someone navigating by keyboard.
    const onKey = () => release();

    const onScroll = () => {
      if (!wrapRef.current || !screenRef.current) return;

      const rect = wrapRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const p = Math.max(0, Math.min(1, (vh - rect.top) / vh));

      const widthPx = (START_SCALE + p * (1 - START_SCALE)) * vw;

      screenRef.current.style.width = `${widthPx}px`;
      screenRef.current.style.left = `${(vw - widthPx) / 2}px`;
      screenRef.current.style.borderRadius = `${Math.round(32 * (1 - p))}px`;

      if (particlesRef.current) {
        particlesRef.current.style.opacity = String(Math.max(0, 1 - p * 2.5));
      }

      // Controls only make sense once the film fills the viewport.
      const isFullWidth = p >= 0.98;
      if (controlsRef.current) {
        controlsRef.current.style.opacity = isFullWidth ? "1" : "0";
        controlsRef.current.style.pointerEvents = isFullWidth ? "auto" : "none";
      }

      // Hide the header while the film is full-screen, and bring it back as
      // soon as the next section starts sliding over the top.
      const hideHeader = isFullWidth && rect.bottom > vh;
      if (hideHeader !== headerHiddenRef.current) {
        headerHiddenRef.current = hideHeader;
        window.dispatchEvent(new CustomEvent("nav-hide", { detail: hideHeader }));
      }

      // Hold the page still the moment the film lands full-bleed. Scroll events
      // stop firing while locked, so onWheel/onTouchMove drive the way out.
      if (p >= 0.995 && rect.bottom > vh) {
        lock();
        // Pin the geometry exactly full-bleed: the lock can catch a frame where
        // p rounded to 0.996 and leave a sliver of backdrop down the sides.
        screenRef.current.style.width = `${vw}px`;
        screenRef.current.style.left = "0px";
        screenRef.current.style.borderRadius = "0px";
      }

      // Re-arm once the film is clearly behind us, so the lock works again on
      // the next pass rather than firing only the first time.
      if (p < 0.5 || rect.bottom <= vh) {
        brokeThroughRef.current = false;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      // Unmounting while locked would leave the whole page frozen.
      if (lockedRef.current) {
        lockedRef.current = false;
        window.dispatchEvent(new CustomEvent("lenis-start"));
      }
      // Never leave the header hidden if this unmounts mid-scroll.
      window.dispatchEvent(new CustomEvent("nav-hide", { detail: false }));
    };
  }, []);

  /* ── Play/pause pill that trails the cursor inside the screen ── */
  useEffect(() => {
    const screen = screenRef.current;
    const btn = followBtnRef.current;
    if (!screen || !btn) return;

    let mouseX = 0;
    let mouseY = 0;
    let pillX = 0;
    let pillY = 0;
    let isInside = false;
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      pillX = lerp(pillX, mouseX, 0.035);
      pillY = lerp(pillY, mouseY, 0.035);
      btn.style.transform = `translate(${pillX}px, ${pillY}px)`;
      rafId = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isInside) {
        // Snap on entry so the pill doesn't fly across the screen.
        pillX = e.clientX;
        pillY = e.clientY;
        isInside = true;
        btn.style.opacity = "1";
      }
    };
    const onLeave = () => {
      isInside = false;
      btn.style.opacity = "0";
    };

    rafId = requestAnimationFrame(animate);
    screen.addEventListener("mousemove", onMove);
    screen.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      screen.removeEventListener("mousemove", onMove);
      screen.removeEventListener("mouseleave", onLeave);
    };
  }, [mounted]);

  const togglePlay = () => {
    const v = activeVideo();
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = activeVideo();
    if (!v) return;
    soundUnlockedRef.current = true;
    setSoundUnlocked(true);
    const next = !mutedRef.current;
    mutedRef.current = next;
    v.muted = next;
    setMuted(next);
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % films.length);

  return (
    // 150vh: one viewport of scroll for the film to expand across, then half a
    // viewport where it stays pinned full-bleed.
    <div id="video-showcase" ref={wrapRef} className="relative" style={{ height: "150vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white z-0">

        {mounted && (
          <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
            <Particles />
          </div>
        )}

        {/* Expanding film screen */}
        <div
          ref={screenRef}
          className="absolute overflow-hidden bg-[#030814] shadow-xl"
          onClick={togglePlay}
          style={{
            // Server-render the same geometry the scroll handler produces at
            // progress 0, so nothing jumps on hydration.
            top: 0,
            left: `${((1 - START_SCALE) / 2) * 100}%`,
            width: `${START_SCALE * 100}%`,
            height: "100%",
            borderRadius: "32px",
            willChange: "width, left, border-radius",
            cursor: "pointer",
          }}
        >
          {films.map((film, index) => {
            const isActive = index === currentIndex;
            return (
              <video
                key={film.id}
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={film.videoSrc}
                poster={film.poster}
                preload="metadata"
                muted
                playsInline
                onEnded={nextSlide}
                onPlay={() => isActive && setPlaying(true)}
                onPause={() => isActive && setPlaying(false)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              />
            );
          })}

          {/* Controls fade in only once the film is full-bleed */}
          <div
            ref={controlsRef}
            className="absolute inset-0 z-20 transition-opacity duration-300"
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            {/* Film selector dashes */}
            <div className="absolute bottom-12 inset-x-0 flex justify-center items-center gap-3.5">
              {films.map((film, index) => (
                <button
                  key={film.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${
                    index === currentIndex ? "w-16 bg-white shadow-sm" : "w-8 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Switch to film ${index + 1}`}
                />
              ))}
            </div>

            {/* Sound toggle */}
            <button
              onClick={toggleMute}
              className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full px-3.5 py-2 bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-colors cursor-pointer"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span className="text-white text-[12px] font-medium">
                    {soundUnlocked ? "Muted" : "Tap for sound"}
                  </span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span className="text-white text-[12px] font-medium">Sound on</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cursor-following play/pause pill */}
        <div
          ref={followBtnRef}
          className="fixed z-50 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            opacity: 0,
            transform: "translate(-999px,-999px)",
            transition: "opacity 0.15s ease",
          }}
        >
          <div
            style={{ transform: "translate(-50%, -50%)" }}
            className="flex items-center gap-3 bg-white text-[#030814] text-[15px] font-semibold px-8 py-4 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.3)] whitespace-nowrap"
          >
            {playing ? (
              <>
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <rect x="0" y="0" width="3.5" height="12" rx="1" />
                  <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg width="10" height="13" viewBox="0 0 10 13" fill="currentColor">
                  <path d="M0 0L10 6.5L0 13V0Z" />
                </svg>
                Play film
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
