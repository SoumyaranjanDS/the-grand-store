import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from 'lucide-react'
import './HeroScrollVideo.css'

gsap.registerPlugin(ScrollTrigger)

export default function HeroScrollVideo() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const mediaRef = useRef(null)
  const introRef = useRef(null)
  const terroirRef = useRef(null)
  const editionRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let context

    const createExperience = () => {
      video.pause()
      if (reducedMotion) return

      const playhead = { time: 0 }
      context = gsap.context(() => {
        gsap.fromTo(
          introRef.current.children,
          { y: 68, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            y: 0,
            autoAlpha: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.05,
            stagger: 0.16,
            ease: 'power3.out',
            delay: 0.12,
            clearProps: 'transform,opacity,visibility,clipPath',
          },
        )

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=240%',
            scrub: 1.15,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        timeline
          .to(playhead, {
            time: Math.max(0.1, video.duration - 0.08),
            duration: 3,
            onUpdate: () => {
              if (Number.isFinite(playhead.time) && Math.abs(video.currentTime - playhead.time) > 0.025) video.currentTime = playhead.time
            },
          }, 0)
          .to(progressRef.current, { scaleX: 1, duration: 3 }, 0)
          .to(introRef.current, { y: -45, autoAlpha: 0, duration: 0.4 }, 0.42)
          .fromTo(terroirRef.current, { x: -45, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.42 }, 0.7)
          .to(terroirRef.current, { x: 28, autoAlpha: 0, duration: 0.34 }, 1.38)
          .fromTo(editionRef.current, { x: 45, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.46 }, 1.58)
          .to(editionRef.current, { y: -24, autoAlpha: 0, duration: 0.36 }, 2.57)
      }, sectionRef)
      ScrollTrigger.refresh()
    }

    if (video.readyState >= 1) createExperience()
    else video.addEventListener('loadedmetadata', createExperience, { once: true })

    return () => {
      video.removeEventListener('loadedmetadata', createExperience)
      context?.revert()
    }
  }, [])

  return (
    <section className="hero-scroll" id="home" ref={sectionRef}>
      <div className="hero-stage" ref={stageRef}>
        <div className="hero-media" ref={mediaRef}>
          <video ref={videoRef} src="/assets/hero-video-scroll.mp4" muted playsInline preload="auto" aria-label="Millionaires Collection sparkling wine film" />
          <div className="hero-film-shade" />
        </div>

        <div className="hero-intro shell" ref={introRef}>
          <p>Signature Méthode Cap Classique</p>
          <h1><span>The 2021</span>Limited Edition</h1>
          <div className="hero-intro-foot">
            <p>Chardonnay &amp; Pinot Noir</p>
            <span>An African masterpiece in every sip</span>
          </div>
        </div>

        <article className="hero-chapter hero-terroir" ref={terroirRef}>
          <span>01 — Origin</span>
          <strong>13</strong>
          <h2>Distinct wine pockets</h2>
          <p>Scattered across the Western Cape’s most celebrated wine-growing regions.</p>
        </article>

        <article className="hero-chapter hero-edition" ref={editionRef}>
          <span>02 — The marque</span>
          <h2>The “M” stands for <em>Millionaire.</em></h2>
          <p>A symbol of status, select taste, and timeless sophistication—crafted for collectors and connoisseurs who accept only the rarest and the best.</p>
          <a href="#story">Enter the collection</a>
        </article>

        <div className="hero-scroll-cue"><ArrowDown size={15} /><span>Scroll to play the film</span></div>
        <div className="hero-progress"><span ref={progressRef} /></div>
      </div>
    </section>
  )
}
