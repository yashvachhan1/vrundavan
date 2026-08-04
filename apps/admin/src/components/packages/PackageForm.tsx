import { useState, useCallback } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import type { NewBundledPackage } from './types';

interface PackageFormProps {
  onSave: (pkg: NewBundledPackage) => Promise<void>;
  onCancel: () => void;
}

export default function PackageForm({ onSave, onCancel }: PackageFormProps) {
  const [newPackage, setNewPackage] = useState<NewBundledPackage>({
    name: '',
    price: '',
    period: '',
    description: '',
    features: [''],
    is_popular: false,
    badge_text: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFeatureChange = useCallback((index: number, value: string) => {
    setNewPackage(prev => {
      const newFeatures = [...(prev.features || [])];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  }, []);

  const addFeatureInput = useCallback(() => {
    setNewPackage(prev => ({ ...prev, features: [...(prev.features || []), ''] }));
  }, []);

  const removeFeatureInput = useCallback((index: number) => {
    setNewPackage(prev => {
      const newFeatures = [...(prev.features || [])];
      newFeatures.splice(index, 1);
      return { ...prev, features: newFeatures };
    });
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!newPackage.name || !newPackage.price || !newPackage.period) {
      setError("Name, price, and period are required.");
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(newPackage);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Package</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Package Name *</label>
          <input 
            type="text" 
            value={newPackage.name} 
            onChange={e => setNewPackage({...newPackage, name: e.target.value})}
            className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-white"
            placeholder="e.g. Pre-Wedding Poetics"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Price *</label>
          <input 
            type="text" 
            value={newPackage.price} 
            onChange={e => setNewPackage({...newPackage, price: e.target.value})}
            className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-white"
            placeholder="e.g. ₹55,000"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Period / Unit *</label>
          <input 
            type="text" 
            value={newPackage.period} 
            onChange={e => setNewPackage({...newPackage, period: e.target.value})}
            className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-white"
            placeholder="e.g. per shoot"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs text-gray-400 mb-1">Description (Short Subtitle)</label>
          <input 
            type="text" 
            value={newPackage.description} 
            onChange={e => setNewPackage({...newPackage, description: e.target.value})}
            className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-white"
            placeholder="Capturing candid coupling stories..."
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Features Included</label>
        <div className="space-y-2">
          {(newPackage.features || []).map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input 
                type="text" 
                value={feature} 
                onChange={e => handleFeatureChange(index, e.target.value)}
                className="flex-1 bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-white"
                placeholder={`Feature ${index + 1}`}
              />
              <button 
                onClick={() => removeFeatureInput(index)}
                className="px-3 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={addFeatureInput}
            className="text-xs text-[#003366] font-bold bg-white px-3 py-1.5 rounded-lg hover:bg-gray-200 mt-2"
          >
            + Add Another Feature
          </button>
        </div>
      </div>

      <div className="flex gap-6 mb-6 bg-black p-4 rounded-lg border border-[#333]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={newPackage.is_popular} 
            onChange={e => setNewPackage({...newPackage, is_popular: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Highlight as Popular
          </span>
        </label>
        {newPackage.is_popular && (
          <input 
            type="text" 
            value={newPackage.badge_text || ''} 
            onChange={e => setNewPackage({...newPackage, badge_text: e.target.value})}
            className="bg-[#1a1a1a] border border-[#333] rounded p-1.5 text-xs text-white outline-none w-40"
            placeholder="Badge Text (e.g. Most Chosen)"
          />
        )}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isSaving ? 'Saving...' : 'Save Package'}
      </button>
    </div>
  );
}
