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

  useEffect(() => {
    const isMobile = window.innerWidth < 768

    const context = gsap.context(() => {
      const bgs = gsap.utils.toArray('.process-bg')
      const panels = gsap.utils.toArray('.process-panel')
      
      if (!isMobile) {
        // Horizontal scroll logic
        const scrollWidth = trackRef.current.scrollWidth - (window.innerWidth * 0.7) // 70vw is the viewport for the track
        const endScrollDistance = scrollWidth + (window.innerWidth * 0.5) // Extra scrolling space to keep last panel pinned
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${endScrollDistance}`, 
            scrub: 1, 
            pin: true,
            invalidateOnRefresh: true,
          }
        })

        // Move the track horizontally
        tl.to(trackRef.current, {
          x: -scrollWidth,
          ease: 'none',
          duration: 1
        }, 0)

        // Background crossfades tied to timeline progress
        // bgs[0] is initial (covers Intro and Step 1).
        tl.to(bgs[0], { opacity: 0.3, duration: 0.1, ease: 'power1.inOut' }, 0)
        
        // Step 2 starts around progress 0.5
        tl.to(bgs[0], { opacity: 0, duration: 0.15, ease: 'power1.inOut' }, 0.4)
        tl.to(bgs[1], { opacity: 0.3, duration: 0.15, ease: 'power1.inOut' }, 0.4)
        
        // Step 3 starts around progress 0.75
        tl.to(bgs[1], { opacity: 0, duration: 0.15, ease: 'power1.inOut' }, 0.65)
        tl.to(bgs[2], { opacity: 0.3, duration: 0.15, ease: 'power1.inOut' }, 0.65)
        
        // Step 4 starts around progress 1.0
        tl.to(bgs[2], { opacity: 0, duration: 0.15, ease: 'power1.inOut' }, 0.9)
        tl.to(bgs[3], { opacity: 0.3, duration: 0.15, ease: 'power1.inOut' }, 0.9)

        // Add dummy padding to the timeline so the last step stays pinned for a moment
        tl.to({}, { duration: 0.2 })

        // Now bind text animations to the horizontal timeline container
        panels.forEach((panel) => {
          const content = panel.querySelector('.step-content') || panel.querySelector('.process-intro-content')
          if (content) {
            gsap.fromTo(content, 
              { x: -50, opacity: 0 },
              { 
                x: 0, opacity: 1, 
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: tl, // This makes it track horizontal scroll!
                  start: 'left 85%',
                  toggleActions: 'play none none reverse'
                }
              }
            )
          }
        })
      }
    }, sectionRef)
    
    return () => context.revert()
  }, [])

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      <div className="process-container">
        
        {/* Left 30% Sticky Column */}
        <div className="process-left">
          <div className="process-bg-layer">
            <img src="/assets/process-bg-1.jpg" alt="Vineyard at golden hour" className="process-bg" />
            <img src="/assets/process-bg-2.jpg" alt="Macro photography of grapes being crushed" className="process-bg" />
            <img src="/assets/process-bg-3.jpg" alt="French oak barrels in a dim wine cellar" className="process-bg" />
            <img src="/assets/process-bg-4.jpg" alt="Golden sparkling wine bubbles" className="process-bg" />
            <div className="process-bg-overlay" />
          </div>

          <div className="process-bottle-fixed">
            <img src="/assets/process-bottle.png" alt="Millionaires Collection premium sparkling wine bottle" />
          </div>
        </div>

        {/* Right 70% Scrolling Window */}
        <div className="process-right">
          
          {/* The track that moves horizontally */}
          <div className="process-horizontal-track" ref={trackRef}>
            
            <div className="process-panel">
              <div className="process-intro-content">
                <div className="intro-title-wrapper">
                  <p className="eyebrow">Discover the process</p>
                  <h2 className="section-title">Crafted in silence—<br /><em>a cellar’s devotion to detail.</em></h2>
                </div>
                <div className="intro-desc-wrapper">
                  <p className="intro-text">Four measured movements transform hand-selected fruit into an elegant Méthode Cap Classique.</p>
                </div>
              </div>
            </div>

            {steps.map((step, index) => (
              <div className="process-panel" key={step.title}>
                <div className="step-content">
                  <span className="step-number">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  )
}
