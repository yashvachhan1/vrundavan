"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Mail, Phone, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    package: 'wedding'
  });

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

  // Handle Form Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-serif text-[#003366] mb-4">Book Your Session</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Select a date and provide your details to secure your booking with Vrundavan Studio.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center items-center mb-12 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[#003366] -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          <div className="flex justify-between w-full">
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md
                  ${step >= num ? 'bg-[#003366] text-white border-2 border-[#003366]' : 'bg-white text-gray-400 border-2 border-gray-200'}
                `}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* STEP 1: CALENDAR */}
          {step === 1 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
              <div className="mb-8">
                <h2 className="text-2xl font-serif text-[#003366] mb-2">1. Select a Date</h2>
                <p className="text-gray-500 text-sm">Dates marked in gray are fully booked.</p>
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
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
                    const isPast = new Date(year, month, day) < new Date(new Date().setHours(0,0,0,0));
                    // Mocking fully booked dates randomly for UI purposes
                    const isFullyBooked = !isPast && (day === 12 || day === 15 || day === 28);
                    const isDisabled = isPast || isFullyBooked;

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(new Date(year, month, day))}
                        className={`h-14 rounded-xl flex items-center justify-center font-medium transition-all text-sm
                          ${isDisabled ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 
                            isSelected ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/30' : 
                            'text-gray-700 bg-white border border-gray-100 hover:border-[#003366]/40 hover:bg-[#003366]/5'
                          }
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
                  onClick={() => setStep(2)}
                  disabled={!selectedDate}
                  className={`px-8 py-3 rounded-full font-medium transition-all ${
                    selectedDate ? 'bg-[#003366] hover:bg-[#002244] text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
              <div className="mb-8">
                <h2 className="text-2xl font-serif text-[#003366] mb-2">2. Your Details</h2>
                <p className="text-gray-500 text-sm">Tell us about yourself and the event.</p>
              </div>

              <div className="space-y-5 flex-1 max-w-2xl w-full">
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
                    <option value="wedding">Complete Wedding Package (2 Days)</option>
                    <option value="prewedding">Pre-Wedding Shoot</option>
                    <option value="maternity">Maternity Shoot</option>
                    <option value="corporate">Corporate Event</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 hover:text-gray-900 font-medium transition-colors">Back</button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!formData.name || !formData.email || !formData.phone}
                  className={`px-8 py-3 rounded-full font-medium transition-all ${
                    formData.name && formData.email && formData.phone ? 'bg-[#003366] hover:bg-[#002244] text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT SCREENSHOT */}
          {step === 3 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col text-center">
              <div className="mb-8">
                <h2 className="text-2xl font-serif text-[#003366] mb-2">3. Confirm Booking</h2>
                <p className="text-gray-500 text-sm">Pay the advance booking amount to secure your date.</p>
              </div>

              <div className="max-w-md mx-auto w-full">
                <div className="bg-[#003366]/5 border border-[#003366]/20 rounded-2xl p-6 mb-8">
                  <p className="text-sm text-[#003366] font-medium uppercase tracking-wider mb-2">Booking Amount</p>
                  <p className="text-4xl font-serif text-[#003366]">₹5,000</p>
                  <p className="text-xs text-gray-500 mt-3">Please pay via UPI to: vrundavan@upi</p>
                </div>

                <label className="block w-full border-2 border-dashed border-gray-300 rounded-2xl p-10 hover:bg-gray-50 hover:border-[#003366]/50 transition-all cursor-pointer group">
                  <input type="file" className="hidden" accept="image/*" />
                  <div className="w-16 h-16 rounded-full bg-[#003366]/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-[#003366]" />
                  </div>
                  <p className="font-semibold text-gray-900">Upload Payment Screenshot</p>
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                </label>
              </div>

              <div className="mt-auto pt-12 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-500 hover:text-gray-900 font-medium transition-colors">Back</button>
                <button 
                  className="px-8 py-3 rounded-full font-medium transition-all bg-[#003366] hover:bg-[#002244] text-white shadow-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Submit Booking Request
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
