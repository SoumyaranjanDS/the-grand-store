import './ExperienceCollection.css'

const collection = [
  { title: 'Pleasure', image: '/assets/collection-pleasure.jpg', note: 'Moments worth uncorking' },
  { title: 'Luxury', image: '/assets/collection-luxury.png', note: 'Composed with intention' },
  { title: 'Elegance', image: '/assets/collection-elegance.png', note: 'A finish that lingers' },
]

export default function ExperienceCollection() {
  return (
    <section className="collection-section" id="collection">
      <div className="shell collection-heading" data-reveal>
        <div>
          <p className="eyebrow">Discover the collection</p>
          <h2 className="section-title">Premium sparkling wine,<br /><em>three expressions.</em></h2>
        </div>
        <p>Discover the subtle notes and crafted textures that define perfection.</p>
      </div>

      <div className="shell collection-grid">
        {collection.map((item, index) => (
          <article className="collection-card" data-reveal key={item.title}>
            <img src={item.image} alt={`${item.title} with Millionaires Collection sparkling wine`} />
            <div className="collection-card-shade" />
            <span>0{index + 1}</span>
            <div>
              <p>{item.note}</p>
              <h3>{item.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
