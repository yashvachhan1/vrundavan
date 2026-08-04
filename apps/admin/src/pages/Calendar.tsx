import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Settings, X, Save } from 'lucide-react';

// Mock data generator for bookings
const generateMockBookings = (year: number, month: number, globalCapacity: number = 5) => {
  const bookings: Record<string, any> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    // Dynamic capacity: Uses global default for mock logic
    const capacity = globalCapacity;
    const count = Math.floor(Math.random() * (capacity + 1));
    
    if (Math.random() > 0.3) { // 70% chance a day has some data
      bookings[`${year}-${month}-${i}`] = {
        capacity: capacity,
        booked: count,
        details: Array.from({ length: count }).map((_, idx) => ({
          id: `${i}-${idx}`,
          name: `Client ${Math.floor(Math.random() * 1000)}`,
          type: ['Wedding', 'Pre-Wedding', 'Maternity', 'Event'][Math.floor(Math.random() * 4)],
          time: ['10:00 AM', '12:30 PM', '03:00 PM', '05:30 PM'][Math.floor(Math.random() * 4)]
        }))
      };
    } else {
      // Empty day, uses global default capacity
      bookings[`${year}-${month}-${i}`] = { capacity: globalCapacity, booked: 0, details: [] };
      bookings[`${year}-${month}-${i}`] = { capacity: capacity, booked: 0, details: [] };
    }
  }
  return bookings;
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Bulk Settings State
  const [isBulkSettingsOpen, setIsBulkSettingsOpen] = useState(false);
  const [globalCapacity, setGlobalCapacity] = useState(5);
  const [tempGlobalCapacity, setTempGlobalCapacity] = useState(5);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Use state for mock data so it updates when month changes
  const [mockData, setMockData] = useState(() => generateMockBookings(year, month, globalCapacity));
  
  useEffect(() => {
    setMockData(generateMockBookings(year, month, globalCapacity));
  }, [year, month, globalCapacity]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const getDayData = (day: number) => {
    // Default fallback if mock generation missed something
    return mockData[`${year}-${month}-${day}`] || { capacity: 5, booked: 0, details: [] };
  };

  const selectedDayData = selectedDate && selectedDate.getMonth() === month && selectedDate.getFullYear() === year 
    ? getDayData(selectedDate.getDate()) 
    : null;

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Calendar Grid Section */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{monthNames[month]} {year}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your studio availability</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setTempGlobalCapacity(globalCapacity);
                setIsBulkSettingsOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#003366]/5 rounded-xl transition-colors border border-[#003366]/20 text-[#003366] font-semibold shadow-sm mr-2"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Bulk Settings</span>
            </button>
            <button onClick={prevMonth} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 text-gray-600 shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2.5 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 text-gray-700 font-semibold shadow-sm">
              Today
            </button>
            <button onClick={nextMonth} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 text-gray-600 shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center font-bold text-gray-400 text-xs tracking-widest uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-32 rounded-xl bg-transparent"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const data = getDayData(day);
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              
              const isFull = data.booked >= data.capacity;
              const isEmpty = data.booked === 0;

              return (
                <button 
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`h-32 rounded-xl border p-3 flex flex-col items-start justify-between transition-all relative overflow-hidden group hover:shadow-md
                    ${isSelected ? 'border-[#003366] ring-1 ring-[#003366] bg-[#003366]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-[#003366]/30'}
                  `}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mb-1
                    ${isToday ? 'bg-[#003366] text-white shadow-md' : 'text-gray-700 group-hover:bg-gray-100'}
                  `}>
                    {day}
                  </div>
                  
                  <div className="w-full mt-auto space-y-2">
                    {/* Capacity Indicator */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className={isEmpty ? 'text-gray-400' : isFull ? 'text-red-600' : 'text-[#003366]'}>
                        {data.booked}/{data.capacity} Booked
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : isEmpty ? 'bg-transparent' : 'bg-[#003366]'}`}
                        style={{ width: `${(data.booked / data.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Sidebar */}
      <div className="w-96 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
        {selectedDate ? (
          <>
            <div className="px-6 py-6 border-b border-gray-100 bg-[#003366]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CalendarIcon className="w-24 h-24 text-[#003366]" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-[#003366] mb-1">
                  <CalendarIcon className="w-5 h-5" />
                  <h3 className="font-bold text-lg">{dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}</h3>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Booked</p>
                    <p className="text-3xl font-black text-gray-900">{selectedDayData?.booked}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center relative group/edit cursor-pointer hover:border-[#003366]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Capacity Limit</p>
                      <span className="text-[9px] text-[#003366] font-bold opacity-0 group-hover/edit:opacity-100 transition-opacity uppercase">Edit</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-600">{selectedDayData?.capacity}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50/30">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Appointments Schedule</h4>
              
              {selectedDayData?.booked === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center opacity-50">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mb-4" strokeWidth={1.5} />
                  <p className="text-gray-500 font-medium">No bookings for this date.</p>
                  <p className="text-gray-400 text-sm mt-1">This entire day is completely open.</p>
                </div>
              ) : (
                selectedDayData?.details.map((booking: any) => (
                  <div key={booking.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-[#003366]/30 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003366] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-bold text-gray-900">{booking.name}</h5>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#003366] bg-[#003366]/10 px-2 py-1 rounded-md">
                        {booking.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Clock className="w-4 h-4 text-[#003366]/70" />
                      {booking.time}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white">
              <button 
                className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg ${
                  selectedDayData && selectedDayData.booked >= selectedDayData.capacity 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-[#003366] hover:bg-[#002244] text-white shadow-[#003366]/20'
                }`}
                disabled={selectedDayData ? selectedDayData.booked >= selectedDayData.capacity : false}
              >
                {selectedDayData && selectedDayData.booked >= selectedDayData.capacity ? 'Fully Booked' : '+ Add New Booking'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
            <CalendarIcon className="w-16 h-16 text-gray-300 mb-4" strokeWidth={1} />
            <p className="text-gray-500 font-medium">Select a date from the calendar to view schedule details.</p>
          </div>
        )}
      </div>

      {/* Bulk Settings Modal */}
      {isBulkSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#003366]" />
                Bulk Capacity Settings
              </h3>
              <button 
                onClick={() => setIsBulkSettingsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Set a global default capacity for all dates. You can still manually override capacity for specific dates later.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Global Daily Booking Limit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">#</span>
                  <input 
                    type="number" 
                    value={tempGlobalCapacity}
                    onChange={(e) => setTempGlobalCapacity(parseInt(e.target.value) || 0)}
                    min="1"
                    max="50"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all font-bold text-gray-900 text-lg"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsBulkSettingsOpen(false)}
                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setGlobalCapacity(tempGlobalCapacity);
                  setIsBulkSettingsOpen(false);
                }}
                className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-xl shadow-md flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Apply Globally
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
