"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquareQuote, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface TestimonialItem {
  id: number;
  quote: string;
  couple: string;
  details: string;
  image: string;
}

export function TestimonialsSection() {
  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      quote: "Vrundavan Studio didn't just photograph our wedding; they crafted an emotional narrative. The cinematic film captures raw feelings, and looking at the pictures brings back the exact breeze and joy of Udaipur. Truly spectacular work!",
      couple: "Divya & Akash",
      details: "Royal Udaipur Palace Destination Wedding",
      image: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_200,q_auto,f_auto/DSC06608.JPG.jpeg",
    },
    {
      id: 2,
      quote: "The dedication and artistic vision of the team are outstanding. They captured every candid embrace and tear with such subtlety. We are absolutely in love with the leather-bound fine-art album and our 15-minute cinematic film.",
      couple: "Ruchi & Akshay",
      details: "Heritage Golden Hour Haldi & Wedding",
      image: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_200,q_auto,f_auto/DSC06650.JPG.jpeg",
    },
    {
      id: 3,
      quote: "Every frame feels like a scene from an organic movie. They made us feel so comfortable, and the team was almost invisible while capturing the most intimate moments of our lives. Cannot recommend them enough!",
      couple: "Priya & Dev",
      details: "Beachside Sunset Ceremony in Goa",
      image: "https://res.cloudinary.com/ujwz0e7r/image/upload/w_200,q_auto,f_auto/DSC06545.JPG.jpeg",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    // Lighter vertical rhythm than the grid sections: this is a single slim
    // slider, not a dense grid, so it doesn't need the same py-28 weight.
    <section id="testimonials" className="w-full py-16 md:py-20 bg-background text-foreground relative overflow-hidden select-none">

      {/* Decorative soft backdrop element */}
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-[85vw] md:max-w-[70vw] mx-auto w-full relative z-10">

        <SectionHeader
          icon={MessageSquareQuote}
          eyebrow="Love Notes"
          title="Client"
          accent="Stories"
          align="center"
          className="!mb-8 md:!mb-10"
        />

        {/*
          Editorial Testimonial Showcase Box:
          Includes a huge quote icon, italic serif narrative text, couple meta, and sliding controls.
          Was min-h-[380px] + justify-between, which forced the same fixed height
          regardless of quote length and spread the pieces out with empty air
          whenever a quote was short (as most are). A natural gap-based stack
          sizes itself to the content instead.
        */}
        <div className="relative flex flex-col items-center text-center px-4 sm:px-8 gap-6">

          {/* Quote Sign Icon */}
          <Quote className="w-10 h-10 text-gold/20 fill-gold/10 rotate-180" />

          {/* Testimonial Quote - transitions nicely based on index */}
          <p className="max-w-4xl text-lg sm:text-xl md:text-2xl font-serif font-light italic leading-relaxed text-[#333] transition-all duration-700 select-text">
            “{testimonials[activeIndex].quote}”
          </p>

          {/* Couple profile & tags details */}
          <div className="mt-2 flex flex-col items-center gap-4">

            {/* Couple Circular Thumbnail Frame */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gold/25 shadow-md">
              <Image
                unoptimized
                src={testimonials[activeIndex].image}
                alt={testimonials[activeIndex].couple}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-serif text-lg font-bold text-foreground tracking-wide">
                {testimonials[activeIndex].couple}
              </h4>
              <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-primary font-semibold">
                {testimonials[activeIndex].details}
              </span>
            </div>

          </div>

          {/* Carousel Buttons Controls */}
          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={prevTestimonial}
              className="w-11 h-11 rounded-full border border-slate-200 hover:border-primary hover:text-primary flex items-center justify-center transition-colors cursor-pointer text-slate-500"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Slide Index indicators dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx ? "w-6 bg-primary" : "w-2 bg-primary/25"
                  }`}
                  aria-label={`Go to testimonial slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-11 h-11 rounded-full border border-slate-200 hover:border-primary hover:text-primary flex items-center justify-center transition-colors cursor-pointer text-slate-500"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
