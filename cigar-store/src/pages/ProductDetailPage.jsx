import { useEffect } from 'react';
import { ArrowRight, Heart, PackageCheck } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import ProductImageZoom from '../components/ProductImageZoom';
import ProductInformation from '../components/ProductInformation';
import ProductEnquiryForm from '../components/ProductEnquiryForm';
import ProductShowcase from '../sections/ProductShowcase';
import SiteFooter from '../sections/SiteFooter';
import { getRelatedProducts, productsBySlug } from '../data/productDetails';
import { useWishlist } from '../context/wishlistContext';
import './ProductDetailPage.css';

function ProductDetailPage() {
  const { slug } = useParams();
  const product = productsBySlug[slug];
  const { isSaved, toggleProduct } = useWishlist();

  useEffect(() => {
    if (!product) return;
    window.scrollTo(0, 0);
    document.title = `${product.name} · Cigar Connoisseur Club`;
  }, [product]);

  if (!product) return <Navigate to="/" replace />;

  const relatedProducts = getRelatedProducts(product.slug);
  const saved = isSaved(product);

  return (
    <div className="product-page" id="top">
      <main className="product-page__main">
        <section className="product-hero">
          <div className="product-hero__breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a><span>/</span><a href="/#new-arrivals">New arrivals</a><span>/</span><strong>{product.name}</strong>
          </div>

          <div className="product-hero__grid">
            <div className="product-gallery">
              <p>{product.brand} · Premium cigar</p>
              <div className="product-gallery__stage"><ProductImageZoom src={product.image} alt={product.name} /></div>
              <div className="product-gallery__thumb"><img src={product.image} alt="" aria-hidden="true" /></div>
            </div>

            <div className="product-summary">
              <p className="product-summary__eyebrow">A humidor classic</p>
              <h1>{product.name}</h1>
              <p className="product-summary__description">{product.description}</p>
              <div className="product-summary__actions">
                <a className="product-summary__enquire" href="#product-enquiry">Enquire now <ArrowRight size={18} strokeWidth={1.4} /></a>
                <button className={`product-summary__save ${saved ? 'is-saved' : ''}`} type="button" aria-pressed={saved} onClick={() => toggleProduct(product)}>
                  <Heart size={18} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved to collection' : 'Save this cigar'}
                </button>
              </div>

              <dl className="product-summary__meta">
                <div><dt>SKU ID</dt><dd>{product.sku}</dd></div>
                <div><dt>Brand</dt><dd>{product.brand}</dd></div>
              </dl>

              <div className="product-summary__service">
                <PackageCheck size={24} strokeWidth={1.2} />
                <span><strong>Handled with care</strong>Personal assistance with every enquiry.</span>
              </div>
            </div>
          </div>
        </section>

        <ProductInformation product={product} />

        <ProductShowcase
          id="related-products"
          eyebrow="Continue exploring"
          title="Related products"
          intro={`More selections related to ${product.brand}.`}
          products={relatedProducts}
          tone="light"
        />

        <ProductEnquiryForm product={product} />

        <section className={`product-review ${product.review ? '' : 'product-review--empty'}`}>
          {product.review && <div><p>Client review</p><h2>{product.review.name}</h2><blockquote>“{product.review.quote}”</blockquote></div>}
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}

export default ProductDetailPage;
