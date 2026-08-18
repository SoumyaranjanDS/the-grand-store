import { ArrowUpRight } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './EditorialSections.css';
import './MissionSection.css';

function MissionSection() {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px',
  });

  return (
    <section
      ref={sectionRef}
      className={`mission-section ${isVisible ? 'mission-section--visible' : ''}`}
      id="mission"
    >
      <div className="mission-section__grid">
        <div className="mission-section__content">
          <p className="editorial-section__number">01 / Our mission</p>
          <h2>Experience<br /><em>the exceptional</em></h2>
          <p>
            We source the finest, rarest cigars from Cuba, the Dominican Republic, and Nicaragua.
            Our humidor holds selections chosen for their impeccable construction, complex profiles, and rich provenance.
            Whether you are exploring the world of premium tobacco or seeking a rare vintage, we provide guidance and access to the extraordinary.
          </p>
          <a className="outline-link" href="/cigar-history">
            Learn about our curation <ArrowUpRight size={16} strokeWidth={1.4} />
          </a>
        </div>

        <figure className="mission-section__image">
          <img
            src="/images/history-making.png"
            width="600"
            height="750"
            alt="A premium cigar resting beside an ashtray"
          />
          <figcaption>Curated selections · Optimal storage</figcaption>
        </figure>
      </div>
    </section>
  );
}

export default MissionSection;
