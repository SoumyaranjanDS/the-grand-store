import { useProducts } from '../../context/ProductContext'
import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ShoppingBag, ArrowRight, Minus, Plus, Trash2, Heart, ZoomIn, CheckCircle2, Truck, RotateCcw, ShieldCheck, Mail, MessageCircle, Share2, X, Gift, SlidersHorizontal, Grid3X3, GitCompareArrows, MapPin, Calendar, Clock, CreditCard, Droplets } from 'lucide-react';
import { brandyBrands, brands, menuCategories, tequilaBrands } from '../../data';
import { useWishlist } from '../../wishlistContext';
import ProductCard from '../../components/ProductCard';

export default function BrandyBlogPage() {
  const { products } = useProducts();

  useEffect(() => {
    document.title = 'Top South African Brandy Brands — The Grand Store'
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { document.title = 'The Grand Store — Luxury Wines & Spirits' }
  }, [])

  return (
    <main className="blog-page">
      <section className="blog-article-hero">
        <div className="shell blog-article-hero-inner">
          <div><p className="eyebrow">Brandy journal · 26 Mar 2025</p><h1>Top South African<br /><em>Brandy Brands</em><br />You Can Order Online</h1></div>
          <p>Ten houses shaping the country’s reputation for fine, patiently matured spirits.</p>
        </div>
      </section>
      <article className="shell blog-article-layout">
        <div className="blog-article-main">
          <img className="blog-article-cover" src="/assets/blogs/south-african-brandy-brands.jpeg" alt="Top South African Brandy Brands" />
          <p className="blog-dropcap">Brandy occupies a special place in South Africa’s drinks heritage. Local distillers create world-class expressions—from smooth, approachable blends to old potstill reserves—making the category equally rewarding for a relaxed pour, a considered gift or a collector’s cabinet.</p>
          <p>Here are ten producers worth knowing, and the distinct character each brings to the glass.</p>
          <div className="brandy-article-list">
            {brandyArticleBrands.map(([name, title, text], index) => (
              <section key={name}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h2>{name}</h2><h3>{title}</h3><p>{text}</p></div>
              </section>
            ))}
          </div>
          <section className="article-callout">
            <p className="eyebrow">A better way to discover</p>
            <h2>South African craft, delivered with care.</h2>
            <p>Explore celebrated local houses, compare styles and find a bottle suited to your table, gift or quiet evening.</p>
            <Link className="button button-gold" to="/shop?category=Brandy">Shop brandy <ArrowRight size={16} /></Link>
          </section>
        </div>
        <aside className="blog-article-aside">
          <p className="eyebrow">Recent stories</p>
          {blogPosts.filter((post) => post.slug !== 'top-south-african-brandy-brands-you-can-order-online').map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.slug}><img src={post.image} alt="" /><span><strong>{post.title}</strong><small>{post.date}</small></span></Link>
          ))}
          <div><p className="eyebrow">Shop the story</p><h3>Explore our Brandy collection</h3><Link className="text-link arrow-link" to="/shop?category=Brandy">View bottles <ArrowRight size={15} /></Link></div>
        </aside>
      </article>
    </main>
  )
}