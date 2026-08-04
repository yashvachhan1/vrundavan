import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  eyebrow: string;
  /** The lead-in words rendered in the regular serif face. */
  title: string;
  /** The word rendered in the italic light face and primary colour. */
  accent: string;
  /** Rendered after the italic word — for headings like "We capture the … moments". */
  suffix?: string;
  align?: "left" | "center";
  /** Optional right-hand slot (e.g. the Gallery filter tabs) that sits alongside the header on desktop. */
  aside?: React.ReactNode;
  className?: string;
}

/**
 * Single source of truth for every section's eyebrow + serif title + rule.
 * Six sections previously hand-wrote this block; small differences (a stray
 * font-serif on the eyebrow, subtly different margins) crept in whenever a new
 * one was added. Consolidating them keeps typography and spacing locked.
 */
export function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  accent,
  suffix,
  align = "left",
  aside,
  className = "",
}: SectionHeaderProps) {
  const alignClasses =
    align === "center"
      ? "items-center text-center"
      : "items-start text-left";

  const header = (
    <div className={`flex flex-col gap-3 ${alignClasses}`}>
      <div className="flex items-center gap-2 text-primary">
        <Icon className="w-4 h-4 text-gold-deep" />
        <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-foreground">
        {title}{" "}
        <span className="italic font-light text-primary">{accent}</span>
        {suffix ? ` ${suffix}` : null}
      </h2>
      <div className="w-12 h-[2px] bg-primary/20 mt-2" />
    </div>
  );

  if (aside) {
    return (
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-16 ${className}`}>
        {header}
        {aside}
      </div>
    );
  }

  return <div className={`mb-10 md:mb-16 ${className}`}>{header}</div>;
}
