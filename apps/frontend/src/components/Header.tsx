"use client";

import * as React from "react";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";

export function Header({ forceSolid = false }: { forceSolid?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Hysteresis: with Lenis momentum the offset can sit right on a single
      // threshold and flip the header back and forth. Require a clear crossing
      // in each direction instead.
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > 8 : y > 48));
    };

    // Defer initial execution to bypass synchronous useEffect setState lint rules
    const timer = setTimeout(handleScroll, 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // VideoShowcase owns the decision about when its film is full-screen, so it
  // tells us to get out of the way rather than us measuring its box from here.
  React.useEffect(() => {
    const onNavHide = (e: Event) => setIsHidden((e as CustomEvent<boolean>).detail);
    window.addEventListener("nav-hide", onNavHide);
    return () => window.removeEventListener("nav-hide", onNavHide);
  }, []);

  // The header stays dark in both states so the logo can always render inverted
  // to white. Only the backdrop and padding change on scroll.
  const solid = scrolled || forceSolid;

  const navLinks = [
    { name: "Home", href: "/#home" },
    { name: "Services", href: "/#services" },
    { name: "Packages", href: "/#packages" },
    { name: "Custom Plan", href: "/custom-plan" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Contact", href: "/#contact" },
  ];


  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[opacity,transform,padding] duration-500 ${
        isHidden ? "opacity-0 pointer-events-none -translate-y-full" : "opacity-100 translate-y-0"
      } ${solid ? "py-4" : "py-7"}`}
    >
      {/*
        The two backdrops are stacked and cross-faded rather than swapped on one
        element. A gradient is a background-image and the solid bar is a
        background-color, and CSS cannot interpolate between the two — swapping
        them made the gradient pop out abruptly. Keeping the border on the solid
        layer also avoids animating border-width from 0 to 1px, which flashed a
        line across the header mid-transition.
      */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-b from-[#030814]/80 to-transparent transition-opacity duration-500 ${
          solid ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        aria-hidden
        className={`absolute inset-0 bg-[#030814]/95 backdrop-blur-md shadow-[0_2px_24px_rgba(0,0,0,0.35)] border-b border-white/10 transition-opacity duration-500 ${
          solid ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 flex items-center justify-between">
        
        {/* Left: Dynamic transparent logo */}
        <a href="/" className="flex items-center group">
          <div className="relative w-16 h-12 md:w-20 md:h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
            <Image
              unoptimized
              src="/mini-logo.png"
              alt="Vrundavan Studio Logo"
              fill
              className="object-contain"
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
              className="relative text-xs font-semibold uppercase tracking-[0.2em] py-2 group/link font-serif text-white/90 hover:text-white transition-colors"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white scale-x-0 group-hover/link:scale-x-100 origin-bottom-right group-hover/link:origin-bottom-left transition-transform duration-300 ease-out" />
            </a>
          ))}
        </nav>

        {/* Right Side: Theme Toggle & Solid Premium CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/custom-plan"
            className="flex items-center justify-center px-7 py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] border border-white/20 text-white hover:bg-white/10 transition-colors font-sans"
          >
            Track Order
          </a>
          <a
            href="#contact"
            className="flex items-center gap-2.5 px-7 py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer font-sans bg-white hover:bg-white/90 text-primary"
          >
            <Phone className="w-3.5 h-3.5" />
            Book Shoot
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white border border-white/20"
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
            <div className="relative w-16 h-12 flex items-center justify-center">
              <Image
                unoptimized
                src="/mini-logo.png"
                alt="Vrundavan Studio Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
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
                className="text-sm font-semibold uppercase tracking-widest text-slate-700 hover:text-primary border-b border-border/60 pb-3 font-serif transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Fixed Bottom Action */}
          <div className="p-6 border-t border-border/20 bg-background flex flex-col gap-3">
            <a
              href="/custom-plan"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold uppercase tracking-[0.15em] border-2 border-primary/20 text-primary text-[11px] font-sans hover:bg-primary/5 transition-colors"
            >
              Track Order
            </a>
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold uppercase tracking-[0.2em] bg-primary text-white text-[11px] font-sans shadow-md"
            >
              <Phone className="w-3.5 h-3.5" />
              Call / Book Shoot
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
