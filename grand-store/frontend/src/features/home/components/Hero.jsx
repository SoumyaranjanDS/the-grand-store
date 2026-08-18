import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowDown, ArrowRight } from 'lucide-react'

const heroFilms = [
  {
    src: '/assets/media/grand-store-hero-scrub.mp4',
    label: 'A premium whisky being served at an evening gathering',
    maxTime: 7,
  },
  {
    src: '/assets/media/grand-store-hero-cellar-hd.mp4',
    label: 'A cinematic journey through a premium wine cellar',
    maxTime: 13,
  },
  {
    src: '/assets/media/grand-store-hero-celebration-wide.mp4',
    label: 'A refined celebration featuring premium wine and spirits',
    maxTime: 13,
  },
]

export default function Hero() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const heroContentRef = useRef(null)
  const transitionLockRef = useRef(false)
  const [activeFilmIndex, setActiveFilmIndex] = useState(0)

  const changeFilm = (nextIndex) => {
    if (nextIndex === activeFilmIndex || transitionLockRef.current) return

    const video = videoRef.current
    if (!video) {
      setActiveFilmIndex(nextIndex)
      return
    }

    transitionLockRef.current = true
    gsap.killTweensOf(video)
    gsap.to(video, {
      autoAlpha: 0,
      scale: 1.018,
      duration: 0.42,
      ease: 'power2.inOut',
      onComplete: () => setActiveFilmIndex(nextIndex),
    })
  }

  useEffect(() => {
    const section = sectionRef.current
    const content = heroContentRef.current
    if (!section || !content) return undefined

    const ctx = gsap.context(() => {
      gsap.from('.hero-title-line, .hero-cta-row', {
        y: 26,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.1,
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    transitionLockRef.current = false
    video.currentTime = 0

    const revealVideo = () => {
      video.play().catch(() => undefined)
      gsap.fromTo(
        video,
        { autoAlpha: 0, scale: 1.018 },
        { autoAlpha: 1, scale: 1, duration: 0.72, ease: 'power2.out' },
      )
    }

    if (video.readyState >= 3) revealVideo()
    else video.addEventListener('canplay', revealVideo, { once: true })

    return () => {
      video.removeEventListener('canplay', revealVideo)
      video.pause()
      gsap.killTweensOf(video)
    }
  }, [activeFilmIndex])

  const handleFilmProgress = (event) => {
    const film = heroFilms[activeFilmIndex]
    if (event.currentTarget.currentTime >= film.maxTime) {
      changeFilm((activeFilmIndex + 1) % heroFilms.length)
    }
  }

  const activeFilm = heroFilms[activeFilmIndex]

  return (
    <section className="relative h-[calc(100svh-112px)] min-h-[680px] bg-[#0c0b09] overflow-hidden" id="top" ref={sectionRef}>
      <div className="absolute inset-0">
        <video
          key={activeFilm.src}
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transform scale-[1.018] will-change-transform"
          src={activeFilm.src}
          muted
          autoPlay
          playsInline
          preload="auto"
          onTimeUpdate={handleFilmProgress}
          onEnded={() => changeFilm((activeFilmIndex + 1) % heroFilms.length)}
          aria-label={activeFilm.label}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.4)_40%,transparent_100%),linear-gradient(0deg,rgba(0,0,0,0.4)_0%,transparent_80%,rgba(8,8,7,0.82))]" />
        <div className="absolute inset-0 opacity-[0.13] pointer-events-none mix-blend-soft-light bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%22.7%22_numOctaves=%222%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22_opacity=%22.6%22/%3E%3C/svg%3E')]" />
        
        <div className="relative z-10 flex items-center h-full max-w-[1240px] mx-auto px-6" ref={heroContentRef}>
          <div className="w-[min(650px,56vw)] pb-[1vh]">
            <h1 className="m-0 font-serif text-[clamp(64px,6.3vw,102px)] font-medium tracking-[-0.04em] leading-[0.82] text-shadow-[0_9px_35px_rgba(0,0,0,0.38)] text-[#f4eee3]">
              <span className="hero-title-line block">Not simply poured.</span>
              <span className="hero-title-line block text-[#e1bd70] font-normal italic">Remembered.</span>
            </h1>
            <div className="hero-cta-row flex items-center mt-[34px] gap-[29px]">
              <a className="inline-flex items-center justify-center min-h-[49px] px-6 gap-[14px] border border-[#e1bd70] text-[#0b0907] bg-[#e1bd70] text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-180 hover:bg-white hover:border-white hover:text-black hover:-translate-y-0.5" href="#arrivals">Explore the collection <ArrowRight size={17} /></a>
            </div>
          </div>
        </div>
        
        <a className="absolute z-10 bottom-12 left-6 sm:left-[max(24px,calc((100vw-1240px)/2))] flex items-center gap-3 text-[#c4bbaf] text-[10px] tracking-[0.2em] uppercase transition-colors hover:text-[#e1bd70] scroll-cue" href="#arrivals">
          <span>Scroll to discover</span>
          <ArrowDown size={17} className="text-[#e1bd70] animate-[bounce_1.8s_ease-in-out_infinite]" />
        </a>
        
        <div className="absolute z-10 bottom-[46px] left-1/2 -translate-x-1/2 flex items-center gap-[11px]" role="tablist" aria-label="Hero films">
          {heroFilms.map((film, index) => (
            <button
              key={film.src}
              type="button"
              className={`p-0 h-2 border rounded-full cursor-pointer transition-all duration-240 ease-out focus:outline-none ${index === activeFilmIndex ? 'w-7 border-[#e1bd70] bg-[#e1bd70]' : 'w-2 border-white/70 bg-white/10 hover:border-[#e1bd70]'}`}
              onClick={() => changeFilm(index)}
              role="tab"
              aria-selected={index === activeFilmIndex}
              aria-label={`Play hero film ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
