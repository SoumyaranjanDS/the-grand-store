import { Quote } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { testimonials } from '../data/homeContent';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './TestimonialsSection.css';

function TestimonialCard({ testimonial, index }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const animationClass = index % 2 === 0 ? 'reveal-left' : 'reveal-right';
  
  return (
    <article 
      ref={ref}
      className={`testimonial-card ${animationClass} ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div 
        className="testimonial-avatar" 
        style={{ backgroundColor: testimonial.color }}
      >
        {testimonial.initial}
      </div>
      <footer><strong>{testimonial.name}</strong><span> - {testimonial.location}</span></footer>
      <blockquote>{testimonial.quote}</blockquote>
    </article>
  );
}

function TestimonialsSection() {
  return (
    <section className="testimonials-section" id="testimonials">
      <SectionHeading eyebrow="Welcome to my personal presentation" title="What our clients say" align="center" light={true} />
      <div className="testimonials-section__grid">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
        ))}
      </div>
    </section>
  );
}

export default TestimonialsSection;
