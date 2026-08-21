import './ExperienceCollection.css'

const collection = [
  { title: 'Pleasure', note: 'Moments worth uncorking' },
  { title: 'Luxury', note: 'Composed with intention' },
  { title: 'Elegance', note: 'A finish that lingers' },
]

export default function ExperienceCollection() {
  return (
    <section className="collection-section" id="collection">
      <div className="shell collection-split">
        <div className="collection-content">
          <div className="collection-heading" data-reveal>
            <p className="eyebrow">Discover the collection</p>
            <h2 className="section-title">Premium sparkling wine,<br /><em>three expressions.</em></h2>
            <p className="collection-intro">Discover the subtle notes and crafted textures that define perfection.</p>
          </div>
          
          <div className="collection-list">
            {collection.map((item, index) => (
              <div className="collection-list-item" key={item.title} data-reveal>
                <span>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="collection-image-wrapper" data-reveal>
          <img src="/assets/collection-featured.jpg" alt="Millionaires Collection sparkling wine celebration" />
        </div>
      </div>
    </section>
  )
}
