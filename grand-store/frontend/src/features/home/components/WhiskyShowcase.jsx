import { useProducts } from '../../../context/ProductContext'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../../../components/ProductCard'
import ProductQuickView from '../../../components/ProductQuickView'
import { brands } from '../../../data'

export default function WhiskyShowcase({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts()
  const sectionRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.product-card-wrap', {
        y: 50,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const whiskyProducts = products.filter((product) => {
    const cat = product.category || product.type
    return cat === 'Whisky' || cat === 'Scotch' || cat === 'whisky' || cat === 'scotch'
  })
  const marqueeBrands = [...brands, ...brands]

  return (
    <>
      <section ref={sectionRef} className="relative py-8 md:py-10 border-t border-white/10 bg-[#0b0a08] bg-[radial-gradient(circle_at_74%_18%,rgba(151,102,31,0.14),transparent_34rem)] overflow-hidden" id="whisky">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-7">
          {whiskyProducts.length > 0 && (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 md:mb-7 gap-4 md:gap-8">
                <div className="text-left">
                  <h2 className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]">
                    Top{' '}
                    <span
                      className="gold-gradient-text inline-block pr-2 font-script text-[1.12em]"
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                    >
                      Whisky
                    </span>
                  </h2>
                </div>
                <Link className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" to="/shop?category=Whisky">
                  View all whisky <ArrowRight size={15} />
                </Link>
              </div>
              
              <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory py-3 gap-5 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                {whiskyProducts.map((product, index) => (
                  <div key={product.id || product._id} className="product-card-wrap snap-start shrink-0 w-[230px] sm:w-[250px] md:w-[270px] lg:w-[280px]">
                    <ProductCard
                      product={product}
                      onAdd={onAdd}
                      onWish={onWish}
                      onCompare={onCompare}
                      isCompared={compareItems.some((item) => item.id === product.id)}
                      onQuickView={setQuickViewProduct}
                    />
                  </div>
                ))}
              </div>
              <p className="md:hidden flex items-center gap-2 mt-4 text-[#918a7f] text-sm">
                <ArrowRight size={15} /> Swipe to explore
              </p>
            </>
          )}
        </div>

        <div className="relative mt-8 max-w-[1440px] mx-auto text-center px-6 sm:px-8 lg:px-7">
          <div className="relative border border-white/10 rounded-2xl py-8 bg-white/[0.01]">
            <div className="mb-8 relative">
              <h2 className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd] relative z-10">
                Top Whisky{' '}
                <span
                  className="gold-gradient-text inline-block pr-2 font-script text-[1.12em]"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  Brands
                </span>
              </h2>
              {/* Liquid Gradient Underglow */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[160px] h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(197,153,59,0.8),transparent)] blur-[0.5px]"></div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[280px] h-[30px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(197,153,59,0.15),transparent_70%)] blur-md pointer-events-none"></div>
            </div>
            <div 
              className="relative overflow-hidden w-full group" 
              style={{ maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}
              aria-label="Featured whisky brands"
            >
              <div className="flex w-max animate-[marquee_20s_linear_infinite] sm:animate-[marquee_24s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform items-center">
                {marqueeBrands.map((brand, index) => (
                  <Link 
                    className="relative flex items-center justify-center max-sm:flex-[0_0_185px] sm:flex-[0_0_300px] md:flex-[0_0_360px] max-sm:min-h-[105px] sm:min-h-[165px] md:min-h-[190px] max-sm:mx-3 sm:mx-8 md:mx-10 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group/brand select-none" 
                    to={`/shop?brand=${encodeURIComponent(brand.name)}`} 
                    key={`${brand.name}-${index}`} 
                    aria-label={`Shop ${brand.name}`}
                  >
                    <img 
                      className="w-auto h-auto max-sm:max-w-[175px] sm:max-w-[280px] md:max-w-[340px] max-sm:max-h-[85px] sm:max-h-[145px] md:max-h-[170px] object-contain filter contrast-[1.08] brightness-[0.95] group-hover/brand:brightness-110 group-hover/brand:drop-shadow-[0_10px_30px_rgba(225,189,112,0.45)] transition-all duration-300" 
                      src={brand.image} 
                      alt={brand.name} 
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
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
