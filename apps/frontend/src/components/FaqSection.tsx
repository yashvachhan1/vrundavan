"use client";

import { useState } from "react";
import { Sparkles, Plus, Minus } from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export function FaqSection() {
  const faqs: FaqItem[] = [
    {
      id: 1,
      question: "Do you travel for destination weddings?",
      answer: "Absolutely. While we are based out of Gujarat, we travel worldwide to cover destination weddings. From the royal palaces of Udaipur and Jaipur to sandy beaches in Goa or international layouts in Dubai, our crew is fully equipped to handle destination logistics.",
    },
    {
      id: 2,
      question: "What is your style of wedding cinematography?",
      answer: "We specialize in organic, editorial, and documentary-style wedding cinema. We avoid artificial acting prompts and focus on capturing real emotions, raw glances, and candid laughter. Our films feel like custom independent romance movies with high-fidelity sound design and warm color grades.",
    },
    {
      id: 3,
      question: "How long does it take to deliver the photos and films?",
      answer: "We believe in premium quality over rushed edits. Typically, our first teaser trailer is delivered within 10-15 days. Complete retouched high-resolution photo galleries and custom feature films are delivered within 8-12 weeks after the wedding festivities.",
    },
    {
      id: 4,
      question: "Can we customize our packages?",
      answer: "Yes, definitely. Every wedding is unique, and we understand that standard packages may not fit everyone. We are more than happy to customize crew sizes, event days, drone coverage, and physical fine-art printed albums based on your budget and requirements.",
    },
    {
      id: 5,
      question: "How do we reserve our wedding dates?",
      answer: "We operate on a first-come, first-served booking system. To lock in your dates, we require a signed digital agreement and an advance retainer deposit. Since we only take a limited number of weddings per season to maintain premium quality standards, we recommend booking 6-9 months in advance.",
    },
  ];

  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="w-full py-28 bg-[#F0F7FD] text-[#1a1a1a] relative overflow-hidden select-none border-t border-slate-200">
      
      {/* Decorative Brand Circles */}
      <div className="absolute top-1/4 left-10 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[92vw] md:max-w-[65vw] mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-16">
          <div className="flex items-center gap-2 text-[#003366]">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">
              Common Queries
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight text-[#1a1a1a]">
            Frequently Asked <span className="italic font-light text-[#003366]">Questions</span>
          </h2>
          <div className="w-12 h-[2px] bg-[#003366]/20 mt-2" />
        </div>

        {/* 
          FAQ Accordion List:
          Features smooth height expanding transitions, custom plus/minus toggle icons,
          and clear division border partitions.
        */}
        <div className="flex flex-col border-t border-slate-350/50">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border-b border-slate-300/40 transition-all duration-300"
              >
                {/* Accordion Trigger Button Header */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full py-6 flex items-center justify-between gap-6 text-left cursor-pointer group"
                >
                  <span className="text-base sm:text-lg font-serif font-normal text-[#1a1a1a] group-hover:text-[#003366] transition-colors duration-300">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 group-hover:border-[#003366] flex items-center justify-center text-slate-400 group-hover:text-[#003366] transition-all duration-300">
                    {isOpen ? (
                      <Minus className="w-4 h-4 transition-transform duration-300 rotate-180" />
                    ) : (
                      <Plus className="w-4 h-4 transition-transform duration-300" />
                    )}
                  </div>
                </button>

                {/* Collapsible Answer Panel */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-[300px] opacity-100 pb-6" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-[95%] select-text">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
