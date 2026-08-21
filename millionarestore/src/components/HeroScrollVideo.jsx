import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from 'lucide-react'
import './HeroScrollVideo.css'

gsap.registerPlugin(ScrollTrigger)

export default function HeroScrollVideo() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaRef = useRef(null)
  const introRef = useRef(null)
  const terroirRef = useRef(null)
  const editionRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let context

    const createExperience = () => {
      if (reducedMotion) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      canvas.width = 1920 * dpr
      canvas.height = 1080 * dpr
      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      const frameCount = 300
      const currentFrame = index => `/hero-sequence/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`

      const images = []
      const playhead = { frame: 0 }

      let currentFrameIndex = -1
      for (let i = 0; i < frameCount; i++) {
        const img = new Image()
        img.src = currentFrame(i)
        images.push(img)
      }

      function render() {
        const frame = Math.round(playhead.frame)
        if (frame !== currentFrameIndex && images[frame] && images[frame].complete) {
          ctx.drawImage(images[frame], 0, 0, 1920, 1080)
          currentFrameIndex = frame
        }
      }

      images[0].onload = render

      context = gsap.context(() => {
        // Intro text animations on load
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
            clearProps: 'transform,clipPath', // keep opacity
          },
        )

        // The background image sequence loops infinitely
        gsap.to(playhead, {
          frame: frameCount - 1,
          snap: 'frame',
          duration: 10,
          repeat: -1,
          ease: 'none',
          onUpdate: render,
        })

        // Progress bar loops
        gsap.to(progressRef.current, { 
          scaleX: 1, 
          duration: 10, 
          repeat: -1, 
          ease: 'none' 
        })

        // Text sequencing timeline (loops with the video)
        const timeline = gsap.timeline({
          repeat: -1,
          defaults: { ease: 'power2.inOut' }
        })

        timeline
          // Intro stays for a bit, then fades out
          .to(introRef.current, { y: -45, autoAlpha: 0, duration: 1 }, 2.5)
          // Terroir fades in
          .fromTo(terroirRef.current, { x: -45, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1 }, 3.5)
          // Terroir fades out
          .to(terroirRef.current, { x: 28, autoAlpha: 0, duration: 1 }, 6.0)
          // Edition fades in
          .fromTo(editionRef.current, { x: 45, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1 }, 7.0)
          // Edition fades out before loop restarts
          .to(editionRef.current, { y: -24, autoAlpha: 0, duration: 1 }, 9.5)
          // Reset intro for the next loop (so it matches the 10 second loop of the video)
          .set(introRef.current, { y: 68, autoAlpha: 0 }, 10)

      }, sectionRef)
    }

    createExperience()

    return () => {
      context?.revert()
    }
  }, [])

  return (
    <section className="hero-scroll" id="home" ref={sectionRef}>
      <div className="hero-stage" ref={stageRef}>
        <div className="hero-media" ref={mediaRef}>
          <canvas ref={canvasRef} aria-label="Millionaires Collection sparkling wine film sequence" />
          <div className="hero-film-shade" />
        </div>

        <div className="hero-intro shell" ref={introRef}>
          <p>Méthode Cap Classique</p>
          <h1><span>The 2021</span>Limited Edition</h1>
        </div>

        <article className="hero-chapter hero-terroir" ref={terroirRef}>
          <strong>13</strong>
          <h2>Distinct Terroirs</h2>
        </article>

        <article className="hero-chapter hero-edition" ref={editionRef}>
          <h2>The <em>Millionaire</em> Marque</h2>
          <p>Timeless sophistication crafted for connoisseurs.</p>
          <a href="#story">Enter the collection</a>
        </article>

        <div className="hero-progress"><span ref={progressRef} /></div>
      </div>
    </section>
  )
}
