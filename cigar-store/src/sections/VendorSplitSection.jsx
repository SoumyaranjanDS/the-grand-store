import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './VendorSplitSection.css';

function VendorSplitSection({ 
  title, 
  subtitle, 
  paragraphs, 
  buttonText, 
  buttonLink, 
  imageAlign = 'left',
  backgroundUrl
}) {
  const [contentRef, contentVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [imageRef, imageVisible] = useIntersectionObserver({ threshold: 0.1 });

  const isLeft = imageAlign === 'left';
  
  const contentSide = (
    <div 
      ref={contentRef} 
      className={`vendor-split__content ${contentVisible ? (isLeft ? 'reveal-right' : 'reveal-left') : (isLeft ? 'hidden-right' : 'hidden-left')}`}
    >
      <div className="vendor-split__content-inner">
        {title && <h3 className="vendor-split__title text-gold">{title}</h3>}
        {subtitle && <h4 className="vendor-split__subtitle">{subtitle}</h4>}
        
        <div className="vendor-split__text">
          {paragraphs.map((p, index) => (
            <p key={index}>{p}</p>
          ))}
        </div>
        
        {buttonText && buttonLink && (
          <a href={buttonLink} className="vendor-split__btn">
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );

  const imageSide = (
    <div 
      ref={imageRef}
      className={`vendor-split__image-side ${imageVisible ? (isLeft ? 'reveal-left' : 'reveal-right') : (isLeft ? 'hidden-left' : 'hidden-right')}`}
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="vendor-split__glass-panel">
        {/* We can put content inside the glass panel if needed, but for now it's just a styled overlay */}
      </div>
    </div>
  );

  return (
    <section className={`vendor-split ${isLeft ? 'vendor-split--img-left' : 'vendor-split--img-right'}`}>
      {isLeft ? (
        <>
          {imageSide}
          {contentSide}
        </>
      ) : (
        <>
          {contentSide}
          {imageSide}
        </>
      )}
    </section>
  );
}

export default VendorSplitSection;
