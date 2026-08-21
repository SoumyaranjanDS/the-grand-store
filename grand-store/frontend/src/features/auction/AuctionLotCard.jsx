import { useProducts } from '../../context/ProductContext'
import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ShoppingBag, ArrowRight, Minus, Plus, Trash2, Heart, ZoomIn, CheckCircle2, Truck, RotateCcw, ShieldCheck, Mail, MessageCircle, Share2, X, Gift, SlidersHorizontal, Grid3X3, GitCompareArrows, MapPin, Calendar, Clock, CreditCard, Droplets } from 'lucide-react';
import { useWishlist } from '../../wishlistContext';
import ProductCard from '../../components/ProductCard';
import AuctionCountdown from './AuctionCountdown';
import Price from '../../components/ui/Price';

export default function AuctionLotCard({ lot, endTime, now, saved, onSave, onBid }) {
  const { products } = useProducts();
  const vendorName = lot.vendor ? (lot.vendor.storeName || lot.vendor.name) : 'The Grand Store';
  const isUpcoming = lot.status === 'upcoming';
  const targetTime = isUpcoming ? new Date(lot.startDate).getTime() : endTime;

  return (
    <article className="bg-[#111] border border-white/[0.05] rounded-xl overflow-hidden flex flex-col hover:border-[var(--color-gold)]/50 transition-colors duration-300 shadow-xl group">
      <div className="relative h-64 bg-black/40 flex items-center justify-center p-6 border-b border-white/[0.05]">
        <img src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/hibiki-17.jpeg'} alt={lot.title} loading="lazy" className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
        
        {isUpcoming ? (
          <span className="absolute top-4 left-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-md">Upcoming</span>
        ) : (
          <span className="absolute top-4 left-4 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-md">Live Auction</span>
        )}
        
        <div className="absolute bottom-4 left-4 text-[10px] font-bold tracking-widest text-[var(--color-ivory)] uppercase bg-black/60 px-3 py-1.5 rounded backdrop-blur-md border border-white/10">Lot {lot.lotNumber}</div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-serif text-[var(--color-ivory)] leading-tight mb-2">{lot.title}</h3>
        <p className="text-[var(--color-ivory-muted)] text-sm mb-5 line-clamp-2 font-light leading-relaxed">{lot.description}</p>
        
        <div className="text-[11px] text-[var(--color-ivory-muted)] mb-6 flex flex-col gap-2 bg-white/[0.02] p-4 rounded-lg border border-white/[0.02]">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
             <span className="uppercase tracking-widest opacity-70">Condition</span> 
             <span className="text-[var(--color-ivory)] font-medium text-right max-w-[60%] truncate">{lot.condition}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
             <span className="uppercase tracking-widest opacity-70">Provenance</span> 
             <span className="text-[var(--color-ivory)] font-medium text-right max-w-[60%] truncate">{lot.provenance}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="uppercase tracking-widest opacity-70">Offered by</span> 
             <span className="text-gold-gradient font-medium">{vendorName}</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-end mb-5">
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1 font-semibold">Starting Bid</div>
              <div className="text-sm font-serif opacity-70 line-through decoration-white/20">ZA<Price amount={lot.startingBid ? lot.startingBid.toLocaleString('en-ZA') : '0'} /></div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest text-gold-gradient mb-1 font-semibold">Current Bid</div>
              <div className="text-xl font-serif font-bold text-gold-gradient">ZA<Price amount={lot.currentBid ? lot.currentBid.toLocaleString('en-ZA') : (lot.startingBid ? lot.startingBid.toLocaleString('en-ZA') : '0')} /></div>
            </div>
          </div>
          
          <div className={`flex items-center justify-between mb-5 ${isUpcoming ? 'bg-blue-500/5 border-blue-500/10' : 'bg-red-500/5 border-red-500/10'} p-3 rounded-lg border`}>
            <span className={`text-[10px] uppercase tracking-widest ${isUpcoming ? 'text-blue-400' : 'text-red-400'} font-semibold flex items-center gap-2`}><Clock size={12} /> {isUpcoming ? 'Starts In' : 'Ends In'}</span>
            <div className={`text-sm font-mono font-medium ${isUpcoming ? 'text-blue-400' : 'text-red-400'} tracking-wider`}><AuctionCountdown endTime={targetTime} now={now} compact /></div>
          </div>

          <Link className="w-full py-4 rounded-lg text-center text-[11px] font-bold uppercase tracking-widest text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all block bg-gold-gradient" to={`/auction/${lot._id}`}>
             {isUpcoming ? 'View Details' : 'Place Bid'} <ArrowRight size={14} className="inline-block ml-2 -mt-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}