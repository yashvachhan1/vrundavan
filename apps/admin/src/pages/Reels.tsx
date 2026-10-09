import { useState, useEffect } from 'react';
import { Plus, Trash2, Clapperboard } from 'lucide-react';

interface Reel {
  id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export default function Reels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The frontend runs on 3000 in dev
  const API_URL = 'http://localhost:3000/api/reels';

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setReels(data.sort((a: Reel, b: Reel) => a.sort_order - b.sort_order));
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl.trim() }),
      });
      if (res.ok) {
        const addedReel = await res.json();
        setReels([...reels, addedReel]);
        setNewUrl('');
      } else {
        alert('Failed to add reel.');
      }
    } catch (error) {
      console.error('Error adding reel:', error);
      alert('Failed to add reel.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this reel?')) return;
    
    try {
      const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReels(reels.filter(r => r.id !== id));
      } else {
        alert('Failed to delete reel.');
      }
    } catch (error) {
      console.error('Error deleting reel:', error);
      alert('Failed to delete reel.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instagram Reels</h1>
          <p className="text-gray-500 mt-1">Manage the Instagram reels displayed on the landing page</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Reel</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] transition-all"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#003366] text-white px-6 py-2 rounded-xl hover:bg-[#002244] transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Reel
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reels...</div>
        ) : reels.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reels found. Add one above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reels.map((reel) => (
              <div key={reel.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                    <Clapperboard className="w-5 h-5" />
                  </div>
                  <div>
                    <a href={reel.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#003366] hover:underline">
                      {reel.url}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(reel.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
