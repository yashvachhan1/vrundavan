"use client";

import * as React from "react";

interface VideoLoaderProps {
  onStartFade: () => void;
  onComplete: () => void;
}

export function VideoLoader({ onStartFade, onComplete }: VideoLoaderProps) {
  const [fade, setFade] = React.useState(false);
  const [mounted, setMounted] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleComplete = React.useCallback(() => {
    setFade(true);
    onStartFade(); // Trigger the page reveal transition
    setTimeout(() => {
      setMounted(false);
      onComplete(); // Clean up unmount
    }, 1200); // 1.2s smooth matching transition duration
  }, [onStartFade, onComplete]);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.35;
    }

    // Fallback: Clear loader after 3.8 seconds max
    const fallbackTimer = setTimeout(() => {
      handleComplete();
    }, 3800);

    return () => clearTimeout(fallbackTimer);
  }, [handleComplete]);

  if (!mounted) return null;

  return (
    <div
      style={{
        transition: "opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1)",
        opacity: fade ? 0 : 1,
      }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center pointer-events-none"
    >
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/ujwz0e7r/video/upload/w_1920,q_auto,f_auto/logo.mp4"
        autoPlay
        muted
        playsInline
        onPlay={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = 1.35;
          }
        }}
        onEnded={handleComplete}
        className="w-full h-full object-cover pointer-events-auto"
      />
    </div>
  );
}
