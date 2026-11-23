import { useState, useRef, useEffect, useMemo } from 'react';
import { Check, X, Image as ImageIcon, Calendar as CalendarIcon, Mail, ChevronDown, MessageCircle, Save, CalendarPlus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DEFAULT_MOCK_TEAM } from '../lib/mockData';

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

interface Order {
  id: string;
  customer: string;
  package: string;
  date: string;
  email: string;
  phone: string;
  assignedTeam?: string[];
  payment_screenshot_url?: string;
  total_amount?: number;
  amountPaid?: string | number;
  event_dates?: Record<string, string>;
  [key: string]: unknown;
}

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  role: string;
  [key: string]: unknown;
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState<'pending_payment' | 'pending' | 'confirmed'>('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [teamMessages, setTeamMessages] = useState<Record<string, string>>({});
  const [emailMessages, setEmailMessages] = useState<Record<string, string>>({});
  const [payoutAmounts, setPayoutAmounts] = useState<Record<string, string>>({});
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const LIVE_FRONTEND_URL = 'https://vrundavan-frontend.vercel.app';

  const fetchData = async () => {
    setIsLoading(true);
    let loadedOrders: Order[] = [];
    let loadedTeam: TeamMember[] = [];
    const defaultFrontend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? LIVE_FRONTEND_URL
      : 'http://localhost:3000';
    const apiUrl = import.meta.env.VITE_FRONTEND_URL || defaultFrontend;

    // 1. Fetch live orders from primary API store
    try {
      const apiRes = await fetch(`${apiUrl}/api/orders`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (Array.isArray(apiData) && apiData.length > 0) {
          loadedOrders = apiData;
        }
      }
    } catch (apiErr) {
      console.warn("Could not fetch orders from API:", apiErr);
    }

    // 1b. If on localhost or custom domain, also fetch live production orders from Vercel so they immediately show!
    if (apiUrl !== LIVE_FRONTEND_URL) {
      try {
        const liveRes = await fetch(`${LIVE_FRONTEND_URL}/api/orders`);
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          if (Array.isArray(liveData) && liveData.length > 0) {
            const existingKeys = new Set(loadedOrders.map(o => o.quote_id || o.id));
            const newFromLive = (liveData as Order[]).filter(o => !existingKeys.has(o.quote_id || o.id));
            loadedOrders = [...loadedOrders, ...newFromLive];
          }
        }
      } catch (liveErr) {
        console.warn("Could not fetch live Vercel orders:", liveErr);
      }
    }

    // 2. Fetch from Supabase if connected
    try {
      const [ordersRes, teamRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*')
      ]);
      if (ordersRes.data && ordersRes.data.length > 0) {
        const existingKeys = new Set(loadedOrders.map(o => o.quote_id || o.id));
        const newFromDb = (ordersRes.data as Order[]).filter(o => !existingKeys.has(o.quote_id || o.id));
        loadedOrders = [...loadedOrders, ...newFromDb];
      }
      if (teamRes.data && teamRes.data.length > 0) loadedTeam = teamRes.data;
    } catch {
      // Supabase offline/paused
    }

    // Helper to identify and purge any static mock orders
    const isMockOrder = (o: any) => {
      if (!o) return true;
      const id = String(o.id || '');
      const quoteId = String(o.quote_id || '');
      const customer = String(o.customer || '').toLowerCase();
      const email = String(o.email || '').toLowerCase();
      return (
        id.startsWith('ORD-10') ||
        id === 'ORD-001' ||
        id === 'ORD-002' ||
        quoteId === 'VRUN-7A1B' ||
        quoteId === 'VRUN-8C2D' ||
        quoteId === 'VRUN-9E3F' ||
        quoteId === 'VRUN-4K9L' ||
        quoteId === 'VRUN-5M8N' ||
        customer.includes('rahul verma') ||
        customer.includes('sneha patel') ||
        customer.includes('amit & riya') ||
        customer.includes('darshan joshi') ||
        customer.includes('kavita mehta') ||
        email.includes('example.com')
      );
    };

    // 3. Fallback to localStorage (clean of mock data)
    if (loadedOrders.length === 0) {
      const local = localStorage.getItem('vrundavan_orders');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedOrders = parsed.filter(o => !isMockOrder(o));
          }
        } catch {
          // ignore
        }
      }
    }

    // Always purge static mock orders completely
    loadedOrders = loadedOrders.filter(o => !isMockOrder(o));
    if (loadedTeam.length === 0) {
      const local = localStorage.getItem('vrundavan_team');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedTeam = parsed;
          }
        } catch {
          // ignore
        }
      }
      if (loadedTeam.length === 0) {
        loadedTeam = DEFAULT_MOCK_TEAM as unknown as TeamMember[];
      }
    }

    setOrders(loadedOrders);
    setTeamMembers(loadedTeam);
    localStorage.setItem('vrundavan_orders', JSON.stringify(loadedOrders));
    localStorage.setItem('vrundavan_team', JSON.stringify(loadedTeam));
    setIsLoading(false);
  };

  const teamNames = useMemo(() => teamMembers.map(m => m.name), [teamMembers]);
  const awaitingOrders = useMemo(() => orders.filter(o => o.status === 'pending_payment'), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === 'confirmed'), [orders]);

  const updateOrderInDb = async (orderId: string, updates: Record<string, unknown>) => {
    const defaultFrontend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? LIVE_FRONTEND_URL
      : 'http://localhost:3000';
    const apiUrl = import.meta.env.VITE_FRONTEND_URL || defaultFrontend;

    // 1. Sync live with Frontend API store
    try {
      await fetch(`${apiUrl}/api/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, updates })
      });
    } catch (apiErr) {
      console.warn("Could not sync order update to API:", apiErr);
    }

    if (apiUrl !== LIVE_FRONTEND_URL) {
      try {
        await fetch(`${LIVE_FRONTEND_URL}/api/orders`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId, updates })
        });
      } catch {
        // live sync optional
      }
    }

    // 2. Sync with Supabase if online
    try {
      const allowedCols = ['customer', 'phone', 'email', 'package', 'date', 'status', 'amountPaid', 'total_amount', 'location', 'payment_screenshot_url', 'assignedTeam'];
      const dbUpdates: Record<string, unknown> = {};
      for (const k of allowedCols) {
        if (updates[k] !== undefined) dbUpdates[k] = k === 'amountPaid' ? String(updates[k]) : updates[k];
      }
      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('orders').update(dbUpdates).eq('id', orderId);
      }
    } catch (err) {
      console.error("Error updating order in Supabase:", err);
    }

    // 3. Update local state and localStorage
    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, ...updates } : o);
      localStorage.setItem('vrundavan_orders', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteOrder = async (order: Order) => {
    const quoteOrId = order.quote_id || order.id;
    const confirmDelete = window.confirm(
      `Kya aap sach me is order ko permanently remove/delete karna chahte hain?\n\nCustomer: ${order.customer}\nQuote ID: ${quoteOrId}\nPackage: ${order.package}`
    );
    if (!confirmDelete) return;

    setDeletingOrderId(order.id);
    const defaultFrontend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? LIVE_FRONTEND_URL
      : 'http://localhost:3000';
    const apiUrl = import.meta.env.VITE_FRONTEND_URL || defaultFrontend;

    // 1. Call primary API DELETE
    try {
      await fetch(`${apiUrl}/api/orders?id=${encodeURIComponent(order.id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, quote_id: order.quote_id })
      });
    } catch (err) {
      console.warn("Primary API delete failed:", err);
    }

    // 1b. Also call live Vercel API DELETE if on localhost
    if (apiUrl !== LIVE_FRONTEND_URL) {
      try {
        await fetch(`${LIVE_FRONTEND_URL}/api/orders?id=${encodeURIComponent(order.id)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.id, quote_id: order.quote_id })
        });
      } catch {
        // live delete optional
      }
    }

    // 2. Delete from Supabase
    try {
      const filterId = order.id;
      const filterQuote = order.quote_id || order.id;
      await supabase.from('orders').delete().or(`id.eq.${filterId},quote_id.eq.${filterQuote}`);
    } catch (err) {
      console.warn("Supabase delete failed:", err);
    }

    // 3. Update local state and localStorage
    setOrders(prev => {
      const next = prev.filter(o => o.id !== order.id && (!order.quote_id || o.quote_id !== order.quote_id));
      localStorage.setItem('vrundavan_orders', JSON.stringify(next));
      return next;
    });

    setDeletingOrderId(null);
  };

  const handleSendEmail = (order: Order, type: string, customMessage?: string) => {
    const defaultFrontend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? LIVE_FRONTEND_URL
      : 'http://localhost:3000';
    const apiUrl = import.meta.env.VITE_FRONTEND_URL || defaultFrontend;

    fetch(`${apiUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, order, customMessage })
    }).then(async res => {
      const data = await res.json();
      if (data.success && data.details && data.details.email) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email. Please ensure your Gmail App Password is set in .env.local.");
      }
    }).catch(e => {
      console.error(e);
      alert("Network error. Is the server running?");
    });
  };

  const handleAssignTeam = (orderId: string, newTeam: string[]) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, assignedTeam: newTeam } : order
    ));
    updateOrderInDb(orderId, { assignedTeam: newTeam });
  };

  const handleNotifyTeamMember = (order: Order, memberName: string) => {
    const member = teamMembers.find(m => m.name === memberName);
    if (!member || !member.phone) {
      alert("No phone number found for this member.");
      return;
    }
    
    const messageKey = `${order.id}-${memberName}`;
    const customMessage = teamMessages[messageKey] || `You have been assigned to order #${order.id}.`;
    
    fetch('http://localhost:3000/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'team_assignment', 
        order: order,
        customMessage: customMessage,
        teamPhones: [member.phone]
      })
    }).then(res => {
       if (res.ok) alert(`Message sent to ${memberName}!`);
       else alert(`Failed to send message to ${memberName}.`);
    }).catch(e => {
       console.error("Notification failed", e);
       alert("Network error.");
    });
  };

  const handleSavePayout = async (order: Order, memberName: string) => {
    const member = teamMembers.find(m => m.name === memberName);
    if (!member) return;
    
    const amountKey = `${order.id}-${memberName}`;
    const amount = Number(payoutAmounts[amountKey] || 0);
    
    if (amount <= 0) {
      alert("Please enter a valid payout amount.");
      return;
    }
    
    try {
      const { error } = await supabase.from('team_payouts').insert([{
        member_id: member.id,
        order_id: order.id,
        client: order.customer,
        date: order.date,
        amount: amount,
        status: 'pending'
      }]);
      
      if (error) throw error;
      alert(`Payout of ₹${amount} saved for ${memberName}!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert(`Error saving payout: ${errorMsg}`);
    }
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    setProcessingOrderId(order.id);
    try {
      await updateOrderInDb(order.id, { status: newStatus });

      if (newStatus === 'confirmed') {
        const defaultFrontend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? LIVE_FRONTEND_URL
          : 'http://localhost:3000';
        const apiUrl = import.meta.env.VITE_FRONTEND_URL || defaultFrontend;

        await fetch(`${apiUrl}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'order_confirmed_invoice', order: { ...order, status: newStatus } })
        }).catch(e => console.error("Failed to send invoice notification", e));

        if (apiUrl !== LIVE_FRONTEND_URL) {
          fetch(`${LIVE_FRONTEND_URL}/api/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'order_confirmed_invoice', order: { ...order, status: newStatus } })
          }).catch(e => console.error("Failed to send live invoice notification", e));
        }
      }

      setOrders(orders.map(o => 
        o.id === order.id ? { ...o, status: newStatus } : o
      ));
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Approve bookings and assign your team to confirmed events.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('pending_payment')}
          className={`pb-4 px-2 font-bold text-sm transition-all relative whitespace-nowrap ${
            activeTab === 'pending_payment' ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          Awaiting Payment
          <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-bold ${activeTab === 'pending_payment' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>{awaitingOrders.length}</span>
          {activeTab === 'pending_payment' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003366] rounded-t-full shadow-[0_-2px_10px_rgba(0,51,102,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 font-bold text-sm transition-all relative whitespace-nowrap ${
            activeTab === 'pending' ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          Pending Approvals
          <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-bold ${activeTab === 'pending' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{pendingOrders.length}</span>
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003366] rounded-t-full shadow-[0_-2px_10px_rgba(0,51,102,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')}
          className={`pb-4 px-2 font-bold text-sm transition-all relative whitespace-nowrap ${
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
        {isLoading ? (
           <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center mt-8">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <div className="w-6 h-6 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
             </div>
             <h3 className="text-lg font-bold text-gray-900">Loading Orders...</h3>
             <p className="text-gray-500 text-sm mt-1">Fetching the latest data from the database.</p>
           </div>
        ) : orders.length === 0 ? (
           <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center mt-8">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Check className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
             <p className="text-gray-500 text-sm mt-1">There are no orders in this category.</p>
           </div>
        ) : (activeTab === 'pending_payment' ? awaitingOrders : activeTab === 'pending' ? pendingOrders : confirmedOrders).length === 0 ? (
           <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center mt-8">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Check className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">No {activeTab.replace('_', ' ')} orders</h3>
             <p className="text-gray-500 text-sm mt-1">You are all caught up!</p>
           </div>
        ) : (activeTab === 'pending_payment' ? awaitingOrders : activeTab === 'pending' ? pendingOrders : confirmedOrders).map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:shadow-lg transition-shadow">
            
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Customer Details */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{order.customer}</h3>
                    <p className="text-[#003366] font-bold text-xs uppercase tracking-wider mt-1">{order.package}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase tracking-widest">{order.id}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order)}
                        disabled={deletingOrderId === order.id}
                        className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                        title="Delete / Remove this order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap justify-end">
                      {order.total_amount && (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                          Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                        </span>
                      )}
                      {order.amountPaid && (
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                          Advance: ₹{Number(order.amountPaid).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"><CalendarIcon className="w-4 h-4 text-[#003366]" /> {order.date}</div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"><Mail className="w-4 h-4 text-[#003366]" /> {order.email}</div>
                  
                  {/* Chat on WhatsApp Button */}
                  <button
                    onClick={() => {
                      const phoneRaw = order.phone || '';
                      let formatted = phoneRaw.replace(/\D/g, '');
                      if (formatted.length === 10) formatted = '91' + formatted; // Assuming India default
                      const message = encodeURIComponent(`Hi ${order.customer}, I am reaching out regarding your Vrundavan booking for the ${order.package} package...`);
                      window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
                    }}
                    className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] px-3 py-2 rounded-lg border border-[#25D366]/30 transition-colors font-bold cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Chat on WhatsApp: </span>{order.phone}
                  </button>
                </div>

                {/* Individual Ceremony Dates Badges if Available */}
                {order.event_dates && typeof order.event_dates === 'object' && Object.keys(order.event_dates).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(order.event_dates).map(([evId, evDate]) => (
                      <span key={evId} className="text-xs bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
                        <strong className="capitalize">{evId.replace(/_/g, ' ')}:</strong> {String(evDate)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment & Actions */}
              <div className="flex flex-col sm:flex-row xl:flex-col justify-center items-center xl:items-end gap-4 border-t xl:border-t-0 xl:border-l border-gray-100 pt-6 xl:pt-0 xl:pl-8 w-full xl:w-[320px] shrink-0">
              
              {activeTab === 'pending_payment' ? (
                <div className="w-full space-y-3">
                  <div className="bg-amber-50 text-amber-600 border border-amber-200/50 px-5 py-3 rounded-xl text-sm font-bold w-full text-center shadow-sm">
                    Waiting for customer payment
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(order, 'confirmed')}
                      disabled={processingOrderId === order.id}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
                    >
                      {processingOrderId === order.id ? 'Processing...' : 'Payment Received'}
                    </button>
                    <button 
                      onClick={() => handleSendEmail(order, 'payment_reminder')}
                      className="flex-1 bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      Send Email Reminder
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDeleteOrder(order)}
                    disabled={processingOrderId === order.id || deletingOrderId === order.id}
                    className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    title="Reject and cancel this unpaid quote"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={3} /> {deletingOrderId === order.id ? 'Rejecting...' : 'Reject / Cancel Order'}
                  </button>
                </div>
              ) : activeTab === 'pending' ? (
                <>
                  <button 
                    onClick={() => {
                      if (order.payment_screenshot_url) {
                        window.open(order.payment_screenshot_url, '_blank');
                      } else {
                        alert("No payment screenshot uploaded for this order.");
                      }
                    }}
                    className="flex items-center gap-2 text-[#003366] bg-[#003366]/5 border border-[#003366]/20 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#003366]/10 transition-colors w-full sm:w-auto xl:w-full justify-center shadow-sm"
                  >
                    <ImageIcon className="w-4 h-4" /> View Payment Screenshot
                  </button>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => handleStatusUpdate(order, 'confirmed')}
                      disabled={processingOrderId === order.id}
                      className="flex-1 flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-emerald-500/20"
                    >
                      <Check className="w-4 h-4" strokeWidth={3} /> {processingOrderId === order.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(order, 'pending_payment')}
                      disabled={processingOrderId === order.id}
                      className="flex-1 flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-70 disabled:cursor-not-allowed text-red-600 py-2 rounded-xl font-bold text-sm transition-colors border border-red-100"
                    >
                      <X className="w-4 h-4" strokeWidth={3} /> {processingOrderId === order.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <div className="w-full bg-emerald-50 text-emerald-700 px-4 rounded-xl text-sm font-bold text-center border border-emerald-100 shadow-sm flex items-center justify-center gap-2 h-[42px]">
                    <Check className="w-4 h-4" strokeWidth={3} /> Order Confirmed
                  </div>
                  
                  {order.date && (
                    <button 
                      onClick={() => {
                        const dateObj = new Date(order.date);
                        // Format to YYYYMMDD
                        const formattedDate = dateObj.toISOString().split('T')[0].replace(/-/g, '');
                        // Add 2 hours for a default block
                        const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '');
                        
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Vrundavan Booking: ' + order.customer)}&dates=${formattedDate}/${endDate}&details=${encodeURIComponent('Package: ' + order.package + '\nClient: ' + order.customer + '\nPhone: ' + order.phone)}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                      <CalendarPlus className="w-4 h-4" /> Add to Google Calendar
                    </button>
                  )}

                  <button 
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-[#003366] border border-gray-200 px-4 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm h-[42px]"
                  >
                    {expandedOrders[order.id] ? 'Close Manager' : 'Manage Team & Email'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedOrders[order.id] ? 'rotate-180' : ''}`} />
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleDeleteOrder(order)}
                    disabled={deletingOrderId === order.id}
                    className="w-full flex items-center justify-center gap-2 bg-red-50/80 hover:bg-red-100 text-red-600 border border-red-200/80 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50 h-[38px]"
                    title="Permanently remove confirmed order"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingOrderId === order.id ? 'Removing...' : 'Remove Confirmed Order'}
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* Confirmed Orders Extended Layout */}
            {activeTab === 'confirmed' && expandedOrders[order.id] && (
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 fade-in duration-200">
                
                {/* Left Side: Team Assignment */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assign Team Members (Multiple)</label>
                    <MultiSelectDropdown 
                      options={teamNames} 
                      selected={order.assignedTeam || []} 
                      onChange={(newTeam) => handleAssignTeam(order.id, newTeam)} 
                    />
                  </div>
                  
                  {order.assignedTeam && order.assignedTeam.length > 0 && (
                    <div className="space-y-3 mt-2">
                      <label className="block text-[10px] font-bold text-[#003366] uppercase tracking-widest">Manage Team Members</label>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {order.assignedTeam.map((memberName: string) => {
                           const msgKey = `${order.id}-${memberName}`;
                           const amtKey = `${order.id}-${memberName}`;
                           const memberObj = teamMembers.find(m => m.name === memberName);
                           
                           return (
                             <div key={memberName} className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3 flex flex-col">
                               <div className="flex justify-between items-center">
                                 <span className="text-xs font-bold text-gray-900">{memberName}</span>
                                 <span className="text-[10px] font-medium text-gray-400">{memberObj?.phone || 'No number'}</span>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                 <span className="text-xs font-bold text-gray-500">₹</span>
                                 <input 
                                   type="number"
                                   placeholder="Payout Amount"
                                   value={payoutAmounts[amtKey] || ''}
                                   onChange={e => setPayoutAmounts({...payoutAmounts, [amtKey]: e.target.value})}
                                   className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-[#003366]"
                                 />
                                 <button 
                                   onClick={() => handleSavePayout(order, memberName)}
                                   className="shrink-0 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1.5 rounded-lg border border-emerald-100 transition-colors"
                                   title="Save Payout to Ledger"
                                 >
                                   <Save className="w-4 h-4" />
                                 </button>
                               </div>

                               <textarea
                                 value={teamMessages[msgKey] || ''}
                                 onChange={(e) => setTeamMessages({ ...teamMessages, [msgKey]: e.target.value })}
                                 placeholder={`Instructions for ${memberName}...`}
                                 className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] min-h-[50px] resize-none"
                               />
                               
                               <button 
                                 onClick={() => handleNotifyTeamMember(order, memberName)}
                                 className="w-full bg-[#003366] hover:bg-[#002244] text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 mt-auto"
                               >
                                 <MessageCircle className="w-3.5 h-3.5" /> Send Message
                               </button>
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Email Customer Section */}
                <div className="space-y-3 lg:border-l lg:border-gray-100 lg:pl-8">
                  <label className="block text-[10px] font-bold text-[#003366] uppercase tracking-widest">Email Customer Update</label>
                  <div className="bg-[#003366]/5 p-4 rounded-xl border border-[#003366]/10 space-y-3 h-[calc(100%-24px)] flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900">{order.customer}</span>
                      <span className="text-xs font-medium text-gray-500">{order.email}</span>
                    </div>
                    <textarea
                      value={emailMessages[order.id] || ''}
                      onChange={(e) => setEmailMessages({ ...emailMessages, [order.id]: e.target.value })}
                      placeholder="Type update message (e.g. 'We received your partial payment!')..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-3 bg-white focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] flex-1 min-h-[100px] resize-none"
                    />
                    <button 
                      onClick={() => handleSendEmail(order, 'order_update', emailMessages[order.id])}
                      className="w-full bg-[#003366] hover:bg-[#002244] text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-auto shadow-sm"
                    >
                      <Mail className="w-4 h-4" /> Send Email Update
                    </button>
                  </div>
                </div>

              </div>
            )}

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
