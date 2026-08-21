import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Process.css'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { title: 'Harvesting', description: 'True to the tradition of Méthode Cap Classique, whole bunches are gently pressed at just 0.4 bar, preserving the essence of each varietal.' },
  { title: 'Crushing & Pressing', description: 'The base wine undergoes a remarkable 12-month maturation in French oak barrels.' },
  { title: 'Fermentation', description: 'Only the finest barrels are selected for a perfect Chardonnay & Pinot Noir blend.' },
  { title: 'Ageing & Bottling', description: 'This refined cuvée is bottled, capturing the soul of the vintage.' },
]

export default function Process() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const bottleRef = useRef(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 768

    const context = gsap.context(() => {
      if (!isMobile) {
        const scrollWidth = trackRef.current.scrollWidth - window.innerWidth

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${scrollWidth * 0.35}`, // Fast scroll
            scrub: 0.3, // Snappy
            pin: true,
            invalidateOnRefresh: true,
          }
        })

        // 1. Horizontal Scroll Animation
        tl.to(trackRef.current, {
          x: -scrollWidth,
          ease: 'none',
          duration: 1 // Baseline duration for the timeline
        }, 0)

        // 2. Bottle Rotation
        gsap.to(bottleRef.current, {
          rotate: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${scrollWidth * 0.35}`,
            scrub: 0.3,
          }
        })

        // 3. Cinematic Background Crossfades
        const bgs = gsap.utils.toArray('.process-bg')
        
        // Initial Background (Harvesting) fades in early
        tl.to(bgs[0], { opacity: 0.3, duration: 0.1, ease: 'power2.inOut' }, 0)
        
        // Step 2 (Crushing) background
        tl.to(bgs[1], { opacity: 0.3, duration: 0.15, ease: 'power2.inOut' }, 0.25)
        
        // Step 3 (Fermentation) background
        tl.to(bgs[2], { opacity: 0.3, duration: 0.15, ease: 'power2.inOut' }, 0.55)
        
        // Step 4 (Bottling) background
        tl.to(bgs[3], { opacity: 0.3, duration: 0.15, ease: 'power2.inOut' }, 0.85)

      }
    }, sectionRef)
    
    return () => context.revert()
  }, [])

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      
      {/* Cinematic Background Layer */}
      <div className="process-bg-layer">
        <img src="/assets/process-bg-1.jpg" alt="Vineyard at golden hour" className="process-bg" />
        <img src="/assets/process-bg-2.jpg" alt="Macro photography of grapes being crushed" className="process-bg" />
        <img src="/assets/process-bg-3.jpg" alt="French oak barrels in a dim wine cellar" className="process-bg" />
        <img src="/assets/process-bg-4.jpg" alt="Golden sparkling wine bubbles" className="process-bg" />
        <div className="process-bg-overlay" /> {/* Dark gradient overlay to ensure text readability */}
      </div>

      <div className="process-pin-wrapper">
        
        {/* Fixed Central Bottle */}
        <div className="process-bottle-fixed" ref={bottleRef}>
          <img src="/assets/process-bottle.png" alt="Millionaires Collection premium sparkling wine bottle" />
        </div>

        {/* Moving Horizontal Track */}
        <div className="process-horizontal-track" ref={trackRef}>
          
          <div className="process-panel process-intro-panel">
            <div className="process-intro-content">
              <p className="eyebrow">Discover the process</p>
              <h2 className="section-title">Crafted in silence—<br /><em>a cellar’s devotion to detail.</em></h2>
              <p className="intro-text">Four measured movements transform hand-selected fruit into an elegant Méthode Cap Classique.</p>
            </div>
          </div>

          {steps.map((step, index) => (
            <div className="process-panel process-step-panel" key={step.title}>
              <div className="step-content">
                <span className="step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}
