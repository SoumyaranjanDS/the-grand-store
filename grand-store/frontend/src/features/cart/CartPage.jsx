import { useProducts } from '../../context/ProductContext'
import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ShoppingBag, ArrowRight, Minus, Plus, Trash2, Heart, ZoomIn, CheckCircle2, Truck, RotateCcw, ShieldCheck, Mail, MessageCircle, Share2, X, Gift, SlidersHorizontal, Grid3X3, GitCompareArrows, MapPin, Calendar, Clock, CreditCard, Droplets, PackageCheck } from 'lucide-react';
import { brandyBrands, brands, menuCategories, tequilaBrands, getProductPrice, formatCartPrice } from '../../data';
import { useWishlist } from '../../wishlistContext';
import ProductCard from '../../components/ProductCard';

export default function CartPage({ cartItems, onUpdateQuantity, onRemove, onClear, onNotify }) {
  const { products } = useProducts();

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cartItems.reduce((total, item) => total + (getProductPrice(item.price) * item.quantity), 0)

  useEffect(() => {
    document.title = 'Shopping Cart – Review Items and Complete Your Purchase at The Grand Store'
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { document.title = 'The Grand Store — Luxury Wines & Spirits' }
  }, [])

  return (
    <main className="cart-page">
      <section className="cart-hero">
        <div className="shell cart-hero-inner">
          <div>
            <p className="eyebrow">You are here</p>
            <div className="cart-breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} /><span>My Cart</span></div>
          </div>
          <div className="cart-hero-title">
            <span>{String(itemCount).padStart(2, '0')}</span>
            <h1>Your Cart</h1>
          </div>
        </div>
      </section>

      {cartItems.length === 0 ? (
        <section className="cart-empty-section">
          <div className="cart-empty">
            <span className="cart-empty-icon"><ShoppingBag size={32} /></span>
            <p className="eyebrow">Your selection awaits</p>
            <h2>Your Cart is empty.</h2>
            <p>Explore our cellar and choose a bottle worthy of the occasion.</p>
            <Link className="button button-gold" to="/shop">Add Products <ArrowRight size={16} /></Link>
          </div>
        </section>
      ) : (
        <section className="cart-content-section">
          <div className="shell cart-layout">
            <div className="cart-items-panel">
              <div className="cart-panel-heading">
                <div>
                  <p className="eyebrow">Selected from the cellar</p>
                  <h2>{itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag</h2>
                </div>
                <button type="button" onClick={onClear}>Clear cart</button>
              </div>

              <div className="cart-item-list">
                {cartItems.map((item) => (
                  <article className="cart-item" key={`${item.id}-${item.option}`}>
                    <Link className="cart-item-image" to={`/product/${item.slug || item.id || item._id}`} aria-label={`View ${item.name}`}>
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div className="cart-item-copy">
                      <p>{item.brand} · {item.origin}</p>
                      <h3><Link to={`/product/${item.slug || item.id || item._id}`}>{item.fullName || item.name}</Link></h3>
                      <dl>
                        <div><dt>Format</dt><dd>{item.option}</dd></div>
                        <div><dt>SKU ID</dt><dd>{item.sku}</dd></div>
                      </dl>
                    </div>
                    <div className="cart-item-purchase">
                      <div className="cart-line-price">
                        <span>Item total</span>
                        <strong>{formatCartPrice(getProductPrice(item.price) * item.quantity)}</strong>
                      </div>
                      <div className="cart-item-controls">
                        <div className="cart-quantity-picker" aria-label={`Quantity for ${item.name}`}>
                          <button type="button" onClick={() => onUpdateQuantity(item.id, item.option, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={15} /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => onUpdateQuantity(item.id, item.option, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={15} /></button>
                        </div>
                        <button className="cart-remove-button" type="button" onClick={() => onRemove(item)}><Trash2 size={15} /> Remove</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="cart-summary-card">
              <p className="eyebrow">Your order</p>
              <h2>Order summary</h2>
              <dl>
                <div><dt>Subtotal</dt><dd>{formatCartPrice(subtotal)}</dd></div>
                <div><dt>Delivery</dt><dd>Calculated at checkout</dd></div>
                <div className="cart-summary-total"><dt>Total</dt><dd>{formatCartPrice(subtotal)}</dd></div>
              </dl>
              <p className="cart-tax-note">Taxes included where applicable.</p>
              <Link className="cart-checkout-button block text-center" to="/customer/checkout">
                Checkout <ArrowRight size={17} className="inline ml-2" />
              </Link>
              <Link className="cart-continue-link" to="/shop"><ChevronLeft size={15} /> Continue Shopping</Link>
              <div className="cart-assurance-list">
                <p><ShieldCheck size={17} /><span><strong>Secure checkout</strong>Your details stay protected.</span></p>
                <p><Truck size={17} /><span><strong>Considered delivery</strong>Complimentary over R1,500.</span></p>
                <p><PackageCheck size={17} /><span><strong>Cellar-safe packaging</strong>Prepared for a safe arrival.</span></p>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  )
}