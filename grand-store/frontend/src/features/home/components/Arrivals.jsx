import { useProducts } from '../../../context/ProductContext'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../../../components/ProductCard'


export default function Arrivals({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts();

  const sectionRef = useRef(null)
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 76%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section 
      className="relative py-[122px] bg-[#0c0b09] bg-[linear-gradient(180deg,#0b0a08_0%,transparent_24%),radial-gradient(circle_at_50%_20%,rgba(135,94,34,0.12),transparent_31rem)]" 
      id="arrivals" 
      ref={sectionRef}
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-[55px] gap-8 md:gap-[50px]">
          <div>
            <p className="flex items-center gap-3 m-0 mb-[19px] text-[#e1bd70] text-xs font-semibold tracking-[0.2em] uppercase">
              Fresh from the cellar
            </p>
            <h2 className="m-0 font-serif text-[clamp(48px,4.4vw,72px)] font-medium tracking-[-0.035em] leading-[0.98] text-[#eee8dd]">
              New arrivals
            </h2>
            <p className="max-w-[570px] m-[15px_0_0] text-[#918a7f] text-[15px] leading-[1.8]">
              Newly discovered, quietly exceptional. Meet the bottles our curators cannot stop talking about.
            </p>
          </div>
          <a className="inline-flex items-center gap-3 pb-[9px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white" href="#all-products">
            View all bottles <ArrowRight size={16} />
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t border-white/10 border-l border-white/10">
          {products.filter((product) => product.featured !== false).slice(0, 5).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              onWish={onWish}
              onCompare={onCompare}
              isCompared={compareItems.some((item) => item.id === product.id)}
            />
          ))}
        </div>
        <p className="hidden md:flex items-center gap-2 mt-6 text-[#918a7f] text-sm md:hidden">
          <ArrowRight size={15} /> Swipe to explore
        </p>
      </div>
    </section>
  )
}
