import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  IndianRupee, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Loader2, 
  Sliders, 
  Calculator, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

export interface AdvanceRule {
  id: string;
  min_amount: number;
  max_amount: number | null;
  advance_amount: number;
  label: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

const DEFAULT_STANDARD_RULES: AdvanceRule[] = [
  {
    id: 'rule-std-50k',
    min_amount: 0,
    max_amount: 99999,
    advance_amount: 5000,
    label: 'Standard Plan (< ₹1,00,000)',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'rule-grand-100k',
    min_amount: 100000,
    max_amount: null,
    advance_amount: 10000,
    label: 'Grand Event (≥ ₹1,00,000)',
    is_active: true,
    sort_order: 2
  }
];

const frontendUrl = import.meta.env.VITE_FRONTEND_URL || '';
const defaultFrontend = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://vrundavan-two.vercel.app'
  : 'http://localhost:3000';
const API_BASE = frontendUrl 
  ? `${frontendUrl}/api/advance-rules` 
  : `${defaultFrontend}/api/advance-rules`;

export default function AdvanceRules() {
  const [rules, setRules] = useState<AdvanceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    min_amount: 0,
    max_amount: '' as string | number,
    advance_amount: 5000,
    is_active: true
  });

  // Simulator state
  const [testAmount, setTestAmount] = useState<number>(50000);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    let loadedRules: AdvanceRule[] = [];

    // 1. Try local API first (Next.js server)
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          loadedRules = data;
        }
      }
    } catch {
      // API may be unavailable, fall back to Supabase or LocalStorage
    }

    // 2. Try Supabase if API returned empty
    if (loadedRules.length === 0 && supabase) {
      try {
        const { data, error: sbError } = await supabase
          .from('custom_plan_advance_rules')
          .select('*')
          .order('min_amount', { ascending: true });
        if (data && data.length > 0 && !sbError) {
          loadedRules = data as AdvanceRule[];
        }
      } catch {
        // Supabase offline
      }
    }

    // 3. Fallback to localStorage or defaults
    if (loadedRules.length === 0) {
      const local = localStorage.getItem('vrundavan_advance_rules');
      if (local) {
        try {
          loadedRules = JSON.parse(local);
        } catch {
          loadedRules = DEFAULT_STANDARD_RULES;
        }
      } else {
        loadedRules = DEFAULT_STANDARD_RULES;
      }
    }

    loadedRules.sort((a, b) => (Number(a.min_amount) || 0) - (Number(b.min_amount) || 0));
    setRules(loadedRules);
    localStorage.setItem('vrundavan_advance_rules', JSON.stringify(loadedRules));
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingRuleId(null);
    setFormData({
      label: '',
      min_amount: rules.length > 0 ? (Number(rules[rules.length - 1].max_amount || rules[rules.length - 1].min_amount) + 1) : 0,
      max_amount: '',
      advance_amount: 5000,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: AdvanceRule) => {
    setEditingRuleId(rule.id);
    setFormData({
      label: rule.label,
      min_amount: rule.min_amount,
      max_amount: rule.max_amount !== null && rule.max_amount !== undefined ? rule.max_amount : '',
      advance_amount: rule.advance_amount,
      is_active: rule.is_active
    });
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const minAmount = Number(formData.min_amount) || 0;
    const maxAmount = formData.max_amount !== '' && formData.max_amount !== null 
      ? Number(formData.max_amount) 
      : null;
    const advanceAmount = Number(formData.advance_amount) || 0;
    const label = formData.label.trim() || (maxAmount ? `Orders up to ₹${maxAmount.toLocaleString('en-IN')}` : `Orders ₹${minAmount.toLocaleString('en-IN')}+`);

    const payload = {
      min_amount: minAmount,
      max_amount: maxAmount,
      advance_amount: advanceAmount,
      label,
      is_active: formData.is_active
    };

    try {
      if (editingRuleId) {
        // Edit existing
        let updated: AdvanceRule | null = null;
        try {
          const res = await fetch(API_BASE, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingRuleId, ...payload })
          });
          if (res.ok) {
            updated = await res.json();
          }
        } catch {
          // Fallback to direct supabase / local
        }

        if (!updated && supabase) {
          try {
            const { data } = await supabase
              .from('custom_plan_advance_rules')
              .update(payload)
              .eq('id', editingRuleId)
              .select();
            if (data && data[0]) updated = data[0] as AdvanceRule;
          } catch {
            // Ignore
          }
        }

        const nextRules = rules.map(r => r.id === editingRuleId ? (updated || { ...r, ...payload }) : r);
        nextRules.sort((a, b) => (Number(a.min_amount) || 0) - (Number(b.min_amount) || 0));
        setRules(nextRules);
        localStorage.setItem('vrundavan_advance_rules', JSON.stringify(nextRules));
      } else {
        // Create new
        const newId = 'rule_' + Math.random().toString(36).substring(2, 9);
        let created: AdvanceRule | null = null;
        try {
          const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId, ...payload })
          });
          if (res.ok) {
            created = await res.json();
          }
        } catch {
          // Fallback
        }

        if (!created && supabase) {
          try {
            const { data } = await supabase
              .from('custom_plan_advance_rules')
              .insert([{ id: newId, ...payload }])
              .select();
            if (data && data[0]) created = data[0] as AdvanceRule;
          } catch {
            // Ignore
          }
        }

        const nextRules = [...rules, created || { id: newId, ...payload, sort_order: rules.length + 1 }];
        nextRules.sort((a, b) => (Number(a.min_amount) || 0) - (Number(b.min_amount) || 0));
        setRules(nextRules);
        localStorage.setItem('vrundavan_advance_rules', JSON.stringify(nextRules));
      }

      setSaveSuccess('Advance limit rule saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save rule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this advance rule?')) return;
    try {
      try {
        await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' });
      } catch {
        // Fallback
      }
      if (supabase) {
        try {
          await supabase.from('custom_plan_advance_rules').delete().eq('id', id);
        } catch {
          // Ignore
        }
      }
      const nextRules = rules.filter(r => r.id !== id);
      setRules(nextRules);
      localStorage.setItem('vrundavan_advance_rules', JSON.stringify(nextRules));
      setSaveSuccess('Rule deleted successfully');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete rule');
    }
  };

  const handleToggleActive = useCallback(async (rule: AdvanceRule) => {
    const nextStatus = !rule.is_active;
    try {
      try {
        await fetch(API_BASE, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: rule.id, is_active: nextStatus })
        });
      } catch {
        // Fallback
      }
      if (supabase) {
        try {
          await supabase.from('custom_plan_advance_rules').update({ is_active: nextStatus }).eq('id', rule.id);
        } catch {
          // Ignore
        }
      }
      const nextRules = rules.map(r => r.id === rule.id ? { ...r, is_active: nextStatus } : r);
      setRules(nextRules);
      localStorage.setItem('vrundavan_advance_rules', JSON.stringify(nextRules));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  }, [rules]);

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all advance rules to the standard 50k (₹5,000) and 100k (₹10,000) limits?')) return;
    setLoading(true);
    try {
      // Clear and re-populate
      for (const rule of rules) {
        try {
          await fetch(`${API_BASE}?id=${rule.id}`, { method: 'DELETE' });
        } catch {}
      }
      for (const def of DEFAULT_STANDARD_RULES) {
        try {
          await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(def)
          });
        } catch {}
      }
      setRules(DEFAULT_STANDARD_RULES);
      localStorage.setItem('vrundavan_advance_rules', JSON.stringify(DEFAULT_STANDARD_RULES));
      setSaveSuccess('Reset to standard 5k & 10k limits complete!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset rules');
    } finally {
      setLoading(false);
    }
  };

  // Simulator calculation
  const simulatedMatch = useMemo(() => {
    const activeRules = rules.filter(r => r.is_active);
    if (activeRules.length === 0) {
      const fallbackAdvance = testAmount >= 100000 ? 10000 : 5000;
      return {
        rule: null,
        advance: fallbackAdvance,
        balance: Math.max(0, testAmount - fallbackAdvance),
        label: testAmount >= 100000 ? 'Default Grand Event (≥ ₹1L)' : 'Default Standard Plan (< ₹1L)'
      };
    }

    // Sort descending by min_amount to find highest threshold first
    const sorted = [...activeRules].sort((a, b) => (Number(b.min_amount) || 0) - (Number(a.min_amount) || 0));

    for (const rule of sorted) {
      const min = Number(rule.min_amount) || 0;
      const max = typeof rule.max_amount === 'number' && !isNaN(rule.max_amount)
        ? Number(rule.max_amount)
        : Infinity;
      if (testAmount >= min && testAmount <= max) {
        const adv = Number(rule.advance_amount);
        return {
          rule,
          advance: adv,
          balance: Math.max(0, testAmount - adv),
          label: rule.label
        };
      }
    }

    const fallbackRule = sorted.find(r => testAmount >= (Number(r.min_amount) || 0)) || sorted[sorted.length - 1];
    const adv = Number(fallbackRule.advance_amount);
    return {
      rule: fallbackRule,
      advance: adv,
      balance: Math.max(0, testAmount - adv),
      label: fallbackRule.label
    };
  }, [testAmount, rules]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Advance Payment Limits
                <span className="text-xs bg-blue-100 text-[#003366] font-semibold px-2.5 py-0.5 rounded-full">
                  Custom Package
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Manage token advance amounts for client bookings (e.g. 50k order → ₹5,000 advance, 100k order → ₹10,000 advance).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-all"
            title="Reset to 5k and 10k standard defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Slab Limit
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchRules} className="text-xs font-bold underline hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Interactive Simulator / Live Calculator */}
      <div className="bg-gradient-to-br from-slate-900 to-[#001f3f] text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Live Advance Rule Simulator</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Test how client orders are charged in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs text-slate-300 font-medium">Enter Test Package Total Amount (₹):</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={testAmount || ''}
                onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
                placeholder="e.g. 50000 or 100000"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white font-mono text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex gap-2 pt-1">
              {[25000, 50000, 75000, 100000, 150000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTestAmount(amt)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${
                    testAmount === amt 
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  ₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Applicable Rule</span>
              <p className="text-sm font-bold text-amber-300 flex items-center gap-1.5 justify-center md:justify-start">
                <Sparkles className="w-3.5 h-3.5" />
                {simulatedMatch.label}
              </p>
            </div>

            <div className="h-px md:h-10 w-full md:w-px bg-white/10" />

            <div className="text-center md:text-right">
              <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">Advance Required</span>
              <p className="text-2xl font-serif font-bold text-white">
                ₹{simulatedMatch.advance.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Balance at shoot: ₹{simulatedMatch.balance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Slabs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#003366]" />
            Active Slabs &amp; Limits ({rules.length})
          </h2>
          <span className="text-xs text-slate-500">Evaluated in ascending order of minimum amount</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Advance Limit Slabs Configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Reset Defaults&quot; or &quot;Add Slab Limit&quot; to configure your 50k and 100k advance limits.
            </p>
            <button
              onClick={handleResetDefaults}
              className="mt-2 text-xs font-bold text-white bg-[#003366] px-4 py-2 rounded-xl"
            >
              Load Default Limits (5k &amp; 10k)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule, idx) => {
              const minFormatted = `₹${(Number(rule.min_amount) || 0).toLocaleString('en-IN')}`;
              const maxFormatted = typeof rule.max_amount === 'number' && !isNaN(rule.max_amount)
                ? `₹${Number(rule.max_amount).toLocaleString('en-IN')}`
                : 'No Upper Limit (Unlimited)';

              return (
                <div
                  key={rule.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                    rule.is_active ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base leading-snug">{rule.label}</h4>
                        <span className="text-[11px] font-mono text-slate-400">ID: {rule.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-1.5 text-slate-400 hover:text-[#003366] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit slab"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete slab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Range and Advance details */}
                  <div className="bg-slate-50 rounded-xl p-3.5 mb-4 grid grid-cols-2 gap-3 border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Package Total Range</span>
                      <p className="text-xs font-semibold text-slate-800">
                        {minFormatted} <span className="text-slate-400 font-normal">to</span> {maxFormatted}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Advance Payment</span>
                      <p className="text-base font-serif font-bold text-emerald-600">
                        ₹{(Number(rule.advance_amount) || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Toggle Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      {rule.is_active ? 'Active on client booking' : 'Currently disabled'}
                    </span>
                    <button
                      onClick={() => handleToggleActive(rule)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all ${
                        rule.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {rule.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {rule.is_active ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRuleId ? 'Edit Advance Payment Slab' : 'Add New Advance Payment Slab'}
                </h3>
                <p className="text-xs text-slate-500">Set order amount range and required advance token.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Slab Label / Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Standard Plan (< ₹1,00,000) or Grand Event (≥ ₹1L)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Order Total (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: Number(e.target.value) })}
                    placeholder="e.g. 0 or 100000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Starting order amount</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Order Total (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                    placeholder="Blank for unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Leave blank for &quot;and above&quot;</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  Required Advance Token Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.advance_amount}
                  onChange={(e) => setFormData({ ...formData, advance_amount: Number(e.target.value) })}
                  placeholder="e.g. 5000 or 10000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 font-mono text-base font-bold text-emerald-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  Amount client must transfer via UPI to confirm booking.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ruleActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#003366] rounded focus:ring-0"
                />
                <label htmlFor="ruleActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Activate this rule immediately for client bookings
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-md transition-all disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingRuleId ? 'Update Slab' : 'Create Slab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
