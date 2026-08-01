"use client";

import * as React from "react";
import { Check, Sparkles, Phone, ShieldCheck } from "lucide-react";

interface PackageFeature {
  text: string;
}

interface PackageItem {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: PackageFeature[];
  isPopular: boolean;
  ctaText: string;
  badgeText?: string;
}

export function PackagesSection() {
  const packages: PackageItem[] = [
    {
      id: "01",
      name: "Pre-Wedding Poetics",
      price: "₹55,000",
      period: "per shoot",
      desc: "Capturing candid coupling stories in organic golden hour natural lighting.",
      isPopular: false,
      ctaText: "Book Portrait Shoot",
      features: [
        { text: "1 Day Shoot at Heritage Location" },
        { text: "2 Creative Concept Outfits" },
        { text: "40 High-Fidelity Edited Pictures" },
        { text: "2-Min Cinematic Teaser Video" },
        { text: "Golden Hour Sunset Session" },
      ],
    },
    {
      id: "02",
      name: "Cinematic Wedding Saga",
      price: "₹1,80,000",
      period: "complete coverage",
      desc: "Comprehensive photography and cinematography for beautiful wedding events.",
      isPopular: true,
      badgeText: "Most Preferred",
      ctaText: "Reserve Wedding Dates",
      features: [
        { text: "3 Days Full Event Coverage" },
        { text: "Candid + Traditional Dual Operators" },
        { text: "250+ Editorial Retouched Pictures" },
        { text: "15-Min Cinematic Film in UltraHD" },
        { text: "High-End Drone Aerial Footage" },
        { text: "Digital Keepsake Vault Access" },
      ],
    },
    {
      id: "03",
      name: "Heritage Royal Heirloom",
      price: "₹3,20,000",
      period: "complete coverage",
      desc: "Elite destination wedding filmmaking with bespoke printed fine-art albums.",
      isPopular: false,
      ctaText: "Request Royal Brochure",
      features: [
        { text: "4 Days Comprehensive Coverage" },
        { text: "6 Crew Operators (Multi-cam Setup)" },
        { text: "Unlimited Edited Digital Negatives" },
        { text: "Leather-bound Luxury Print Album" },
        { text: "45-Min Cinema Feature Film" },
        { text: "Full Pre-Wedding Shoot Included" },
        { text: "Next-Day Teaser Delivery" },
      ],
    },
  ];

  return (
    <section id="packages" className="w-full py-28 bg-[#ffffff] text-[#1a1a1a] relative overflow-hidden select-none border-t border-slate-100">
      
      {/* Background brand accents */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-[92vw] mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-16 text-left">
          <div className="flex items-center gap-2 text-[#003366]">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
              Bespoke Plans
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-[#1a1a1a]">
            Investment & <span className="italic font-light text-[#003366]">Packages</span>
          </h2>
          <div className="w-12 h-[2px] bg-[#003366]/20 mt-2" />
        </div>

        {/* 
          Premium Packages Cards Grid:
          Highlighting the preferred Cinematic Wedding Saga with border trims and shadow depth.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:scale-[1.015] ${
                pkg.isPopular
                  ? "bg-white border-2 border-amber-500/20 shadow-[0_25px_60px_rgba(0,51,102,0.08)]"
                  : "bg-[#F0F7FD]/80 hover:bg-white border border-slate-200/60 shadow-[0_15px_40px_rgba(0,0,0,0.03)]"
              }`}
            >
              {/* Popular Tag Badge */}
              {pkg.isPopular && pkg.badgeText && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-mono text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 fill-white" />
                  <span>{pkg.badgeText}</span>
                </div>
              )}

              {/* Package Header details */}
              <div className="flex flex-col gap-5 text-left border-b border-slate-200/50 pb-6">
                <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase">
                  PLAN 0{pkg.id}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-2xl font-serif font-normal text-[#1a1a1a]">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pkg.desc}
                  </p>
                </div>

                {/* Pricing block */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-serif font-normal text-[#1a1a1a]">
                    {pkg.price}
                  </span>
                  <span className="text-xs text-slate-400 tracking-wider">
                    / {pkg.period}
                  </span>
                </div>
              </div>

              {/* Feature Checklist */}
              <ul className="flex flex-col gap-4 py-8 text-left flex-grow">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-[#444444]">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-normal">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <a
                href="#contact"
                className={`w-full py-4 rounded-full font-serif text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  pkg.isPopular
                    ? "bg-[#003366] text-white hover:bg-[#002244] shadow-md hover:shadow-lg"
                    : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>{pkg.ctaText}</span>
              </a>

            </div>
          ))}
        </div>

        {/* Security / Quality guarantee note */}
        <div className="mt-16 flex items-center justify-center gap-2 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Transparent Pricing • Custom requirements available on demand</span>
        </div>

      </div>
    </section>
  );
}
