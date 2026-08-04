import { useState } from 'react';
import { FileText, Plus, Trash2, Link as LinkIcon, Send, Copy, CheckCircle2 } from 'lucide-react';

export default function Quotations() {
  const [clientName, setClientName] = useState('');
  const [lineItems, setLineItems] = useState([
    { id: 1, name: '2-Day Wedding Coverage (Photo & Video)', price: 150000 },
    { id: 2, name: 'Pre-Wedding Cinematic Shoot', price: 35000 },
  ]);
  const [isGenerated, setIsGenerated] = useState(false);

  const addItem = () => {
    setLineItems([...lineItems, { id: Date.now(), name: '', price: 0 }]);
  };

  const removeItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: 'name' | 'price', value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const total = lineItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col font-sans" style={{ fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>Quotation Builder</h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">Create beautiful, interactive proposals to send to your clients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Builder Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Client Details</h2>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Client Name</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rahul & Sneha"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all font-medium"
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Package Details</h2>
              <button onClick={addItem} className="text-[#003366] hover:bg-[#003366]/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                <Plus className="w-4 h-4" strokeWidth={3} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Service Name (e.g. Drone Add-on)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all font-medium text-sm"
                    />
                  </div>
                  <div className="w-40 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <input 
                      type="number" 
                      value={item.price || ''}
                      onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all font-medium text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Total Quote</span>
              <span className="text-3xl font-bold text-[#003366]">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-[#003366] text-white p-8 rounded-3xl shadow-xl shadow-[#003366]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <FileText className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Ready to send?</h2>
              <p className="text-[#003366] text-blue-100 text-sm mb-8 font-medium">This will generate a secret, beautiful webpage that your client can view to accept the quote.</p>
              
              {!isGenerated ? (
                <button 
                  onClick={() => setIsGenerated(true)}
                  className="w-full bg-white text-[#003366] hover:bg-gray-50 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" strokeWidth={3} />
                  Generate Proposal Link
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-white/10 border border-white/20 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs font-mono text-white/80 truncate pr-4">vrundavan.com/quote/xyz89...</span>
                    <button className="p-2 bg-white text-[#003366] rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" strokeWidth={3} />
                    Send via WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Tip */}
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm mb-1">Premium Client Experience</h4>
                <p className="text-emerald-700 text-xs font-medium leading-relaxed">
                  When clients open this link, they will see a luxury presentation of your work alongside the quote, drastically increasing booking rates.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
