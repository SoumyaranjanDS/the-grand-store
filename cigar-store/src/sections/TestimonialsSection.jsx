import SectionHeading from '../components/SectionHeading';
import { testimonials } from '../data/homeContent';
import './TestimonialsSection.css';

function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card">
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
      <div className="testimonials-section__heading-wrapper">
        <SectionHeading eyebrow="Welcome to my personal presentation" title="What our clients say" align="center" light={true} />
      </div>
      
      <div className="testimonials-marquee-wrapper">
        <div className="testimonials-marquee">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
          {/* Duplicate for infinite scroll */}
          {testimonials.map((testimonial) => (
            <TestimonialCard key={`${testimonial.name}-dup`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
