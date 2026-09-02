import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '../../../context/ProductContext'
import { useCategories } from '../../../context/CategoryContext'
import ProductCard from '../../../components/ProductCard'
import ProductQuickView from '../../../components/ProductQuickView'
import { tequilaBrands } from '../../../data'

export default function TequilaShowcase({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts()
  const { categories } = useCategories()
  const sectionRef = useRef(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [productOrder, setProductOrder] = useState({})

  useEffect(() => {
    if (products.length > 0 && Object.keys(productOrder).length === 0) {
      const order = {}
      products.forEach(p => { order[p.id || p._id] = Math.random() })
      setProductOrder(order)
    }
  }, [products])

  const tequilaProducts = products
    .filter((product) => {
      const category = String(product.category || product.type || '').toLowerCase()
      return category === 'tequila'
    })
    .sort((a, b) => {
      const orderA = productOrder[a.id || a._id] || 0
      const orderB = productOrder[b.id || b._id] || 0
      return orderA - orderB
    })
    .slice(0, 5)

  useEffect(() => {
    if (tequilaProducts.length === 0 || !sectionRef.current) return;
    const context = gsap.context(() => {
      gsap.from('.product-card', {
        y: 52,
        opacity: 0,
        stagger: 0.09,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 77%' },
      })
    }, sectionRef)

    return () => context.revert()
  }, [tequilaProducts.length])

  const categoryData = categories?.find(c => c.name.toLowerCase() === 'tequila');
  const dynamicBrands = categoryData?.brandLogos?.length > 0 
    ? categoryData.brandLogos.map(logo => ({ name: logo.alt || 'Brand Logo', image: logo.url })) 
    : tequilaBrands;

  const marqueeBrands = [...dynamicBrands, ...dynamicBrands]

  // Only show the marquee if we actually have brands
  const showMarquee = dynamicBrands.length > 0;

  return (
    <>
      <section className="section tequila-showcase home-product-editorial" id="tequila" ref={sectionRef}>
        <div className="shell relative">
          
          {/* Floating Cigar Character */}
          <style>{`
            @keyframes slideInRightCigar {
              0% { transform: translateX(120%); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
            @keyframes floatSpeechBubble {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            .animate-slide-cigar {
              animation: slideInRightCigar 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              animation-delay: 0.5s;
              opacity: 0;
            }
            .animate-float-bubble {
              animation: floatSpeechBubble 4s ease-in-out infinite;
            }
          `}</style>
            <div 
              onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute right-0 md:right-5 top-[60px] md:top-[120px] z-30 cursor-pointer group animate-slide-cigar"
              title="View our Cigar Partners"
            >
              <div className="relative flex items-center gap-3 md:gap-5 overflow-visible w-[320px] md:w-[480px]">
                
                {/* Speech Bubble */}
                <div className="relative flex-1 bg-[#151515]/95 backdrop-blur-md border border-[#c9a35b]/30 rounded-t-3xl rounded-bl-3xl rounded-br-md p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-float-bubble transform group-hover:border-[#c9a35b]/80 group-hover:shadow-[0_20px_60px_rgba(201,163,91,0.2)] transition-all duration-500">
                  <p className="text-[#c9a35b] text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mb-2">Private Collection</p>
                  <p className="text-white font-serif text-base md:text-xl leading-snug mb-4">"Looking for a truly exceptional cigar?"</p>
                  <div className="inline-flex items-center gap-2 border-b border-[#c9a35b]/40 pb-1 group-hover:border-[#c9a35b] transition-colors">
                    <span className="text-[#eee8dd] text-[10px] md:text-xs uppercase tracking-widest font-semibold">Explore Club</span>
                    <ArrowRight size={14} className="text-[#c9a35b]" />
                  </div>
                  
                  {/* Pointer pointing to mouth */}
                  <div className="absolute top-8 -right-[9px] w-5 h-5 bg-[#151515]/95 border-t border-r border-[#c9a35b]/30 rotate-45 group-hover:border-[#c9a35b]/80 transition-colors duration-500"></div>
                </div>
                
                {/* Character */}
                <div className="relative z-20 shrink-0">
                  <img 
                    src="/assets/images/cigar_character_full.png" 
                    alt="Cigar Aficionado"
                    className="w-32 md:w-48 h-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] transform group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          <div className="section-heading flex flex-col items-start text-left md:flex-row md:text-left md:justify-between md:items-end gap-3 md:gap-0">
            <div className="flex flex-col items-start md:items-start w-full">
              <p className="eyebrow hidden md:block">From the heart of agave country</p>
              <h2>Top Tequila</h2>
              <p className="section-intro hidden md:block">
                Reposado warmth, crystalline clarity and rare extra añejo—selected for the modern cabinet.
              </p>
            </div>
            <Link className="text-link arrow-link flex items-center gap-1" to="/shop?category=Tequila">
              <span className="hidden md:inline">View all tequila</span>
              <span className="inline md:hidden">View all</span> 
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="tequila-product-rail">
            {tequilaProducts.map((product, index) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                index={index}
                onAdd={onAdd}
                onWish={onWish}
                onCompare={onCompare}
                isCompared={compareItems.some((item) => (item.id || item._id) === (product.id || product._id))}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
          <p className="swipe-hint"><ArrowRight size={15} /> Swipe to explore</p>
        </div>
      </section>

      {showMarquee && (
        <section className="home-brand-marquee relative py-8 md:py-10 border-t border-white/10 bg-[#0b0a08] overflow-hidden" aria-labelledby="tequila-brands-title">
        <div className="relative max-w-[1440px] mx-auto text-center sm:px-8 lg:px-7">
          <div className="home-brand-marquee-panel relative border-y sm:border border-white/10 sm:rounded-2xl py-8 bg-white/[0.01]">
            <div className="home-brand-marquee-heading mb-8 relative px-6 sm:px-0">
              <h2 id="tequila-brands-title" className="home-brand-marquee-title m-0 font-serif text-[clamp(24px,2.5vw,36px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd] relative z-10">
                Top Tequila Brands
              </h2>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[160px] h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(197,153,59,0.8),transparent)] blur-[0.5px]" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[280px] h-[30px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(197,153,59,0.15),transparent_70%)] blur-md pointer-events-none" />
            </div>
            <div
              className="relative overflow-hidden w-full group"
              style={{ maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}
              aria-label="Featured tequila brands"
            >
              <div className="flex w-max animate-[marquee_20s_linear_infinite] sm:animate-[marquee_24s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform items-center">
                {marqueeBrands.map((brand, index) => (
                  <Link
                    to={`/shop?category=Tequila&brand=${encodeURIComponent(brand.name)}`}
                    className="home-brand-marquee-tile relative flex items-center justify-center max-sm:flex-[0_0_260px] sm:flex-[0_0_280px] md:flex-[0_0_320px] max-sm:min-h-[180px] sm:min-h-[165px] md:min-h-[190px] max-sm:mx-0 sm:mx-4 md:mx-6 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group/brand select-none cursor-pointer"
                    key={`${brand.name}-${index}`}
                    aria-label={`View ${brand.name}`}
                  >
                    <img
                      className="home-brand-marquee-logo w-auto h-auto max-sm:max-w-[250px] sm:max-w-[260px] md:max-w-[300px] max-sm:max-h-[160px] sm:max-h-[145px] md:max-h-[170px] max-sm:scale-125 object-contain filter contrast-[1.08] brightness-[0.95] group-hover/brand:brightness-110 group-hover/brand:drop-shadow-[0_10px_30px_rgba(225,189,112,0.45)] transition-all duration-300"
                      src={brand.image}
                      alt={brand.name}
                      loading="lazy"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAdd={onAdd}
        />
      )}
    </>
  )
}
