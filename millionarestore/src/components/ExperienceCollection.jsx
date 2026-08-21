import { Grape, Sparkles, Crown } from 'lucide-react'
import './ExperienceCollection.css'

const collection = [
  { 
    title: 'The Brut Reserve', 
    note: 'Our signature expression. Crisp green apple and bright citrus on the palate, perfectly balanced with warm notes of toasted brioche. Aged 36 months on the lees for a fine, persistent mousse.',
    details: '60% Chardonnay, 40% Pinot Noir',
    icon: Grape
  },
  { 
    title: 'The Rosé Edition', 
    note: 'A vibrant and romantic pour. Delicate aromas of wild strawberry and crushed rose petal lead into a soft, creamy palate. A breathtakingly elegant finish with a vivid salmon hue.',
    details: '70% Pinot Noir, 30% Chardonnay',
    icon: Sparkles
  },
  { 
    title: 'The Vintage Blanc', 
    note: 'The pinnacle of our craft, released only in exceptional years. Deeply complex with rich almond, wild honey, and white peach. A structured, powerful wine with unmatched ageing potential.',
    details: '100% Chardonnay • Zero Dosage',
    icon: Crown
  },
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
                <div className="collection-icon"><item.icon size={18} strokeWidth={1.5} /></div>
                <div className="collection-item-text">
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                  <span className="collection-details">{item.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="collection-image-wrapper" data-reveal>
          <img src="/assets/collection-featured.jpg" alt="Millionaires Collection sparkling wine celebration" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  )
}
