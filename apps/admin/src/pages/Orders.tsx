import { useState, useRef, useEffect } from 'react';
import { Check, X, Image as ImageIcon, Calendar as CalendarIcon, Phone, Mail, ChevronDown } from 'lucide-react';

const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'Rahul Verma',
    phone: '+91 98765 43210',
    email: 'rahul@example.com',
    package: 'Complete Wedding Package',
    date: '2026-08-15',
    status: 'pending',
    amountPaid: '₹5,000'
  },
  {
    id: 'ORD-002',
    customer: 'Sneha Patel',
    phone: '+91 87654 32109',
    email: 'sneha@example.com',
    package: 'Pre-Wedding Shoot',
    date: '2026-08-12',
    status: 'confirmed',
    assignedTeam: [] as string[],
    amountPaid: '₹5,000'
  }
];

const mockTeam = ['Rahul Sharma', 'Amit Patel', 'Sanjay Kumar', 'Priya Singh'];

// Custom Multi-Select Dropdown Component
function MultiSelectDropdown({ options, selected, onChange }: { options: string[], selected: string[], onChange: (selected: string[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] bg-white border ${isOpen ? 'border-[#003366] ring-2 ring-[#003366]/20' : 'border-gray-200'} rounded-xl px-3 py-2 cursor-pointer flex flex-wrap gap-2 items-center transition-all`}
      >
        {selected.length === 0 && <span className="text-gray-400 text-sm font-medium">Select team members...</span>}
        {selected.map(sel => (
          <span key={sel} className="bg-[#003366]/10 text-[#003366] text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm max-w-full truncate">
            <span className="truncate">{sel}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleOption(sel); }}
              className="hover:bg-[#003366]/20 p-0.5 rounded-full transition-colors shrink-0"
            >
              <X className="w-3 h-3" strokeWidth={3} />
            </button>
          </span>
        ))}
        <div className="ml-auto shrink-0">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-xl p-2 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map(opt => (
            <div 
              key={opt} 
              onClick={() => toggleOption(opt)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selected.includes(opt) ? 'bg-[#003366] border-[#003366] shadow-md' : 'border-gray-300 group-hover:border-gray-400'}`}>
                {selected.includes(opt) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm ${selected.includes(opt) ? 'font-bold text-[#003366]' : 'font-medium text-gray-700'}`}>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed'>('pending');
  const [orders, setOrders] = useState(mockOrders);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');

  const handleAssignTeam = (orderId: string, newTeam: string[]) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, assignedTeam: newTeam } : order
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Approve bookings and assign your team to confirmed events.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 font-bold text-sm transition-all relative ${
            activeTab === 'pending' ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          Pending Approvals
          <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-bold ${activeTab === 'pending' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{pendingOrders.length}</span>
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003366] rounded-t-full shadow-[0_-2px_10px_rgba(0,51,102,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')}
          className={`pb-4 px-2 font-bold text-sm transition-all relative ${
            activeTab === 'confirmed' ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          Confirmed Orders
          <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-bold ${activeTab === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{confirmedOrders.length}</span>
          {activeTab === 'confirmed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003366] rounded-t-full shadow-[0_-2px_10px_rgba(0,51,102,0.5)]"></div>}
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {(activeTab === 'pending' ? pendingOrders : confirmedOrders).map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col xl:flex-row gap-6 hover:shadow-lg transition-shadow">
            
            {/* Customer Details */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{order.customer}</h3>
                  <p className="text-[#003366] font-bold text-xs uppercase tracking-wider mt-1">{order.package}</p>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase tracking-widest">{order.id}</span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><CalendarIcon className="w-4 h-4 text-[#003366]" /> {order.date}</div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Phone className="w-4 h-4 text-[#003366]" /> {order.phone}</div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Mail className="w-4 h-4 text-[#003366]" /> {order.email}</div>
              </div>
            </div>

            {/* Payment & Actions */}
            <div className="flex flex-col sm:flex-row xl:flex-col justify-center items-center xl:items-end gap-4 border-t xl:border-t-0 xl:border-l border-gray-100 pt-6 xl:pt-0 xl:pl-8 w-full xl:w-[320px] shrink-0">
              
              {activeTab === 'pending' ? (
                <>
                  <button className="flex items-center gap-2 text-[#003366] bg-[#003366]/5 border border-[#003366]/20 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#003366]/10 transition-colors w-full sm:w-auto xl:w-full justify-center shadow-sm">
                    <ImageIcon className="w-4 h-4" /> View Payment Screenshot
                  </button>
                  <div className="flex gap-3 w-full">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-all">
                      <Check className="w-4 h-4" strokeWidth={3} /> Approve
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 hover:border-red-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-all">
                      <X className="w-4 h-4" strokeWidth={3} /> Reject
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full relative">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Assign Team Members (Multiple)</label>
                    <MultiSelectDropdown 
                      options={mockTeam} 
                      selected={order.assignedTeam || []} 
                      onChange={(newTeam) => handleAssignTeam(order.id, newTeam)} 
                    />
                  </div>
                  <div className="w-full bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold text-center border border-emerald-100 flex items-center justify-center gap-1.5 mt-2">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} /> Order Confirmed
                  </div>
                </>
              )}

            </div>
          </div>
        ))}

        {(activeTab === 'pending' ? pendingOrders : confirmedOrders).length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-gray-300" strokeWidth={3} />
            </div>
            <h3 className="text-gray-900 font-bold text-xl">No {activeTab} orders</h3>
            <p className="text-gray-500 text-sm mt-1">You are all caught up!</p>
          </div>
        )}
      </div>

    </div>
  );
}
