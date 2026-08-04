import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Check, X, Loader2, Tag } from 'lucide-react';

type DiscountCoupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  is_active: boolean;
};

export default function Discounts() {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdding, setIsAdding] = useState(false);

  const [newCoupon, setNewCoupon] = useState<Partial<DiscountCoupon>>({ discount_type: 'percentage', is_active: true, discount_value: 0 });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.from('discount_coupons').select('*').order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      if (data) setCoupons(data as DiscountCoupon[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch coupons.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value) return;
    setIsSaving(true);
    try {
      const { data, error: insertError } = await supabase.from('discount_coupons').insert([{
        code: newCoupon.code.toUpperCase(),
        discount_type: newCoupon.discount_type,
        discount_value: newCoupon.discount_value,
        is_active: true
      }]).select();

      if (insertError) throw insertError;
      
      if (data) {
        setCoupons([data[0] as DiscountCoupon, ...coupons]);
        setIsAdding(false);
        setNewCoupon({ discount_type: 'percentage', is_active: true, discount_value: 0 });
      }
    } catch (err: any) {
      alert(`Failed to create coupon: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase.from('discount_coupons').update({ is_active: !currentStatus }).eq('id', id);
      if (updateError) throw updateError;
      setCoupons(coupons.map(coupon => coupon.id === id ? { ...coupon, is_active: !currentStatus } : coupon));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const { error: deleteError } = await supabase.from('discount_coupons').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setCoupons(coupons.filter(coupon => coupon.id !== id));
    } catch (err: any) {
      alert(`Failed to delete coupon: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Tag className="w-8 h-8 text-amber-500" />
          Discount Coupons
        </h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-amber-400 transition-colors"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Generate Coupon'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center justify-between mb-6">
          <span>{error}</span>
          <button onClick={fetchCoupons} className="underline text-sm hover:text-red-400">Retry</button>
        </div>
      )}

      {isAdding && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Generate New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Coupon Code</label>
              <input 
                type="text" 
                value={newCoupon.code || ''} 
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-amber-500 uppercase font-mono"
                placeholder="e.g. SUMMER20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Discount Type</label>
              <select 
                value={newCoupon.discount_type} 
                onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value as 'percentage' | 'flat'})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-amber-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Value</label>
              <input 
                type="number" 
                value={newCoupon.discount_value || ''} 
                onChange={e => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-amber-500"
                placeholder="e.g. 20"
              />
            </div>
          </div>
          <button 
            onClick={handleAddCoupon}
            className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Create Coupon
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className="bg-[#1a1a1a] rounded-xl border border-[#333] p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              
              <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                  <div className="font-mono text-xl font-bold text-white tracking-wider bg-black/50 px-3 py-1 rounded-md border border-white/10 inline-block mb-2">
                    {coupon.code}
                  </div>
                  <div className="text-sm text-gray-400">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}% OFF` 
                      : `₹${coupon.discount_value.toLocaleString('en-IN')} OFF`}
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteCoupon(coupon.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pl-2 border-t border-[#333] pt-4 mt-2">
                <button 
                  onClick={() => toggleActive(coupon.id, coupon.is_active)}
                  className={`flex items-center justify-center w-full gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    coupon.is_active 
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                      : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                  }`}
                >
                  {coupon.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {coupon.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}

          {coupons.length === 0 && (
            <div className="col-span-full bg-[#1a1a1a] border border-[#333] rounded-xl p-8 text-center text-gray-500">
              No discount coupons found. Create one above!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
