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
    src: '/assets/media/grand-store-hero-third.mp4',
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

    const context = gsap.context(() => {
      gsap.from('.hero-title-line, .hero-cta-row', {
        y: 26,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.1,
      })
    }, section)

    return () => context.revert()
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
    <section className="hero-scroll" id="top" ref={sectionRef}>
      <div className="hero-sticky">
        <video
          key={activeFilm.src}
          ref={videoRef}
          className="hero-video"
          src={activeFilm.src}
          muted
          autoPlay
          playsInline
          preload="auto"
          onTimeUpdate={handleFilmProgress}
          onEnded={() => changeFilm((activeFilmIndex + 1) % heroFilms.length)}
          aria-label={activeFilm.label}
        />
        <div className="hero-shade" />
        <div className="hero-grain" />

        <div className="shell hero-content" ref={heroContentRef}>
          <div className="hero-copy-block">
            <h1>
              <span className="hero-title-line">Not simply poured.</span>
              <span className="hero-title-line italic">Remembered.</span>
            </h1>
            <div className="hero-cta-row">
              <a className="button button-gold" href="#arrivals">
                Explore the collection <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>

        <a className="scroll-cue" href="#arrivals" aria-label="Scroll to featured arrivals">
          <ArrowDown size={17} />
        </a>

        <div className="hero-film-dots" role="tablist" aria-label="Hero films">
          {heroFilms.map((film, index) => (
            <button
              key={film.src}
              type="button"
              className={index === activeFilmIndex ? 'active' : ''}
              onClick={() => changeFilm(index)}
              role="tab"
              aria-selected={index === activeFilmIndex}
              aria-label={`Play hero film ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
