import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Testimonials() {
  const [activeReview, setActiveReview] = useState(0)
  const testimonialRailRef = useRef(null)
  
  const reviews = [
    {
      name: 'Thabo Selwane',
      location: 'Johannesburg',
      image: '/assets/testimonials/thabo-selwane.jpg',
      text: 'The richness of South African wines arrived right at my door. The quality and authenticity genuinely recall the vineyards of Stellenbosch.',
    },
    {
      name: 'Themba Nkosi',
      location: 'Pretoria',
      image: '/assets/testimonials/themba-nkosi.jpg',
      text: 'What I value most is the transparency. The selection feels thoughtful, the bottles feel authentic and ordering is reassuringly simple.',
    },
    {
      name: 'Michelle Steyn',
      location: 'Stellenbosch',
      image: '/assets/testimonials/michelle-steyn.jpg',
      text: 'The Grand Store combines global standards with local taste. It is rare to find an online cellar that feels this considered and trustworthy.',
    },
    {
      name: 'Rajesh Pillay',
      location: 'Johannesburg',
      image: '/assets/testimonials/rajesh-pillay.jpg',
      text: 'My go-to for hosting. Premium bottles, uncomplicated ordering and dependable delivery every time.',
    },
    {
      name: 'Sipho Dlamini',
      location: 'Durban',
      image: '/assets/testimonials/sipho-dlamini.jpg',
      text: 'A fine selection of international and local beers, with an easy experience that brings premium bottles home.',
    },
    {
      name: 'Zanele Khumalo',
      location: 'Pretoria',
      image: '/assets/testimonials/zanele-khumalo.jpg',
      text: 'The Champagne exceeded expectations. Presentation, delivery and product quality all felt genuinely world-class.',
    },
    {
      name: 'Liam van der Merwe',
      location: 'Johannesburg',
      image: '/assets/testimonials/liam-van-der-merwe.jpg',
      text: 'The premium whisky collection stands apart: genuine bottles, smooth ordering and delivery exactly when promised.',
    },
  ]

  const moveReview = (direction) => setActiveReview((current) => (current + direction + reviews.length) % reviews.length)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(() => setActiveReview((current) => (current + 1) % reviews.length), 3600)
    return () => window.clearInterval(timer)
  }, [reviews.length])

  useEffect(() => {
    const rail = testimonialRailRef.current
    const activeCard = rail?.children[activeReview]
    if (!rail || !activeCard) return
    const railRect = rail.getBoundingClientRect()
    const cardRect = activeCard.getBoundingClientRect()
    const cardCenter = (cardRect.left - railRect.left) + rail.scrollLeft + (cardRect.width / 2)
    const targetLeft = Math.min(
      rail.scrollWidth - rail.clientWidth,
      Math.max(0, cardCenter - (rail.clientWidth / 2)),
    )
    rail.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }, [activeReview])

  return (
    <section 
      className="py-[76px] lg:py-[76px] border-t border-white/10 bg-[#11100d] bg-[linear-gradient(120deg,rgba(117,75,23,0.1),transparent_45%)]" 
      aria-labelledby="testimonials-title"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0 grid grid-cols-1 lg:grid-cols-[minmax(280px,0.7fr)_minmax(500px,1.3fr)] items-center gap-10 lg:gap-[clamp(40px,6vw,94px)]">
        
        <div>
          <div>
            <p className="flex items-center gap-3 m-0 text-[#e1bd70] text-xs font-semibold tracking-[0.2em] uppercase">
              From our private list
            </p>
            <h2 
              id="testimonials-title" 
              className="m-[8px_0_0] font-serif text-[clamp(48px,4.6vw,70px)] font-medium tracking-[-0.045em] leading-[0.9] text-[#eee8dd]"
            >
              Testimonials
            </h2>
            <p className="max-w-[530px] mt-6 text-[#a69e92] font-serif text-[17px] leading-[1.5]">
              Seven client notes, moving quietly through the moments and bottles they remember.
            </p>
          </div>
          <div className="flex items-center w-fit mt-[29px] gap-[13px]">
            <button 
              className="grid w-[42px] h-[42px] lg:w-[38px] lg:h-[38px] p-0 place-items-center border border-[#e1bd70]/30 rounded-full bg-transparent text-[#e1bd70] cursor-pointer transition-all duration-160 hover:border-[#e1bd70] hover:text-[#0b0906] hover:bg-[#e1bd70]" 
              type="button" 
              onClick={() => moveReview(-1)} 
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[#777066] text-[10px] tracking-[0.12em]">
              {String(activeReview + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}
            </span>
            <button 
              className="grid w-[42px] h-[42px] lg:w-[38px] lg:h-[38px] p-0 place-items-center border border-[#e1bd70]/30 rounded-full bg-transparent text-[#e1bd70] cursor-pointer transition-all duration-160 hover:border-[#e1bd70] hover:text-[#0b0906] hover:bg-[#e1bd70]" 
              type="button" 
              onClick={() => moveReview(1)} 
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div 
          className="flex w-full overflow-x-auto overflow-y-hidden p-[4px_1px_12px] gap-[13px] scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" 
          ref={testimonialRailRef} 
          aria-live="polite"
        >
          {reviews.map((item, index) => (
            <article 
              className={`relative shrink-0 grow-0 basis-[100%] md:basis-[calc((100%-13px)/2)] lg:basis-[calc((100%-26px)/3)] min-w-0 min-h-[244px] p-[24px_27px_25px] overflow-hidden border bg-white/2 snap-start cursor-pointer transition-all duration-220 ease ${index === activeReview ? 'border-[#e1bd70]/50 bg-[#e1bd70]/5 opacity-100 transform-none' : 'border-[#e1bd70]/15 opacity-60'}`} 
              onClick={() => setActiveReview(index)} 
              key={item.name}
            >
              <img 
                className="block w-12 h-12 m-[0_0_18px] border-2 border-[#15130f] rounded-full object-cover outline outline-1 outline-[#e1bd70]/40" 
                src={item.image} 
                alt={item.name} 
                loading="lazy" 
              />
              <p className="m-0 text-[#d8d0c4] font-serif text-[15px] lg:text-[17px] leading-[1.55] break-words">
                “{item.text}”
              </p>
              <footer className="grid mt-[23px] pt-[15px] gap-1 border-t border-white/10">
                <strong className="font-serif text-[15px] font-medium text-[#eee8dd]">{item.name}</strong>
                <span className="text-[#716b62] text-[8px] tracking-[0.12em] uppercase">{item.location} • Verified client</span>
              </footer>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
