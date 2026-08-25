import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '../../../context/ProductContext'
import ProductCard from '../../../components/ProductCard'
import ProductQuickView from '../../../components/ProductQuickView'
import { brandyBrands } from '../../../data'

export default function BrandyShowcase({ onAdd, onWish, onCompare, compareItems }) {
  const { products } = useProducts()
  const sectionRef = useRef(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useEffect(() => {
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
  }, [])

  const brandyProducts = products
    .filter((product) => (
      String(product.category || product.type || '').toLowerCase() === 'brandy'
    ))
    .slice(0, 5)
  const marqueeBrands = [...brandyBrands, ...brandyBrands]

  return (
    <>
      <section className="section tequila-showcase brandy-showcase home-product-editorial" id="brandy" ref={sectionRef}>
        <div className="shell">
          <div className="section-heading tequila-heading">
            <div>
              <p className="eyebrow">Distilled patience · South African soul</p>
              <h2>Top Brandy</h2>
              <p className="section-intro">
                Polished Cape potstill, aged estate releases and a French classic—chosen for a cabinet with character.
              </p>
            </div>
            <Link className="text-link arrow-link" to="/shop?category=Brandy">
              View all brandy <ArrowRight size={16} />
            </Link>
          </div>

          <div className="tequila-product-rail brandy-product-rail">
            {brandyProducts.map((product, index) => (
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

      <section className="relative py-8 md:py-10 border-t border-white/10 bg-[#0b0a08] overflow-hidden" aria-labelledby="brandy-brands-title">
        <div className="relative max-w-[1440px] mx-auto text-center px-6 sm:px-8 lg:px-7">
          <div className="relative border border-white/10 rounded-2xl py-8 bg-white/[0.01]">
            <div className="mb-8 relative">
              <h2 id="brandy-brands-title" className="m-0 font-serif text-[clamp(24px,2.5vw,36px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd] relative z-10">
                Top Cognac & Brandy Brands
              </h2>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[160px] h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(197,153,59,0.8),transparent)] blur-[0.5px]" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[280px] h-[30px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(197,153,59,0.15),transparent_70%)] blur-md pointer-events-none" />
            </div>
            <div
              className="relative overflow-hidden w-full group"
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
