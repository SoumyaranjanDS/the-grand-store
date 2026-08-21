import "./AgeingGallery.css";

import img1 from '../assets/image.png'
import img2 from '../assets/image copy.png'
import img3 from '../assets/image copy 2.png'
import img4 from '../assets/image copy 3.png'
import img5 from '../assets/image copy 4.png'
import img6 from '../assets/image copy 5.png'

const gallery = [
  {
    image: img4,
    title: "The Vineyard",
    subtitle: "Early Morning Harvest",
  },
  {
    image: img6,
    title: "The Press",
    subtitle: "Traditional Methods",
  },
  {
    image: img3,
    title: "The Cellar",
    subtitle: "Oak Barrel Ageing",
  },
  {
    image: img2,
    title: "Production",
    subtitle: "Meticulous Craftsmanship",
  },
  {
    image: img5,
    title: "The Toast",
    subtitle: "Intimate Social Gatherings",
  },
  {
    image: img1,
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
