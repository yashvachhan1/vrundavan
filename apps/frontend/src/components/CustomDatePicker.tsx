"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  bookedDates: string[]; // YYYY-MM-DD
  placeholder?: string;
  dark?: boolean;
  className?: string;
}

export function CustomDatePicker({
  value,
  onChange,
  bookedDates,
  placeholder = "Select Event Date",
  dark = false,
  className = ""
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupCoords, setPopupCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = Math.min(320, window.innerWidth - 24);
    const popupHeight = 350;

    // Check if there is enough space below
    const spaceBelow = window.innerHeight - rect.bottom;
    let top = rect.bottom + 8;
    if (spaceBelow < popupHeight && rect.top > popupHeight) {
      // Place above trigger
      top = rect.top - popupHeight - 8;
    }

    // Align right to trigger, but keep within viewport edges
    let left = rect.right - popupWidth;
    if (left < 12) left = 12;
    if (left + popupWidth > window.innerWidth - 12) {
      left = window.innerWidth - popupWidth - 12;
    }

    setPopupCoords({ top, left, width: popupWidth });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current && triggerRef.current.contains(target)
      ) {
        return;
      }
      if (
        popupRef.current && popupRef.current.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    function handleScrollOrResize() {
      calculatePosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateBooked = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    return bookedDates.includes(dateStr);
  };

  const isDateInPast = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    return d < today;
  };

  const handleDateSelect = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    
    onChange(dateStr);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-all cursor-pointer flex items-center justify-between border text-left ${
          dark
            ? 'bg-white/5 border-white/10 hover:border-amber-400/50 text-white hover:bg-white/10'
            : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-700'
        }`}
      >
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <CalendarIcon className={`w-4 h-4 ${dark ? 'text-amber-400' : 'text-slate-400'}`} />
        </div>
        <span className={value ? (dark ? "text-white font-medium" : "text-slate-800 font-medium") : (dark ? "text-slate-400" : "text-slate-400")}>
          {value ? getDisplayValue() : placeholder}
        </span>
      </button>

      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          ref={popupRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: popupCoords ? `${popupCoords.top}px` : '50%',
            left: popupCoords ? `${popupCoords.left}px` : '50%',
            width: popupCoords ? `${popupCoords.width}px` : '320px',
            zIndex: 999999,
          }}
          className={`rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 border ${
            dark
              ? 'bg-[#0b1329] border-white/20 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)] ring-1 ring-white/10'
              : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevMonth(); }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                dark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className={`font-bold text-sm select-none ${dark ? 'text-white' : 'text-slate-800'}`}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextMonth(); }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                dark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => (
              <div 
                key={day} 
                className={`text-center text-[10px] font-bold uppercase tracking-wider py-1 ${
                  dark ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 w-full" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const booked = isDateBooked(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const past = isDateInPast(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const disabled = booked || past;
              
              const currentDateStr = [
                currentMonth.getFullYear(),
                String(currentMonth.getMonth() + 1).padStart(2, '0'),
                String(day).padStart(2, '0')
              ].join('-');
              const isSelected = value === currentDateStr;

              let btnStyle = "";
              if (disabled) {
                btnStyle = dark 
                  ? 'text-slate-600 cursor-not-allowed opacity-40' 
                  : 'text-slate-300 cursor-not-allowed opacity-50';
              } else if (isSelected) {
                btnStyle = dark
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/30'
                  : 'bg-[#003366] text-white font-bold shadow-md shadow-[#003366]/20';
              } else {
                btnStyle = dark
                  ? 'text-slate-200 hover:bg-white/10'
                  : 'text-slate-700 hover:bg-[#003366]/5';
              }

              return (
                <button
                  type="button"
                  key={day}
                  disabled={disabled}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    handleDateSelect(day); 
                  }}
                  className={`
                    h-9 w-full rounded-lg text-xs flex items-center justify-center transition-all relative cursor-pointer
                    ${btnStyle}
                    ${booked ? 'line-through decoration-red-400 decoration-2 text-slate-400' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          <div className={`mt-3 pt-3 border-t flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider ${
            dark ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${dark ? 'bg-amber-400' : 'bg-[#003366]'}`}></div> 
              Selected
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm flex items-center justify-center ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div className="w-full h-px bg-red-400 rotate-45"></div>
              </div> 
              Booked
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
