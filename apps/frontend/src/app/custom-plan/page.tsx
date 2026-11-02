"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { ContactSection } from "@/components/ContactSection";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import {
  Camera,
  Video,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Search,
  Calendar,
  ShieldCheck,
  UploadCloud,
  FileCheck2,
  Plus,
  Minus,
  Layers,
  Send,
  ExternalLink,
  Clock,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  Award,
  Lock,
  Copy,
  AlertCircle,
  QrCode
} from "lucide-react";
import { createClient } from "../../../utils/supabase/client";

// Catalog Interface
interface EventCardData {
  id: string;
  name: string;
  tagline: string;
  fullPrice: number;
  photoPrice: number;
  videoPrice: number;
  isStandalone?: boolean; // For Pre-Wedding (flat 15k)
  description: string;
  features: string[];
  image: string;
}

// Exact Studio Rate Sheet from Vrundavan Studio brochure
const EVENT_CATALOG: EventCardData[] = [
  {
    id: "pre_wedding",
    name: "Pre-Wedding Shoot",
    tagline: "Romantic Golden Hour Storytelling",
    fullPrice: 15000,
    photoPrice: 15000,
    videoPrice: 15000,
    isStandalone: true, // "provading me sirf akela hoga sb mtlb 15 k me"
    description: "All Couple photo, 10 Days Story, 1 Reel. (+ Travel charge Extra)",
    features: [
      "All High-Res Couple Photos",
      "10 Days Social Media Story Highlights",
      "1 Signature Instagram Reel",
      "Couple Color Grading & Retouching",
      "Travel charge extra depending on location"
    ],
    image: "/services_pre_wedding.png"
  },
  {
    id: "engagement",
    name: "Engagement Ceremony",
    tagline: "Rings, Joy & Festive Beginnings",
    fullPrice: 23000,
    photoPrice: 11500, // 50% split
    videoPrice: 11500, // 50% split
    description: "All Photo, Couple photo With grading, Full video, 1 Reel, 1 Story.",
    features: [
      "All Photos with Professional Grading",
      "Dedicated Couple Portrait Session",
      "Full Traditional Ceremony Video",
      "1 Highlight Instagram Reel",
      "1 Curated Story Highlight"
    ],
    image: "/DSC06391_comp.jpg"
  },
  {
    id: "wedding",
    name: "Wedding (Lagna)",
    tagline: "Sacred Vows, Mandap Rituals & Grandeur",
    fullPrice: 50000,
    photoPrice: 25000, // 50% split
    videoPrice: 25000, // 50% split
    description: "All Photo, Couple photo With grading, Full video, 1 Reel, 1 Story.",
    features: [
      "Complete Rituals Coverage (Hasta Melap, Phera, Vidai)",
      "All Photos High-Res with Color Grading",
      "Couple Portraits with Cinematic Lighting",
      "Full Ceremony Video Film",
      "1 Signature Wedding Reel",
      "1 Curated Story"
    ],
    image: "/DSC06585.JPG_comp.jpg"
  },
  {
    id: "cinematic_candid",
    name: "Cinematic / Candid",
    tagline: "Unscripted Luxury 4K Film & Emotional Moments",
    fullPrice: 60000,
    photoPrice: 30000, // 50% split
    videoPrice: 30000, // 50% split
    description: "All Photo, Couple photo With grading, 1 Highlight, 1 Teaser(Reel), 4 Story.",
    features: [
      "Artistic Candid Photography (Pure natural emotions)",
      "4K Cinematic Wedding Filmmaking",
      "All Photos with Advanced Studio Grading",
      "1 Cinematic Highlight Film (3-5 min)",
      "1 Teaser Reel for Instagram",
      "4 High-Impact Stories"
    ],
    image: "/services_cinematic.png"
  },
  {
    id: "reception",
    name: "Reception",
    tagline: "Evening Glamour, Family Stage & Celebrations",
    fullPrice: 23000,
    photoPrice: 11500, // 50% split
    videoPrice: 11500, // 50% split
    description: "All Photo, Couple photo With grading, Full video, 1 Story.",
    features: [
      "Stage Greetings & Guest Portraits",
      "All Photos with Color Grading",
      "Couple Evening Glamour Shoot",
      "Full Reception Video",
      "1 Event Story Highlight"
    ],
    image: "/DSC06608.JPG_comp.jpg"
  },
  {
    id: "bride_side",
    name: "Bride Side Coverage",
    tagline: "Emotional Moments & Dedicated Family Coverage",
    fullPrice: 23000,
    photoPrice: 11500, // 50% split
    videoPrice: 11500, // 50% split
    description: "All Photo, Full video.",
    features: [
      "Exclusive Focus on Bride & Her Family",
      "All High-Res Ceremony Photos",
      "Full Ceremony Video Documentation"
    ],
    image: "/DSC06846.JPG_comp.jpg"
  }
];



export default function CustomPlanBuilder() {
  const supabase = createClient();

  // Mode: 'builder' | 'tracking'
  const [activeTab, setActiveTab] = useState<"builder" | "tracking">("builder");

  // Step 1: Package Selection, Step 2: Client & Date Details, Step 3: Advance Payment, Step 4: Confirmed
  const [step, setStep] = useState(1);

  // Pre-wedding selection (standalone flat 15k)
  const [includePreWedding, setIncludePreWedding] = useState(false);

  // Event coverage selection: { [eventId]: { photo: boolean, video: boolean } }
  const [eventSelections, setEventSelections] = useState<
    Record<string, { photo: boolean; video: boolean }>
  >({});


  // Per-event Drone Coverage (Day based: 10k per day)
  const [eventDrones, setEventDrones] = useState<Record<string, number>>({});
  const DRONE_PRICE_PER_DAY = 10000;

  // Discount coupon
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    type: "percentage" | "flat";
    value: number;
    code: string;
  } | null>(null);
  const [discountStatus, setDiscountStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [discountMessage, setDiscountMessage] = useState("");

  // Client form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    location: "Junagadh"
  });

  // Tracking & Order states
  const [searchQuery, setSearchQuery] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [resumedOrder, setResumedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  // Fetch booked dates from database on mount
  useEffect(() => {
    async function fetchBooked() {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("orders")
          .select("date")
          .eq("status", "confirmed");
        if (data) {
          setBookedDates(data.map((o) => o.date).filter(Boolean));
        }
      } catch (err) {
        console.warn("Could not fetch booked dates:", err);
      }
    }
    fetchBooked();
  }, [supabase]);

  // Ensure cinematic_candid is never active without wedding
  useEffect(() => {
    const isWeddingActive = Boolean(
      eventSelections["wedding"]?.photo || eventSelections["wedding"]?.video
    );
    if (!isWeddingActive) {
      if (eventSelections["cinematic_candid"]) {
        setEventSelections((prev) => {
          const next = { ...prev };
          delete next["cinematic_candid"];
          return next;
        });
      }
      if (eventDrones["cinematic_candid"]) {
        setEventDrones((prev) => {
          const next = { ...prev };
          delete next["cinematic_candid"];
          return next;
        });
      }
    }
  }, [eventSelections, eventDrones]);

  // Handle Photo / Video toggling for ceremony events
  const toggleCoverage = (
    eventId: string,
    coverageType: "photo" | "video"
  ) => {
    // Prevent selecting cinematic without wedding
    if (eventId === "cinematic_candid") {
      const isWeddingActive = Boolean(
        eventSelections["wedding"]?.photo || eventSelections["wedding"]?.video
      );
      if (!isWeddingActive) {
        alert("Please select Wedding (Lagna) first to add Cinematic / Candid coverage.");
        return;
      }
    }

    setEventSelections((prev) => {
      const current = prev[eventId] || { photo: false, video: false };
      const updated = {
        ...current,
        [coverageType]: !current[coverageType]
      };

      const nextState = { ...prev };

      // If both unchecked, remove from selections
      if (!updated.photo && !updated.video) {
        delete nextState[eventId];
        // If wedding is turned off, also remove cinematic_candid
        if (eventId === "wedding") {
          delete nextState["cinematic_candid"];
        }
        return nextState;
      }

      nextState[eventId] = updated;
      return nextState;
    });
  };

  // Toggle both photo and video at once
  const toggleBoth = (eventId: string) => {
    // Prevent selecting cinematic without wedding
    if (eventId === "cinematic_candid") {
      const isWeddingActive = Boolean(
        eventSelections["wedding"]?.photo || eventSelections["wedding"]?.video
      );
      if (!isWeddingActive) {
        alert("Please select Wedding (Lagna) first to add Cinematic / Candid coverage.");
        return;
      }
    }

    setEventSelections((prev) => {
      const current = prev[eventId];
      const nextState = { ...prev };
      if (current && current.photo && current.video) {
        // Turn off
        delete nextState[eventId];
        // If wedding is turned off, also remove cinematic_candid
        if (eventId === "wedding") {
          delete nextState["cinematic_candid"];
        }
        return nextState;
      }
      // Turn both on
      nextState[eventId] = { photo: true, video: true };
      return nextState;
    });
  };



  // Dynamic Price Calculation
  const { subtotal, total, discountAmount, droneTotal, selectedItemsList } =
    useMemo(() => {
      let calcSubtotal = 0;
      const items: { label: string; price: number; type: string }[] = [];

      // 1. Pre-wedding
      if (includePreWedding) {
        const pw = EVENT_CATALOG.find((e) => e.id === "pre_wedding")!;
        calcSubtotal += pw.fullPrice;
        items.push({
          label: "Pre-Wedding Shoot (Couple Photos + 10D Story + 1 Reel)",
          price: pw.fullPrice,
          type: "Pre-Wedding"
        });

        // Pre-wedding drone
        if (eventDrones["pre_wedding"] && eventDrones["pre_wedding"] > 0) {
          const dDays = eventDrones["pre_wedding"];
          const dPrice = dDays * DRONE_PRICE_PER_DAY;
          calcSubtotal += dPrice;
          items.push({
            label: `Pre-Wedding: Drone Aerial Coverage (${dDays} Day${dDays > 1 ? "s" : ""})`,
            price: dPrice,
            type: "Drone"
          });
        }
      }

      // 2. Ceremonies
      Object.entries(eventSelections).forEach(([evId, cov]) => {
        const ev = EVENT_CATALOG.find((e) => e.id === evId);
        if (!ev) return;

        if (cov.photo && cov.video) {
          calcSubtotal += ev.fullPrice;
          items.push({
            label: `${ev.name} (Photo + Video)`,
            price: ev.fullPrice,
            type: "Ceremony"
          });
        } else if (cov.photo) {
          calcSubtotal += ev.photoPrice;
          items.push({
            label: `${ev.name} (Photography Only)`,
            price: ev.photoPrice,
            type: "Photography"
          });
        } else if (cov.video) {
          calcSubtotal += ev.videoPrice;
          items.push({
            label: `${ev.name} (Videography Only)`,
            price: ev.videoPrice,
            type: "Videography"
          });
        }

        // In-ceremony drone
        if (eventDrones[evId] && eventDrones[evId] > 0) {
          const dDays = eventDrones[evId];
          const dPrice = dDays * DRONE_PRICE_PER_DAY;
          calcSubtotal += dPrice;
          items.push({
            label: `${ev.name}: Drone Coverage (${dDays} Day${dDays > 1 ? "s" : ""})`,
            price: dPrice,
            type: "Drone"
          });
        }
      });

      // Total drone aggregate
      let dTotal = 0;
      Object.values(eventDrones).forEach((days) => {
        dTotal += (days || 0) * DRONE_PRICE_PER_DAY;
      });

      // Discount
      let disc = 0;
      if (appliedDiscount) {
        if (appliedDiscount.type === "percentage") {
          disc = Math.round(calcSubtotal * (appliedDiscount.value / 100));
        } else {
          disc = Math.min(calcSubtotal, appliedDiscount.value);
        }
      }

      const finalTotal = Math.max(0, calcSubtotal - disc);

      return {
        subtotal: calcSubtotal,
        total: finalTotal,
        discountAmount: disc,
        droneTotal: dTotal,
        selectedItemsList: items
      };
    }, [
      includePreWedding,
      eventSelections,
      eventDrones,
      appliedDiscount
    ]);

  // Handle Discount Application
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountStatus("loading");

    const codeUpper = discountCode.trim().toUpperCase();

    // Built-in discount fallback for high responsiveness
    if (codeUpper === "SUMMER20") {
      setAppliedDiscount({ type: "percentage", value: 20, code: "SUMMER20" });
      setDiscountStatus("success");
      setDiscountMessage("20% OFF Applied successfully!");
      return;
    }
    if (codeUpper === "FLAT5000") {
      setAppliedDiscount({ type: "flat", value: 5000, code: "FLAT5000" });
      setDiscountStatus("success");
      setDiscountMessage("₹5,000 Flat Discount Applied!");
      return;
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("discount_coupons")
          .select("*")
          .ilike("code", codeUpper)
          .eq("is_active", true)
          .single();

        if (data && !error) {
          setAppliedDiscount({
            type: data.discount_type,
            value: Number(data.discount_value),
            code: data.code
          });
          setDiscountStatus("success");
          setDiscountMessage(
            `${data.discount_type === "percentage" ? data.discount_value + "% OFF" : "₹" + data.discount_value + " OFF"} Applied!`
          );
          return;
        }
      }
      throw new Error("Invalid or expired coupon code.");
    } catch (err: any) {
      setDiscountStatus("error");
      setDiscountMessage(err.message || "Invalid coupon code.");
      setAppliedDiscount(null);
    }
  };

  // Build the textual package blueprint
  const packageString = useMemo(() => {
    const parts: string[] = [];
    selectedItemsList.forEach((item) => parts.push(`${item.label}`));
    return `Custom Plan: ${parts.join(" | ")}`;
  }, [selectedItemsList]);

  // Step 1 -> Step 2 validation
  const handleProceedToDetails = () => {
    if (selectedItemsList.length === 0) {
      alert("Please select at least one ceremony, pre-wedding shoot, or coverage service to continue.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Step 2 -> Step 3: Create Order & Generate Quote
  const handleCreateOrder = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please enter your name and contact phone number.");
      return;
    }
    if (!formData.date) {
      alert("Please select your shoot date.");
      return;
    }

    setIsSubmitting(true);
    const generatedQuote = `VRUN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const orderPayload = {
        name: formData.name,
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        location: formData.location || "Junagadh",
        package: packageString,
        total_amount: total,
        quote_id: generatedQuote,
        status: "pending_payment",
        amountPaid: "0"
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const resData = await res.json();
      if (resData.order) {
        setOrderId(resData.order.id);
        setQuoteId(resData.order.quote_id || generatedQuote);
        setResumedOrder(resData.order);
      } else {
        setOrderId(`ORD-${Date.now().toString().slice(-4)}`);
        setQuoteId(generatedQuote);
      }

      setStep(3);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: any) {
      console.error("Order creation error:", err);
      // Still allow client to advance to payment with local quote ID
      setQuoteId(generatedQuote);
      setOrderId(`ORD-${Date.now().toString().slice(-4)}`);
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 -> Step 4: Submit Payment Screenshot & Confirm
  const handlePaymentSubmit = async () => {
    if (!paymentFile) {
      setPaymentError("Payment screenshot is strictly required. Please upload your transfer receipt to proceed.");
      return;
    }
    setPaymentError("");
    setIsSubmitting(true);
    try {
      let screenshotUrl = null;

      if (paymentFile && supabase) {
        try {
          const fileExt = paymentFile.name.split(".").pop();
          const fileName = `${quoteId || "quote"}-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("payment-screenshots")
            .upload(fileName, paymentFile);

          if (!uploadError) {
            const {
              data: { publicUrl }
            } = supabase.storage.from("payment-screenshots").getPublicUrl(fileName);
            screenshotUrl = publicUrl;
          }
        } catch (e) {
          console.warn("Storage upload fallback:", e);
        }
      }

      const updatePayload = {
        id: orderId || quoteId,
        updates: {
          status: "pending",
          amountPaid: "5000",
          payment_screenshot_url: screenshotUrl || paymentPreview || "uploaded"
        }
      };

      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload)
      });

      // Notify studio (non-blocking)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin_new_order",
          order: {
            customer: formData.name,
            phone: formData.phone,
            package: packageString,
            total_amount: total,
            quote_id: quoteId,
            date: formData.date
          }
        })
      }).catch((e) => console.warn("Notify error:", e));

      setStep(4);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: any) {
      alert("Error confirming payment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track existing order by Quote ID or Phone/Email
  const handleSearchOrder = async () => {
    if (!searchQuery.trim()) {
      setAuthError("Please enter your Quote ID, Phone or Email.");
      return;
    }
    setAuthError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/orders?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (data.order) {
        setResumedOrder(data.order);
        setOrderId(data.order.id);
        setQuoteId(data.order.quote_id);
        setActiveTab("tracking");
      } else {
        setAuthError("No order found matching this Quote ID or Contact number.");
      }
    } catch (err: any) {
      setAuthError("Unable to locate order. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#030814] text-slate-100 selection:bg-[#003366] selection:text-white">
      <Header forceSolid={true} />

      {/* Luxury Hero Banner */}
      <section className="relative w-full pt-32 pb-16 px-6 overflow-hidden border-b border-white/5">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#003366]/30 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-300 font-bold">
              Bespoke Studio Rates • Junagadh
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-normal tracking-tight text-white mb-4">
            Custom Package <span className="italic text-amber-300 font-light">Builder</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed mb-8">
            Create your personalized wedding package. Choose Photography &amp; Videography individually (50/50 split), add Pre-Wedding, configure Drone days, and view instant transparent pricing.
          </p>

          {/* Quick Tab Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => {
                setActiveTab("builder");
                setResumedOrder(null);
              }}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "builder"
                  ? "bg-[#003366] text-white shadow-lg shadow-[#003366]/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Build Package
            </button>
            <button
              onClick={() => setActiveTab("tracking")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "tracking"
                  ? "bg-[#003366] text-white shadow-lg shadow-[#003366]/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Track Quote / Order
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 relative z-10">
        {activeTab === "tracking" ? (
          /* ============================================================== */
          /* TRACKING VIEW                                                  */
          /* ============================================================== */
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#0b1329] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-8">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-2">
                  Order Status Lookup
                </span>
                <h2 className="text-3xl font-serif text-white">Track Your Booking</h2>
                <p className="text-xs text-slate-400 mt-2">
                  Enter your Quote ID (e.g. VRUN-7A1B), Phone Number, or Email to view your booking details.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchOrder()}
                    placeholder="Enter Quote ID, Phone or Email..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
                <button
                  onClick={handleSearchOrder}
                  disabled={isSubmitting}
                  className="bg-[#003366] hover:bg-[#002244] text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Searching..." : "Track"}
                </button>
              </div>

              {authError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center mb-6">
                  {authError}
                </div>
              )}

              {resumedOrder && (
                <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-widest block">
                        Quote Reference
                      </span>
                      <span className="text-xl font-mono font-bold text-amber-300">
                        {resumedOrder.quote_id || resumedOrder.id}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-widest block">
                        Status
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1 ${
                          resumedOrder.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : resumedOrder.status === "pending"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {resumedOrder.status === "confirmed"
                          ? "Confirmed"
                          : resumedOrder.status === "pending"
                          ? "Verifying Payment"
                          : "Awaiting Advance Token"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Client Details
                      </span>
                      <p className="text-sm font-bold text-white">{resumedOrder.customer || resumedOrder.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{resumedOrder.phone}</p>
                      <p className="text-xs text-slate-400">{resumedOrder.email || "No email"}</p>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Event Date &amp; Location
                      </span>
                      <p className="text-sm font-bold text-white">
                        {resumedOrder.date
                          ? new Date(resumedOrder.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })
                          : "Date not set"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{resumedOrder.location || "Junagadh"}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">
                      Package Blueprint
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {resumedOrder.package}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Total Investment
                      </span>
                      <span className="text-lg font-serif font-bold text-white">
                        ₹{Number(resumedOrder.total_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Advance Paid
                      </span>
                      <span className="text-lg font-serif font-bold text-emerald-400">
                        ₹{Number(resumedOrder.amountPaid || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Balance Due
                      </span>
                      <span className="text-lg font-serif font-bold text-amber-400">
                        ₹{(
                          Number(resumedOrder.total_amount || 0) -
                          Number(resumedOrder.amountPaid || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {resumedOrder.status === "pending_payment" && (
                    <button
                      onClick={() => {
                        setQuoteId(resumedOrder.quote_id || resumedOrder.id);
                        setOrderId(resumedOrder.id);
                        setActiveTab("builder");
                        setStep(3);
                      }}
                      className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider text-xs transition-all shadow-lg"
                    >
                      Pay ₹5,000 Advance Token Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* BUILDER VIEW (STEPS 1, 2, 3, 4)                                */
          /* ============================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Builder Steps */}
            <div className="lg:col-span-8 space-y-10">
              {/* Step Progression Bar */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0b1329] border border-white/10 text-xs font-mono">
                <div
                  className={`flex items-center gap-2 ${
                    step >= 1 ? "text-amber-300 font-bold" : "text-slate-500"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 1 ? "bg-amber-400 text-black font-bold" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    1
                  </span>
                  <span className="hidden sm:inline">Select Package</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <div
                  className={`flex items-center gap-2 ${
                    step >= 2 ? "text-amber-300 font-bold" : "text-slate-500"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 2 ? "bg-amber-400 text-black font-bold" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    2
                  </span>
                  <span className="hidden sm:inline">Event Details</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <div
                  className={`flex items-center gap-2 ${
                    step >= 3 ? "text-amber-300 font-bold" : "text-slate-500"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 3 ? "bg-amber-400 text-black font-bold" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    3
                  </span>
                  <span className="hidden sm:inline">Advance Payment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <div
                  className={`flex items-center gap-2 ${
                    step >= 4 ? "text-emerald-400 font-bold" : "text-slate-500"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 4 ? "bg-emerald-400 text-black font-bold" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    4
                  </span>
                  <span className="hidden sm:inline">Confirmed</span>
                </div>
              </div>

              {step === 1 && (
                /* STEP 1: CURATE EVENTS, COVERAGE & DRONE */
                <div className="space-y-10 animate-in fade-in duration-500">
                  {/* 1. PRE-WEDDING SHOOT (Special Standalone Package - 15K) */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block">
                          Solo Package • All Inclusive
                        </span>
                        <h2 className="text-2xl font-serif text-white">Pre-Wedding Shoot</h2>
                      </div>
                      <span className="text-xl font-serif font-bold text-amber-300">
                        ₹15,000
                      </span>
                    </div>

                    <div
                      onClick={() => setIncludePreWedding((prev) => !prev)}
                      className={`relative rounded-3xl p-6 sm:p-7 border cursor-pointer transition-all duration-300 group overflow-hidden ${
                        includePreWedding
                          ? "bg-gradient-to-r from-[#003366]/40 via-[#0b1329] to-[#003366]/30 border-amber-400/60 shadow-[0_10px_30px_rgba(251,191,36,0.1)] ring-1 ring-amber-400/40"
                          : "bg-[#0b1329]/80 border-white/10 hover:border-white/20 hover:bg-[#0b1329]"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-serif text-white font-medium">
                              Pre-Wedding Story Package
                            </h3>
                            {includePreWedding && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-amber-400 text-black">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            All Couple photos with cinematic grading, 10 Days Story coverage, and 1 Instagram Reel. *(Travel charge extra)*
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                              📸 All Couple Photos
                            </span>
                            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                              🎬 1 Cinematic Reel
                            </span>
                            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                              ✨ 10 Days Story
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <span className="text-2xl font-serif font-bold text-white block">
                              ₹15,000
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Flat Complete Rate
                            </span>
                          </div>
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                              includePreWedding
                                ? "bg-amber-400 border-amber-400 text-black"
                                : "border-slate-600 group-hover:border-slate-400"
                            }`}
                          >
                            {includePreWedding && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      {/* In-Card Drone for Pre-Wedding */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] -mx-2 -mb-2 p-3.5 rounded-2xl cursor-default"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              (eventDrones["pre_wedding"] || 0) > 0
                                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                                : "bg-white/5 text-slate-400"
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Pre-Wedding Drone Coverage
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ₹10,000 / Day
                            </span>
                          </div>
                        </div>

                        {(eventDrones["pre_wedding"] || 0) === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (!includePreWedding) setIncludePreWedding(true);
                              setEventDrones((prev) => ({ ...prev, pre_wedding: 1 }));
                            }}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                            <span>Add Drone</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-[#003366]/40 p-1.5 rounded-xl border border-amber-400/40 shadow-inner">
                            <button
                              type="button"
                              onClick={() => {
                                const current = eventDrones["pre_wedding"] || 1;
                                if (current <= 1) {
                                  setEventDrones((prev) => {
                                    const next = { ...prev };
                                    delete next["pre_wedding"];
                                    return next;
                                  });
                                } else {
                                  setEventDrones((prev) => ({ ...prev, pre_wedding: current - 1 }));
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Decrease day"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="font-mono text-xs font-bold text-white px-2 min-w-[3.5rem] text-center">
                              {eventDrones["pre_wedding"]}{" "}
                              {eventDrones["pre_wedding"] === 1 ? "Day" : "Days"}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                const current = eventDrones["pre_wedding"] || 1;
                                setEventDrones((prev) => ({
                                  ...prev,
                                  pre_wedding: Math.min(10, current + 1)
                                }));
                              }}
                              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Increase day"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <div className="border-l border-white/15 pl-2.5 pr-1 font-serif font-bold text-amber-300 text-xs">
                              ₹{((eventDrones["pre_wedding"] || 1) * DRONE_PRICE_PER_DAY).toLocaleString("en-IN")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. CEREMONY PACKAGES */}
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block">
                        Ceremonies &amp; Coverage
                      </span>
                      <h2 className="text-2xl font-serif text-white">Event Coverage</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Select Photography, Videography, or Both for each ceremony, and add Drone days as required.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {EVENT_CATALOG.filter((e) => !e.isStandalone).map((event) => {
                        const isWeddingSelected = Boolean(
                          eventSelections["wedding"]?.photo || eventSelections["wedding"]?.video
                        );

                        // If this event is cinematic_candid, only show when Wedding is selected!
                        if (event.id === "cinematic_candid" && !isWeddingSelected) {
                          return (
                            <div
                              key="cinematic_locked"
                              className="rounded-3xl border border-dashed border-amber-400/20 bg-amber-500/[0.03] p-6 transition-all duration-300"
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center shrink-0">
                                    <Lock className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-serif font-bold text-white text-base">
                                        Cinematic / Candid Film (Locked)
                                      </span>
                                      <span className="text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded border border-amber-400/20">
                                        Requires Wedding Day
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                      Select <strong className="text-white">Wedding (Lagna)</strong> to unlock Cinematic &amp; Candid film coverage.
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleBoth("wedding")}
                                  className="px-5 py-2.5 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  Select Wedding to Unlock
                                </button>
                              </div>
                            </div>
                          );
                        }

                        const selection = eventSelections[event.id] || {
                          photo: false,
                          video: false
                        };
                        const hasPhoto = selection.photo;
                        const hasVideo = selection.video;
                        const isBoth = hasPhoto && hasVideo;
                        const isSelected = hasPhoto || hasVideo;

                        return (
                          <div
                            key={event.id}
                            className={`rounded-3xl border p-6 sm:p-7 transition-all duration-300 ${
                              isSelected
                                ? "bg-[#0b1329] border-[#003366] shadow-[0_10px_30px_rgba(0,51,102,0.25)] ring-1 ring-[#003366]/50"
                                : "bg-[#080e21] border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-serif text-white font-medium">
                                    {event.name}
                                  </h3>
                                  {event.id === "cinematic_candid" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-amber-400 text-black">
                                      ✨ Wedding Upgrade Unlocked
                                    </span>
                                  )}
                                  {isBoth ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-[#003366] text-amber-300 border border-amber-400/30">
                                      Photo + Video
                                    </span>
                                  ) : hasPhoto ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                      Photography (₹{event.photoPrice.toLocaleString("en-IN")})
                                    </span>
                                  ) : hasVideo ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                                      Videography (₹{event.videoPrice.toLocaleString("en-IN")})
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                  {event.description}
                                </p>
                              </div>

                              <div className="text-left md:text-right">
                                <span className="text-xs text-slate-500 uppercase font-mono block">
                                  Full Event Rate
                                </span>
                                <span className="text-xl font-serif font-bold text-white">
                                  ₹{event.fullPrice.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>

                            {/* Coverage Controls: Photography and Videography (NO 50% text) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/5">
                              {/* Option A: Photography */}
                              <button
                                type="button"
                                onClick={() => toggleCoverage(event.id, "photo")}
                                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  hasPhoto
                                    ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Camera className="w-4 h-4 text-blue-400" />
                                  <div>
                                    <span className="text-xs font-bold block">Photography</span>
                                    <span className="text-[11px] font-mono font-bold text-amber-300">
                                      ₹{event.photoPrice.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                    hasPhoto
                                      ? "bg-blue-500 border-blue-500 text-white"
                                      : "border-slate-600"
                                  }`}
                                >
                                  {hasPhoto && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </button>

                              {/* Option B: Videography */}
                              <button
                                type="button"
                                onClick={() => toggleCoverage(event.id, "video")}
                                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  hasVideo
                                    ? "bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/10"
                                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Video className="w-4 h-4 text-purple-400" />
                                  <div>
                                    <span className="text-xs font-bold block">Videography</span>
                                    <span className="text-[11px] font-mono font-bold text-amber-300">
                                      ₹{event.videoPrice.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                    hasVideo
                                      ? "bg-purple-500 border-purple-500 text-white"
                                      : "border-slate-600"
                                  }`}
                                >
                                  {hasVideo && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </button>

                              {/* Option C: Quick Select Both */}
                              <button
                                type="button"
                                onClick={() => toggleBoth(event.id)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isBoth
                                    ? "bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10"
                                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                  <div>
                                    <span className="text-xs font-bold block">Complete (Both)</span>
                                    <span className="text-[11px] font-mono font-bold text-amber-300">
                                      ₹{event.fullPrice.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                    isBoth
                                      ? "bg-amber-400 border-amber-400 text-black"
                                      : "border-slate-600"
                                  }`}
                                >
                                  {isBoth && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </button>
                            </div>

                            {/* In-Card Drone Aerial Stepper */}
                            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] -mx-2 -mb-2 p-3.5 rounded-2xl">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                    (eventDrones[event.id] || 0) > 0
                                      ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                                      : "bg-white/5 text-slate-400"
                                  }`}
                                >
                                  <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-white block">
                                    {event.name} Drone Coverage
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    ₹10,000 / Day
                                  </span>
                                </div>
                              </div>

                              {(eventDrones[event.id] || 0) === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isSelected) toggleBoth(event.id);
                                    setEventDrones((prev) => ({ ...prev, [event.id]: 1 }));
                                  }}
                                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Add Drone</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 bg-[#003366]/40 p-1.5 rounded-xl border border-amber-400/40 shadow-inner">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = eventDrones[event.id] || 1;
                                      if (current <= 1) {
                                        setEventDrones((prev) => {
                                          const next = { ...prev };
                                          delete next[event.id];
                                          return next;
                                        });
                                      } else {
                                        setEventDrones((prev) => ({ ...prev, [event.id]: current - 1 }));
                                      }
                                    }}
                                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                                    title="Decrease day"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>

                                  <span className="font-mono text-xs font-bold text-white px-2 min-w-[3.5rem] text-center">
                                    {eventDrones[event.id]} {eventDrones[event.id] === 1 ? "Day" : "Days"}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = eventDrones[event.id] || 1;
                                      setEventDrones((prev) => ({
                                        ...prev,
                                        [event.id]: Math.min(10, current + 1)
                                      }));
                                    }}
                                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                                    title="Increase day"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>

                                  <div className="border-l border-white/15 pl-2.5 pr-1 font-serif font-bold text-amber-300 text-xs">
                                    ₹{((eventDrones[event.id] || 1) * DRONE_PRICE_PER_DAY).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                /* STEP 2: CLIENT DETAILS & SHOOT DATE */
                <div className="bg-[#0b1329] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                      Step 02 • Client Information
                    </span>
                    <h2 className="text-3xl font-serif text-white">Event &amp; Booking Details</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Provide your shoot date and location to verify team availability and generate your formal quote.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Yash Patel"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        WhatsApp / Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="yash@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        Shoot Venue / City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Junagadh, Rajkot, Ahmedabad..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block">
                      Shoot Date *
                    </label>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                      <CustomDatePicker
                        value={formData.date}
                        onChange={(date) => setFormData({ ...formData, date })}
                        bookedDates={bookedDates}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Packages
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateOrder}
                      disabled={isSubmitting}
                      className="flex-1 py-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#003366]/40 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{isSubmitting ? "Generating Quote..." : "Generate Quote & Reserve Dates"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                /* STEP 3: ADVANCE TOKEN PAYMENT */
                <div className="bg-[#0b1329] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div className="text-center pb-6 border-b border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                      Step 03 • Lock Your Dates
                    </span>
                    <h2 className="text-3xl font-serif text-white">Payment &amp; Screenshot Verification</h2>
                    <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                      Transfer the advance token of{" "}
                      <strong className="text-amber-300 font-bold">₹5,000</strong> (or full investment{" "}
                      <strong className="text-white font-bold">₹{total.toLocaleString("en-IN")}</strong>) via UPI, then upload the payment screenshot to proceed.
                    </p>

                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl mt-4">
                      <span className="text-xs text-slate-400 uppercase font-mono">Your Quote ID:</span>
                      <span className="text-base font-mono font-bold text-amber-300 tracking-wider">
                        {quoteId}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details & QR Code Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Bank / Studio Info & UPI QR */}
                    <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                            <QrCode className="w-4 h-4" />
                            <span>Scan &amp; Pay via UPI</span>
                          </h4>
                          <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            Instant UPI
                          </span>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-3.5 rounded-xl border border-white/10 mb-4">
                          <div className="bg-white p-2 rounded-lg shrink-0 shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                                `upi://pay?pa=vrundavanstudio@upi&pn=VrundavanStudio&am=5000&cu=INR`
                              )}`}
                              alt="Vrundavan Studio UPI QR"
                              className="w-28 h-28 object-contain"
                            />
                          </div>
                          <div className="text-xs space-y-1.5 text-center sm:text-left">
                            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                              Scan with Any UPI App
                            </span>
                            <p className="text-slate-300 text-[11px] leading-tight">
                              GPay • PhonePe • Paytm • BHIM
                            </p>
                            <div className="pt-1">
                              <span className="text-[10px] text-slate-500 font-mono block">UPI ID</span>
                              <div className="flex items-center gap-2 mt-0.5 justify-center sm:justify-start">
                                <span className="font-mono text-xs text-white font-bold bg-white/10 px-2 py-1 rounded">
                                  vrundavanstudio@upi
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText("vrundavanstudio@upi");
                                    setCopiedUpi(true);
                                    setTimeout(() => setCopiedUpi(false), 2000);
                                  }}
                                  className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                                  title="Copy UPI ID"
                                >
                                  {copiedUpi ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Total Package Investment</span>
                            <span className="font-mono text-amber-300 font-bold">
                              ₹{total.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Advance Token to Lock Dates</span>
                            <span className="font-mono text-emerald-400 font-bold">₹5,000</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Remaining Balance on Shoot</span>
                            <span className="font-mono text-slate-300 font-medium">
                              ₹{Math.max(0, total - 5000).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-500 border-t border-white/5">
                        📍 Studio: Shop No. A17, Cosmic Complex, Zanzarda Chowkdi, Junagadh
                      </div>
                    </div>

                    {/* Screenshot Upload Box (Strictly Mandatory) */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-amber-400" />
                            <span>Payment Screenshot *</span>
                          </label>
                          <span className="text-[10px] font-mono uppercase bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold">
                            Mandatory
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3">
                          Please attach screenshot of your advance transfer. Booking will only proceed after verification.
                        </p>

                        {!paymentFile ? (
                          <div
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
                              paymentError
                                ? "border-red-500/60 bg-red-500/[0.03]"
                                : "border-amber-400/30 hover:border-amber-400/60 hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-white mb-1">
                              Click or Drag &amp; Drop Screenshot Here
                            </p>
                            <p className="text-[11px] text-slate-400 mb-2">
                              Google Pay, PhonePe, Paytm, or Bank Transfer Receipt
                            </p>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono">
                              JPG, PNG or PDF up to 10MB
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file) {
                                  if (file.size > 10 * 1024 * 1024) {
                                    setPaymentError("File size must be under 10MB");
                                    return;
                                  }
                                  setPaymentError("");
                                  setPaymentFile(file);
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPaymentPreview(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="border border-emerald-500/40 bg-emerald-500/[0.04] rounded-2xl p-4 transition-all">
                            <div className="flex items-center gap-3">
                              {paymentPreview && paymentFile.type.startsWith("image/") ? (
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/30 shrink-0 bg-black/40">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={paymentPreview}
                                    alt="Payment screenshot"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                  <Check className="w-7 h-7" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-0.5">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Screenshot Attached</span>
                                </div>
                                <p className="text-xs text-white truncate font-medium">
                                  {paymentFile.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {(paymentFile.size / 1024).toFixed(1)} KB • Ready to submit
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentFile(null);
                                  setPaymentPreview(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-300 font-mono transition-colors"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        )}

                        {paymentError && (
                          <div className="flex items-center gap-2 text-red-400 text-xs mt-2 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{paymentError}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <span>
                          Step 4 confirmation is locked until payment screenshot is provided to prevent spam bookings.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handlePaymentSubmit}
                      disabled={isSubmitting || !paymentFile}
                      className={`w-full sm:flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        paymentFile
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 cursor-pointer"
                          : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {paymentFile ? (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>{isSubmitting ? "Submitting Verification..." : "Submit Screenshot & Confirm Booking"}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Upload Screenshot to Unlock Step 4</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                /* STEP 4: BOOKING CONFIRMED */
                <div className="bg-[#0b1329] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-in zoom-in-95 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <FileCheck2 className="w-10 h-10" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-serif text-white">Booking Quote Received!</h2>
                  <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                    Thank you, <strong className="text-white font-bold">{formData.name}</strong>. Your custom package has been reserved with Quote ID:
                  </p>

                  <div className="inline-block bg-white/5 border border-white/10 px-8 py-3.5 rounded-2xl">
                    <span className="font-mono text-2xl font-bold text-amber-300 tracking-wider">
                      {quoteId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Our Junagadh Studio management team is reviewing your date and details. We will contact you on WhatsApp at{" "}
                    <strong className="text-white">{formData.phone}</strong> shortly.
                  </p>

                  {/* WhatsApp Quick Link */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href={`https://wa.me/919876543210?text=${encodeURIComponent(
                        `Hello Vrundavan Studio Junagadh! I have created a custom booking quote ${quoteId} for my wedding on ${formData.date}. Total investment: ₹${total.toLocaleString(
                          "en-IN"
                        )}. Please confirm team assignment.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30"
                    >
                      <Send className="w-4 h-4" />
                      Chat with Studio on WhatsApp
                    </a>

                    <button
                      onClick={() => {
                        setStep(1);
                        setIncludePreWedding(false);
                        setEventSelections({ wedding: { photo: true, video: true } });
                        setEventDrones({});
                      }}
                      className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider border border-white/10 transition-all"
                    >
                      Create Another Package
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Sticky Summary Card ("Your Custom Blueprint") */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-[#0b1329] rounded-3xl border border-white/10 p-6 md:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white">
                      Your Blueprint
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedItemsList.length} Selected
                  </span>
                </div>

                {/* Selected Items Breakdown */}
                <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto pr-1">
                  {selectedItemsList.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No events or services selected yet. Choose ceremonies on the left to start building.
                    </div>
                  ) : (
                    selectedItemsList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="text-white font-medium block leading-tight">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400/80">
                            {item.type}
                          </span>
                        </div>
                        <span className="font-serif font-bold text-slate-200 shrink-0">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Discount Code Input */}
                <div className="pt-4 border-t border-white/10 space-y-2 mb-6">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                    Promo Code / Voucher
                  </span>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Try: SUMMER20"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono uppercase text-white placeholder:text-slate-500 focus:outline-none focus:border-[#003366]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={discountStatus === "loading" || !discountCode.trim()}
                      className="px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold uppercase disabled:opacity-50 transition-all"
                    >
                      {discountStatus === "loading" ? "..." : "Apply"}
                    </button>
                  </div>
                  {discountMessage && (
                    <p
                      className={`text-[10px] font-mono font-bold ${
                        discountStatus === "success" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {discountMessage}
                    </p>
                  )}
                </div>

                {/* Pricing Totals */}
                <div className="pt-4 border-t border-white/10 space-y-2.5 mb-6 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({appliedDiscount?.code})</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Total Investment
                    </span>
                    <div className="text-right">
                      <span className="text-3xl font-serif font-bold text-amber-300">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-amber-300">
                      <span>Token Advance to Reserve</span>
                      <span>₹5,000</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Balance on Shoot Day</span>
                      <span>₹{Math.max(0, total - 5000).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                {step === 1 && (
                  <button
                    type="button"
                    onClick={handleProceedToDetails}
                    disabled={selectedItemsList.length === 0}
                    className="w-full py-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#003366]/40 flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <span>Proceed to Book (Step 2)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] uppercase font-mono tracking-widest text-center mt-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Guaranteed Studio Dates</span>
                </div>
              </div>

              {/* Studio Info Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Vrundavan Studio Junagadh</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Shop No. A17, Cosmic Complex, Zanzarda Chowkdi, Junagadh.
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Custom rates are per our studio official price card. Travel charges outside Junagadh district are extra.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <ContactSection />
    </main>
  );
}
