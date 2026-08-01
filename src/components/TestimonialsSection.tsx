"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, ChevronLeft, ChevronRight, Quote } from "lucide-react";

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
      image: "/DSC06608.JPG.jpeg",
    },
    {
      id: 2,
      quote: "The dedication and artistic vision of the team are outstanding. They captured every candid embrace and tear with such subtlety. We are absolutely in love with the leather-bound fine-art album and our 15-minute cinematic film.",
      couple: "Ruchi & Akshay",
      details: "Heritage Golden Hour Haldi & Wedding",
      image: "/DSC06650.JPG.jpeg",
    },
    {
      id: 3,
      quote: "Every frame feels like a scene from an organic movie. They made us feel so comfortable, and the team was almost invisible while capturing the most intimate moments of our lives. Cannot recommend them enough!",
      couple: "Priya & Dev",
      details: "Beachside Sunset Ceremony in Goa",
      image: "/DSC06545.JPG.jpeg",
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
    <section id="testimonials" className="w-full py-28 bg-[#ffffff] text-[#1a1a1a] relative overflow-hidden select-none border-t border-slate-100">
      
      {/* Decorative soft backdrop element */}
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-[85vw] md:max-w-[70vw] mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-16">
          <div className="flex items-center gap-2 text-[#003366]">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
              Love Notes
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-[#1a1a1a]">
            Client <span className="italic font-light text-[#003366]">Stories</span>
          </h2>
          <div className="w-12 h-[2px] bg-[#003366]/20 mt-2" />
        </div>

        {/* 
          Editorial Testimonial Showcase Box:
          Includes a huge quote icon, italic serif narrative text, couple meta, and sliding controls.
        */}
        <div className="relative flex flex-col items-center text-center px-4 sm:px-8 min-h-[380px] justify-between">
          
          {/* Quote Sign Icon */}
          <div className="text-amber-500/20 mb-6">
            <Quote className="w-14 h-14 mx-auto fill-amber-500/10 rotate-180" />
          </div>

          {/* Testimonial Quote - transitions nicely based on index */}
          <div className="flex-grow flex items-center justify-center max-w-4xl">
            <p className="text-lg sm:text-xl md:text-2xl font-serif font-light italic leading-relaxed text-[#333] transition-all duration-700 select-text">
              “{testimonials[activeIndex].quote}”
            </p>
          </div>

          {/* Couple profile & tags details */}
          <div className="mt-10 flex flex-col items-center gap-4">
            
            {/* Couple Circular Thumbnail Frame */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-amber-500/25 shadow-md">
              <Image
                src={testimonials[activeIndex].image}
                alt={testimonials[activeIndex].couple}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-serif text-lg font-bold text-[#1a1a1a] tracking-wide">
                {testimonials[activeIndex].couple}
              </h4>
              <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#003366] font-semibold">
                {testimonials[activeIndex].details}
              </span>
            </div>

          </div>

          {/* Carousel Buttons Controls */}
          <div className="flex items-center gap-6 mt-12">
            <button
              onClick={prevTestimonial}
              className="w-11 h-11 rounded-full border border-slate-200 hover:border-[#003366] hover:text-[#003366] flex items-center justify-center transition-colors cursor-pointer text-slate-500"
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
                    activeIndex === idx ? "w-6 bg-[#003366]" : "w-2 bg-[#003366]/25"
                  }`}
                  aria-label={`Go to testimonial slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-11 h-11 rounded-full border border-slate-200 hover:border-[#003366] hover:text-[#003366] flex items-center justify-center transition-colors cursor-pointer text-slate-500"
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
