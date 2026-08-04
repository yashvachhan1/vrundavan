import { useState } from 'react';
import { Edit2, Phone, Camera, User, Calendar as CalendarIcon, History, Plus, ArrowLeft, Filter } from 'lucide-react';

const mockTeam = [
  { 
    id: 1, name: 'Rahul Sharma', role: 'Lead Photographer', phone: '+91 98765 43210', icon: Camera,
    totalPaid: 120000, pending: 20000,
    history: [
      { orderId: 'ORD-001', client: 'Rahul Verma', date: 'Aug 15, 2026', amount: 20000, status: 'pending' },
      { orderId: 'ORD-005', client: 'Destination Wedding', date: 'Jul 20, 2026', amount: 120000, status: 'paid' },
    ]
  },
  { 
    id: 2, name: 'Sanjay Kumar', role: 'Drone Operator', phone: '+91 76543 21098', icon: User,
    totalPaid: 45000, pending: 15000,
    history: [
      { orderId: 'ORD-001', client: 'Rahul Verma', date: 'Aug 15, 2026', amount: 15000, status: 'paid' },
      { orderId: 'ORD-008', client: 'Kunal Wedding', date: 'Aug 02, 2026', amount: 30000, status: 'paid' },
      { orderId: 'ORD-012', client: 'Pre-Wedding Shoot', date: 'Aug 28, 2026', amount: 15000, status: 'pending' },
    ]
  },
  { 
    id: 3, name: 'Priya Singh', role: 'Editor', phone: '+91 65432 10987', icon: User,
    totalPaid: 35000, pending: 0,
    history: [
      { orderId: 'ORD-002', client: 'Sneha Patel', date: 'Aug 12, 2026', amount: 8000, status: 'paid' },
      { orderId: 'ORD-006', client: 'Birthday Event', date: 'Jul 15, 2026', amount: 27000, status: 'paid' },
    ]
  },
];

export default function Team() {
  const [team] = useState(mockTeam);
  const [isHistoryView, setIsHistoryView] = useState(false);
  
  // History Filters
  const [filterMember, setFilterMember] = useState('All Members');
  const [filterTimeframe, setFilterTimeframe] = useState('All Time');

  // Flatten all payouts for the history view
  const allPayouts = team.flatMap(m => m.history.map(h => ({ ...h, memberName: m.name, memberRole: m.role, memberId: m.id })));

  // Apply filters
  const filteredPayouts = allPayouts.filter(record => {
    // Member Filter
    if (filterMember !== 'All Members' && record.memberName !== filterMember) return false;
    
    // Timeframe Filter
    if (filterTimeframe === 'This Month (Aug 2026)' && !record.date.includes('Aug')) return false;
    if (filterTimeframe === 'Last Month (Jul 2026)' && !record.date.includes('Jul')) return false;
    if (filterTimeframe === 'This Year (2026)' && !record.date.includes('2026')) return false;
    
    return true;
  });

  const totalFilteredPaid = filteredPayouts.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const totalFilteredPending = filteredPayouts.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-7rem)] flex flex-col font-sans" style={{ fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {isHistoryView ? 'Payout History & Ledger' : 'Team Management'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isHistoryView ? 'View and filter all financial transactions with your freelancers.' : 'Manage your staff and assign them to orders.'}
          </p>
        </div>
        
        <div className="flex gap-3">
          {isHistoryView ? (
            <>
              {/* Filters for History View */}
              <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                <div className="flex items-center px-3 border-r border-slate-100">
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>
                <select 
                  value={filterMember}
                  onChange={(e) => setFilterMember(e.target.value)}
                  className="bg-transparent text-slate-700 px-3 py-1.5 text-sm font-bold outline-none cursor-pointer border-r border-slate-100"
                >
                  <option>All Members</option>
                  {team.map(m => <option key={m.id}>{m.name}</option>)}
                </select>
                <select 
                  value={filterTimeframe}
                  onChange={(e) => setFilterTimeframe(e.target.value)}
                  className="bg-transparent text-slate-700 px-3 py-1.5 text-sm font-bold outline-none cursor-pointer"
                >
                  <option>All Time</option>
                  <option>This Month (Aug 2026)</option>
                  <option>Last Month (Jul 2026)</option>
                  <option>This Year (2026)</option>
                </select>
              </div>

              <button 
                onClick={() => setIsHistoryView(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Team
              </button>
            </>
          ) : (
            <>
              {/* Buttons for Team View */}
              <button 
                onClick={() => setIsHistoryView(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                <History className="w-4 h-4" /> Payout History
              </button>
              <button className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {!isHistoryView ? (
          /* TEAM DIRECTORY VIEW */
          <div className="overflow-y-auto custom-scrollbar pr-2 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {team.map((member) => {
                const Icon = member.icon;
                return (
                  <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#003366]/30 transition-all relative group flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#003366]/5 text-[#003366]">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-[#003366] hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{member.name}</h3>
                    <p className="text-[#003366] font-bold text-[10px] uppercase tracking-widest mt-1 mb-5">{member.role}</p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {member.phone}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* GLOBAL PAYOUT HISTORY VIEW */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 shadow-[0_1px_0_#e2e8f0] z-10">
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Client / Order</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayouts.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                          {record.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{record.memberName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{record.memberRole}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm">{record.client}</p>
                        <p className="text-[10px] font-bold text-[#003366] uppercase tracking-wider">{record.orderId}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-600 text-sm">
                          ₹{record.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${record.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredPayouts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-bold">No payouts found matching your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary Footer for History View */}
            <div className="bg-slate-900 p-5 shrink-0 flex justify-between items-center text-white">
              <div className="flex gap-8">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Filtered Records</span>
                  <span className="text-lg font-bold">{filteredPayouts.length} Transactions</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Pending</span>
                  <span className="text-lg font-bold text-orange-400">₹{totalFilteredPending.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Paid</span>
                <span className="text-2xl font-bold text-emerald-400">₹{totalFilteredPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
