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
      className="relative py-[52px] md:py-[64px] bg-[#0c0b09] bg-[linear-gradient(180deg,#0b0a08_0%,transparent_24%),radial-gradient(circle_at_50%_20%,rgba(135,94,34,0.12),transparent_31rem)]" 
      id="arrivals" 
      ref={sectionRef}
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-7 md:mb-8 gap-4 md:gap-8">
          <div className="text-left">
            <h2 className="m-0 text-left font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]">
              New{' '}
              <span
                className="gold-gradient-text inline-block pr-2 font-script text-[1.12em]"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Arrivals
              </span>
            </h2>
            <p className="max-w-[600px] mt-3 text-[rgba(244,238,224,0.76)] text-[15px] md:text-[16px] leading-[1.65]">
              <span className="font-serif text-[#f0cf76] italic text-[1.06em]">Newly discovered, quietly exceptional.</span>{' '}
              Meet the bottles our curators cannot stop talking about.
            </p>
          </div>
          <a className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" href="#all-products">
            View all bottles <ArrowRight size={15} />
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
