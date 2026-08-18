import { useEffect, useRef } from 'react'
import { gsap as gsapLib } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsapLib.registerPlugin(ScrollTrigger)

export default function WhyChooseUs() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return undefined

    video.playbackRate = 0.94
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduceMotion) video.play().catch(() => undefined)
      else video.pause()
    }, { rootMargin: '100px 0px', threshold: 0.08 })

    observer.observe(section)
    const ctx = gsapLib.context(() => {
      gsapLib.from('.why-video-frame', {
        x: -34,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
      gsapLib.from('.why-content > *', {
        y: 22,
        opacity: 0,
        stagger: 0.08,
        duration: 0.58,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      })
    }, section)

    return () => {
      observer.disconnect()
      video.pause()
      ctx.revert()
    }
  }, [])

  const reasons = [
    {
      number: '01',
      title: 'Quality',
      text: 'All our beverages are supplied by proven manufacturers and distributors from around the world. We are highly selective and guarantee a high-class product with excellent service. Quality is paramount to our business, and our wine selection has been tasted and reviewed by leading South African panels and, most importantly, our valued customers.',
    },
    {
      number: '02',
      title: 'Domestic & Commercial',
      text: 'Online shopping has grown into an essential part of modern life. The Grand Store delivers throughout South Africa and internationally, working with reputable shipping and logistics partners to provide cost-effective, careful and on-time service for private and commercial clients.',
    },
    {
      number: '03',
      title: 'Best Cost',
      text: 'Finding the right price is one of the most important parts of online retail. We follow a considered cost-based pricing model, offering our valued customers suitable prices that remain fair, transparent and accessible.',
    },
  ]

  return (
    <section 
      className="py-[54px] lg:py-[72px] border-t border-white/10 bg-[#0d0b08] bg-[radial-gradient(circle_at_72%_32%,rgba(143,89,28,0.14),transparent_32rem)]" 
      ref={sectionRef} 
      id="why-us"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1.06fr)_minmax(430px,0.94fr)] items-stretch min-h-[470px] gap-8 lg:gap-[clamp(38px,5vw,78px)]">
        <div className="why-content flex flex-col justify-center py-2.5">
          <h2 
            className="m-[8px_0_0] font-serif text-[clamp(48px,4.6vw,70px)] font-medium tracking-[-0.045em] leading-[0.9] text-[#eee8dd]"
          >
            Why Choose Us
          </h2>
          <p className="max-w-[530px] m-[24px_0_20px] text-[#a69e92] font-serif text-[17px] leading-[1.5]">
            Quiet expertise, trusted provenance and thoughtful service from our cellar to your door.
          </p>
          <div className="border-t border-[#e1bd70]/20">
            {reasons.map((reason) => (
              <article key={reason.number} className="grid grid-cols-[32px_1fr] py-[15px] gap-[14px] border-b border-white/5">
                <span className="pt-[3px] text-[#bd9054] font-serif text-[14px] lg:text-[17px]">{reason.number}</span>
                <div>
                  <h3 className="m-[0_0_3px] font-serif text-[20px] lg:text-[24px] font-medium text-[#eee8dd]">{reason.title}</h3>
                  <p className="m-0 text-[#7f786e] text-[12px] lg:text-[18px] lg:leading-[1.62] leading-[1.5]">{reason.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="why-video-frame relative overflow-hidden min-h-[430px] border border-[#e1bd70]/20 bg-[#12100d] before:absolute before:inset-[13px] before:z-10 before:border before:border-[#eed397]/15 before:pointer-events-none lg:order-last order-first">
          <video 
            className="w-full h-full object-cover scale-[1.012] will-change-auto" 
            ref={videoRef} 
            src="/assets/media/why-choose-us.mp4" 
            muted 
            loop 
            playsInline 
            disablePictureInPicture
            preload="metadata"
            aria-label="Friends enjoying wine together"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(6,5,4,0.68))] pointer-events-none" />
          <span className="absolute right-[30px] bottom-[25px] left-[30px] text-[#e9dfcf] font-serif text-[19px] italic">
            The pleasure of good company
          </span>
        </div>
      </div>
    </section>
  )
}
