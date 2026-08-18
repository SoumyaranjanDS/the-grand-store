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
      <section className="relative py-[122px] border-t border-white/10 bg-[linear-gradient(180deg,#0e0c09,#090806)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_24%,rgba(172,107,38,0.15),transparent_34rem)] before:pointer-events-none" id="brandy">
        <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-0">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-[55px] gap-8 md:gap-[50px]">
            <div>
              <p className="flex items-center gap-3 m-0 mb-[19px] text-[#e1bd70] text-xs font-semibold tracking-[0.2em] uppercase">
                Distilled patience • South African soul
              </p>
              <h2 className="m-0 font-serif text-[clamp(48px,4.4vw,72px)] font-medium tracking-[-0.035em] leading-[0.98] text-[#eee8dd]">
                Top Brandy
              </h2>
              <p className="max-w-[570px] m-[15px_0_0] text-[#918a7f] text-[15px] leading-[1.8]">
                Polished Cape potstill, aged estate releases and a French classic—chosen for a cabinet with character.
              </p>
            </div>
            <Link className="inline-flex items-center gap-3 pb-[9px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white" to="/shop?category=Brandy">
              View all brandy <ArrowRight size={16} />
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

        <div className="relative mt-16 max-w-[1240px] mx-auto text-center px-6 sm:px-0">
          <div className="mb-[25px]">
            <h2 className="m-0 font-serif text-[40px] font-medium tracking-[-0.035em] leading-[0.98] text-[#eee8dd]">
              Top Brandy Brands
            </h2>
          </div>
          <div 
            className="relative overflow-hidden w-full group mx-auto" 
            style={{ maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)' }}
            aria-label="Featured brandy brands"
          >
            <div className="flex w-max animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform">
              {marqueeBrands.map((brand, index) => (
                <Link 
                  className="relative flex items-center justify-center flex-[0_0_200px] h-[130px] mr-3 p-[13px_18px_12px] overflow-hidden border border-[#e1bd70]/20 bg-white/5 transition-all duration-200 hover:border-[#e1bd70]/60 hover:bg-[#e1bd70]/10 hover:-translate-y-1" 
                  to={`/shop?brand=${encodeURIComponent(brand.name)}`} 
                  key={`${brand.name}-${index}`} 
                  aria-label={`Shop ${brand.name}`}
                >
                  <img className="w-[205px] h-[78px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" src={brand.image} alt="" loading="lazy" />
                  <span className="absolute bottom-2 right-2 text-[#d8cbae] text-[9px] font-[650] tracking-[0.18em] uppercase opacity-0 transition-opacity group-hover:opacity-100">
                    {brand.name}
                  </span>
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
