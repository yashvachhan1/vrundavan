import { useState, useEffect } from 'react';
import { Edit2, Phone, Camera, User, Calendar as CalendarIcon, History, Plus, ArrowLeft, Filter, X, Video, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const iconMap: Record<string, any> = {
  Camera: Camera,
  User: User,
  Video: Video
};

export default function Team() {
  const [team, setTeam] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  const [newMember, setNewMember] = useState({ name: '', role: '', phone: '', icon: 'Camera' });
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // History Filters
  const [filterMember, setFilterMember] = useState('All Members');
  const [filterTimeframe, setFilterTimeframe] = useState('All Time');



  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [membersRes, payoutsRes, rolesRes] = await Promise.all([
      supabase.from('team_members').select('*').order('created_at', { ascending: true }),
      supabase.from('team_payouts').select('*').order('created_at', { ascending: false }),
      supabase.from('team_roles').select('*').order('created_at', { ascending: true })
    ]);
    
    if (membersRes.data) setTeam(membersRes.data);
    if (payoutsRes.data) setPayouts(payoutsRes.data);
    if (rolesRes.data) setRoles(rolesRes.data);
    setIsLoading(false);
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from('team_members').insert([newMember]).select();
    if (error) {
      alert("Error adding member: " + error.message);
    } else if (data) {
      setTeam([...team, data[0]]);
      setShowAddModal(false);
      setNewMember({ name: '', role: '', phone: '', icon: 'Camera' });
    }
    setIsSubmitting(false);
  }

  async function handleAddRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const { data, error } = await supabase.from('team_roles').insert([{ name: newRoleName.trim() }]).select();
    if (!error && data) {
      setRoles([...roles, data[0]]);
      setNewRoleName('');
    }
  }

  async function handleDeleteRole(id: string) {
    const { error } = await supabase.from('team_roles').delete().eq('id', id);
    if (!error) {
      setRoles(roles.filter(r => r.id !== id));
    }
  }

  // Flatten all payouts for the history view
  const allPayouts = payouts.map(p => {
    const member = team.find(m => m.id === p.member_id);
    return {
      ...p,
      memberName: member?.name || 'Unknown',
      memberRole: member?.role || 'Unknown'
    };
  });

  // Apply filters
  const filteredPayouts = allPayouts.filter(record => {
    if (filterMember !== 'All Members' && record.memberName !== filterMember) return false;
    if (filterTimeframe === 'This Month (Aug 2026)' && !record.date.includes('Aug')) return false;
    if (filterTimeframe === 'Last Month (Jul 2026)' && !record.date.includes('Jul')) return false;
    if (filterTimeframe === 'This Year (2026)' && !record.date.includes('2026')) return false;
    return true;
  });

  const totalFilteredPaid = filteredPayouts.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0);
  const totalFilteredPending = filteredPayouts.filter(r => r.status === 'pending').reduce((sum, r) => sum + Number(r.amount), 0);

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

              <button onClick={() => setIsHistoryView(false)} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Team
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowRolesModal(true)} className="flex items-center gap-2 bg-slate-100 text-[#003366] px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-200 transition-colors">
                <Settings className="w-4 h-4" /> Manage Roles
              </button>
              <button onClick={() => setIsHistoryView(true)} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-100 transition-colors">
                <History className="w-4 h-4" /> Payout History
              </button>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#003366] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#002244] transition-colors">
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">Loading Team Data...</div>
        ) : !isHistoryView ? (
          /* TEAM DIRECTORY VIEW */
          <div className="overflow-y-auto custom-scrollbar pr-2 pb-4">
            {team.length === 0 ? (
               <div className="text-center py-20 text-slate-400 font-bold">No members found. Click Add Member to get started.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {team.map((member) => {
                  const Icon = iconMap[member.icon] || User;
                  const memberPayouts = payouts.filter(p => p.member_id === member.id);
                  const memberPaid = memberPayouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
                  const memberPending = memberPayouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);

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
                      
                      <div className="mb-6 grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paid</p>
                          <p className="font-bold text-emerald-600">₹{memberPaid.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pending</p>
                          <p className="font-bold text-orange-500">₹{memberPending.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-white px-3 py-2 rounded-lg border border-slate-200 w-fit">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {member.phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                          ₹{Number(record.amount).toLocaleString('en-IN')}
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

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add New Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                  <input required type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm" placeholder="e.g. Aman Gupta" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Role</label>
                    {isCustomRole && (
                      <button type="button" onClick={() => { setIsCustomRole(false); setNewMember({...newMember, role: roles[0]?.name || ''}); }} className="text-[10px] font-bold text-[#003366] hover:underline uppercase tracking-wider">
                        Choose Existing
                      </button>
                    )}
                  </div>
                  
                  {!isCustomRole && roles.length > 0 ? (
                    <select 
                      required 
                      value={newMember.role} 
                      onChange={e => {
                        if (e.target.value === 'ADD_NEW') {
                          setIsCustomRole(true);
                          setNewMember({...newMember, role: ''});
                        } else {
                          setNewMember({...newMember, role: e.target.value});
                        }
                      }} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm bg-white"
                    >
                      <option value="" disabled>Select a role...</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                      ))}
                      <option value="ADD_NEW" className="font-bold text-[#003366]">+ Add New Role...</option>
                    </select>
                  ) : (
                    <input 
                      required 
                      type="text" 
                      value={newMember.role} 
                      onChange={e => setNewMember({...newMember, role: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm" 
                      placeholder="e.g. Drone Operator" 
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                  <input type="text" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] text-sm" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Icon</label>
                  <div className="flex gap-3 mt-2">
                    {['Camera', 'User', 'Video'].map(icon => (
                      <div 
                        key={icon} 
                        onClick={() => setNewMember({...newMember, icon})}
                        className={`px-4 py-2 border rounded-xl cursor-pointer text-sm font-bold flex items-center gap-2 transition-all ${newMember.icon === icon ? 'border-[#003366] bg-[#003366]/5 text-[#003366]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#003366] text-white py-3.5 rounded-xl font-bold hover:bg-[#002244] transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Adding Member...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MANAGE ROLES MODAL */}
      {showRolesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Manage Roles</h2>
              <button onClick={() => setShowRolesModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="space-y-3">
                {roles.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">No roles defined yet.</p>
                ) : (
                  roles.map(role => (
                    <div key={role.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <span className="text-sm font-medium text-slate-700">{role.name}</span>
                      <button 
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50">
              <form onSubmit={handleAddRole} className="flex gap-3">
                <input 
                  type="text" 
                  value={newRoleName} 
                  onChange={e => setNewRoleName(e.target.value)} 
                  placeholder="New role name..." 
                  className="flex-grow border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#003366] text-sm bg-white"
                />
                <button 
                  type="submit"
                  disabled={!newRoleName.trim()}
                  className="bg-[#003366] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002244] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  Add Role
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
