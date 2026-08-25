import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function HeroMobile() {
  return (
    <section className="relative w-full py-12 flex flex-col justify-center items-center bg-[#050505] overflow-hidden select-none">
      
      {/* Background Image covering the whole container */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/assets/vendor/premium-bar.png" 
          alt="Luxury Bar Atmosphere" 
          className="w-full h-full object-cover object-[70%_center] scale-105"
          loading="eager"
        />
        {/* Deep dark gradient overlay so text on top is perfectly readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-black/30" />
      </div>
      
      {/* Sparkle accents */}
      <div className="absolute top-[25%] left-[10%] text-[#ffeaa7] text-lg opacity-60 animate-luxury-glitter">✧</div>
      <div className="absolute top-[15%] right-[15%] text-[#ffd700] text-sm opacity-50 animate-luxury-glitter-delay-1">✦</div>

      {/* Content overlaid on image at the bottom */}
      <div className="relative z-10 w-full flex flex-col items-center text-center px-6 mx-auto">
        
        {/* Master Brand Headline */}
        <h1 
          className="font-serif not-italic text-center select-none m-0 p-0 mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
        >
          <span className="block text-lg tracking-[0.3em] text-[#e5a93c] mb-1 font-medium uppercase">
            The
          </span>
          <span className="block text-4xl sm:text-5xl font-bold uppercase tracking-widest text-white leading-tight">
            Grand Store
          </span>
        </h1>

        {/* Sub-label Luxury Curated Accent */}
        <p 
          className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#e5a93c] mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          style={{ 
            fontFamily: "'Montserrat', 'Inter', sans-serif",
          }}
        >
          Curated Rare Spirits & Wine
        </p>

        {/* Minimal & Creative CTA Button */}
        <Link 
          to="/shop"
          className="group relative flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#c9a35b]/60 text-white py-2 pl-6 pr-2 rounded-full overflow-hidden transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <span className="font-semibold uppercase tracking-[0.2em] text-[10px] z-10 mt-[1px]">Enter the Cellar</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e5a93c] to-[#a86c0c] flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_10px_rgba(229,169,60,0.3)]">
            <ChevronRight size={14} className="text-black ml-[1px]" />
          </div>
          
          {/* Sweep animation effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-[#c9a35b]/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </Link>
        
      </div>
      
    </section>
  );
}
