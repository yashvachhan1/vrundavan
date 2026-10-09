import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  bookedDates: string[]; // YYYY-MM-DD
}

export function CustomDatePicker({ value, onChange, bookedDates }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all text-slate-700 cursor-pointer flex items-center justify-between"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value ? getDisplayValue() : "Select Event Date"}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full sm:w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={(e) => { e.preventDefault(); prevMonth(); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-800">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={(e) => { e.preventDefault(); nextMonth(); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 w-full" />
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

              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={(e) => { e.preventDefault(); handleDateSelect(day); }}
                  className={`
                    h-10 w-full rounded-lg text-sm flex items-center justify-center transition-all relative
                    ${disabled ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-[#003366]/5'}
                    ${isSelected && !disabled ? 'bg-[#003366] text-white font-bold shadow-md shadow-[#003366]/20' : ''}
                    ${booked ? 'line-through decoration-red-400 decoration-2 text-slate-400' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#003366] rounded-sm"></div> Selected</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-200 rounded-sm flex items-center justify-center"><div className="w-full h-px bg-red-400 rotate-45"></div></div> Booked</div>
          </div>
          
        </div>
      )}
    </div>
  );
}
