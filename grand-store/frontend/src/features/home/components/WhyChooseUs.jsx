import { useState, useEffect, useRef } from 'react'
import { gsap as gsapLib } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Award, Truck, Sparkles, CheckCircle2 } from 'lucide-react'

gsapLib.registerPlugin(ScrollTrigger)

export default function WhyChooseUs() {
  const [activeTab, setActiveTab] = useState(0)
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
      gsapLib.fromTo(
        '.why-card',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 90%', once: true },
        }
      )
    }, section)

    return () => {
      observer.disconnect()
      video.pause()
      ctx.revert()
    }
  }, [])

  const pillars = [
    {
      id: '01',
      icon: Award,
      badge: 'Estate Guaranteed',
      titlePrefix: 'Sommelier-Vetted',
      titleAccent: 'Provenance',
      highlightPhrase: 'Estate-certified partnerships.',
      description: 'Every bottle is sourced directly from proven wine estates and master distillers. Tasted and reviewed by leading South African panels and our discerning global curators to guarantee uncompromised vintage authenticity.',
      highlight: '100% Certified Provenance',
    },
    {
      id: '02',
      icon: Truck,
      badge: 'White-Glove Delivery',
      titlePrefix: 'Climate-Controlled',
      titleAccent: 'Logistics',
      highlightPhrase: 'Insured temperature transit.',
      description: 'Temperature-sensitive storage and specialized transit partnerships ensure your collection arrives in pristine cellar condition throughout South Africa and across international destinations.',
      highlight: 'Insured Temperature Transit',
    },
    {
      id: '03',
      icon: Sparkles,
      badge: 'Direct Estate Value',
      titlePrefix: 'Direct Estate',
      titleAccent: 'Pricing',
      highlightPhrase: 'Fair transparent value.',
      description: 'We follow a considered cost-based pricing structure, connecting connoisseurs directly with top producers for accessible, fair value on world-class bottles without unnecessary markups.',
      highlight: 'Transparent Estate Pricing',
    },
  ]

  return (
    <section 
      className="relative py-[50px] md:py-[60px] bg-[#0a0a0a] border-t border-white/10 overflow-hidden" 
      ref={sectionRef} 
      id="why-us"
    >
      {/* Ambient Radial Golden Glows (Matching Vendor Dashboard) */}
      <div className="absolute -top-40 right-0 w-[400px] h-[400px] bg-[var(--color-gold)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 left-0 w-[400px] h-[400px] bg-[var(--color-gold)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 sm:px-0 relative z-10">
        
        {/* Header & KPI Summary Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 md:mb-10 gap-6 text-left">
          <div className="max-w-2xl">
            <h2 className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]">
              Why{' '}
              <span 
                className="gold-gradient-text inline-block pr-2 text-[1.12em]"
                
              >
                Choose Us
              </span>
            </h2>
            <p className="max-w-[600px] mt-3 text-[rgba(244,238,224,0.76)] text-[15px] md:text-[16px] leading-[1.65]">
              <span className="font-serif text-[#f0cf76] italic text-[1.06em]">Uncompromising excellence.</span>{' '}
              Quiet expertise, trusted provenance and thoughtful service from our cellar to your door.
            </p>
          </div>

          {/* KPI Stats Trio */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#11100d] border border-white/10 hover:border-[#c9a35b]/40 transition-all text-center group">
              <div className="text-xl sm:text-2xl font-serif text-gold-gradient font-bold mb-0.5">100%</div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#918a7f] font-semibold">Estate Direct</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#11100d] border border-white/10 hover:border-[#c9a35b]/40 transition-all text-center group">
              <div className="text-xl sm:text-2xl font-serif text-gold-gradient font-bold mb-0.5">500+</div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#918a7f] font-semibold">Curated Bottles</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#11100d] border border-white/10 hover:border-[#c9a35b]/40 transition-all text-center group">
              <div className="text-xl sm:text-2xl font-serif text-gold-gradient font-bold mb-0.5">24/7</div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#918a7f] font-semibold">Cellar Concierge</div>
            </div>
          </div>
        </div>

        {/* Interactive Experience Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 3 Pillars List */}
          <div className="lg:col-span-7 flex flex-col gap-3 text-left">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon
              const isActive = activeTab === idx
              return (
                <div
                  key={pillar.id}
                  onClick={() => setActiveTab(idx)}
                  onMouseEnter={() => setActiveTab(idx)}
                  className={`why-card relative p-5 md:p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden group text-left shadow-lg ${
                    isActive 
                      ? 'border-[#c9a35b]/60 bg-gradient-to-r from-[#17140e] to-[#0f0d0a] shadow-[0_8px_30px_rgba(0,0,0,0.45)]' 
                      : 'border-white/10 bg-[#11100d] hover:border-[#c9a35b]/40 hover:bg-[#15120e]'
                  }`}
                >
                  {/* Glowing blur orb */}
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-[var(--color-gold)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-gold)]/20 transition-all pointer-events-none" />

                  {/* Active Indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#b58b38] via-[#e6c97a] to-[#b58b38]" />
                  )}

                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 text-left relative z-10">
                    
                    {/* Large Icon & Number Column */}
                    <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2.5 shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-md ${
                        isActive 
                          ? 'border-[#c9a35b] bg-[#1a1711] text-gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                          : 'border-white/10 bg-[#0a0a0a] text-[#918a7f] group-hover:text-gold-gradient group-hover:border-[#c9a35b]/50'
                      }`}>
                        <Icon size={24} strokeWidth={1.5} className="text-gold-gradient" />
                      </div>
                      <span className="text-2xl md:text-3xl font-serif font-bold text-gold-gradient shrink-0 tracking-tight">
                        {pillar.id}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gold-gradient bg-[#c9a35b]/10 px-2.5 py-0.5 rounded-full border border-[#c9a35b]/20">
                          {pillar.badge}
                        </span>
                      </div>
                      <h3 className="m-0 font-serif text-xl md:text-2xl font-medium text-[#eee8dd] group-hover:text-white transition-colors text-left">
                        {pillar.titlePrefix}{' '}
                        <span
                          className="gold-gradient-text inline-block pr-2 text-[1.12em]"
                          
                        >
                          {pillar.titleAccent}
                        </span>
                      </h3>
                      <p className="mt-2 text-sm md:text-[15px] text-[rgba(244,238,224,0.74)] leading-relaxed font-light text-left">
                        <span className="font-serif text-[#f0cf76] italic text-[1.06em]">{pillar.highlightPhrase}</span>{' '}
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Video & Dynamic Highlight Frame (Vendor Health / Intelligence style) */}
          <div className="lg:col-span-5 relative min-h-[340px] rounded-xl border border-white/10 bg-[#11100d] overflow-hidden group shadow-2xl flex flex-col justify-between p-5 sm:p-6 hover:border-[#c9a35b]/40 transition-all">
            <video 
              className="absolute inset-0 w-full h-full object-cover scale-[1.02] transition-transform duration-700 group-hover:scale-105 opacity-80" 
              ref={videoRef} 
              src="/assets/media/why-choose-us.mp4" 
              muted 
              loop 
              playsInline 
              disablePictureInPicture
              preload="metadata"
              aria-label="Friends enjoying wine together"
            />
            {/* Ambient Darkened Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-gold)]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute inset-2.5 border border-white/10 rounded-lg pointer-events-none" />

            {/* Floating Top Badge */}
            <div className="relative z-10 self-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/75 backdrop-blur-md rounded-lg border border-[#c9a35b]/40 text-gold-gradient text-[11px] font-semibold uppercase tracking-widest shadow-lg">
                <CheckCircle2 size={14} className="text-[#e6c97a]" />
                {pillars[activeTab].highlight}
              </span>
            </div>

            {/* Bottom Caption Box */}
            <div className="relative z-10 mt-auto p-4 rounded-lg bg-black/65 backdrop-blur-md border border-white/10 text-left">
              <div className="text-[9px] uppercase tracking-widest text-gold-gradient font-bold mb-0.5">
                The Connoisseur Experience
              </div>
              <p className="text-sm sm:text-base font-serif text-[var(--color-ivory)] italic m-0">
                “The pleasure of good company, elevated by extraordinary craft.”
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Trust Guarantee Strip */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          {[
            'Temperature Insured',
            'Certified Provenance',
            'Sommelier Support',
            'Global Dispatch',
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-lg bg-[#11100d] border border-white/5 hover:border-[#c9a35b]/30 transition-all flex items-center gap-2.5 group"
            >
              <div className="p-1.5 rounded-md bg-[var(--color-gold)]/10 text-gold-gradient border border-[var(--color-gold)]/20 group-hover:bg-[var(--color-gold)]/20 transition-colors shrink-0">
                <CheckCircle2 size={14} />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-[var(--color-ivory)] font-semibold truncate">
                {item}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
