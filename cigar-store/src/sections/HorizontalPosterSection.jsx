import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

function HorizontalPosterSection() {
  const [posterRef, posterVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section 
      style={{ 
        width: '100%', 
        backgroundColor: '#eee8dd', 
        paddingBottom: '4rem'
      }}
      aria-label="Featured horizontal poster"
    >
      <div style={{ width: '100%', margin: '0', overflow: 'hidden' }}>
        <figure 
          ref={posterRef}
          style={{ 
            margin: 0,
            width: '100%', 
            height: 'auto',
            opacity: posterVisible ? 1 : 0,
            transform: posterVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease, transform 1s ease'
          }}
        >
          <img 
            src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787664072/cigar-store/ChatGPT_Image_Aug_25_2026_05_02_12_PM.jpg" 
            alt="Cigar lifestyle horizontal poster" 
            loading="lazy" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              display: 'block'
            }}
          />
        </figure>
      </div>
    </section>
  );
}

export default HorizontalPosterSection;
