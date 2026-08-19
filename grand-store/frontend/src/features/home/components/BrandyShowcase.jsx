import { useProducts } from '../../../context/ProductContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../../../components/ProductCard'
import ProductQuickView from '../../../components/ProductQuickView'
import { brandyBrands } from '../../../data'

export default function BrandyShowcase({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts();

  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const brandyProducts = products.filter((product) => product.category === 'Brandy')
  const marqueeBrands = [...brandyBrands, ...brandyBrands]

  return (
    <>
      <section className="relative py-[52px] md:py-[64px] border-t border-white/10 bg-[linear-gradient(180deg,#0e0c09,#090806)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_24%,rgba(172,107,38,0.15),transparent_34rem)] before:pointer-events-none" id="brandy">
        <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-0">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-7 md:mb-8 gap-4 md:gap-8">
            <div className="text-left">
              <h2 className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]">
                Top{' '}
                <span
                  className="gold-gradient-text inline-block pr-2 font-script text-[1.12em]"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  Brandy
                </span>
              </h2>
              <p className="max-w-[600px] mt-3 text-[rgba(244,238,224,0.76)] text-[15px] md:text-[16px] leading-[1.65]">
                <span className="font-serif text-[#f0cf76] italic text-[1.06em]">Distilled patience, South African soul.</span>{' '}
                Polished Cape potstill, aged estate releases and French classics chosen for character.
              </p>
            </div>
            <Link className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" to="/shop?category=Brandy">
              View all brandy <ArrowRight size={15} />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory p-[25px_5%_45px] gap-5 w-[calc(100%+15px)] md:w-auto -ml-3 md:ml-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {brandyProducts.map((product) => (
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
              Top Brandy{' '}
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
            aria-label="Featured brandy brands"
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
                    loading="lazy" 
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
