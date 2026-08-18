import React from 'react';
import { Check } from 'lucide-react';

export default function FilterGroup({ title, options, selectedValues, onToggle }) {
  return (
    <div className="border-b border-white/10 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      <h3 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-4">{title}</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option);
          return (
            <label 
              key={option || index} 
              className="group flex items-center gap-3 cursor-pointer select-none"
            >
              <input 
                type="checkbox" 
                className="sr-only"
                checked={isSelected} 
                onChange={() => onToggle(option)} 
              />
              <div className={`w-4 h-4 border flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-[#b58b38] bg-[#b58b38]' : 'border-white/20 group-hover:border-[#b58b38]/50'}`}>
                {isSelected && <Check size={12} className="text-black" strokeWidth={3} />}
              </div>
              <span className={`text-xs font-medium tracking-wide transition-colors duration-300 ${isSelected ? 'text-[#e6c97a]' : 'text-[#888] group-hover:text-white'}`}>
                {option}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}