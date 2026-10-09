"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { Header } from "@/components/Header";
import { ContactSection } from "@/components/ContactSection";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { Camera, Video, MonitorPlay, Check, ArrowRight, User, ShieldCheck, Mail, Phone, UploadCloud, FileCheck2, Sparkles, MapPin, Search, LayoutDashboard, Clock, Calendar } from 'lucide-react';

import { createClient } from '../../../utils/supabase/client';

type PlanItem = {
  id: string;
  type: 'event' | 'service' | 'addon';
  name: string;
  price: number;
  desc: string;
  icon: React.ElementType;
};

export default function CustomPlanBuilder() {
  const [EVENTS, setEvents] = useState<PlanItem[]>([]);
  const [SERVICES, setServices] = useState<PlanItem[]>([]);
  const [ADDONS, setAddons] = useState<PlanItem[]>([]);

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{type: 'percentage' | 'flat', value: number} | null>(null);
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [discountMessage, setDiscountMessage] = useState('');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', location: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resumedOrder, setResumedOrder] = useState<any>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  // Null when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't configured. This page
  // is client-rendered, so Next still runs this during prerender at build
  // time — createClient() used to throw in that case and take the whole
  // build down with it, so it now degrades to null instead.
  const supabase = createClient();

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        // Use fallback if supabase is not configured
        setEvents([
          { id: '1', type: 'event', name: 'Haldi', price: 15000, desc: 'Bright & colorful haldi ceremony coverage', icon: Camera },
          { id: '2', type: 'event', name: 'Mehendi', price: 20000, desc: 'Intimate mehendi evening with family', icon: Camera },
          { id: '3', type: 'event', name: 'Wedding', price: 50000, desc: 'Full traditional wedding day coverage', icon: Camera }
        ]);
        setServices([
          { id: '4', type: 'service', name: 'Cinematic Video', price: 80000, desc: '4K cinematic film with drone shots', icon: Video },
          { id: '5', type: 'service', name: 'Candid Photography', price: 40000, desc: 'Natural unposed moments captured', icon: Camera }
        ]);
        setAddons([
          { id: '6', type: 'addon', name: 'Same Day Edit Video', price: 25000, desc: 'Quick highlight video shown at reception', icon: Video },
          { id: '7', type: 'addon', name: 'Standard Canvera Album', price: 15000, desc: 'Premium printed 40-page photobook', icon: Camera }
        ]);
        return;
      }
      try {
        const { data, error } = await supabase.from('custom_plan_items').select('*').eq('active', true).order('created_at', { ascending: true });
        if (error) throw error;

        if (data && data.length > 0) {
          setEvents(data.filter(item => item.type === 'event').map(i => ({...i, desc: i.description})));
          setServices(data.filter(item => item.type === 'service').map(i => ({...i, desc: i.description, icon: i.icon === 'video' ? Video : Camera})));
          setAddons(data.filter(item => item.type === 'addon').map(i => ({...i, desc: i.description})));
        } else {
          throw new Error('No data found');
        }

        // Fetch booked dates
        const { data: ordersData, error: ordersError } = await supabase.from('orders').select('date').eq('status', 'confirmed');
        if (!ordersError && ordersData) {
           setBookedDates(ordersData.map(o => o.date).filter(Boolean));
        }
      } catch (err: any) {
        console.error("Using fallback data due to:", err);
        // Fallback data
        setEvents([
          { id: '1', type: 'event', name: 'Haldi', price: 15000, desc: 'Bright & colorful haldi ceremony coverage', icon: Camera },
          { id: '2', type: 'event', name: 'Mehendi', price: 20000, desc: 'Intimate mehendi evening with family', icon: Camera },
          { id: '3', type: 'event', name: 'Wedding', price: 50000, desc: 'Full traditional wedding day coverage', icon: Camera }
        ]);
        setServices([
          { id: '4', type: 'service', name: 'Cinematic Video', price: 80000, desc: '4K cinematic film with drone shots', icon: Video },
          { id: '5', type: 'service', name: 'Candid Photography', price: 40000, desc: 'Natural unposed moments captured', icon: Camera }
        ]);
        setAddons([
          { id: '6', type: 'addon', name: 'Same Day Edit Video', price: 25000, desc: 'Quick highlight video shown at reception', icon: Video },
          { id: '7', type: 'addon', name: 'Standard Canvera Album', price: 15000, desc: 'Premium printed 40-page photobook', icon: Camera }
        ]);
      }
    }
    fetchData();
  }, []);

  const handleApplyDiscount = async () => {
    if (!discountCode) return;
    if (!supabase) {
      setDiscountStatus('error');
      setDiscountMessage('Discount codes are temporarily unavailable.');
      return;
    }
    setDiscountStatus('loading');

    try {
      const { data, error } = await supabase.from('discount_coupons')
        .select('*')
        .ilike('code', discountCode)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Invalid or expired coupon code.');
      }
      
      setDiscountStatus('success');
      setDiscountMessage(`${data.discount_type === 'percentage' ? data.discount_value + '% OFF' : '₹' + data.discount_value + ' OFF'} Applied!`);
      setAppliedDiscount({ type: data.discount_type, value: data.discount_value });
      
    } catch (err: any) {
      setDiscountStatus('error');
      setDiscountMessage(err.message || 'Error applying coupon.');
      setAppliedDiscount(null);
    }
  };

  const toggleSelection = (id: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (state.includes(id)) {
      setState(state.filter(item => item !== id));
    } else {
      setState([...state, id]);
    }
  };

  const calculateTotal = React.useMemo(() => {
    let total = 0;
    const numEvents = selectedEvents.length;
    selectedEvents.forEach(id => {
      total += EVENTS.find(e => e.id === id)?.price || 0;
    });
    selectedServices.forEach(id => {
      const service = SERVICES.find(s => s.id === id);
      if (service) {
        total += service.price * (numEvents > 0 ? numEvents : 1);
      }
    });
    selectedAddons.forEach(id => {
      total += ADDONS.find(a => a.id === id)?.price || 0;
    });

    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        total = total - (total * (appliedDiscount.value / 100));
      } else if (appliedDiscount.type === 'flat') {
        total = Math.max(0, total - appliedDiscount.value);
      }
    }

    return total;
  }, [selectedEvents, selectedServices, selectedAddons, EVENTS, SERVICES, ADDONS, appliedDiscount]);

  const handleStartPlanning = async () => {
    if (!searchQuery.trim()) {
      setAuthError('Please enter your email, phone, or quote ID.');
      return;
    }
    setAuthError('');
    setIsSubmitting(true);
    
    try {
      if (supabase) {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1);
        
        const q = searchQuery.trim();
        const isEmail = q.includes('@');
        const isQuoteId = q.length === 8 && /^[A-Z0-9]+$/i.test(q);
        
        if (isQuoteId) {
          query = query.eq('quote_id', q.toUpperCase());
        } else if (isEmail) {
          query = query.eq('email', q);
        } else {
          query = query.or(`email.eq.${q},phone.eq.${q}`);
        }
        
        const { data } = await query;
        if (data && data.length > 0) {
          const order = data[0];
          setOrderId(order.id);
          setResumedOrder(order);
          
          if (isQuoteId) {
            setStep(6);
            setIsSubmitting(false);
            return;
          }
          
          if (order.status === 'pending_payment') {
            setStep(4);
            setIsSubmitting(false);
            if (isEmail) setFormData(prev => ({...prev, email: q}));
            else setFormData(prev => ({...prev, phone: q}));
            return;
          }
        }
        
        if (isQuoteId) {
          setAuthError('Invalid Quote ID or Order not found.');
          setIsSubmitting(false);
          return;
        }
      }
      
      const q = searchQuery.trim();
      if (q.includes('@')) setFormData(prev => ({...prev, email: q}));
      else setFormData(prev => ({...prev, phone: q}));
      
      setStep(2);
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextToDetails = () => {
    if (selectedEvents.length === 0 && selectedServices.length === 0 && selectedAddons.length === 0) {
      alert("Please select at least one item to proceed.");
      return;
    }
    setStep(3);
  };

  const handleCreateOrder = async () => {
    if (!formData.name || !formData.date) {
      alert("Please fill in your name and event date.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      
      const packageString = `Custom Plan: ${[...selectedEvents.map(id => EVENTS.find(e => e.id === id)?.name), ...selectedServices.map(id => SERVICES.find(e => e.id === id)?.name), ...selectedAddons.map(id => ADDONS.find(e => e.id === id)?.name)].filter(Boolean).join(', ')}`;
      
      const { data, error } = await supabase.from('orders').insert([{
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        location: formData.location,
        package: packageString,
        total_amount: calculateTotal,
        status: 'pending_payment',
        amountPaid: '0'
      }]).select().single();
      
      if (error) throw error;
      if (data) {
        setOrderId(data.id);
        
        // Notify Admin of new order (non-blocking)
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'admin_new_order', order: data })
        }).catch(e => console.error("Notification failed", e));
        
        setStep(4);
      }
    } catch (err: any) {
      alert("Failed to create order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!supabase || !orderId) return;
      
      let screenshotUrl = null;
      if (paymentFile) {
        const fileExt = paymentFile.name.split('.').pop();
        const fileName = `${orderId}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, paymentFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(fileName);
          
        screenshotUrl = publicUrl;
      }
      
      const updatePayload: any = { status: 'pending', amountPaid: '5000' };
      if (screenshotUrl) {
        updatePayload.payment_screenshot_url = screenshotUrl;
      }

      const { data: updatedOrder, error } = await supabase.from('orders').update(updatePayload).eq('id', orderId).select().single();
      if (error) throw error;
      
      // Notify Customer of confirmed quote (non-blocking)
      if (updatedOrder) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'customer_confirmed', order: updatedOrder })
        }).catch(e => console.error("Notification failed", e));
      }
      
      setStep(5);
    } catch (err: any) {
      alert("Error confirming payment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#ffffff] text-[#1a1a1a] selection:bg-[#003366] selection:text-white">
      <Header forceSolid={true} />
      
      {/* Luxury Hero Banner */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center text-center px-6 pt-24">
        {/* Background Image - Lighter for Light Theme */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://res.cloudinary.com/ujwz0e7r/image/upload/q_auto,f_auto/DSC00362.JPG"
            alt="Wedding Cover"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#ffffff]/80 to-[#ffffff]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto mt-20">
          <div className="flex items-center justify-center gap-2 text-[#003366] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-serif font-bold uppercase tracking-[0.35em]">Bespoke Creation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-normal font-serif leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-[#1a1a1a]">
            Build Your <span className="italic font-light text-[#003366]">Masterpiece</span>
          </h1>
          <div className="w-12 h-[2px] bg-[#003366]/20 mx-auto mb-6" />
          <p className="text-slate-500 text-sm tracking-wide md:text-base animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 leading-relaxed">
            Curate your perfect wedding package. Select your events, choose the coverage you desire, and instantly see your custom investment estimate. 
          </p>
        </div>
      </section>

      <section className={`max-w-[1440px] mx-auto w-full px-6 pb-40 flex flex-col ${step === 1 || step === 6 ? 'items-center justify-center' : 'lg:flex-row items-start'} gap-12 lg:gap-16 relative z-10 -mt-10`}>
        
        {/* Left Column: The Builder (Interactive Form) */}
        <div className={`w-full flex flex-col gap-24 ${step === 1 ? 'max-w-3xl mx-auto' : step === 6 ? 'max-w-6xl mx-auto' : 'flex-1'}`}>
          
          {fetchError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-4 rounded-xl text-sm font-medium">
              {fetchError}
            </div>
          )}
          
          {step === 1 ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-4 max-w-2xl w-full mx-auto mt-4">
              <div className="mb-10 border-b border-slate-100 pb-8 text-center flex flex-col items-center">
                <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase bg-[#003366]/5 px-3 py-1.5 rounded-full mb-5">Step 01</span>
                <h2 className="text-4xl font-serif text-[#1a1a1a] mb-3">Let's Get Started</h2>
                <p className="text-sm text-slate-500 max-w-md">Enter your email, phone, or a specific Quote ID to track an existing order.</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Email, Phone, or Quote ID (e.g. 989D4715)" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleStartPlanning()} 
                      className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white pl-11 pr-4 py-4 rounded-xl text-sm outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all" 
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartPlanning}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-sans font-bold tracking-[0.15em] uppercase text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[#003366] text-white hover:bg-[#002244] shadow-[0_10px_20px_rgba(0,51,102,0.15)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Searching...' : 'Continue'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>

                {authError && <p className="text-red-500 text-[11px] font-medium pl-1 text-center">{authError}</p>}
              </div>
            </div>
          ) : step === 2 ? (
            <>
          
          {/* Section 1: Events */}
          <div className="animate-in fade-in duration-1000 delay-300">
            <div className="flex flex-col gap-2 mb-10 border-b border-slate-200/50 pb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase">Step 01</span>
              <h2 className="text-3xl font-serif text-[#1a1a1a]">Curate Your Events</h2>
              <p className="text-xs text-slate-500">Select the ceremonies that require our presence.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {EVENTS.map(event => {
                const isSelected = selectedEvents.includes(event.id);
                return (
                  <button 
                    key={event.id}
                    onClick={() => toggleSelection(event.id, selectedEvents, setSelectedEvents)}
                    className={`group relative p-6 rounded-2xl text-left transition-all duration-500 border hover:scale-[1.02] overflow-hidden ${
                      isSelected 
                      ? 'bg-white border-amber-500/30 shadow-[0_15px_40px_rgba(0,51,102,0.08)]' 
                      : 'bg-[#F0F7FD]/50 border-slate-200/60 hover:bg-white hover:border-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-serif text-xl transition-colors ${isSelected ? 'text-[#003366]' : 'text-[#1a1a1a]'}`}>
                        {event.name}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-white scale-110' : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{event.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 2: Services */}
          <div className="animate-in fade-in duration-1000 delay-400">
            <div className="flex flex-col gap-2 mb-10 border-b border-slate-200/50 pb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase">Step 02</span>
              <h2 className="text-3xl font-serif text-[#1a1a1a]">Determine Coverage</h2>
              <p className="text-xs text-slate-500">Choose the artistic mediums to capture your {selectedEvents.length} events.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SERVICES.map(service => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button 
                    key={service.id}
                    onClick={() => toggleSelection(service.id, selectedServices, setSelectedServices)}
                    className={`group relative p-6 rounded-2xl text-left transition-all duration-500 border flex items-center gap-5 hover:scale-[1.02] overflow-hidden ${
                      isSelected 
                      ? 'bg-white border-amber-500/30 shadow-[0_15px_40px_rgba(0,51,102,0.08)]' 
                      : 'bg-[#F0F7FD]/50 border-slate-200/60 hover:bg-white hover:border-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-[#003366]/10 text-[#003366]' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                      <service.icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <span className={`block font-serif text-lg mb-1 transition-colors ${isSelected ? 'text-[#003366]' : 'text-[#1a1a1a]'}`}>
                        {service.name}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{service.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                      isSelected ? 'bg-amber-500 border-amber-500 text-white scale-110' : 'border-slate-300 group-hover:border-slate-400'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Add-ons */}
          <div className="animate-in fade-in duration-1000 delay-500">
            <div className="flex flex-col gap-2 mb-10 border-b border-slate-200/50 pb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase">Step 03</span>
              <h2 className="text-3xl font-serif text-[#1a1a1a]">Tangible Memories</h2>
              <p className="text-xs text-slate-500">Select premium deliverables and add-ons.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ADDONS.map(addon => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <button 
                    key={addon.id}
                    onClick={() => toggleSelection(addon.id, selectedAddons, setSelectedAddons)}
                    className={`group relative p-6 rounded-2xl text-left transition-all duration-500 border hover:scale-[1.02] overflow-hidden ${
                      isSelected 
                      ? 'bg-white border-amber-500/30 shadow-[0_15px_40px_rgba(0,51,102,0.08)]' 
                      : 'bg-[#F0F7FD]/50 border-slate-200/60 hover:bg-white hover:border-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-serif text-lg leading-tight pr-4 transition-colors ${isSelected ? 'text-[#003366]' : 'text-[#1a1a1a]'}`}>
                        {addon.name}
                      </span>
                      <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-white scale-110' : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{addon.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
          </>
          ) : step === 3 ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-right-8 max-w-2xl w-full mx-auto mt-4">
              <div className="mb-10 border-b border-slate-100 pb-8 relative">
                <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase bg-[#003366]/5 px-3 py-1.5 rounded-full inline-block mb-4">Step 02</span>
                <h2 className="text-4xl font-serif text-[#1a1a1a] mb-2">Your Details</h2>
                <p className="text-sm text-slate-500">Provide your information so we can generate and save your formal custom quote.</p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 rounded-full pointer-events-none" />
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" placeholder="rahul@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all text-slate-700" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all text-slate-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Event Date</label>
                  <CustomDatePicker 
                    value={formData.date} 
                    onChange={date => setFormData({...formData, date})} 
                    bookedDates={bookedDates} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Event Location / Venue</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="e.g. Taj Palace, Mumbai" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          ) : step === 4 ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-right-8 max-w-2xl w-full mx-auto mt-4">
              <div className="mb-10 border-b border-slate-100 pb-8 text-center flex flex-col items-center">
                <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase bg-[#003366]/5 px-3 py-1.5 rounded-full mb-5">Step 04</span>
                <h2 className="text-4xl font-serif text-[#1a1a1a] mb-3">
                  {resumedOrder ? `Welcome Back, ${resumedOrder.customer.split(' ')[0]}!` : "Secure Your Booking"}
                </h2>
                <p className="text-sm text-slate-500 max-w-md">
                  {resumedOrder 
                    ? "You're almost there! Complete your payment to officially block your dates." 
                    : "Your quote is securely saved. You can always resume it later using your email or phone number."}
                </p>
                <div className="mt-5 bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Quote ID</span>
                  <div className="w-px h-4 bg-slate-200" />
                  <strong className="text-[#003366] font-mono tracking-wider text-lg">{orderId?.split('-')[0].toUpperCase()}</strong>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200/60 p-6 rounded-2xl mb-8 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">Advance Payment Required</h3>
                  <p className="text-amber-700/80 text-sm leading-relaxed">To officially block your dates and confirm our team, an advance token amount of <strong className="font-bold">₹5,000</strong> is required. Please transfer via UPI/Bank and upload the screenshot below.</p>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#003366]/30 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-[#003366]/5 text-[#003366] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#003366]/10 transition-all duration-300">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#1a1a1a] mb-1">Upload Payment Screenshot</h3>
                <p className="text-xs text-slate-400 mb-6 font-medium tracking-wide">PNG, JPG or PDF up to 5MB</p>
                
                {/* Visual Fake Input for aesthetics */}
                <div className="relative overflow-hidden inline-block">
                  <button className="bg-white border shadow-sm px-6 py-2.5 rounded-full text-xs font-bold text-slate-700 pointer-events-none group-hover:border-[#003366]/30 group-hover:text-[#003366] transition-colors">
                    {paymentFile ? paymentFile.name : 'Browse Files'}
                  </button>
                  <input type="file" onChange={e => setPaymentFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
              </div>
            </div>
          ) : step === 5 ? (
            <div className="bg-white p-12 md:p-20 rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.03)] animate-in fade-in zoom-in-95 flex flex-col items-center text-center max-w-2xl w-full mx-auto mt-4">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                <FileCheck2 className="w-10 h-10 relative z-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-4">Payment Submitted!</h2>
              <div className="w-12 h-1 bg-emerald-500/20 rounded-full mb-6" />
              <p className="text-base text-slate-500 mb-8 max-w-md leading-relaxed">
                Thank you! Your tracking ID is <strong className="text-[#003366] font-mono px-1">{orderId?.split('-')[0].toUpperCase()}</strong>. We have received your payment submission. Our team will verify the details and contact you shortly to finalize the contract.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 hover:text-[#1a1a1a] transition-all"
              >
                Create Another Quote
              </button>
            </div>
          ) : step === 6 ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-4 w-full mx-auto mt-4">
              <div className="mb-10 border-b border-slate-100 pb-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#003366]/5 text-[#003366] rounded-2xl flex items-center justify-center mb-5">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-serif text-[#1a1a1a] mb-3">Order Dashboard</h2>
                <div className="mt-4 bg-slate-50 border border-slate-100 px-6 py-2.5 rounded-2xl flex items-center gap-3">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Quote ID</span>
                  <div className="w-px h-4 bg-slate-200" />
                  <strong className="text-[#003366] font-mono tracking-wider text-lg">{resumedOrder?.quote_id || resumedOrder?.id?.split('-')[0].toUpperCase()}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Status & Client Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Status Card */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Current Status</h3>
                    <div className="flex items-start gap-4">
                      {resumedOrder?.status === 'pending_payment' ? (
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Clock className="w-5 h-5" /></div>
                      ) : resumedOrder?.status === 'pending' ? (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Search className="w-5 h-5" /></div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check className="w-5 h-5" /></div>
                      )}
                      <div>
                        <div className="font-bold text-slate-800 text-sm">
                          {resumedOrder?.status === 'pending_payment' ? 'Awaiting Payment' : 
                           resumedOrder?.status === 'pending' ? 'Verifying Payment' : 'Booked!'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {resumedOrder?.status === 'pending_payment' ? 'Complete your token advance to lock dates.' : 
                           resumedOrder?.status === 'pending' ? 'Verifying uploaded screenshot.' : 'Your dates are locked.'}
                        </div>
                      </div>
                    </div>
                    {resumedOrder?.status === 'pending_payment' && (
                      <button onClick={() => setStep(4)} className="w-full mt-5 bg-[#003366] text-white px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#002244] transition-colors shadow-sm">
                        Pay Advance Now
                      </button>
                    )}
                  </div>

                  {/* Client Details */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 pb-3 border-b border-slate-100">Client Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{resumedOrder?.customer || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{resumedOrder?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{resumedOrder?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Financials & Package */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Financials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Amount</div>
                      <div className="text-2xl font-serif text-slate-800">₹{Number(resumedOrder?.total_amount || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount Paid</div>
                      <div className="text-2xl font-serif text-emerald-600">₹{Number(resumedOrder?.amountPaid || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] bg-amber-50/30">
                      <div className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-2">Balance Due</div>
                      <div className="text-2xl font-serif text-amber-600">₹{(Number(resumedOrder?.total_amount || 0) - Number(resumedOrder?.amountPaid || 0)).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Event & Location Info */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex-1 flex gap-4 items-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 pr-0 sm:pr-4">
                      <div className="w-10 h-10 rounded-full bg-[#003366]/5 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-[#003366]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Event Date</div>
                        <div className="text-sm font-medium text-slate-800">{resumedOrder?.date ? new Date(resumedOrder.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#003366]/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#003366]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</div>
                        <div className="text-sm font-medium text-slate-800 truncate">{resumedOrder?.location || 'Not Specified'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Package breakdown */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 pb-3 border-b border-slate-100">Package Blueprint</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {resumedOrder?.package?.replace('Custom Plan: ', '').split(', ').filter(Boolean).map((item: string, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

        </div>

        {/* Right Column: Sticky Summary Panel */}
        {step >= 2 && step <= 5 && (
          <div className="w-full lg:w-[400px] shrink-0 sticky top-24 animate-in fade-in duration-1000 delay-700 z-20">
          <div className="bg-white text-[#1a1a1a] rounded-2xl border border-slate-200 shadow-[0_20px_45px_rgba(0,51,102,0.08)] p-6 relative overflow-hidden">
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Your Blueprint</h3>
            </div>
            
            <div className="space-y-4 mb-5 min-h-[100px]">
              {resumedOrder ? (
                <div className="flex flex-col gap-3 animate-in fade-in">
                  <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase block">Saved Package</span>
                  <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-medium shadow-sm">
                    {resumedOrder.package}
                  </div>
                </div>
              ) : selectedEvents.length === 0 && selectedServices.length === 0 && selectedAddons.length === 0 ? (
                <div className="h-[100px] flex flex-col items-center justify-center text-center opacity-40">
                  <span className="text-xs uppercase tracking-widest mb-2 font-bold text-[#003366]">Empty Canvas</span>
                  <p className="text-[10px] max-w-[200px] text-slate-500">Select options on the left to build your customized investment plan.</p>
                </div>
              ) : (
                <>
                  {selectedEvents.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase mb-2 block">Events</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvents.map(id => (
                          <div key={id} className="text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            {EVENTS.find(e => e.id === id)?.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedServices.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase mb-2 block">Coverage</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map(id => (
                          <div key={id} className="text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            {SERVICES.find(e => e.id === id)?.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAddons.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase mb-2 block">Add-ons</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedAddons.map(id => (
                          <div key={id} className="text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            {ADDONS.find(e => e.id === id)?.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 mb-5">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Discount Code" 
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      if (discountStatus !== 'idle') {
                        setDiscountStatus('idle');
                        setDiscountMessage('');
                      }
                    }}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#003366] uppercase font-mono"
                  />
                  <button 
                    onClick={handleApplyDiscount}
                    disabled={discountStatus === 'loading' || !discountCode}
                    className="bg-[#003366] text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    {discountStatus === 'loading' ? '...' : 'Apply'}
                  </button>
                </div>
                {discountMessage && (
                  <p className={`text-[10px] mt-1.5 font-bold ${discountStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {discountMessage}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estimated Total</span>
                <span className="text-4xl font-serif text-[#1a1a1a] font-normal flex items-center gap-3">
                  ₹{resumedOrder && resumedOrder.total_amount ? Number(resumedOrder.total_amount).toLocaleString('en-IN') : calculateTotal.toLocaleString('en-IN')}
                  {!resumedOrder && appliedDiscount && (
                    <span className="text-sm line-through text-slate-400">
                      ₹{(() => {
                        // Recalculate without discount just for the original price display
                        let rawTotal = 0;
                        const numEvents = selectedEvents.length;
                        selectedEvents.forEach(id => { rawTotal += EVENTS.find(e => e.id === id)?.price || 0; });
                        selectedServices.forEach(id => { const s = SERVICES.find(x => x.id === id); if(s) rawTotal += s.price * (numEvents > 0 ? numEvents : 1); });
                        selectedAddons.forEach(id => { rawTotal += ADDONS.find(a => a.id === id)?.price || 0; });
                        return rawTotal;
                      })().toLocaleString('en-IN')}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {step === 1 ? (
                <button
                  onClick={handleStartPlanning}
                  disabled={isSubmitting || (!formData.email && !formData.phone)}
                  className="w-full py-3.5 rounded-2xl font-serif text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[#003366] text-white hover:bg-[#002244] shadow-[0_10px_20px_rgba(0,51,102,0.2)] hover:shadow-[0_15px_25px_rgba(0,51,102,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <span>{isSubmitting ? 'Starting...' : 'Start Planning'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : step === 2 ? (
                <button
                  onClick={handleNextToDetails}
                  className="w-full py-3.5 rounded-2xl font-serif text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[#003366] text-white hover:bg-[#002244] shadow-[0_10px_20px_rgba(0,51,102,0.2)] hover:shadow-[0_15px_25px_rgba(0,51,102,0.3)] hover:-translate-y-0.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : step === 3 ? (
                <button
                  onClick={handleCreateOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl font-serif text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[#003366] text-white hover:bg-[#002244] shadow-[0_10px_20px_rgba(0,51,102,0.2)] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <span>{isSubmitting ? 'Saving Quote...' : 'Generate Quote & Save'}</span>
                </button>
              ) : step === 4 ? (
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isSubmitting || !paymentFile}
                  className="w-full py-3.5 rounded-2xl font-serif text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_10px_20px_rgba(5,150,105,0.2)] hover:shadow-[0_15px_25px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                  <span className="font-sans font-bold">{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</span>
                </button>
              ) : null}
              <div className="flex items-center justify-center gap-2 text-slate-400 font-mono text-[8px] uppercase tracking-widest text-center px-4 mt-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Estimate subject to date availability</span>
              </div>
            </div>
          </div>
        </div>
        )}

      </section>

      <ContactSection />
    </main>
  );
}
