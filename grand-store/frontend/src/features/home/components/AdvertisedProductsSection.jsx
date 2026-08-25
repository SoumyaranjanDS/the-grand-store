import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../api';

const ProductCard = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : [];

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group relative flex flex-col h-full bg-[#11100d] border border-white/5 hover:border-[#c9a35b]/30 transition-all duration-700 overflow-hidden">
      
      {/* Image Carousel */}
      <div className="relative h-[280px] overflow-hidden bg-[#0a0907] group/carousel flex items-center justify-center">
        {images.length > 0 ? (
          <img 
            src={images[currentIndex]} 
            alt={product.title}
            className="w-full h-full object-contain p-8 transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs bg-[#0a0907]">
            No Image Available
          </div>
        )}
        
        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none opacity-80"></div>
        
        {/* Carousel Controls */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm text-white rounded-full opacity-0 group-hover/carousel:opacity-100 hover:bg-[#c9a35b] hover:text-black transition-all duration-300 z-20"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm text-white rounded-full opacity-0 group-hover/carousel:opacity-100 hover:bg-[#c9a35b] hover:text-black transition-all duration-300 z-20"
            >
              <ChevronRight size={16} />
            </button>
            
            {/* Elegant Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-[2px] transition-all duration-300 ${i === currentIndex ? 'bg-[#c9a35b] w-6' : 'bg-white/40 w-2'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          {product.category && (
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-[9px] text-[#c9a35b] uppercase tracking-[0.2em] font-bold">
              {product.category}
            </div>
          )}
          {product.brand && !product.category && (
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-[9px] text-white uppercase tracking-[0.2em] font-bold">
              {product.brand}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col relative bg-[#11100d]">
        {/* Price Tag positioned beautifully overlapping the image line */}
        {product.price && (
          <div className="absolute -top-5 right-6 bg-[#c9a35b] text-black px-3 py-2 text-xs font-bold tracking-wider rounded-sm shadow-2xl">
            {product.price}
          </div>
        )}

        {product.tagline && (
          <p className="text-[11px] text-[#c9a35b] uppercase tracking-widest font-bold mb-3">
            {product.tagline}
          </p>
        )}
        
        <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-3 leading-tight group-hover:text-[#c9a35b] transition-colors duration-500">
          <Link to={`/discover/${product._id}`} className="hover:underline decoration-1 underline-offset-4">
            {product.title}
          </Link>
        </h3>
        
        <p className="text-[var(--color-ivory-muted)] text-sm mb-6 line-clamp-2 leading-relaxed font-light">
          {product.description}
        </p>
        
        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
          <Link 
            to={`/discover/${product._id}`}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white hover:text-[#c9a35b] transition-colors group/link"
          >
            View Details 
            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
          {product.linkUrl && (
            <a 
              href={product.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 hover:text-white transition-colors"
              title="Visit External Site"
            >
              Visit Site <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdvertisedProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/advertisements/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching advertised products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return null; // Just skip rendering while loading
  }

  return (
    <section className="section home-advertised-products home-product-editorial relative" id="advertised">
      {/* Background Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#c9a35b]/5 pointer-events-none rounded-full blur-[120px] opacity-60 z-0"></div>

      <div className="shell relative z-10">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Exclusive Showcases</p>
            <h2>Featured Partnerships</h2>
            <p className="section-intro">
              Discover extraordinary releases and exclusive offerings curated in partnership with the world's most esteemed luxury brands.
            </p>
          </div>
          <Link className="text-link arrow-link whitespace-nowrap hidden sm:flex" to="/advertise">
            Advertise With Us <ArrowRight size={16} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-[#11100d] border border-white/5 p-16 text-center mt-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,163,91,0.05),transparent_70%)] pointer-events-none"></div>
            <h3 className="text-3xl font-serif text-[var(--color-ivory)] mb-4 relative z-10">Feature Your Legacy</h3>
            <p className="text-[var(--color-ivory-muted)] mb-8 max-w-md mx-auto relative z-10">
              Be the first to showcase your luxury brand to our exclusive audience of connoisseurs and collectors.
            </p>
            <Link className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black bg-[#c9a35b] hover:bg-white px-8 py-4 transition-colors relative z-10" to="/advertise">
              Start Campaign <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Mobile Advertise Link */}
            <div className="mt-12 text-center sm:hidden">
              <Link className="text-link arrow-link inline-flex" to="/advertise">
                Advertise With Us <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
