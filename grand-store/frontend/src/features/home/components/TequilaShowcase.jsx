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
      <section className="relative py-[122px] border-t border-white/10 bg-[#0b0a08] bg-[radial-gradient(circle_at_74%_18%,rgba(151,102,31,0.14),transparent_34rem)]" id="tequila">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-0">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-[55px] gap-8 md:gap-[50px]">
            <div>
              <p className="flex items-center gap-3 m-0 mb-[19px] text-[#e1bd70] text-xs font-semibold tracking-[0.2em] uppercase">
                From the heart of agave country
              </p>
              <h2 className="m-0 font-serif text-[clamp(48px,4.4vw,72px)] font-medium tracking-[-0.035em] leading-[0.98] text-[#eee8dd]">
                Top Tequila
              </h2>
              <p className="max-w-[570px] m-[15px_0_0] text-[#918a7f] text-[15px] leading-[1.8]">
                Reposado warmth, crystalline clarity and rare extra añejo—selected for the modern cabinet.
              </p>
            </div>
            <Link className="inline-flex items-center gap-3 pb-[9px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white" to="/shop?category=Tequila">
              View all tequila <ArrowRight size={16} />
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

        <div 
          className="relative overflow-hidden w-full group mt-16" 
          style={{ maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)' }}
          aria-label="Featured tequila brands"
        >
          <div className="flex w-max animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform">
            {marqueeBrands.map((brand, index) => (
              <Link 
                className="relative flex items-center justify-center flex-[0_0_200px] md:flex-[0_0_240px] min-h-[150px] mr-3 p-[18px_22px] overflow-hidden border border-[#e1bd70]/20 text-[#e1bd70] bg-[linear-gradient(150deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] transition-all duration-180 hover:border-[#e1bd70]/60 hover:bg-[#e1bd70]/10 hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1" 
                to={`/shop?brand=${encodeURIComponent(brand.name)}`} 
                key={`${brand.name}-${index}`} 
                aria-label={`Shop ${brand.name}`}
              >
                <img className="max-w-[140px] max-h-[75px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" src={brand.image} alt="" />
              </Link>
            ))}
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
