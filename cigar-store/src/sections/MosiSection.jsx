import { ArrowUpRight } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './EditorialSections.css';

function MosiSection() {
  const [contentRef, contentVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [imgRef, imgVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section className="mosi-section" id="mosi">
      <div 
        ref={contentRef}
        className={`mosi-section__content reveal-left ${contentVisible ? 'is-visible' : ''}`}
      >
        <p className="editorial-section__number">02 / African craft</p>
        <h2>Mosi Oa Tunya<br /><em>Cigars</em></h2>
        <p>
          Mosi Oa Tunya Cigars is a women-empowerment initiative powered by an all-female team of expert cigar rollers. We promote livelihood upliftment through skill development, value addition, and export-driven growth. Inspired by the mystique of Victoria Falls, our premium cigars are meticulously hand-rolled using high-quality African tobacco, offering a truly unique smoking experience.
        </p>
        <a className="outline-link outline-link--light" href="/shop/mosi-oa-tunya">
          Discover Mosi Oa Tunya <ArrowUpRight size={16} strokeWidth={1.4} />
        </a>
      </div>
      <figure 
        ref={imgRef}
        className={`mosi-section__image reveal-right ${imgVisible ? 'is-visible' : ''}`}
      >
        <img src="/images/mosi-oa-tunya.jpeg" alt="Mosi Oa Tunya cigar resting on a whisky glass" loading="lazy" />
        <figcaption>Hand-rolled · African tobacco · Victoria Falls</figcaption>
      </figure>
    </section>
  );
}

export default MosiSection;
