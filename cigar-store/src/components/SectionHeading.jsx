import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './SectionHeading.css';

function SectionHeading({ eyebrow, title, intro, align = 'left', light = false }) {
  const isCenter = align === 'center';
  const isLight = light;
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <header 
      ref={ref}
      className={`section-heading section-heading--${align} ${light ? 'section-heading--light' : ''} reveal-left ${isVisible ? 'is-visible' : ''}`}
    >
      {eyebrow && <p className="section-heading__eyebrow"><span />{eyebrow}<span /></p>}
      <h2>{title}</h2>
      {intro && <p className="section-heading__intro">{intro}</p>}
    </header>
  );
}

export default SectionHeading;
