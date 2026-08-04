import React, { memo } from 'react';
import { Trash2, Check, X, CheckCircle2 } from 'lucide-react';
import type { BundledPackage } from './types';

interface PackageCardProps {
  pkg: BundledPackage;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onDelete, onToggleActive }) => {
  return (
    <div className={`bg-[#1a1a1a] rounded-xl border ${pkg.is_popular ? 'border-amber-500/50' : 'border-[#333]'} p-6 relative flex flex-col`}>
      {pkg.is_popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-400 text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
          {pkg.badge_text || 'Popular'}
        </div>
      )}

      <div className="flex justify-between items-start mb-2 mt-2">
        <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
        <button 
          onClick={() => onDelete(pkg.id)}
          className="text-gray-600 hover:text-red-400 transition-colors"
          title="Delete Package"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-3xl font-serif text-white mb-1">
        {pkg.price}
        <span className="text-sm font-sans text-gray-500 ml-2">/{pkg.period}</span>
      </div>
      
      <p className="text-sm text-gray-400 mb-6">{pkg.description}</p>
      
      <div className="space-y-3 mb-6 flex-1">
        {pkg.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[#333]">
        <button 
          onClick={() => onToggleActive(pkg.id, pkg.active)}
          className={`flex items-center justify-center w-full gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            pkg.active 
              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
              : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
          }`}
        >
          {pkg.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {pkg.active ? 'Active on Website' : 'Hidden'}
        </button>
      </div>
    </div>
  );
};

export default memo(PackageCard);
