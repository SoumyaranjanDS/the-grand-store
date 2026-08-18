import './AgeingGallery.css'

const gallery = [
  { image: '/assets/gallery-1.jpg', title: 'The first pour' },
  { image: '/assets/gallery-2.jpg', title: 'The collection' },
  { image: '/assets/gallery-3.jpg', title: 'Wrapped with intention' },
  { image: '/assets/gallery-4.jpg', title: 'Harvest character' },
  { image: '/assets/gallery-5.jpg', title: 'Cellar moments' },
  { image: '/assets/gallery-6.jpg', title: 'A finish that lingers' },
]

export default function AgeingGallery() {
  return (
    <section className="ageing-section" id="gallery">
      <div className="shell ageing-heading" data-reveal>
        <p className="eyebrow">Discover</p>
        <h2 className="section-title">That gets better<br /><em>with ageing.</em></h2>
        <p>The perfect pairing—light, bright, and versatile.</p>
      </div>

      <div className="shell ageing-grid">
        {gallery.map((item, index) => (
          <figure className="ageing-card" key={item.image}>
            <img src={item.image} alt={item.title} />
            <figcaption><span>0{index + 1} · Grapes Harvest</span><strong>{item.title}</strong></figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
