import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

function MosiPosterSection() {
  const [posterRef, posterVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section 
      style={{ 
        width: '100%', 
        backgroundColor: '#100e0c', 
        paddingBottom: '0'
      }}
      aria-label="Mosi Oa Tunya featured poster"
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
            src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787664081/cigar-store/mosi-new.jpg" 
            alt="Mosi Oa Tunya featured lifestyle poster" 
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

export default MosiPosterSection;
