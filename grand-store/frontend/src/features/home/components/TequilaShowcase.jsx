import { useProducts } from '../../../context/ProductContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../../../components/ProductCard'
import ProductQuickView from '../../../components/ProductQuickView'
import { tequilaBrands } from '../../../data'

export default function TequilaShowcase({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts();

  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const tequilaProducts = products.filter((product) => product.category === 'Tequila')
  const marqueeBrands = [...tequilaBrands, ...tequilaBrands]

  return (
    <>
      <section className="relative py-[52px] md:py-[64px] border-t border-white/10 bg-[#0b0a08] bg-[radial-gradient(circle_at_74%_18%,rgba(151,102,31,0.14),transparent_34rem)]" id="tequila">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-0">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-7 md:mb-8 gap-4 md:gap-8">
            <div className="text-left">
              <h2 className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]">
                Top{' '}
                <span
                  className="gold-gradient-text inline-block pr-2 font-script text-[1.12em]"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  Tequila
                </span>
              </h2>
              <p className="max-w-[600px] mt-3 text-[rgba(244,238,224,0.76)] text-[15px] md:text-[16px] leading-[1.65]">
                <span className="font-serif text-[#f0cf76] italic text-[1.06em]">From the heart of agave country.</span>{' '}
                Reposado warmth, crystalline clarity and rare extra añejo selected for the modern cabinet.
              </p>
            </div>
            <Link className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" to="/shop?category=Tequila">
              View all tequila <ArrowRight size={15} />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory p-[25px_5%_45px] gap-5 border-b border-white/5 w-[calc(100%+15px)] md:w-auto -ml-3 md:ml-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tequilaProducts.map((product) => (
              <div key={product.id} className="snap-start shrink-0 basis-[84vw] md:basis-[min(74vw,310px)]">
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
          <p className="md:hidden flex items-center gap-2 mt-6 text-[#918a7f] text-sm">
            <ArrowRight size={15} /> Swipe to explore
          </p>
        </div>

        <div className="relative mt-8 max-w-[1240px] mx-auto text-center px-6 sm:px-0">
          <div className="mb-3.5">
            <h2 className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]">
              Top Tequila{' '}
              <span
                className="gold-gradient-text inline-block pr-2 font-script text-[1.12em]"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Brands
              </span>
            </h2>
          </div>
          <div 
            className="relative overflow-hidden w-full group py-1" 
            style={{ maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}
            aria-label="Featured tequila brands"
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
