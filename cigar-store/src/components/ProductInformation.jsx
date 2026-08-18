import { useState } from 'react';
import { patronNotice } from '../data/productDetails';

function ProductInformation({ product }) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <section className="product-information" aria-labelledby="product-information-title">
      <div className="product-information__inner">
        <div className="product-information__tabs" role="tablist" aria-label="Product information">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'description'}
            className={activeTab === 'description' ? 'is-active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'details'}
            className={activeTab === 'details' ? 'is-active' : ''}
            onClick={() => setActiveTab('details')}
          >
            Product details
          </button>
        </div>

        <div className="product-information__panel" role="tabpanel">
          {activeTab === 'description' ? (
            <div className="product-information__description">
              <p className="product-information__index">01 / Product description</p>
              <h2 id="product-information-title">{product.detailHeading}</h2>
              <p className="product-information__lead">{product.description}</p>
              <aside className="patron-notice">
                <h3>Dear Patrons,</h3>
                {patronNotice.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <strong>Thank you for your understanding and enjoy shopping.<br />Cigar Connoisseur Club</strong>
              </aside>
            </div>
          ) : (
            <div className="product-specifications">
              <p className="product-information__index">02 / Specifications</p>
              <h2>Product &amp; packaging information</h2>
              <dl>
                {product.specifications.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductInformation;
