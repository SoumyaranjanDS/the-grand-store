import React, { useEffect } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from '../sections/SiteFooter';
import './ExclusiveCollection.css';

const craftPillars = [
  {
    number: '01',
    title: 'Discerning selection',
    text: 'Every component is chosen for balance, character and the way it contributes to the whole—not simply for rarity alone.',
  },
  {
    number: '02',
    title: 'Time as an ingredient',
    text: 'Patience allows the tobacco to settle into itself, softening the edges while preserving the depth that gives each draw presence.',
  },
  {
    number: '03',
    title: 'Master construction',
    text: 'Careful rolling, an even burn and a considered draw complete an experience designed to unfold slowly from first light to final ash.',
  },
];

const tastingNotes = [
  {
    stage: 'The opening',
    title: 'Quietly aromatic',
    text: 'A composed introduction with warm cedar, gentle spice and a restrained natural sweetness.',
  },
  {
    stage: 'The heart',
    title: 'Richly layered',
    text: 'Roasted coffee and dark cocoa emerge through the centre, bringing texture without overwhelming the palate.',
  },
  {
    stage: 'The finish',
    title: 'Long and measured',
    text: 'A polished close of seasoned wood and lingering warmth rewards an unhurried final third.',
  },
];

function ExclusiveCollectionPage() {
  useEffect(() => {
    window.scrollTo(0, 0);

    const revealItems = document.querySelectorAll('[data-ec-reveal]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="exclusive-collection-page site-shell" id="top">
      <main>
        <section className="ec-hero" aria-labelledby="exclusive-collection-title">
          <div className="ec-hero__inner">
            <div className="ec-hero__copy">
              <span className="ec-kicker">The Millionaires Collection · Private Release</span>
              <h1 id="exclusive-collection-title">
                A richer expression <em>of time.</em>
              </h1>
              <p className="ec-hero__lead">
                A signature cigar collection shaped by patience, precision and an absolute respect for the ritual.
              </p>
              <p className="ec-hero__body">
                Created for considered evenings and memorable company, each cigar is composed to reveal its character gradually—never hurried, never overstated.
              </p>

              <div className="ec-hero__actions">
                <Link className="ec-button ec-button--gold" to="/contact">
                  Request private access <ArrowRight size={17} />
                </Link>
                <a className="ec-button ec-button--text" href="#philosophy">
                  Discover the collection <ChevronDown size={17} />
                </a>
              </div>

              <div className="ec-hero__release">
                <span>Edition I</span>
                <span>Hand-rolled</span>
                <span>Coming soon</span>
              </div>
            </div>

            <figure className="ec-hero__visual">
              <div className="ec-hero__image-frame">
                <img
                  src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787664075/cigar-store/ChatGPT_Image_Aug_25_2026_05_02_31_PM.jpg"
                  alt="Millionaires Collection cigar presentation"
                />
              </div>
              <figcaption>
                <span>Campaign portrait · No. 01</span>
                <span>Beyond mere luxury</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="ec-philosophy" id="philosophy">
          <div className="ec-section-shell">
            <div className="ec-philosophy__heading" data-ec-reveal>
              <span className="ec-kicker ec-kicker--dark">The philosophy</span>
              <h2>Luxury is not excess.<br /><em>It is attention.</em></h2>
            </div>

            <div className="ec-philosophy__copy" data-ec-reveal>
              <p className="ec-dropcap">
                The Millionaires Collection begins with a simple belief: the most rewarding things reveal themselves slowly. A fine cigar is not an interruption to the day, but an invitation to become present within it.
              </p>
              <p>
                That belief guides every choice—from the harmony of the blend to the tactile weight of the presentation. The result is a collection with confidence rather than noise: deeply expressive, impeccably composed and made to be remembered.
              </p>
            </div>

            <div className="ec-principles" data-ec-reveal>
              <div>
                <span>01</span>
                <strong>Heritage</strong>
                <p>Tradition treated as a living discipline, refined for the modern aficionado.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Elegance</strong>
                <p>A poised, layered experience in which every detail earns its place.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Character</strong>
                <p>A distinctive profile with depth, warmth and a finish that stays with you.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="ec-craft" id="craft">
          <div className="ec-section-shell ec-craft__layout">
            <figure className="ec-craft__visual" data-ec-reveal>
              <span className="ec-figure-index">02 / Heritage in every detail</span>
              <img
                src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787664077/cigar-store/ChatGPT_Image_Aug_25_2026_05_30_51_PM.jpg"
                alt="Vintage Millionaires Collection cigar campaign artwork"
                loading="lazy"
              />
              <figcaption>Take a moment. Greatness takes time.</figcaption>
            </figure>

            <div className="ec-craft__content" data-ec-reveal>
              <span className="ec-kicker">From leaf to legacy</span>
              <h2>Crafted without <em>shortcuts.</em></h2>
              <p className="ec-craft__intro">
                Great construction should feel effortless in the hand. Achieving it is anything but. The Millionaires Collection is built through disciplined selection, patient maturation and the practiced touch of experienced makers.
              </p>

              <div className="ec-craft__steps">
                {craftPillars.map((pillar) => (
                  <article key={pillar.number}>
                    <span>{pillar.number}</span>
                    <div>
                      <h3>{pillar.title}</h3>
                      <p>{pillar.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="ec-profile" id="profile">
          <div className="ec-section-shell">
            <div className="ec-profile__header" data-ec-reveal>
              <div>
                <span className="ec-kicker ec-kicker--dark">The tasting arc</span>
                <h2>A profile with <em>presence.</em></h2>
              </div>
              <p>
                Complex without becoming heavy, the experience moves in deliberate stages. Each note has room to arrive, develop and resolve.
              </p>
            </div>

            <div className="ec-profile__grid" data-ec-reveal>
              {tastingNotes.map((note, index) => (
                <article key={note.stage}>
                  <div className="ec-profile__number">0{index + 1}</div>
                  <span>{note.stage}</span>
                  <h3>{note.title}</h3>
                  <p>{note.text}</p>
                </article>
              ))}
            </div>

            <blockquote data-ec-reveal>
              “True luxury does not ask for attention. It rewards the attention you give it.”
              <cite>The Millionaires Collection</cite>
            </blockquote>
          </div>
        </section>

        <section className="ec-access" id="private-access">
          <div className="ec-section-shell ec-access__layout">
            <div className="ec-access__content" data-ec-reveal>
              <span className="ec-kicker">A modern icon · Distinct by design</span>
              <h2>Tradition, <em>redrawn.</em></h2>
              <p>
                The collection respects the codes of classic cigar culture without becoming trapped by them. Bold geometry, confident colour and an unmistakable monogram give the presentation a contemporary point of view.
              </p>
              <p>
                The inaugural release will be offered in considered quantities. Register your interest to receive product announcements, collector notes and invitations to future private experiences.
              </p>
              <ul>
                <li>Contemporary presentation</li>
                <li>Considered first release</li>
                <li>Private collector access</li>
              </ul>
              <Link className="ec-button ec-button--gold" to="/contact">
                Register your interest <ArrowRight size={17} />
              </Link>
              <small>For adults of legal smoking age only. Please enjoy responsibly.</small>
            </div>

            <figure className="ec-access__visual" data-ec-reveal>
              <span className="ec-figure-index">03 / A modern expression</span>
              <img
                src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787664078/cigar-store/ChatGPT_Image_Aug_25_2026_05_40_14_PM.jpg"
                alt="Illustrated M Collection premium cigar presentation"
                loading="lazy"
              />
              <figcaption>Classic ritual. Contemporary character.</figcaption>
            </figure>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default ExclusiveCollectionPage;
