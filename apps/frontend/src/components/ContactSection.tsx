"use client";

import * as React from "react";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

export function ContactSection() {
  const [formState, setFormState] = React.useState({ name: "", email: "", date: "", msg: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // WhatsApp redirect format
    const text = `Hello Vrundavan Studio, I would like to book a shoot.\nName: ${formState.name}\nEmail: ${formState.email}\nDate: ${formState.date}\nMessage: ${formState.msg}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/919999999999?text=${encoded}`, "_blank");
  };

  return (
    <section id="contact" className="relative z-10 w-full py-14 md:py-20 bg-background text-foreground select-none border-t border-primary/5 shadow-[0_-30px_60px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1440px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Contact Information Details */}
        <div className="lg:col-span-5 flex flex-col gap-8 text-left justify-start">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Get In Touch
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal font-serif leading-tight text-foreground">
              Let&apos;s write your <br />
              <span className="italic font-light text-primary">next chapter.</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Dates fill up quickly for wedding seasons. Reach out today to reserve your slots or plan a consultation session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mt-2">
            {/* Phone */}
            <a href="tel:+919999999999" className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Phone className="w-4 h-4 text-primary group-hover:text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Call Us
                </span>
                <span className="text-sm font-semibold text-foreground">
                  +91 99999 99999
                </span>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:info@vrundavanstudio.com" className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Mail className="w-4 h-4 text-primary group-hover:text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Write Us
                </span>
                <span className="text-sm font-semibold text-foreground">
                  info@vrundavanstudio.com
                </span>
              </div>
            </a>

            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <svg className="w-4 h-4 text-primary group-hover:text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Instagram
                </span>
                <span className="text-sm font-semibold text-foreground">
                  @vrundavan_studio
                </span>
              </div>
            </a>

            {/* Location */}
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 flex-shrink-0 rounded-full border border-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Studio Address
                </span>
                <span className="text-sm font-semibold text-foreground">
                  Junagadh, Gujarat, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Booking / Consultation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-primary/5 rounded-2xl p-8 sm:p-10 shadow-md flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-serif text-foreground">
              Reserve Your Consultation
            </h3>
            <p className="text-xs text-muted-foreground">
              Fill in your details and we will connect on WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Your Name
              </label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. Aarav Patel"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. name@domain.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Proposed Event Date
            </label>
            <input
              type="date"
              required
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
              className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Brief Story / Requirements
            </label>
            <textarea
              rows={4}
              required
              value={formState.msg}
              onChange={(e) => setFormState({ ...formState, msg: e.target.value })}
              className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Tell us about your wedding location or portraits vision..."
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest bg-primary hover:bg-[#002244] text-white text-xs shadow-md transition-all duration-300 hover:scale-[1.01]"
          >
            <MessageCircle className="w-4 h-4" />
            Connect on WhatsApp
          </button>
        </form>

      </div>
    </section>
  );
}
