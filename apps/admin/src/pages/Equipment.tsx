import { useState } from 'react';
import { Camera, Search, Plus, MapPin } from 'lucide-react';

const mockInventory = [
  { id: 'EQ-001', name: 'Sony A7S III', type: 'Camera', status: 'assigned', assignedTo: 'Rahul S.', location: 'Delhi Shoot', condition: 'excellent' },
  { id: 'EQ-002', name: 'Sony 24-70mm f/2.8 GM', type: 'Lens', status: 'assigned', assignedTo: 'Rahul S.', location: 'Delhi Shoot', condition: 'excellent' },
  { id: 'EQ-003', name: 'DJI Mavic 3 Pro', type: 'Drone', status: 'available', assignedTo: null, location: 'Studio Storage', condition: 'good' },
  { id: 'EQ-004', name: 'Canon R5', type: 'Camera', status: 'maintenance', assignedTo: null, location: 'Service Center', condition: 'repair' },
];

export default function Equipment() {
  const [inventory] = useState(mockInventory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'assigned': return 'bg-[#003366]/10 text-[#003366] border-[#003366]/20';
      case 'maintenance': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Equipment Manager</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Track your cameras, lenses, and drones so you never double-book gear.</p>
        </div>
        <button className="bg-[#003366] hover:bg-[#002244] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#003366]/20 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" strokeWidth={3} />
          Add Equipment
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {/* Filters/Search */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search gear..." 
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all font-medium text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 outline-none font-bold text-sm">
              <option>All Types</option>
              <option>Cameras</option>
              <option>Lenses</option>
              <option>Drones</option>
            </select>
            <select className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 outline-none font-bold text-sm">
              <option>All Status</option>
              <option>Available</option>
              <option>Assigned</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>

        {/* Inventory List */}
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-6 py-4">Equipment Details</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Current Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group bg-white">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm text-gray-600">{item.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#003366]/10 text-[#003366] text-[10px] font-bold flex items-center justify-center">
                          {item.assignedTo.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-sm text-gray-700">{item.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {item.location}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
