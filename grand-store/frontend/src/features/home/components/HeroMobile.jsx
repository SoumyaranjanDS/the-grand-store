import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function HeroMobile() {
  return (
    <section className="relative w-full h-[65svh] min-h-[450px] max-h-[600px] flex flex-col justify-end bg-[#050505] overflow-hidden select-none pb-10">
      
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
      <div className="relative z-10 w-full flex flex-col px-6 mx-auto">
        
        {/* Master Brand Headline */}
        <h1 
          className="font-serif not-italic text-4xl sm:text-5xl font-bold uppercase text-left leading-[1.1] whitespace-nowrap select-none m-0 p-0 flex flex-col mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          style={{ 
            fontFamily: "'Cinzel', 'Playfair Display', serif",
          }}
        >
          {/* Line 1: 'The' */}
          <span 
            className="tracking-widest"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, #fff8e7 0%, #ffe299 18%, #e5a93c 45%, #ffd269 72%, #a86c0c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The
          </span>

          {/* Line 2: 'Grand Store' */}
          <span 
            className="tracking-wider"
            style={{
              backgroundImage: 'linear-gradient(135deg, #fff8e7 0%, #ffe299 18%, #e5a93c 45%, #ffd269 72%, #a86c0c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
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

        {/* Bold CTA Button */}
        <Link 
          to="/shop"
          className="group relative w-full max-w-sm flex items-center justify-between bg-transparent border border-[#c9a35b] text-[#c9a35b] hover:bg-[#c9a35b] hover:text-black py-3.5 px-6 transition-all duration-300"
        >
          <span className="font-bold uppercase tracking-widest text-[11px]">Enter the Cellar</span>
          <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          
          {/* Ambient glow on button */}
          <div className="absolute inset-0 -z-10 bg-[#c9a35b] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </Link>
        
      </div>
      
    </section>
  );
}
