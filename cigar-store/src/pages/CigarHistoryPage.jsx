import { useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SiteFooter from '../sections/SiteFooter';
import { historyChapters } from '../data/historyContent';
import './CigarHistoryPage.css';

gsap.registerPlugin(ScrollTrigger);

function ChapterCopy({ chapter }) {
  return (
    <div className="history-chapter__copy">
      <p className="history-chapter__eyebrow history-reveal">{chapter.eyebrow}</p>
      <h2 className="history-reveal">{chapter.title}</h2>
      {chapter.lead && <p className="history-chapter__lead history-reveal">{chapter.lead}</p>}

      {chapter.entries && (
        <div className="history-chapter__entries">
          {chapter.entries.map((entry) => (
            <div className="history-entry history-reveal" key={entry.label}>
              <h3>{entry.label}</h3>
              <p>{entry.body}</p>
            </div>
          ))}
        </div>
      )}

      {chapter.paragraphs && (
        <div className="history-chapter__prose">
          {chapter.paragraphs.map((paragraph) => <p className="history-reveal" key={paragraph}>{paragraph}</p>)}
        </div>
      )}
    </div>
  );
}

function CigarHistoryPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Cigar History | Cigar Connoisseur Club';
  }, []);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!page || reducedMotion) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        '.history-page-hero__reveal',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
      );

      page.querySelectorAll('.history-chapter').forEach((chapter) => {
        const imageFrame = chapter.querySelector('.history-chapter__visual');
        const image = chapter.querySelector('img');
        const reveals = chapter.querySelectorAll('.history-reveal');
        const rule = chapter.querySelector('.history-chapter__rule span');

        gsap.timeline({
          scrollTrigger: {
            trigger: chapter,
            start: 'top 76%',
            toggleActions: 'play none none reverse',
          },
        })
          .fromTo(imageFrame, { autoAlpha: 0, x: chapter.classList.contains('history-chapter--reverse') ? 56 : -56 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'power3.out' })
          .fromTo(reveals, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.07, ease: 'power2.out' }, '-=0.58')
          .fromTo(rule, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'power2.out' }, '-=0.75');

        gsap.fromTo(image, { scale: 1.08, yPercent: -2 }, {
          scale: 1.02,
          yPercent: 3,
          ease: 'none',
          scrollTrigger: {
            trigger: chapter,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        });
      });
    }, page);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, []);

  return (
    <div className="history-page" id="top" ref={pageRef}>
      <main>
        <header className="history-page-hero">
          <div className="history-page-hero__ornament" aria-hidden="true">CC</div>
          <div className="history-page-hero__inner">
            <h1 className="history-page-hero__reveal">The ritual, <em>through time.</em></h1>
          </div>
        </header>

        <div className="history-journal">
          {historyChapters.map((chapter, index) => (
            <article className={`history-chapter ${index % 2 ? 'history-chapter--reverse' : ''}`} id={chapter.id} key={chapter.id}>
              <div className="history-chapter__rule" aria-hidden="true"><span /></div>
              <figure className="history-chapter__visual">
                <div className="history-chapter__image">
                  <img src={chapter.image} alt={chapter.imageAlt} loading={index === 0 ? 'eager' : 'lazy'} />
                </div>
                <span className="history-chapter__number">{chapter.number}</span>
                <figcaption>{chapter.caption}</figcaption>
              </figure>
              <ChapterCopy chapter={chapter} />
            </article>
          ))}
        </div>

        <section className="history-page-cta">
          <p>The story continues in every humidor.</p>
          <h2>Explore cigars with<br /><em>history and character.</em></h2>
          <a href="/shop/mosi-oa-tunya">Discover the collection <ArrowUpRight size={18} /></a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default CigarHistoryPage;
