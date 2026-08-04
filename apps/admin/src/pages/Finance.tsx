import { useState } from 'react';
import { IndianRupee, AlertCircle, Wallet, FileText, User, Plus, CheckCircle2, Bell } from 'lucide-react';

const mockFinances = [
  { 
    id: 'ORD-001', 
    client: 'Rahul Verma', 
    total: 150000, 
    paid: 5000, 
    due: 145000, 
    status: 'overdue',
    payouts: [
      { id: 1, name: 'Sanjay Kumar', role: 'Drone Operator', amount: 15000, status: 'paid' },
      { id: 2, name: 'Amit Patel', role: 'Lead Photographer', amount: 20000, status: 'pending' }
    ]
  },
  { 
    id: 'ORD-002', 
    client: 'Sneha Patel', 
    total: 35000, 
    paid: 35000, 
    due: 0, 
    status: 'paid',
    payouts: [
      { id: 3, name: 'Priya Singh', role: 'Editor', amount: 8000, status: 'paid' }
    ]
  },
  { 
    id: 'ORD-003', 
    client: 'Corporate Event', 
    total: 80000, 
    paid: 40000, 
    due: 40000, 
    status: 'pending',
    payouts: []
  },
];

export default function Finance() {
  const [finances] = useState(mockFinances);
  const [selectedOrder, setSelectedOrder] = useState(mockFinances[0]);

  // Calculate totals for the selected order
  const totalPayouts = selectedOrder.payouts.reduce((sum, p) => sum + p.amount, 0);
  const netProfit = selectedOrder.total - totalPayouts;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-7rem)] flex flex-col font-sans" style={{ fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header - Compact */}
      <div className="flex justify-between items-end mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>Financial Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Track your incoming payments and per-order team payouts.</p>
        </div>
        <button className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2">
          <FileText className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-5 flex-1 min-h-0">
        
        {/* Left Side (Takes 2/3 width) */}
        <div className="flex-[2] flex flex-col gap-5 min-h-0">
          
          {/* Global Stats */}
          <div className="grid grid-cols-3 gap-5 shrink-0">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Revenue</p>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-bold text-slate-900 leading-none">₹2,65,000</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pending Balance</p>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-bold text-slate-900 leading-none">₹1,85,000</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Team Payouts</p>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-bold text-slate-900 leading-none">₹43,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Client Balances</h2>
              <button className="text-xs font-bold text-[#003366] hover:underline">View All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-[0_1px_0_#f1f5f9] z-10">
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-right">Paid</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {finances.map(row => (
                    <tr 
                      key={row.id} 
                      onClick={() => setSelectedOrder(row)}
                      className={`cursor-pointer transition-colors ${selectedOrder.id === row.id ? 'bg-[#003366]/5 border-l-4 border-[#003366]' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                    >
                      <td className="px-5 py-3 flex flex-col justify-center h-[60px]">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{row.client}</p>
                        <p className="text-[10px] font-bold text-slate-400 leading-tight">{row.id}</p>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-600 text-sm text-right h-[60px]">₹{row.total.toLocaleString()}</td>
                      <td className="px-5 py-3 font-bold text-emerald-600 text-sm text-right h-[60px]">₹{row.paid.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right h-[60px]">
                        {row.due === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded border ${row.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                            ₹{row.due.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center h-[60px]">
                        {row.due > 0 ? (
                          <button className="bg-slate-100 text-slate-600 hover:bg-[#003366] hover:text-white p-1.5 rounded-lg transition-colors inline-flex" title="Send Reminder" onClick={(e) => e.stopPropagation()}>
                            <Bell className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Panel - Order Payouts */}
        <div className="flex-1 bg-[#f8fafc] rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Team Payouts</h2>
              <p className="text-[10px] font-bold text-[#003366] uppercase tracking-widest mt-0.5">{selectedOrder.client}</p>
            </div>
            <button className="text-white bg-[#003366] hover:bg-[#002244] p-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1 text-xs font-bold px-3">
              <Plus className="w-3 h-3" strokeWidth={3} /> Add
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {selectedOrder.payouts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <User className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-slate-500 font-bold text-sm">No team payouts added.</p>
              </div>
            ) : (
              selectedOrder.payouts.map(payout => (
                <div key={payout.id} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{payout.name}</h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{payout.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-600 text-sm bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 block mb-1.5">-₹{payout.amount.toLocaleString()}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${payout.status === 'paid' ? 'text-emerald-500' : 'text-orange-500'}`}>{payout.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="bg-white border-t border-slate-200 p-4 shrink-0 rounded-b-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Revenue</span>
              <span className="text-sm font-bold text-slate-900">₹{selectedOrder.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Payouts</span>
              <span className="text-sm font-bold text-red-500">-₹{totalPayouts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#003366] uppercase tracking-widest">Net Profit</span>
              <span className="text-xl font-bold text-emerald-600">₹{netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
