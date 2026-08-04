"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { Header } from "@/components/Header";
import { ContactSection } from "@/components/ContactSection";
import { Camera, Video, MonitorPlay, Sparkles, Check, Phone, ShieldCheck } from 'lucide-react';

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

  const supabase = createClient();

  const [fetchError, setFetchError] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.from('custom_plan_items').select('*').eq('active', true).order('created_at', { ascending: true });
        if (error) throw error;
        
        if (data) {
          setEvents(data.filter(item => item.type === 'event').map(i => ({...i, desc: i.description})));
          setServices(data.filter(item => item.type === 'service').map(i => ({...i, desc: i.description, icon: i.icon === 'video' ? Video : Camera})));
          setAddons(data.filter(item => item.type === 'addon').map(i => ({...i, desc: i.description})));
        }
      } catch (err: any) {
        setFetchError("Failed to load plan builder items. Please try again later.");
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleApplyDiscount = async () => {
    if (!discountCode) return;
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

  return (
    <main className="relative min-h-screen bg-[#ffffff] text-[#1a1a1a] selection:bg-[#003366] selection:text-white">
      <Header forceSolid={true} />
      
      {/* Luxury Hero Banner */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center text-center px-6">
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

      <section className="max-w-[1440px] mx-auto w-full px-6 pb-40 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start relative z-10 -mt-10">
        
        {/* Left Column: The Builder (Interactive Form) */}
        <div className="flex-1 w-full flex flex-col gap-24">
          
          {fetchError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-4 rounded-xl text-sm font-medium">
              {fetchError}
            </div>
          )}
          
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

        </div>

        {/* Right Column: Sticky Summary Panel */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-24 animate-in fade-in duration-1000 delay-700 z-20">
          <div className="bg-white text-[#1a1a1a] rounded-2xl border border-slate-200 shadow-[0_20px_45px_rgba(0,51,102,0.08)] p-6 relative overflow-hidden">
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Your Blueprint</h3>
            </div>
            
            <div className="space-y-4 mb-5 min-h-[100px]">
              {selectedEvents.length === 0 && selectedServices.length === 0 && selectedAddons.length === 0 ? (
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
                  ₹{calculateTotal.toLocaleString('en-IN')}
                  {appliedDiscount && (
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
              <a
                href="#contact"
                className="w-full py-3 rounded-full font-serif text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[#003366] text-white hover:bg-[#002244] shadow-[0_10px_20px_rgba(0,51,102,0.2)] hover:shadow-[0_15px_25px_rgba(0,51,102,0.3)] hover:scale-[1.03]"
              >
                <Phone className="w-4 h-4" />
                <span>Request Formal Quote</span>
              </a>
              <div className="flex items-center justify-center gap-2 text-slate-400 font-mono text-[8px] uppercase tracking-widest text-center px-4">
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Estimate subject to date availability</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      <ContactSection />
    </main>
  );
}
