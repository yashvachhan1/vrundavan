import { useState, useEffect } from 'react';
import { IndianRupee, AlertCircle, Wallet, FileText, User, Plus, CheckCircle2, Bell, X, Upload, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Payout {
  id: string;
  member_id: string;
  order_id: string;
  amount: number | string;
  status: string;
  name: string;
  role: string;
  screenshot_url?: string;
  note?: string;
}

interface FinanceRecord {
  id: string;
  quote_id: string;
  client: string;
  total: number;
  paid: number;
  due: number;
  status: string;
  payouts: Payout[];
}

export default function Finance() {
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<FinanceRecord | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAddPayoutModal, setShowAddPayoutModal] = useState(false);
  const [newPayout, setNewPayout] = useState({ member_id: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'paid', note: '' });
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [ordersRes, teamRes, payoutsRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('*'),
      supabase.from('team_payouts').select('*')
    ]);

    if (ordersRes.data) {
      const orders = ordersRes.data;
      const members = teamRes.data || [];
      const payouts = payoutsRes.data || [];
      
      setTeamMembers(members);

      const formattedFinances = orders.map(order => {
        const orderPayouts = payouts.filter(p => p.order_id === order.id).map(p => {
           const member = members.find(m => m.id === p.member_id);
           return {
             ...p,
             name: member?.name || 'Unknown',
             role: member?.role || 'Unknown'
           };
        });

        const total = Number(order.total_amount || 0);
        const paid = Number(order.amountPaid || 0);
        const due = Math.max(0, total - paid);

        return {
          id: order.id,
          quote_id: order.quote_id || order.id.split('-')[0].toUpperCase(),
          client: order.customer,
          total,
          paid,
          due,
          status: due > 0 ? 'overdue' : 'paid',
          payouts: orderPayouts
        };
      });

      setFinances(formattedFinances);
      if (formattedFinances.length > 0) {
        setSelectedOrder(formattedFinances[0]);
      }
    }
    setIsLoading(false);
  };

  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newPayout.member_id || !newPayout.amount) return;
    
    setIsSubmitting(true);
    
    let screenshotUrl = null;
    if (paymentFile) {
      const fileExt = paymentFile.name.split('.').pop();
      const fileName = `${selectedOrder.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, paymentFile);
        
      if (uploadError) {
        alert("Failed to upload screenshot: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);
        
      screenshotUrl = publicUrl;
    }

    const { data, error } = await supabase.from('team_payouts').insert([{
      order_id: selectedOrder.id,
      client: selectedOrder.client,
      member_id: newPayout.member_id,
      amount: Number(newPayout.amount),
      date: newPayout.date,
      status: newPayout.status,
      screenshot_url: screenshotUrl,
      note: newPayout.note
    }]).select();

    if (error) {
      alert("Error adding payout: " + error.message);
    } else if (data) {
      // Send email if paid
      if (newPayout.status === 'paid') {
        try {
          const selectedMember = teamMembers.find(m => m.id === newPayout.member_id);
          // Call the notify API
          // We assume the frontend API is running on localhost:3000 in dev or NEXT_PUBLIC_SITE_URL in prod
          const apiUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
          fetch(`${apiUrl}/api/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'team_payout_receipt',
              payout: {
                member_name: selectedMember?.name || 'Unknown Member',
                role: selectedMember?.role || 'Unknown Role',
                amount: newPayout.amount,
                date: newPayout.date,
                screenshot_url: screenshotUrl,
                note: newPayout.note,
                client: selectedOrder.client,
                order_id: selectedOrder.id
              }
            })
          }).catch(err => console.error("Failed to trigger email:", err));
        } catch (e) {
          console.error("Email error", e);
        }
      }

      // Refresh data
      await fetchData();
      setShowAddPayoutModal(false);
      setNewPayout({ member_id: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'paid', note: '' });
      setPaymentFile(null);
    }
    setIsSubmitting(false);
  };

  const globalRevenue = finances.reduce((sum, f) => sum + f.total, 0);
  const globalPending = finances.reduce((sum, f) => sum + f.due, 0);
  const globalPayouts = finances.reduce((sum, f) => sum + f.payouts.reduce((s: number, p: Payout) => s + Number(p.amount), 0), 0);

  const totalPayouts = selectedOrder?.payouts.reduce((sum: number, p: Payout) => sum + Number(p.amount), 0) || 0;
  const netProfit = (selectedOrder?.total || 0) - totalPayouts;

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
                  <p className="text-xl font-bold text-slate-900 leading-none">₹{globalRevenue.toLocaleString('en-IN')}</p>
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
                  <p className="text-xl font-bold text-slate-900 leading-none">₹{globalPending.toLocaleString('en-IN')}</p>
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
                  <p className="text-xl font-bold text-slate-900 leading-none">₹{globalPayouts.toLocaleString('en-IN')}</p>
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
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold">Loading Financial Data...</div>
              ) : (
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
                        className={`cursor-pointer transition-colors ${selectedOrder?.id === row.id ? 'bg-[#003366]/5 border-l-4 border-[#003366]' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                      >
                        <td className="px-5 py-3 flex flex-col justify-center h-[60px]">
                          <p className="font-bold text-slate-900 text-sm leading-tight">{row.client}</p>
                          <p className="text-[10px] font-bold text-slate-400 leading-tight">{row.quote_id}</p>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-600 text-sm text-right h-[60px]">₹{row.total.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 font-bold text-emerald-600 text-sm text-right h-[60px]">₹{row.paid.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-right h-[60px]">
                          {row.due === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded border ${row.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                              ₹{row.due.toLocaleString('en-IN')}
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
              )}
            </div>
          </div>
        </div>

        {/* Right Side Panel - Order Payouts */}
        <div className="flex-1 bg-[#f8fafc] rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Team Payouts</h2>
              <p className="text-[10px] font-bold text-[#003366] uppercase tracking-widest mt-0.5">{selectedOrder?.client || 'No Order Selected'}</p>
            </div>
            <button onClick={() => setShowAddPayoutModal(true)} className="text-white bg-[#003366] hover:bg-[#002244] p-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1 text-xs font-bold px-3 cursor-pointer">
              <Plus className="w-3 h-3" strokeWidth={3} /> Add
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {!selectedOrder ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                 <p className="text-slate-500 font-bold text-sm">Select an order to view payouts.</p>
              </div>
            ) : selectedOrder.payouts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <User className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-slate-500 font-bold text-sm">No team payouts added for this order.</p>
              </div>
            ) : (
              selectedOrder.payouts.map((payout: Payout) => (
                <div key={payout.id} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group relative overflow-hidden">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{payout.name}</h4>
                      {payout.screenshot_url && (
                        <a href={payout.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-[#003366] hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors" title="View Payment Proof">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{payout.role}</span>
                  </div>
                  <div className="text-right z-10">
                    <span className="font-bold text-red-600 text-sm bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 block mb-1.5">-₹{Number(payout.amount).toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${payout.status === 'paid' ? 'text-emerald-500' : 'text-orange-500'}`}>{payout.status}</span>
                  </div>
                  
                  {payout.note && (
                    <div className="col-span-full w-full mt-2 pt-2 border-t border-slate-100">
                      <p className="text-[11px] text-slate-500 italic">" {payout.note} "</p>
                    </div>
                  )}

                  {payout.status === 'paid' && (
                    <div className="absolute -right-3 -bottom-3 text-emerald-500/10 rotate-12 pointer-events-none">
                      <CheckCircle2 className="w-16 h-16" strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="bg-white border-t border-slate-200 p-4 shrink-0 rounded-b-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Revenue</span>
              <span className="text-sm font-bold text-slate-900">₹{(selectedOrder?.total || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Payouts</span>
              <span className="text-sm font-bold text-red-500">-₹{totalPayouts.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#003366] uppercase tracking-widest">Net Profit</span>
              <span className="text-xl font-bold text-emerald-600">₹{netProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ADD PAYOUT MODAL */}
      {showAddPayoutModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Team Payout</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{selectedOrder.client}</p>
              </div>
              <button onClick={() => setShowAddPayoutModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPayout} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Team Member</label>
                  <select required value={newPayout.member_id} onChange={e => setNewPayout({...newPayout, member_id: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm bg-white cursor-pointer">
                    <option value="" disabled>Select member...</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Amount (₹)</label>
                  <input required type="number" min="0" value={newPayout.amount} onChange={e => setNewPayout({...newPayout, amount: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm" placeholder="e.g. 5000" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Date</label>
                    <input required type="date" value={newPayout.date} onChange={e => setNewPayout({...newPayout, date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Status</label>
                    <select required value={newPayout.status} onChange={e => setNewPayout({...newPayout, status: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm bg-white cursor-pointer">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Payment Screenshot (Optional)</label>
                  <label className={`w-full flex items-center gap-3 border ${paymentFile ? 'border-[#003366] bg-[#003366]/5' : 'border-slate-200 border-dashed hover:bg-slate-50'} rounded-xl px-4 py-3 cursor-pointer transition-colors`}>
                    <Upload className={`w-5 h-5 ${paymentFile ? 'text-[#003366]' : 'text-slate-400'}`} />
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${paymentFile ? 'text-[#003366]' : 'text-slate-600'}`}>
                        {paymentFile ? paymentFile.name : 'Upload Screenshot'}
                      </span>
                      {!paymentFile && <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          setPaymentFile(e.target.files[0]);
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Note (Optional)</label>
                  <textarea 
                    rows={2}
                    value={newPayout.note} 
                    onChange={e => setNewPayout({...newPayout, note: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm custom-scrollbar" 
                    placeholder="e.g. Travel allowance included" 
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <button type="submit" disabled={isSubmitting || teamMembers.length === 0} className="w-full bg-[#003366] text-white py-3.5 rounded-xl font-bold hover:bg-[#002244] transition-colors disabled:opacity-50 cursor-pointer">
                  {isSubmitting ? 'Saving...' : 'Save Payout'}
                </button>
                {teamMembers.length === 0 && (
                  <p className="text-xs text-red-500 text-center mt-2 font-medium">Please add team members in the Team tab first.</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
