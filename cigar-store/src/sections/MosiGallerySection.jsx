import './MosiGallerySection.css';

const galleryImages = [
  {
    src: 'https://res.cloudinary.com/oioqrgj0/image/upload/f_auto,q_auto/v1787664911/cigar-store/mosi-oa-tunya-gallery/gallery1.jpg',
    alt: 'Mosi Oa Tunya artisans hand-rolling cigars together',
  },
  {
    src: 'https://res.cloudinary.com/oioqrgj0/image/upload/f_auto,q_auto/v1787664912/cigar-store/mosi-oa-tunya-gallery/gallery2.jpg',
    alt: 'Mosi Oa Tunya artisan selecting tobacco leaves',
  },
  {
    src: 'https://res.cloudinary.com/oioqrgj0/image/upload/f_auto,q_auto/v1787664914/cigar-store/mosi-oa-tunya-gallery/gallery3.jpg',
    alt: 'Tobacco leaves being prepared by hand',
  },
  {
    src: 'https://res.cloudinary.com/oioqrgj0/image/upload/f_auto,q_auto/v1787664916/cigar-store/mosi-oa-tunya-gallery/gallery4.jpg',
    alt: 'Cigar wrapper leaf being carefully cut',
  },
  {
    src: 'https://res.cloudinary.com/oioqrgj0/image/upload/f_auto,q_auto/v1787664917/cigar-store/mosi-oa-tunya-gallery/gallery5.jpg',
    alt: 'Mosi Oa Tunya cigar makers at their rolling tables',
  },
  {
    src: 'https://res.cloudinary.com/oioqrgj0/image/upload/f_auto,q_auto/v1787664922/cigar-store/mosi-oa-tunya-gallery/gallery6.jpg',
    alt: 'Hand-rolled cigars resting in production trays',
  },
];

function MosiGallerySection() {
  return (
    <section className="mosi-gallery" id="mosi-gallery" aria-labelledby="mosi-gallery-title">
      <div className="mosi-gallery__inner">
        <h2 id="mosi-gallery-title">
          Mosi Oa Tunya <em>Gallery</em>
        </h2>

        <div className="mosi-gallery__grid">
          {galleryImages.map((image) => (
            <figure key={image.src}>
              <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MosiGallerySection;
