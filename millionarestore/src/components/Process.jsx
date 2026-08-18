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
  const bottleRef = useRef(null)

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(bottleRef.current, { rotate: -7, y: 60 }, {
        rotate: 5,
        y: -35,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      gsap.from('.process-step', {
        x: 48,
        autoAlpha: 0,
        stagger: 0.14,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.process-steps', start: 'top 82%', once: true },
      })
    }, sectionRef)
    return () => context.revert()
  }, [])

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      <div className="shell process-heading" data-reveal>
        <div>
          <p className="eyebrow">Discover the process of winemaking</p>
          <h2 className="section-title">Crafted in silence—<br /><em>a cellar’s devotion to detail.</em></h2>
        </div>
        <p>Four measured movements transform hand-selected fruit into an elegant Méthode Cap Classique.</p>
      </div>

      <div className="shell process-layout">
        <div className="process-bottle-stage">
          <span>Chardonnay</span><span>Pinot Noir</span>
          <img ref={bottleRef} src="/assets/process-bottle.png" alt="Millionaires Collection premium sparkling wine bottle" />
          <div className="process-orbit" />
        </div>

        <div className="process-steps">
          {steps.map((step, index) => (
            <article className="process-step" key={step.title}>
              <span>0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
