import { useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import './ScrollVideoHero.css';

function ScrollVideoHero() {
  const videoRef = useRef(null);
  return (
    <section className="scroll-film" aria-label="Cigar Connoisseur Club film">
      <div className="hero-mobile-only">
        <img src="/images/mobile-hero.jpg" alt="Premium Handcrafted Cigars" />
        <div className="hero-mobile-text">
          <h1>Premium Handcrafted<br /><em>Cigars.</em></h1>
        </div>
      </div>

      <div className="hero-desktop-only">
        <video
          ref={videoRef}
          className="scroll-film__video"
          muted
          playsInline
          loop
          autoPlay
          aria-hidden="true"
        >
          <source src="https://res.cloudinary.com/oioqrgj0/video/upload/v1787819585/cigar-store/hero/tqvn9t0up9y8vsxrlbix.mp4" type="video/mp4" />
        </video>
        <div className="scroll-film__shade" aria-hidden="true" />
        <div className="scroll-film__grain" aria-hidden="true" />

        <div className="scroll-film__copy">
          <h1>Premium Handcrafted<br /><em>Cigars.</em></h1>
        </div>
      </div>
    </section>
  );
}

export default ScrollVideoHero;
