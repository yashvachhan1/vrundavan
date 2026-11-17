import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DEFAULT_MOCK_PLAN_ITEMS } from '../lib/mockData';
import { Plus, Trash2, Check, X, Loader2, Camera, Video, MonitorPlay, Box, IndianRupee, ArrowRight } from 'lucide-react';

type PlanItemType = 'event' | 'service' | 'addon';
type IconType = 'camera' | 'video' | 'drone';

type PlanItem = {
  id: string;
  type: PlanItemType;
  name: string;
  price: number;
  description: string;
  icon: IconType;
  active: boolean;
};

export default function CustomPlanItems() {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newItem, setNewItem] = useState<Partial<PlanItem>>({
    type: 'event',
    icon: 'camera',
    active: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    let loaded: PlanItem[] = [];
    try {
      const { data, error: fetchError } = await supabase
        .from('custom_plan_items')
        .select('*')
        .order('type', { ascending: true })
        .order('created_at', { ascending: false });
        
      if (!fetchError && data && data.length > 0) {
        loaded = data as PlanItem[];
      }
    } catch {
      // Supabase offline
    }

    if (loaded.length === 0) {
      const local = localStorage.getItem('vrundavan_custom_plan_items');
      loaded = local ? JSON.parse(local) : (DEFAULT_MOCK_PLAN_ITEMS as any);
      localStorage.setItem('vrundavan_custom_plan_items', JSON.stringify(loaded));
    }

    setItems(loaded);
    setLoading(false);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    setIsSaving(true);
    try {
      const { data, error: insertError } = await supabase.from('custom_plan_items').insert([{
        type: newItem.type,
        name: newItem.name,
        price: newItem.price,
        description: newItem.description || '',
        icon: newItem.icon,
        active: true
      }]).select();

      if (insertError) throw insertError;
      
      if (data) {
        setItems([data[0] as PlanItem, ...items]);
        setIsAdding(false);
        setNewItem({ type: 'event', icon: 'camera', active: true });
      }
    } catch (err: any) {
      alert(`Failed to create item: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase.from('custom_plan_items').update({ active: !currentStatus }).eq('id', id);
      if (updateError) throw updateError;
      setItems(prev => prev.map(item => item.id === id ? { ...item, active: !currentStatus } : item));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const { error: deleteError } = await supabase.from('custom_plan_items').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(`Failed to delete item: ${err.message}`);
    }
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'drone': return <MonitorPlay className="w-5 h-5 text-purple-500" />;
      default: return <Camera className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Box className="w-8 h-8 text-indigo-500" />
          Plan Builder Items
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/advance-rules"
            className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#002244] transition-colors text-sm"
          >
            <IndianRupee className="w-4 h-4" />
            Advance Limits (50k / 100k)
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-400 transition-colors"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? 'Cancel' : 'Add Item'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center justify-between mb-6">
          <span>{error}</span>
          <button onClick={fetchItems} className="underline text-sm hover:text-red-400">Retry</button>
        </div>
      )}

      {isAdding && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select 
                value={newItem.type} 
                onChange={e => setNewItem({...newItem, type: e.target.value as PlanItemType})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-indigo-500"
              >
                <option value="event">Event (e.g. Haldi)</option>
                <option value="service">Service (e.g. Candid Photo)</option>
                <option value="addon">Add-on (e.g. Drone)</option>
              </select>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input 
                type="text" 
                value={newItem.name || ''} 
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                placeholder="e.g. Candid Photography"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price (₹)</label>
              <input 
                type="number" 
                value={newItem.price || ''} 
                onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                placeholder="e.g. 15000"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <input 
                type="text" 
                value={newItem.description || ''} 
                onChange={e => setNewItem({...newItem, description: e.target.value})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                placeholder="Brief description of the item"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Icon</label>
              <select 
                value={newItem.icon} 
                onChange={e => setNewItem({...newItem, icon: e.target.value as IconType})}
                className="w-full bg-black border border-[#333] rounded-lg p-2 text-white outline-none focus:border-indigo-500"
              >
                <option value="camera">Camera</option>
                <option value="video">Video</option>
                <option value="drone">Drone</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleAddItem}
            disabled={isSaving}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Item
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className={`bg-[#1a1a1a] rounded-xl border ${item.active ? 'border-[#333]' : 'border-red-900/30 opacity-60'} p-5 flex flex-col group`}>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black rounded-lg border border-[#333]">
                    {getIconComponent(item.icon)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{item.type}</span>
                    <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-gray-400 mb-4 flex-1">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#333]">
                <span className="font-serif text-xl font-bold text-white">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
                
                <button 
                  onClick={() => toggleActive(item.id, item.active)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    item.active 
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                      : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  }`}
                >
                  {item.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {item.active ? 'Active' : 'Hidden'}
                </button>
              </div>
            </div>
          ))}
          {!error && items.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-[#333] rounded-xl">
               No plan items found.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
