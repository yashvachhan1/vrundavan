import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, Loader2, Package as PackageIcon } from 'lucide-react';
import type { BundledPackage, NewBundledPackage } from '../components/packages/types';
import PackageCard from '../components/packages/PackageCard';
import PackageForm from '../components/packages/PackageForm';

export default function Packages() {
  const [packages, setPackages] = useState<BundledPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('bundled_packages')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (fetchError) throw fetchError;
      if (data) setPackages(data as BundledPackage[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (newPackage: NewBundledPackage) => {
    // Filter out empty features
    const cleanFeatures = (newPackage.features || []).filter(f => f.trim() !== '');
    
    const { data, error: insertError } = await supabase.from('bundled_packages').insert([{
      name: newPackage.name,
      price: newPackage.price,
      period: newPackage.period,
      description: newPackage.description || '',
      features: cleanFeatures,
      is_popular: newPackage.is_popular,
      badge_text: newPackage.badge_text || null,
      active: true
    }]).select();

    if (insertError) throw insertError;
    
    if (data) {
      setPackages(prev => [...prev, data[0] as BundledPackage]);
      setIsAdding(false);
    }
  };

  const toggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase.from('bundled_packages').update({ active: !currentStatus }).eq('id', id);
      if (updateError) throw updateError;
      
      setPackages(prev => prev.map(pkg => pkg.id === id ? { ...pkg, active: !currentStatus } : pkg));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  }, []);

  const deletePackage = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bundled package?")) return;
    
    try {
      const { error: deleteError } = await supabase.from('bundled_packages').delete().eq('id', id);
      if (deleteError) throw deleteError;
      
      setPackages(prev => prev.filter(pkg => pkg.id !== id));
    } catch (err: any) {
      alert(`Failed to delete package: ${err.message}`);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <PackageIcon className="w-8 h-8 text-[#003366]" />
          Predefined Bundled Packages
        </h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#002244] transition-colors"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Create Package'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPackages} className="underline text-sm hover:text-red-400">Retry</button>
        </div>
      )}

      {isAdding && (
        <PackageForm onSave={handleAddPackage} onCancel={() => setIsAdding(false)} />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <PackageCard 
              key={pkg.id} 
              pkg={pkg} 
              onDelete={deletePackage} 
              onToggleActive={toggleActive} 
            />
          ))}
          {!error && packages.length === 0 && (
            <div className="col-span-full bg-[#1a1a1a] border border-[#333] rounded-xl p-8 text-center text-gray-500">
              No bundled packages found. Create one above!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
