import { ArrowDown, ArrowUpRight } from 'lucide-react';
import newHeroVideo from '../assets/2efe7f3d-ee23-480e-924e-6345797c4f9b.mp4';
import './ScrollVideoHero.css';

function ScrollVideoHero() {
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
          className="scroll-film__video" 
          muted 
          playsInline 
          autoPlay 
          loop 
          preload="auto" 
          aria-label="Cigar smoke film"
        >
          <source src={newHeroVideo} type="video/mp4" />
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
