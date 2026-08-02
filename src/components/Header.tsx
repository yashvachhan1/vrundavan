"use client";

import * as React from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Phone } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const videoSection = document.getElementById("video-showcase");
      if (videoSection) {
        const rect = videoSection.getBoundingClientRect();
        // Hide the header if the video showcase covers the header height threshold
        const isCoveringScreen = rect.top < 80 && rect.bottom > 80;
        setIsHidden(isCoveringScreen);
      } else {
        setIsHidden(false);
      }
    };

    // Defer initial execution to bypass synchronous useEffect setState lint rules
    const timer = setTimeout(handleScroll, 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Gallery", href: "#gallery" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isHidden ? "opacity-0 pointer-events-none -translate-y-full" : "opacity-100 translate-y-0"
      } ${
        scrolled
          ? "bg-background/90 backdrop-blur-md py-4 shadow-lg"
          : "bg-transparent py-7"
      }`}
    >
      <div className="w-full px-4 md:px-8 flex items-center justify-between">
        
        {/* Left: Dynamic transparent logo */}
        <a href="#home" className="flex items-center group">
          <div className="relative w-48 h-16 md:w-52 md:h-16 ml-[-48px] flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
            <Image
              src="/logo.png"
              alt="Vrundavan Studio Logo"
              fill
              className="object-contain scale-[1.65] mix-blend-multiply dark:invert dark:mix-blend-screen"
              priority
            />
          </div>
        </a>

        {/* Center: Luxury Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative text-sm font-bold uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground dark:text-slate-100 dark:hover:text-white transition-colors py-2 group/link"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-sky-400 scale-x-0 group-hover/link:scale-x-100 origin-bottom-right group-hover/link:origin-bottom-left transition-transform duration-300 ease-out" />
            </a>
          ))}
        </nav>

        {/* Right Side: Theme Toggle & Solid Premium CTA */}
        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <a
            href="#contact"
            className="flex items-center gap-2.5 px-7 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-primary hover:bg-primary/95 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            Book Shoot
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      </header>

      {/* Mobile Sidebar Overlay (Moved OUTSIDE header to escape transform containment) */}
      <div 
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dark Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Sidebar Panel */}
        <div 
          className={`absolute top-0 left-0 bottom-0 w-[80vw] max-w-sm bg-background border-r border-border shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            {/* Logo */}
            <div className="relative w-32 h-10 ml-[-20px] flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Vrundavan Studio Logo"
                fill
                className="object-contain scale-[1.65] mix-blend-multiply dark:invert dark:mix-blend-screen"
                priority
              />
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="px-6 py-8 flex flex-col gap-6 overflow-y-auto flex-grow">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary dark:text-slate-200 dark:hover:text-sky-400 border-b border-border/10 pb-3"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Fixed Bottom Action */}
          <div className="p-6 border-t border-border/20 bg-background">
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest bg-primary dark:bg-sky-500 text-white dark:text-slate-950 text-xs shadow-md"
            >
              <Phone className="w-4 h-4" />
              Call / Book Shoot
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
