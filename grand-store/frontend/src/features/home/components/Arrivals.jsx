import { useProducts } from '../../../context/ProductContext'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../../../components/ProductCard'

export default function Arrivals({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts()
  const sectionRef = useRef(null)
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
  
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

  const arrivalProducts = products
    .filter((product) => product.vendorId && product.approvalStatus === 'approved')
    .sort((first, second) => {
      const firstCreatedAt = Date.parse(first.createdAt || '') || 0
      const secondCreatedAt = Date.parse(second.createdAt || '') || 0

      return secondCreatedAt - firstCreatedAt
    })

  return (
    <section 
      className="relative py-[52px] md:py-[64px] bg-[#0c0b09] bg-[linear-gradient(180deg,#0b0a08_0%,transparent_24%),radial-gradient(circle_at_50%_20%,rgba(135,94,34,0.12),transparent_31rem)] overflow-hidden select-none"
      id="arrivals" 
      ref={sectionRef}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-7">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-7 md:mb-9 gap-4 md:gap-8">
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
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <a className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" href="#all-products">
              View all bottles <ArrowRight size={15} />
            </a>
          </div>
        </div>
        
        {/* Carousel Presentation Stage with < and > Chevrons */}
        <div className="relative group/carousel">

          {/* Scrollable Product Track */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory py-3 gap-5 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {arrivalProducts.map((product, index) => (
              <div
                key={product.id || product._id}
                className="product-card-wrap snap-start shrink-0 w-[230px] sm:w-[250px] md:w-[270px] lg:w-[280px]"
              >
                <ProductCard
                  product={product}
                  index={index}
                  onAdd={onAdd}
                  onWish={onWish}
                  onCompare={onCompare}
                  isCompared={compareItems.some((item) => item.id === product.id)}
                />
              </div>
            ))}
          </div>

        </div>

        <p className="md:hidden flex items-center gap-2 mt-4 text-[#918a7f] text-sm">
          <ArrowRight size={15} /> Swipe to explore
        </p>
      </div>
    </section>
  )
}
