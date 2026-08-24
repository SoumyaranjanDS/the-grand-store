import "./AgeingGallery.css";

const gallery = [
  {
    image: '/assets/gallery_vineyard.jpg',
    title: "The Vineyard",
    subtitle: "Early Morning Harvest",
  },
  {
    image: '/assets/gallery_press.jpg',
    title: "The Press",
    subtitle: "Traditional Methods",
  },
  {
    image: '/assets/gallery_cellar.jpg',
    title: "The Cellar",
    subtitle: "Oak Barrel Ageing",
  },
  {
    image: '/assets/gallery_production.jpg',
    title: "Production",
    subtitle: "Meticulous Craftsmanship",
  },
  {
    image: '/assets/gallery_toast.jpg',
    title: "The Toast",
    subtitle: "Intimate Social Gatherings",
  },
  {
    image: '/assets/gallery_pour.jpg',
    title: "The First Pour",
    subtitle: "Golden Elegance",
  },
];

export default function AgeingGallery() {
  return (
    <section className="ageing-section" id="gallery">
      <div className="shell ageing-heading" data-reveal>
        <p className="eyebrow">Discover</p>
        <h2 className="section-title">
          A legacy in <em>every pour.</em>
        </h2>
        <p>
          Discover the artistry, patience, and meticulous attention to detail
          that defines the Millionaires Collection.
        </p>
      </div>

      <div className="shell ageing-grid">
        {gallery.map((item, index) => (
          <figure className="ageing-card" key={item.image}>
            <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
            <figcaption>
              <span>
                0{index + 1} · {item.subtitle}
              </span>
              <strong>{item.title}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
