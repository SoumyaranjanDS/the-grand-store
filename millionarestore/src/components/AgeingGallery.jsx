import './AgeingGallery.css'

const gallery = [
  { image: '/assets/gallery-1.jpg', title: 'The First Pour', subtitle: 'A Golden Moment' },
  { image: '/assets/gallery-2.jpg', title: 'The Collection', subtitle: 'A Statement of Status' },
  { image: '/assets/gallery-3.jpg', title: 'Crafted Intention', subtitle: 'French Oak Rest' },
  { image: '/assets/gallery-4.jpg', title: 'Harvest Character', subtitle: 'From Vine to Bottle' },
  { image: '/assets/gallery-5.jpg', title: 'A Celebration', subtitle: 'For Life’s Grandest Moments' },
  { image: '/assets/gallery-6.jpg', title: 'A Finish That Lingers', subtitle: 'Sophisticated Evenings' },
]

export default function AgeingGallery() {
  return (
    <section className="ageing-section" id="gallery">
      <div className="shell ageing-heading" data-reveal>
        <p className="eyebrow">Discover</p>
        <h2 className="section-title">A legacy in <em>every pour.</em></h2>
        <p>Discover the artistry, patience, and meticulous attention to detail that defines the Millionaires Collection.</p>
      </div>

      <div className="shell ageing-grid">
        {gallery.map((item, index) => (
          <figure className="ageing-card" key={item.image}>
            <img src={item.image} alt={item.title} />
            <figcaption><span>0{index + 1} · {item.subtitle}</span><strong>{item.title}</strong></figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
