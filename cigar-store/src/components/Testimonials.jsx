import React from 'react';
import './Testimonials.css';

const testimonialsData = [
  {
    initial: 'Z',
    color: '#4A5B69', // Muted blue-grey
    name: 'Zola Z.',
    location: 'Mpumalanga',
    text: "Overall, I'm very happy with my purchase. The cigars themselves were excellent and tasted fantastic. Though the delivery took a day longer than expected. But the quality of the cigars is proper. Customer support was.."
  },
  {
    initial: 'D',
    color: '#1A1A1A', // Dark charcoal
    name: 'Daniel P.',
    location: 'Cape Town',
    text: "As someone relatively new to premium cigars, I wasn't sure what to expect. The team made the process simple, and the product descriptions helped me choose something that suited my taste perfectly. It turned an.."
  },
  {
    initial: 'R',
    color: '#B0205D', // Deep magenta/burgundy
    name: 'Richard M.',
    location: 'Pretoria',
    text: "I was pleasantly surprised by the variety and quality. Each cigar offered a unique experience. The freshness was noticeable immediately. Packaging was professional, and delivery updates kept me informed.."
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <h4 className="testimonials-subtitle">WELCOME TO MY PERSONAL PRESENTATION</h4>
        <h2 className="testimonials-title">
          WHAT OUR <span className="highlight-gold">CLIENTS SAY</span>
        </h2>
        <div className="title-separator"></div>
      </div>

      <div className="testimonials-container">
        {testimonialsData.map((testimonial, index) => (
          <div className="testimonial-card" key={index}>
            <div 
              className="testimonial-avatar" 
              style={{ backgroundColor: testimonial.color }}
            >
              {testimonial.initial}
            </div>
            <h3 className="testimonial-author">
              {testimonial.name} <span className="testimonial-location">– {testimonial.location}</span>
            </h3>
            <p className="testimonial-text">
              {testimonial.text}
            </p>
          </div>
        ))}
      </div>

      <div className="testimonials-pagination">
        <span className="dot active"></span>
        <span className="dot"></span>
      </div>
    </section>
  );
};

export default Testimonials;
