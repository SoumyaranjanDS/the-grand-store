import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export default function PartnerDestinations() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.partner-card', {
        y: 26,
        opacity: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 84%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const destinations = [
    {
      href: 'https://cigarconnoisseurclub.com/',
      image: '/assets/partners/cigar-connoisseur.webp',
      eyebrow: 'The smoking room',
      title: 'Cigar Connoisseur Club',
      label: 'Visit the club',
    },
    {
      href: 'https://millionairescollection.com/',
      image: '/assets/partners/millionaires-collection.webp',
      eyebrow: 'A private world',
      title: 'Millionaires Collection',
      label: 'Discover the collection',
    },
    {
      href: 'https://cigarconnoisseurclub.com/',
      image: '/assets/partners/cigar-connoisseur.webp',
      eyebrow: 'African tobacco',
      title: 'The Connoisseur’s Humidor',
      label: 'View exclusive offers',
    },
  ]

  return (
    <section 
      className="py-[54px] lg:py-[55px] border-t border-white/10 bg-[#090806]" 
      ref={sectionRef} 
      aria-labelledby="partner-title"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] items-end lg:items-center gap-8 lg:gap-[clamp(30px,4vw,70px)]">
        <div className="flex flex-col items-start justify-between lg:block">
          <h2 
            id="partner-title" 
            className="max-w-none lg:max-w-[210px] m-[8px_0_0] font-serif text-[clamp(36px,3vw,48px)] font-medium tracking-[-0.035em] leading-[0.98] text-[#eee8dd]"
          >
            Advertise With Us
          </h2>
          <p className="mt-4 lg:mt-6 text-[#918a7f] text-[15px] leading-[1.8]">
            A private circle of complementary houses, chosen for clients who appreciate craftsmanship beyond the bottle.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {destinations.map((destination) => (
            <a 
              className="partner-card group relative block overflow-hidden min-h-[235px] lg:min-h-0 aspect-square border border-[#e1bd70]/20 bg-[#14110d]" 
              href={destination.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              key={`${destination.title}-${destination.href}`}
            >
              <img 
                className="absolute inset-0 w-full h-full object-contain object-center transition-[filter] duration-500 ease group-hover:saturate-[1.06] group-hover:brightness-[1.03]" 
                src={destination.image} 
                alt="" 
                loading="lazy" 
              />
              <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,4,3,0.88),rgba(5,4,3,0.22)_66%,rgba(5,4,3,0.08))]" />
              <span className="absolute inset-0 flex flex-col items-start justify-end p-[28px]">
                <small className="text-[#e1bd70] text-[9px] lg:text-[13px] lg:leading-[1.45] font-[650] tracking-[0.16em] uppercase">
                  {destination.eyebrow}
                </small>
                <strong className="max-w-[270px] mt-[7px] font-serif text-[clamp(26px,2.3vw,37px)] lg:text-[clamp(27px,2.2vw,35px)] font-medium leading-[1] lg:leading-[1.08] text-[#eee8dd]">
                  {destination.title}
                </strong>
                <em className="inline-flex items-center mt-[17px] pb-[5px] border-b border-[#e1bd70]/55 gap-2 text-[#d9d0c1] text-[9px] lg:text-[13px] lg:leading-[1.45] not-italic font-[650] tracking-[0.11em] uppercase">
                  {destination.label} <ArrowRight size={15} />
                </em>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
