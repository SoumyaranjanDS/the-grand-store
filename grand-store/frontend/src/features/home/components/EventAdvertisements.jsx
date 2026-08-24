import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EventAdvertisements() {
  return (
    <section className="section pb-24" id="event-advertisements">
      <div className="shell">
        <div className="section-heading collection-heading">
          <div>
            <p className="eyebrow">Upcoming Events</p>
            <h2>Join the Experience</h2>
          </div>
          <p className="section-intro">
            Discover our exclusive luxury auctions and curated tasting events designed for the true connoisseur.
          </p>
        </div>

        {/* Use a narrower max-width and smaller gap to decrease card size */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Auction Card */}
          <div className="group flex flex-col bg-[#0f0e0c] rounded-lg overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(216,183,109,0.15)] border border-white/10 hover:border-[#d8b76d]/40">
            <Link to="/auction" className="w-full aspect-square relative overflow-hidden block">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <img 
                src="/auc-ev/wine-tasting.webp" 
                alt="Luxury Wine Auction" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
            <div className="p-6 flex items-center justify-between border-t border-white/5 group-hover:border-[#d8b76d]/20 transition-colors duration-500">
              <h3 className="font-serif text-xl md:text-2xl text-[#f2ede4] group-hover:text-[#d8b76d] transition-colors">Luxury Wine Auction</h3>
              <Link to="/auction" className="flex items-center gap-2 text-sm text-[#918a7f] group-hover:text-[#d8b76d] transition-colors whitespace-nowrap">
                Explore <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Event Card */}
          <div className="group flex flex-col bg-[#0f0e0c] rounded-lg overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(216,183,109,0.15)] border border-white/10 hover:border-[#d8b76d]/40">
            <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="w-full aspect-square relative overflow-hidden block">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <img 
                src="/auc-ev/wine tasting event.webp" 
                alt="Exclusive Tasting Event" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </a>
            <div className="p-6 flex items-center justify-between border-t border-white/5 group-hover:border-[#d8b76d]/20 transition-colors duration-500">
              <h3 className="font-serif text-xl md:text-2xl text-[#f2ede4] group-hover:text-[#d8b76d] transition-colors">Wine Tasting</h3>
              <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#918a7f] group-hover:text-[#d8b76d] transition-colors whitespace-nowrap">
                Explore <ArrowRight size={16} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
