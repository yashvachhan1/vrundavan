import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";

// Values here mirror what ContactSection already publishes, so the two can't
// drift apart.
const STUDIO = {
  address: "Junagadh, Gujarat, India",
  email: "info@vrundavanstudio.com",
  phoneLabel: "+91 99999 99999",
  phoneHref: "tel:+919999999999",
  instagram: "https://instagram.com",
  instagramHandle: "@vrundavan_studio",
};

const SHOOT_LOCATIONS = ["Rajkot", "Udaipur", "Ahmedabad", "Dubai"];

const EXPLORE = [
  { name: "Services", href: "/#services" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Packages", href: "/#packages" },
  { name: "Testimonials", href: "/#testimonials" },
  { name: "FAQ", href: "/#faq" },
];

const BOOKING = [
  { name: "Contact", href: "/#contact" },
  { name: "Build a Custom Plan", href: "/custom-plan" },
  { name: "Book a Date", href: "/book" },
];

export function Footer() {
  return (
    <footer className="w-full bg-[#030814] text-white select-none">
      <div className="max-w-[1440px] mx-auto w-full px-6 py-20">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-4 flex flex-col gap-5">
            {/*
              logo.png is a square 7200x7200 mark-over-text lockup. The
              Header's wide/cropped treatment (w-44 h-14 + negative margin +
              scale-1.5) is tuned to show only the mark inside a short navbar
              — copying it here squeezed the square image into a landscape
              box and shoved it off the left edge, clipping both the mark and
              the "Junagadh" text beneath it. A plain square box shows the
              whole lockup at a readable size instead.
            */}
            <div className="relative w-20 h-20">
              <Image
                unoptimized
                src="/logo.png"
                alt="Vrundavan Studio"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              Wedding photography and cinematic films, shot as documentary rather
              than staged. Based in Gujarat, travelling worldwide.
            </p>
            <a
              href={STUDIO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft hover:text-white transition-colors w-fit"
            >
              {STUDIO.instagramHandle}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Explore */}
          <nav className="md:col-span-2 flex flex-col gap-4" aria-label="Explore">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 font-serif">
              Explore
            </h2>
            <ul className="flex flex-col gap-3">
              {EXPLORE.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Booking */}
          <nav className="md:col-span-3 flex flex-col gap-4" aria-label="Booking">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 font-serif">
              Start a Booking
            </h2>
            <ul className="flex flex-col gap-3">
              {BOOKING.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 font-serif">
              Studio
            </h2>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-soft flex-shrink-0 mt-0.5" />
                <span>{STUDIO.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold-soft flex-shrink-0 mt-0.5" />
                <a href={`mailto:${STUDIO.email}`} className="hover:text-white transition-colors break-all">
                  {STUDIO.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-soft flex-shrink-0 mt-0.5" />
                <a href={STUDIO.phoneHref} className="hover:text-white transition-colors">
                  {STUDIO.phoneLabel}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Shoot locations — doubles as local-SEO copy */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col gap-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 font-serif">
            Shooting In
          </h2>
          <p className="text-sm text-white/60">
            {SHOOT_LOCATIONS.join(" · ")} · and destinations worldwide
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Vrundavan Studio. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Photography &amp; cinematography, Junagadh
          </p>
        </div>

      </div>
    </footer>
  );
}
