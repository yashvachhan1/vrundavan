import * as React from "react";
import { Check, Sparkles, Gem, Phone, ShieldCheck, Settings } from "lucide-react";
import Link from 'next/link';
import { createClient } from '../../utils/supabase/server';

interface PackageItem {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  badgeText?: string | null;
}

export async function PackagesSection() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bundled_packages')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  const packages: PackageItem[] = data ? data.map((item, index) => ({
    id: String(index + 1).padStart(2, '0'),
    name: item.name,
    price: item.price,
    period: item.period,
    desc: item.description || '',
    features: item.features || [],
    isPopular: item.is_popular,
    ctaText: "Inquire Now",
    badgeText: item.badge_text
  })) : [];


  return (
    <section id="packages" className="w-full py-20 md:py-28 bg-background text-foreground relative overflow-hidden select-none">
      
      {/* Background brand accents */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto w-full px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-10 md:mb-16 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Gem className="w-4 h-4 text-gold-deep" />
            <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
              Bespoke Plans
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-foreground">
            Investment & <span className="italic font-light text-primary">Packages</span>
          </h2>
          <div className="w-12 h-[2px] bg-primary/20 mt-2" />
        </div>

        <div className="flex justify-end mb-10">
          <Link 
            href="/custom-plan"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:bg-[#002244] hover:scale-[1.02] transition-all"
          >
            <Settings className="w-4 h-4" />
            Build Custom Plan
          </Link>
        </div>

        {/* 
          Premium Packages Cards Grid:
          Highlighting the preferred packages with border trims and shadow depth.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:scale-[1.015] ${
                pkg.isPopular
                  ? "bg-white border-2 border-gold/20 shadow-lg"
                  : "bg-[#F0F7FD]/80 hover:bg-white border border-slate-200/60 shadow-md"
              }`}
            >
              {/* Popular Tag Badge */}
              {pkg.isPopular && pkg.badgeText && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-white font-mono text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 fill-white" />
                  <span>{pkg.badgeText}</span>
                </div>
              )}

              {/* Package Header details */}
              <div className="flex flex-col gap-5 text-left border-b border-slate-200/50 pb-6">
                <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">
                  PLAN 0{pkg.id}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-2xl font-serif font-normal text-foreground">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pkg.desc}
                  </p>
                </div>

                {/* Pricing block */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-serif font-normal text-foreground">
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
                    <span className="leading-normal">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <a
                href="#contact"
                className={`w-full py-4 rounded-full font-serif text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  pkg.isPopular
                    ? "bg-primary text-white hover:bg-[#002244] shadow-md hover:shadow-lg"
                    : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>{pkg.ctaText}</span>
              </a>

            </div>
          ))}
          {packages.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No packages currently available. Please check back later!
            </div>
          )}
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
