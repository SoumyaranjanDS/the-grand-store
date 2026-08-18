import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollVideoHero.css';

gsap.registerPlugin(ScrollTrigger);

function ScrollVideoHero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const introRef = useRef(null);
  const closeRef = useRef(null);
  const progressRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let context;

    const mountTimeline = () => {
      if (!video.duration || context || reducedMotion) return;

      const playhead = { time: 0 };
      const finalTime = Math.max(video.duration - 0.05, 0);
      video.pause();
      video.currentTime = 0;

      context = gsap.context(() => {
        gsap.set(closeRef.current, { autoAlpha: 0, x: -50 });
        gsap.set(progressRef.current, { scaleY: 0, transformOrigin: 'top' });

        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * 1.8}`,
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
          .to(playhead, {
            time: finalTime,
            duration: 1,
            onUpdate: () => {
              if (Math.abs(video.currentTime - playhead.time) > 0.015) video.currentTime = playhead.time;
            },
          }, 0)
          .to(progressRef.current, { scaleY: 1, duration: 1 }, 0)
          .to(introRef.current, { autoAlpha: 0, x: 50, duration: 0.18 }, 0.14)
          .to('.scroll-film__shade', { opacity: 0.18, duration: 0.24 }, 0.25)
          .to('.scroll-film__shade', { opacity: 0.64, duration: 0.24 }, 0.68)
          .to(closeRef.current, { autoAlpha: 1, x: 0, duration: 0.2 }, 0.72);
      }, section);
    };

    const handleMetadata = () => {
      mountTimeline();
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) mountTimeline();
    else video.addEventListener('loadedmetadata', handleMetadata, { once: true });

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      context?.revert();
    };
  }, []);

  return (
    <section className="scroll-film" ref={sectionRef} aria-label="Cigar Connoisseur Club film">
      <video ref={videoRef} className="scroll-film__video" muted playsInline preload="auto" aria-label="Cigar smoke film">
        <source src="/media/smoke-3.mp4" type="video/mp4" />
      </video>
      <div className="scroll-film__shade" aria-hidden="true" />
      <div className="scroll-film__grain" aria-hidden="true" />

      <div className="scroll-film__copy" ref={introRef}>
        <p>Cigar Connoisseur Club</p>
        <h1>A world of<br /><em>exceptional cigars.</em></h1>
        <span>Curated for those who appreciate the ritual.</span>
      </div>

      <div className="scroll-film__copy scroll-film__copy--closing" ref={closeRef}>
        <p>Discover the collection</p>
        <h2>Craft, character<br /><em>and provenance.</em></h2>
        <a href="#new-arrivals">Explore new arrivals <ArrowUpRight size={16} strokeWidth={1.4} /></a>
      </div>

      <div className="scroll-film__cue" aria-hidden="true"><ArrowDown size={14} /><span>Scroll to discover</span></div>
      <div className="scroll-film__progress" aria-hidden="true">
        <span>01</span><i><b ref={progressRef} /></i><span>03</span>
      </div>
    </section>
  );
}

export default ScrollVideoHero;
