import { useProducts } from '../../context/ProductContext'
import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ShoppingBag, ArrowRight, Minus, Plus, Trash2, Heart, ZoomIn, CheckCircle2, Truck, RotateCcw, ShieldCheck, Mail, MessageCircle, Share2, X, Gift, SlidersHorizontal, Grid3X3, GitCompareArrows, MapPin, Calendar, Clock, CreditCard, Droplets } from 'lucide-react';
import { useWishlist } from '../../wishlistContext';
import ProductCard from '../../components/ProductCard';
import AuctionCountdown from './AuctionCountdown';

export default function AuctionLotCard({ lot, endTime, now, saved, onSave, onBid }) {
  const { products } = useProducts();

  return (
    <article className="auction-lot-card">
      <div className="auction-lot-image">
        <img src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/hibiki-17.jpeg'} alt={lot.title} loading="lazy" />
        <span className="auction-live-badge">Live</span>
      </div>
      <div className="auction-lot-copy">
        <p className="eyebrow">Lot {lot.lotNumber}</p>
        <h3>{lot.title}</h3>
        <dl className="auction-lot-meta">
          <div><dt>Ends in</dt><dd><AuctionCountdown endTime={endTime} now={now} compact /></dd></div>
        </dl>
        <div className="auction-bid-row">
          <span><small>Current bid</small><strong>ZAR {lot.currentBid ? lot.currentBid.toLocaleString('en-ZA') : '0'}</strong></span>
          <Link className="button" to={`/auction/${lot._id}`}>Bid now <ArrowRight size={14} /></Link>
        </div>
      </div>
    </article>
  )
}