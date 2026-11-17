"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Mail, Phone, Image as ImageIcon, CheckCircle, Search, ArrowRight, ShieldCheck, UploadCloud, LayoutDashboard, Clock } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';

export default function BookingPage() {
  const supabase = createClient();
  
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [resumedOrder, setResumedOrder] = useState<any>(null);
  const [authError, setAuthError] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [advanceRules, setAdvanceRules] = useState<any[]>([]);

  React.useEffect(() => {
    async function fetchRules() {
      try {
        const res = await fetch('/api/advance-rules');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAdvanceRules(data);
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchRules();
  }, []);

  const getAdvanceForPrice = (price: number) => {
    const activeRules = advanceRules.filter((r: any) => r.is_active !== false);
    if (activeRules.length === 0) {
      return price >= 100000 ? 10000 : 5000;
    }
    const sorted = [...activeRules].sort((a: any, b: any) => (Number(b.min_amount) || 0) - (Number(a.min_amount) || 0));
    for (const rule of sorted) {
      const min = Number(rule.min_amount) || 0;
      const max = rule.max_amount !== null && rule.max_amount !== undefined && rule.max_amount !== '' ? Number(rule.max_amount) : Infinity;
      if (price >= min && price <= max) {
        return Number(rule.advance_amount);
      }
    }
    const fallback = sorted.find((r: any) => price >= (Number(r.min_amount) || 0)) || sorted[sorted.length - 1];
    return Number(fallback?.advance_amount) || (price >= 100000 ? 10000 : 5000);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    package: 'Wedding' // Default package string to use if booking directly
  });
  
  React.useEffect(() => {
    async function fetchBookedDates() {
      if (!supabase) return;
      const { data, error } = await supabase.from('orders').select('date').eq('status', 'confirmed');
      if (!error && data) {
        setBookedDates(data.map(o => o.date).filter(Boolean));
      }
    }
    fetchBookedDates();
  }, [supabase]);
  
  // Calendar Logic
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStartBooking = async () => {
    if (!searchQuery.trim()) {
      setAuthError('Please enter your email, phone, or Quote ID.');
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
          } else if (order.status === 'verifying' || order.status === 'confirmed') {
            setStep(6);
            setIsSubmitting(false);
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
      
      setStep(2); // Proceed to date selection
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const packagePrice = formData.package.includes("Masterpiece") || formData.package.includes("1,75,000")
        ? 175000
        : formData.package.includes("Intimate") || formData.package.includes("85,000")
        ? 85000
        : 55000;

      const { data, error } = await supabase.from('orders').insert([{
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        package: formData.package,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        total_amount: packagePrice,
        status: 'pending_payment',
        amountPaid: '0'
      }]).select().single();
      
      if (error) throw error;
      if (data) {
        setOrderId(data.id);
        
        // Notify Admin
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'admin_new_order', order: data })
        }).catch(e => console.error("Notification failed", e));
        
        setStep(4);
      }
    } catch (err: any) {
      alert("Failed to submit booking: " + err.message);
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
      
      const currentPkg = resumedOrder?.package || formData.package;
      const currentPkgPrice = currentPkg.includes("Masterpiece") || currentPkg.includes("1,75,000")
        ? 175000
        : currentPkg.includes("Intimate") || currentPkg.includes("85,000")
        ? 85000
        : 55000;
      const advanceRequired = getAdvanceForPrice(currentPkgPrice);
      const updatePayload: any = { status: 'pending', amountPaid: String(advanceRequired) };
      if (screenshotUrl) {
        updatePayload.payment_screenshot_url = screenshotUrl;
      }

      const { data: updatedOrder, error } = await supabase.from('orders').update(updatePayload).eq('id', orderId).select().single();
      if (error) throw error;
      
      // Notify Customer
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
    <div className="min-h-screen bg-[#f3f4f6] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-serif text-[#003366] mb-4">Book Your Session</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Select a date and provide your details to secure your booking with Vrundavan Studio.</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* STEP 1: RESUME/SEARCH */}
          {step === 1 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col max-w-2xl mx-auto w-full justify-center min-h-[400px]">
              <div className="mb-10 text-center flex flex-col items-center">
                <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase bg-[#003366]/5 px-3 py-1.5 rounded-full mb-5">Step 01</span>
                <h2 className="text-4xl font-serif text-[#1a1a1a] mb-3">Let's Get Started</h2>
                <p className="text-sm text-slate-500">Enter your email, phone, or Quote ID to track an existing order or start a new one.</p>
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
                      onKeyDown={e => e.key === 'Enter' && handleStartBooking()} 
                      className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white pl-11 pr-4 py-4 rounded-xl text-sm outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all" 
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartBooking}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-sans font-bold tracking-[0.15em] uppercase text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[#003366] text-white hover:bg-[#002244] shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Searching...' : 'Continue'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>

                {authError && <p className="text-red-500 text-[11px] font-medium text-center">{authError}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: CALENDAR */}
          {step === 2 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
              <div className="mb-8 border-b border-slate-100 pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif text-[#003366] mb-2">2. Select a Date</h2>
                  <p className="text-gray-500 text-sm">Dates marked with a red line are fully booked.</p>
                </div>
                <button onClick={() => setStep(1)} className="text-sm font-semibold text-slate-400 hover:text-[#003366] transition-colors flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              </div>

              <div className="border border-gray-100 rounded-2xl p-6 mb-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{monthNames[month]} {year}</h3>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 border border-gray-200 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 border border-gray-200 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400 tracking-wider uppercase">
                  {dayNames.map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-14"></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
                    const isPast = new Date(year, month, day) < new Date(new Date().setHours(0,0,0,0));
                    
                    const currentDateStr = [
                      year,
                      String(month + 1).padStart(2, '0'),
                      String(day).padStart(2, '0')
                    ].join('-');
                    const isFullyBooked = bookedDates.includes(currentDateStr);
                    const isDisabled = isPast || isFullyBooked;

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(new Date(year, month, day))}
                        className={`h-14 rounded-xl flex items-center justify-center font-medium transition-all text-sm
                          ${isDisabled && !isFullyBooked ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : ''}
                          ${isFullyBooked ? 'line-through decoration-red-400 decoration-2 text-gray-400 bg-gray-50 cursor-not-allowed' : ''}
                          ${isSelected && !isDisabled ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/30' : ''}
                          ${!isDisabled && !isSelected ? 'text-gray-700 bg-white border border-gray-100 hover:border-[#003366]/40 hover:bg-[#003366]/5' : ''}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto flex justify-end">
                <button 
                  onClick={() => setStep(3)}
                  disabled={!selectedDate}
                  className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                    selectedDate ? 'bg-[#003366] hover:bg-[#002244] text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
              <div className="mb-8 border-b border-slate-100 pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif text-[#003366] mb-2">3. Your Details</h2>
                  <p className="text-gray-500 text-sm">Tell us about yourself and the event.</p>
                </div>
                <button onClick={() => setStep(2)} className="text-sm font-semibold text-slate-400 hover:text-[#003366] transition-colors flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              </div>

              <div className="space-y-5 flex-1 max-w-2xl w-full mx-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Package</label>
                  <select name="package" value={formData.package} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all appearance-none cursor-pointer">
                    <option value="Pre-Wedding Poetics">Pre-Wedding Poetics (₹55,000)</option>
                    <option value="The Masterpiece">The Masterpiece (₹1,75,000)</option>
                    <option value="Intimate Elegance">Intimate Elegance (₹85,000)</option>
                    <option value="Corporate Event">Corporate Event (Custom)</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleCreateOrder}
                  disabled={!formData.name || !formData.email || !formData.phone || isSubmitting}
                  className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                    formData.name && formData.email && formData.phone ? 'bg-[#003366] hover:bg-[#002244] text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Proceed to Payment'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT SCREENSHOT */}
          {step === 4 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col text-center">
              <div className="mb-10 pb-8 relative flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono tracking-widest text-[#003366] font-bold uppercase bg-[#003366]/5 px-3 py-1.5 rounded-full inline-block mb-4">Step 04</span>
                <h2 className="text-3xl font-serif text-[#003366] mb-2">
                  {resumedOrder ? `Welcome Back, ${resumedOrder.customer.split(' ')[0]}!` : "Secure Your Booking"}
                </h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {resumedOrder 
                    ? "You're almost there! Complete your payment to officially block your dates." 
                    : "Your order is securely saved. You can always resume it later using your email or phone number."}
                </p>
                <div className="mt-5 bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Quote ID</span>
                  <div className="w-px h-4 bg-slate-200" />
                  <strong className="text-[#003366] font-mono tracking-wider text-lg">{orderId?.split('-')[0].toUpperCase()}</strong>
                </div>
              </div>

              <div className="max-w-md mx-auto w-full">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200/60 p-6 rounded-2xl mb-8 flex items-start gap-4 text-left">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 mb-1">Advance Payment Required</h3>
                    <p className="text-amber-700/80 text-sm leading-relaxed">
                      To officially block your dates and confirm our team, an advance token amount of{" "}
                      <strong className="font-bold">
                        ₹{getAdvanceForPrice((formData.package.includes("Masterpiece") || formData.package.includes("1,75,000")) ? 175000 : (formData.package.includes("Intimate") || formData.package.includes("85,000")) ? 85000 : 55000).toLocaleString("en-IN")}
                      </strong>{" "}
                      is required. Please transfer via UPI/Bank and upload the screenshot below.
                    </p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#003366]/30 transition-all cursor-pointer group mb-8">
                  <div className="w-16 h-16 bg-[#003366]/5 text-[#003366] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#003366]/10 transition-all duration-300">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-1">Upload Payment Screenshot</h3>
                  <p className="text-xs text-slate-400 mb-6 font-medium tracking-wide">PNG, JPG or PDF up to 5MB</p>
                  
                  <div className="relative overflow-hidden inline-block">
                    <button className="bg-white border shadow-sm px-6 py-2.5 rounded-full text-xs font-bold text-slate-700 pointer-events-none group-hover:border-[#003366]/30 group-hover:text-[#003366] transition-colors">
                      {paymentFile ? paymentFile.name : 'Browse Files'}
                    </button>
                    <input type="file" onChange={e => setPaymentFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 flex justify-center">
                <button 
                  onClick={handlePaymentSubmit}
                  disabled={isSubmitting || !paymentFile}
                  className="px-8 py-4 rounded-full font-bold transition-all bg-[#003366] hover:bg-[#002244] text-white shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                  {!isSubmitting && <CheckCircle className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          
          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <div className="p-12 md:p-20 animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                <CheckCircle className="w-10 h-10 relative z-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-4">Payment Submitted!</h2>
              <div className="w-12 h-1 bg-emerald-500/20 rounded-full mb-6" />
              <p className="text-base text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                Thank you! Your tracking ID is <strong className="text-[#003366] font-mono px-1">{orderId?.split('-')[0].toUpperCase()}</strong>. We have received your payment submission. Our team will verify the details and confirm your event shortly.
              </p>
              <Link
                href="/"
                className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 hover:text-[#1a1a1a] transition-all"
              >
                Return to Home
              </Link>
            </div>
          )}

          {/* STEP 6: DASHBOARD */}
          {step === 6 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 w-full flex-1 flex flex-col justify-center max-w-3xl mx-auto">
              <div className="mb-10 pb-8 flex flex-col items-center text-center">
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

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  {resumedOrder?.status === 'pending_payment' ? (
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Clock className="w-6 h-6" /></div>
                  ) : resumedOrder?.status === 'pending' || resumedOrder?.status === 'verifying' ? (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Search className="w-6 h-6" /></div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle className="w-6 h-6" /></div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      {resumedOrder?.status === 'pending_payment' ? 'Awaiting Payment' : 
                       resumedOrder?.status === 'pending' || resumedOrder?.status === 'verifying' ? 'Verifying Payment' : 'Booking Confirmed!'}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {resumedOrder?.status === 'pending_payment' ? 'Complete your token advance to lock dates.' : 
                       resumedOrder?.status === 'pending' || resumedOrder?.status === 'verifying' ? 'We are verifying your uploaded payment screenshot. You will receive an email once confirmed.' : 'Your dates are fully locked and our team is ready!'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-6">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</span>
                    <span className="font-medium text-slate-700">{resumedOrder?.customer || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Package</span>
                    <span className="font-medium text-slate-700">{resumedOrder?.package || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Event Date</span>
                    <span className="font-medium text-slate-700">{resumedOrder?.date ? new Date(resumedOrder.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amount Paid</span>
                    <span className="font-medium text-emerald-600 text-lg">₹{Number(resumedOrder?.amountPaid || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Link
                  href="/"
                  className="bg-white border border-slate-200 text-slate-600 px-8 py-3 rounded-full text-sm font-bold hover:bg-slate-50 hover:text-[#1a1a1a] transition-all shadow-sm"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
