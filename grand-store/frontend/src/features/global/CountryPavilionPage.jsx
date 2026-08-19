import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { products } from '../../data';
import ProductCard from '../../components/ProductCard';

const countryDetails = {
  france: {
    name: 'France',
    desc: 'The benchmark for fine wine. From the structured elegance of Bordeaux to the delicate complexity of Burgundy.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop'
  },
  italy: {
    name: 'Italy',
    desc: 'A tapestry of ancient terroirs and indigenous grapes, producing some of the world’s most food-friendly and diverse wines.',
    image: 'https://i.pinimg.com/1200x/40/1d/84/401d84d477523012fa2eec4b0ca1b7b2.jpg'
  },
  spain: {
    name: 'Spain',
    desc: 'Tradition meets innovation. Discover the bold reds of Ribera del Duero and the classic aged expressions of Rioja.',
    image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2070&auto=format&fit=crop'
  },
  australia: {
    name: 'Australia',
    desc: 'Bold, expressive, and unconstrained by tradition. Home to some of the world’s most powerful Shiraz and refined Cabernet.',
    image: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=2071&auto=format&fit=crop'
  }
};

export default function CountryPavilionPage({ onAdd, onWish, onCompare, compareItems = [] }) {
  const { country } = useParams();
  const [pavilionWines, setPavilionWines] = useState([]);

  const details = countryDetails[country?.toLowerCase()] || {
    name: country,
    desc: 'Discover exceptional international wines.',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop'
  };

  useEffect(() => {
    // Filter products from data.js where country matches the route param
    const filtered = products.filter(p => p.country && p.country.toLowerCase() === country?.toLowerCase());
    setPavilionWines(filtered);
    window.scrollTo(0, 0);
  }, [country]);

  return (
    <div className="min-h-screen bg-[#0a0907] pb-20 relative overflow-hidden">
      
      {/* Massive subtle golden glow background behind products */}
      <div className="absolute top-[60vh] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c9a35b]/5 via-[#0a0907]/0 to-[#0a0907]/0 pointer-events-none rounded-full blur-3xl opacity-80"></div>

      {/* Hero */}
      <div 
        className="relative h-[65vh] flex items-center justify-center pt-0"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${details.image})` }}
        />
        {/* Seamless gradient fade to black */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0a0907]" />
        
        {/* Glowing overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c9a35b]/10 via-transparent to-transparent opacity-80 mix-blend-screen" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mt-12">
          <Link to="/global-wines" className="inline-flex items-center gap-2 text-gold-gradient hover:text-[#e1bd70] transition-colors mb-8 text-sm font-bold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(201,163,91,0.5)]">
            <ArrowLeft size={16} /> Back to Global Wines
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold-gradient text-sm md:text-base font-bold tracking-[0.4em] uppercase mb-4 block drop-shadow-[0_0_10px_rgba(201,163,91,0.5)]">Wines of</span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-[#eee8dd] mb-6 md:mb-8 tracking-wide drop-shadow-2xl">{details.name}</h1>
            <p className="text-white/80 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto font-light tracking-wide px-2">
              {details.desc}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#c9a35b]/20 pb-4 shadow-[0_4px_20px_-10px_rgba(201,163,91,0.2)]">
          <div>
            <h2 className="text-3xl font-serif text-[#eee8dd] tracking-wider">Featured Collection</h2>
            <p className="text-gold-gradient text-sm mt-2 tracking-widest uppercase font-bold">{pavilionWines.length} {pavilionWines.length === 1 ? 'wine' : 'wines'} available</p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button className="flex items-center gap-2 text-sm text-[#eee8dd] hover:text-gold-gradient transition-all font-bold uppercase tracking-widest">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 text-sm text-[#eee8dd] hover:text-gold-gradient transition-all font-bold uppercase tracking-widest">
              <Search size={16} /> Search
            </button>
          </div>
        </div>

        {pavilionWines.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {pavilionWines.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => onAdd(product)}
                onWish={() => onWish(product)}
                onCompare={() => onCompare(product)}
                isCompared={compareItems.some((item) => item.id === product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#c9a35b]/10 via-transparent to-transparent blur-2xl"></div>
            <h3 className="text-3xl text-[#eee8dd] mb-4 font-serif relative z-10">Curating the collection</h3>
            <p className="text-[#918a7f] text-lg font-light relative z-10">We are currently sourcing exceptional wines from {details.name}. Please check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
